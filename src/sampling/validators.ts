import type { Context } from "telegraf";
import type { MessageEntity, TelegramMessage, MessageType } from "./types.js";
import { samplingConfig } from "../config.js";

export class MessageValidator {
	private botUsername: string | null = null;

	setBotUsername(username: string): void {
		this.botUsername = username;
	}

	isMentioned(text: string, entities: MessageEntity[] = []): boolean {
		if (!this.botUsername) return false;

		// Check for @username mentions
		if (text.includes(`@${this.botUsername}`)) return true;

		// Check for mentions in entities
		return entities.some(
			(entity) =>
				entity.type === "mention" &&
				text.substring(entity.offset, entity.offset + entity.length) ===
					`@${this.botUsername}`,
		);
	}

	shouldProcessMessage(ctx: Context, messageType: MessageType): boolean {
		const msg = ctx.message;
		if (!msg || !ctx.chat) return false;

		const chatId = ctx.chat.id;
		const userId = msg.from?.id;
		if (!userId) return false;

		// Check if message type is enabled
		if (
			!samplingConfig.enabledListeners[
				messageType as keyof typeof samplingConfig.enabledListeners
			]
		) {
			return false;
		}

		// Check blocked users/chats
		if (
			samplingConfig.blockedUsers.includes(userId) ||
			this.isChatBlocked(ctx.chat)
		) {
			return false;
		}

		// Check allowed users/chats (if specified)
		if (
			samplingConfig.allowedUsers.length > 0 &&
			!samplingConfig.allowedUsers.includes(userId)
		) {
			return false;
		}
		if (
			samplingConfig.allowedChats.length > 0 &&
			!this.isChatAllowed(ctx.chat)
		) {
			return false;
		}

		// Check if it's a DM
		const isDM = chatId === userId;

		// For groups: check mention requirement except for system events like NEW_MEMBER
		if (!isDM && samplingConfig.mentionOnly) {
			// Allow NEW_MEMBER without mention
			if ((messageType as string) === "new_member") {
				return true;
			}
			if ("text" in msg && msg.text) {
				return this.isMentioned(msg.text, msg.entities);
			}
			if ("caption" in msg && msg.caption) {
				return this.isMentioned(msg.caption, msg.caption_entities);
			}
			return false;
		}

		// For DMs: respect respondToPrivateMessages setting
		if (isDM && !samplingConfig.respondToPrivateMessages) {
			return false;
		}

		return true;
	}

	validateTextMessage(text: string): boolean {
		// Check message length
		if (
			text.length < samplingConfig.minMessageLength ||
			text.length > samplingConfig.maxMessageLength
		) {
			return false;
		}

		// Check if it's a command and we should ignore commands
		if (samplingConfig.ignoreCommands && text.startsWith("/")) {
			return false;
		}

		// Check keyword triggers (if specified)
		if (samplingConfig.keywordTriggers.length > 0) {
			const hasKeyword = samplingConfig.keywordTriggers.some((keyword) =>
				text.toLowerCase().includes(keyword.toLowerCase()),
			);
			if (!hasKeyword) return false;
		}

		return true;
	}

	hasRequiredFields(msg: TelegramMessage, requiredFields: string[]): boolean {
		return requiredFields.every((field) => {
			if (field === "from") return msg.from != null;
			return field in msg;
		});
	}

	private isChatAllowed(chat: NonNullable<Context["chat"]>): boolean {
		return this.isChatInList(chat, samplingConfig.allowedChats);
	}

	private isChatBlocked(chat: NonNullable<Context["chat"]>): boolean {
		return this.isChatInList(chat, samplingConfig.blockedChats);
	}

	private isChatInList(
		chat: NonNullable<Context["chat"]>,
		chatList: (number | string)[],
	): boolean {
		const chatId = chat.id;
		const chatUsername = "username" in chat ? chat.username : undefined;

		return chatList.some((entry) => {
			// Check numeric ID match
			if (typeof entry === "number") {
				return entry === chatId;
			}

			// Check username match (handle both @username and username formats)
			if (typeof entry === "string" && chatUsername) {
				const normalizedEntry = entry.startsWith("@") ? entry.slice(1) : entry;
				return normalizedEntry === chatUsername;
			}

			return false;
		});
	}
}
