import type { FastMCPSession, TextContent } from "fastmcp";
import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
import { message } from "telegraf/filters";
import { TelegramService } from "../services/telegram-service.js";
import type { SamplingRequest, MessageTemplateData } from "./types.js";
import { MessageType, TemplateType } from "./types.js";
import { samplingConfig } from "../config.js";
import { MessageValidator } from "./validators.js";
import { RateLimiter, formatTemplate, getActiveListeners } from "./utils.js";
import {
	handleTextMessage,
	handlePhotoMessage,
	handleDocumentMessage,
	handleVoiceMessage,
	handleVideoMessage,
	handleStickerMessage,
	handleLocationMessage,
	handleContactMessage,
	handlePollMessage,
	handleNewMemberMessage,
} from "./message-handlers.js";

export class SamplingHandler {
	private session: FastMCPSession;
	private bot: Telegraf;
	private telegramService: TelegramService;
	private validator: MessageValidator;
	private rateLimiter: RateLimiter;
	private botUsername: string | null = null;

	constructor(session: FastMCPSession) {
		this.session = session;
		this.telegramService = new TelegramService();
		this.validator = new MessageValidator();
		this.rateLimiter = new RateLimiter();

		const botToken = process.env.TELEGRAM_BOT_TOKEN;
		if (!botToken) {
			throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
		}
		this.bot = new Telegraf(botToken);

		this.setupTelegramHandlers();
	}

	private async getBotUsername(): Promise<string> {
		if (!this.botUsername) {
			const botInfo = await this.bot.telegram.getMe();
			this.botUsername = botInfo.username || "bot";
			this.validator.setBotUsername(this.botUsername);
		}
		return this.botUsername;
	}

	private async processMessage(
		ctx: Context,
		messageType: MessageType,
		handlerFunction: (ctx: Context) => ReturnType<typeof handleTextMessage>,
	): Promise<void> {
		if (!this.validator.shouldProcessMessage(ctx, messageType)) return;
		if (!this.rateLimiter.checkRateLimit(ctx.from?.id || 0, ctx.chat?.id || 0))
			return;

		const templateData = handlerFunction(ctx);
		if (!templateData) return;

		if (
			messageType === "text" &&
			!this.validator.validateTextMessage(templateData.content)
		) {
			return;
		}

		await this.handleMessage(ctx, messageType, templateData);
	}

	private setupTelegramHandlers() {
		// Text messages
		this.bot.on(message("text"), async (ctx: Context) => {
			await this.processMessage(ctx, MessageType.TEXT, handleTextMessage);
		});

		// Photo messages
		this.bot.on(message("photo"), async (ctx: Context) => {
			await this.processMessage(ctx, MessageType.PHOTO, handlePhotoMessage);
		});

		// Document messages
		this.bot.on(message("document"), async (ctx: Context) => {
			await this.processMessage(
				ctx,
				MessageType.DOCUMENT,
				handleDocumentMessage,
			);
		});

		// Voice messages
		this.bot.on(message("voice"), async (ctx: Context) => {
			await this.processMessage(ctx, MessageType.VOICE, handleVoiceMessage);
		});

		// Video messages
		this.bot.on(message("video"), async (ctx: Context) => {
			await this.processMessage(ctx, MessageType.VIDEO, handleVideoMessage);
		});

		// Sticker messages
		this.bot.on(message("sticker"), async (ctx: Context) => {
			await this.processMessage(ctx, MessageType.STICKER, handleStickerMessage);
		});

		// Location messages
		this.bot.on(message("location"), async (ctx: Context) => {
			await this.processMessage(
				ctx,
				MessageType.LOCATION,
				handleLocationMessage,
			);
		});

		// Contact messages
		this.bot.on(message("contact"), async (ctx: Context) => {
			await this.processMessage(ctx, MessageType.CONTACT, handleContactMessage);
		});

		// Poll messages
		this.bot.on(message("poll"), async (ctx: Context) => {
			await this.processMessage(ctx, MessageType.POLL, handlePollMessage);
		});

		// New members joined
		this.bot.on("new_chat_members", async (ctx: Context) => {
			// Directly handle without text validation
			if (!this.validator.shouldProcessMessage(ctx, MessageType.NEW_MEMBER))
				return;
			if (
				!this.rateLimiter.checkRateLimit(ctx.from?.id || 0, ctx.chat?.id || 0)
			)
				return;

			const templateData = handleNewMemberMessage(ctx);
			if (!templateData) return;

			await this.handleMessage(ctx, MessageType.NEW_MEMBER, templateData);
		});
	}

	private async handleMessage(
		ctx: Context,
		messageType: MessageType,
		templateData: MessageTemplateData,
	) {
		try {
			// Show typing indicator if enabled
			if (samplingConfig.showTypingIndicator) {
				await ctx.sendChatAction("typing");
			}

			// Create sampling request
			const request: SamplingRequest = {
				userId: Number(templateData.userId),
				sessionId: `telegram_${templateData.chatId}`,
				content: String(templateData.content),
				chatId: Number(templateData.chatId),
				messageId: Number(templateData.messageId),
				messageType,
				templateData,
			};

			// Handle the sampling request
			await this.handleRequest(request);
		} catch (error) {
			console.error(`Error handling ${messageType} message:`, error);
			if (!samplingConfig.silentMode) {
				await ctx.reply(
					"Sorry, I encountered an error processing your message.",
				);
			}
		}
	}

	async handleRequest(request: SamplingRequest) {
		try {
			if (!this.session) {
				console.error("No active FastMCP session available");
				if (!samplingConfig.silentMode) {
					await this.telegramService.sendMessage(
						request.chatId,
						"Sorry, the AI service is not available right now.",
						request.templateData.topicId,
					);
				}
				return;
			}

			// Get the appropriate template
			const template =
				samplingConfig.templates[
					request.messageType as unknown as TemplateType
				] || samplingConfig.templates[TemplateType.FALLBACK];

			// Format the template with data
			const formattedTemplate = formatTemplate(template, request.templateData);

			// Create sampling request for FastMCP
			const samplingResponse = await this.session.requestSampling({
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: formattedTemplate,
						},
					},
				],
				maxTokens: samplingConfig.maxTokens,
			});

			// Extract the response text
			let responseText: string;
			if (
				samplingResponse.content &&
				samplingResponse.content.type === "text"
			) {
				responseText = (samplingResponse.content as TextContent).text;
			} else {
				responseText = "I'm sorry, I couldn't generate a response.";
			}

			// Send response back to Telegram (unless in silent mode)
			if (!samplingConfig.silentMode) {
				await this.telegramService.sendMessage(
					request.chatId,
					responseText,
					request.templateData.topicId,
					request.messageId,
				);
			}

			console.log(
				`Processed ${request.messageType} message from user ${request.userId} in chat ${request.chatId}`,
			);
		} catch (error) {
			console.error("Error in sampling request:", error);

			if (!samplingConfig.silentMode) {
				await this.telegramService.sendMessage(
					request.chatId,
					"Sorry, I encountered an error while processing your request. Please try again.",
					request.templateData.topicId,
					request.messageId,
				);
			}
		}
	}

	async start() {
		try {
			console.log("Starting Telegram bot for sampling...");

			// Get bot username for mention detection
			await this.getBotUsername();

			await this.bot.launch();
			console.log("Telegram bot started successfully");

			const configMode = samplingConfig.mentionOnly
				? "Mention-only mode"
				: "All messages";
			const listeners = getActiveListeners();
			console.log(`Configuration: ${configMode}, Listeners: ${listeners}`);

			// Enable graceful stop
			process.once("SIGINT", () => this.stop());
			process.once("SIGTERM", () => this.stop());
		} catch (error) {
			console.error("Error starting Telegram bot:", error);
			throw error;
		}
	}

	async stop() {
		console.log("Stopping Telegram bot...");
		this.bot.stop();
		console.log("Telegram bot stopped");
	}

	updateSession(session: FastMCPSession) {
		this.session = session;
	}

	getTelegramService(): TelegramService {
		return this.telegramService;
	}

	getRateLimiter(): RateLimiter {
		return this.rateLimiter;
	}
}
