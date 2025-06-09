import dedent from "dedent";
import { z } from "zod";
import { TelegramService } from "../services/telegram-service.js";

const pinMessageParams = z.object({
	chatId: z
		.union([z.string(), z.number()])
		.describe("The chat ID or channel username"),
	messageId: z.number().describe("ID of the message to pin"),
	disableNotification: z.boolean().optional().describe("Pin message silently"),
});

type PinMessageParams = z.infer<typeof pinMessageParams>;

export const pinMessageTool = {
	name: "PIN_MESSAGE",
	description: "Pin a message in a Telegram chat or channel",
	parameters: pinMessageParams,
	execute: async (params: PinMessageParams) => {
		const telegramService = new TelegramService();

		try {
			const success = await telegramService.pinMessage(
				params.chatId,
				params.messageId,
				{
					disableNotification: params.disableNotification,
				},
			);

			if (success) {
				return dedent`
					Message pinned successfully!

					Chat ID: ${params.chatId}
					Message ID: ${params.messageId}
					Silent: ${params.disableNotification ? "Yes" : "No"}
				`;
			}
			return "Failed to pin message";
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("BOT_TOKEN")) {
					return "Error: Telegram bot token is not configured. Please set the TELEGRAM_BOT_TOKEN environment variable.";
				}
				return `Error pinning message: ${error.message}`;
			}
			return "An unknown error occurred while pinning the message";
		}
	},
} as const;
