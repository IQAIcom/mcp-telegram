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
	): Promise<MessageInfo> {
		try {
			const message = await this.bot.telegram.sendMessage(chatId, text, {
				message_thread_id: topicId,
			});

			return {
				messageId: message.message_id,
				chatId: message.chat.id,
				text: message.text,
				date: message.date,
			};
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
