import type { FastMCP, FastMCPSession, TextContent } from "fastmcp";
import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
import { message } from "telegraf/filters";
import { TelegramService } from "./services/telegram-service.js";

interface SamplingRequest {
	userId: number;
	sessionId: string;
	content: string;
	chatId: number;
	messageId: number;
}

export class SamplingHandler {
	private session: FastMCPSession;
	private bot: Telegraf;
	private telegramService: TelegramService;

	constructor(session: FastMCPSession) {
		this.session = session;
		this.telegramService = new TelegramService();

		// Create bot instance for listening to messages
		const botToken = process.env.TELEGRAM_BOT_TOKEN;
		if (!botToken) {
			throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
		}
		this.bot = new Telegraf(botToken);

		this.setupTelegramHandlers();
	}

	private setupTelegramHandlers() {
		// Handle text messages
		this.bot.on(message("text"), async (ctx: Context) => {
			try {
				const msg = ctx.message;
				if (!msg || !("text" in msg) || !ctx.chat) return;
				const content = msg.text;
				const chatId = ctx.chat.id;
				const messageId = msg.message_id;
				const sessionId = `telegram_${chatId}`;
				const userId = msg.from?.id;
				// Send typing indicator
				await ctx.sendChatAction("typing");

				// Create sampling request
				const request: SamplingRequest = {
					userId,
					sessionId,
					content,
					chatId,
					messageId,
				};

				// Handle the sampling request
				await this.handleRequest(request);
			} catch (error) {
				console.error("Error handling Telegram message:", error);
				await ctx.reply(
					"Sorry, I encountered an error processing your message.",
				);
			}
		});

		// Handle bot commands
		this.bot.start((ctx) => {
			ctx.reply(
				"Hello! I'm your AI assistant. Send me a message and I'll respond using AI sampling.",
			);
		});

		this.bot.help((ctx) => {
			ctx.reply(
				"Send me any message and I'll generate a response using AI sampling.",
			);
		});
	}

	async handleRequest(request: SamplingRequest) {
		try {
			// Check if we have an active session
			if (!this.session) {
				console.error("No active FastMCP session available");
				await this.telegramService.sendMessage(
					request.chatId,
					"Sorry, the AI service is not available right now.",
				);
				return;
			}
			const template = `
        NEW TELEGRAM MESSAGE FROM:
        user_id: ${request.userId}
        chat_id: ${request.chatId}
        isDM: ${request.chatId === request.userId}
        message_id: ${request.messageId}
        content: ${request.content}
      `;

			// Create sampling request for FastMCP
			const samplingResponse = await this.session.requestSampling({
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: template,
						},
					},
				],
				maxTokens: 1000,
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

			// Send response back to Telegram using the service
			await this.telegramService.sendMessage(request.chatId, responseText);
		} catch (error) {
			console.error("Error in sampling request:", error);

			// Send error message to user using the service
			await this.telegramService.sendMessage(
				request.chatId,
				"Sorry, I encountered an error while processing your request. Please try again.",
			);
		}
	}

	// Start the Telegram bot
	async start() {
		try {
			console.log("Starting Telegram bot for sampling...");
			await this.bot.launch();
			console.log("Telegram bot started successfully");

			// Enable graceful stop
			process.once("SIGINT", () => this.stop());
			process.once("SIGTERM", () => this.stop());
		} catch (error) {
			console.error("Error starting Telegram bot:", error);
			throw error;
		}
	}

	// Stop the Telegram bot
	async stop() {
		console.log("Stopping Telegram bot...");
		this.bot.stop();
		console.log("Telegram bot stopped");
	}

	// Update session when a new client connects
	updateSession(session: FastMCPSession) {
		this.session = session;
	}

	// Get the telegram service instance for external use
	getTelegramService(): TelegramService {
		return this.telegramService;
	}
}
