import dedent from "dedent";
import { z } from "zod";
import { TelegramService } from "../services/telegram-service.js";

const forwardMessageParams = z.object({
	fromChatId: z
		.union([z.string(), z.number()])
		.describe("Source chat ID or username"),
	toChatId: z
		.union([z.string(), z.number()])
		.describe("Destination chat ID or username"),
	messageId: z.number().describe("ID of the message to forward"),
	disableNotification: z
		.boolean()
		.optional()
		.describe("Forward message silently"),
});

type ForwardMessageParams = z.infer<typeof forwardMessageParams>;

export const forwardMessageTool = {
	name: "FORWARD_MESSAGE",
	description: "Forward a message from one chat to another",
	parameters: forwardMessageParams,
	execute: async (params: ForwardMessageParams) => {
		const telegramService = new TelegramService();

		try {
			const messageInfo = await telegramService.forwardMessage(
				params.fromChatId,
				params.toChatId,
				params.messageId,
			);

			return dedent`
				Message forwarded successfully!

				New Message ID: ${messageInfo.messageId}
				Destination Chat ID: ${messageInfo.chatId}
				Forwarded at: ${new Date(messageInfo.date * 1000).toISOString()}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("BOT_TOKEN")) {
					return "Error: Telegram bot token is not configured. Please set the TELEGRAM_BOT_TOKEN environment variable.";
				}
				return `Error forwarding message: ${error.message}`;
			}
			return "An unknown error occurred while forwarding the message";
		}
	},
} as const;
