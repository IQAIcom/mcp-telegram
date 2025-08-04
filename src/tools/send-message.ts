import dedent from "dedent";
import { z } from "zod";
import { TelegramService } from "../services/telegram-service.js";

const sendMessageParams = z.object({
	chatId: z
		.union([z.string(), z.number()])
		.describe(
			"The chat ID or channel username (e.g., @channelname or -1001234567890)",
		),
	text: z.string().min(1).describe("The message text to send"),
	topicId: z
		.number()
		.optional()
		.describe("The topic ID for forum channels (optional)"),
});

type SendMessageParams = z.infer<typeof sendMessageParams>;

export const sendMessageTool = {
	name: "SEND_MESSAGE",
	description: "Send a message to a Telegram chat or channel",
	parameters: sendMessageParams,
	execute: async (params: SendMessageParams) => {
		const telegramService = new TelegramService();

		try {
			const messageInfo = await telegramService.sendMessage(
				params.chatId,
				params.text,
				params.topicId,
			);

			return dedent`
				Message sent successfully!

				Message ID: ${messageInfo.messageId}
				Chat ID: ${messageInfo.chatId}
				Sent at: ${new Date(messageInfo.date * 1000).toISOString()}
				Text: ${messageInfo.text || "N/A"}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("BOT_TOKEN")) {
					return "Error: Telegram bot token is not configured. Please set the TELEGRAM_BOT_TOKEN environment variable.";
				}
				return `Error sending message: ${error.message}`;
			}
			return "An unknown error occurred while sending the message";
		}
	},
} as const;
