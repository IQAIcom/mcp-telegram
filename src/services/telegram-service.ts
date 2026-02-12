import { Telegraf } from "telegraf";

export interface ChannelInfo {
	id: number;
	title: string;
	username?: string;
	description?: string;
	memberCount?: number;
	type: string;
}

export interface MessageInfo {
	messageId: number;
	chatId: number;
	text?: string;
	date: number;
}

export type TelegramParseMode = "Markdown" | "MarkdownV2" | "HTML";

export interface SendMessageOptions {
	parseMode?: TelegramParseMode | null;
	fallbackToPlainText?: boolean;
}

export class TelegramService {
	private bot: Telegraf;

	constructor() {
		const botToken = process.env.TELEGRAM_BOT_TOKEN;
		if (!botToken) {
			throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
		}
		this.bot = new Telegraf(botToken);
	}

	async sendMessage(
		chatId: string | number,
		text: string,
		topicId?: number,
		replyToMessageId?: number,
		sendOptions?: SendMessageOptions,
	): Promise<MessageInfo> {
		try {
			const baseOptions: {
				message_thread_id?: number;
				reply_parameters?: {
					message_id: number;
					allow_sending_without_reply?: boolean;
				};
			} = {};

			if (typeof topicId === "number") {
				baseOptions.message_thread_id = topicId;
			}

			if (typeof replyToMessageId === "number") {
				baseOptions.reply_parameters = {
					message_id: replyToMessageId,
					allow_sending_without_reply: true,
				};
			}

			const parseMode =
				sendOptions?.parseMode === undefined ? "Markdown" : sendOptions.parseMode;
			const shouldFallback = sendOptions?.fallbackToPlainText ?? true;

			// null parseMode = plain text (no formatting), used when "Text" is selected in SEND_MESSAGE
			if (!parseMode) {
				const message = await this.bot.telegram.sendMessage(
					chatId,
					text,
					baseOptions,
				);

				return {
					messageId: message.message_id,
					chatId: message.chat.id,
					text: message.text,
					date: message.date,
				};
			}

			try {
				const message = await this.bot.telegram.sendMessage(chatId, text, {
					...baseOptions,
					parse_mode: parseMode,
				});

				return {
					messageId: message.message_id,
					chatId: message.chat.id,
					text: message.text,
					date: message.date,
				};
			} catch (error) {
				if (!shouldFallback || !isParseModeError(error)) {
					throw error;
				}

				const message = await this.bot.telegram.sendMessage(
					chatId,
					text,
					baseOptions,
				);

				return {
					messageId: message.message_id,
					chatId: message.chat.id,
					text: message.text,
					date: message.date,
				};
			}
		} catch (error) {
			throw new Error(
				`Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async getChannelInfo(channelId: string | number): Promise<ChannelInfo> {
		try {
			const chat = await this.bot.telegram.getChat(channelId);
			const memberCount =
				await this.bot.telegram.getChatMembersCount(channelId);

			return {
				id: chat.id,
				title: "title" in chat ? chat.title : "Private Chat",
				username: "username" in chat ? chat.username : undefined,
				description: "description" in chat ? chat.description : undefined,
				memberCount,
				type: chat.type,
			};
		} catch (error) {
			throw new Error(
				`Failed to get channel info: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async forwardMessage(
		fromChatId: string | number,
		toChatId: string | number,
		messageId: number,
	): Promise<MessageInfo> {
		try {
			const message = await this.bot.telegram.forwardMessage(
				toChatId,
				fromChatId,
				messageId,
			);

			return {
				messageId: message.message_id,
				chatId: message.chat.id,
				date: message.date,
			};
		} catch (error) {
			throw new Error(
				`Failed to forward message: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async pinMessage(
		chatId: string | number,
		messageId: number,
	): Promise<boolean> {
		try {
			await this.bot.telegram.pinChatMessage(chatId, messageId);
			return true;
		} catch (error) {
			throw new Error(
				`Failed to pin message: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async getChannelMembers(
		channelId: string | number,
		limit = 10,
	): Promise<
		Array<{
			userId: number;
			username?: string;
			firstName?: string;
			lastName?: string;
			status: string;
		}>
	> {
		try {
			const administrators =
				await this.bot.telegram.getChatAdministrators(channelId);

			return administrators.slice(0, limit).map((member) => ({
				userId: member.user.id,
				username: member.user.username,
				firstName: member.user.first_name,
				lastName: member.user.last_name,
				status: member.status,
			}));
		} catch (error) {
			throw new Error(
				`Failed to get channel members: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}

function isParseModeError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	const normalizedMessage = error.message.toLowerCase();
	return (
		normalizedMessage.includes("can't parse entities") ||
		normalizedMessage.includes("cannot parse entities") ||
		normalizedMessage.includes("parse entities")
	);
}
