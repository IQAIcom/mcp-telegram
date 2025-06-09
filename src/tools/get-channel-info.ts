import dedent from "dedent";
import { z } from "zod";
import { TelegramService } from "../services/telegram-service.js";

const getChannelInfoParams = z.object({
	channelId: z
		.union([z.string(), z.number()])
		.describe(
			"The channel ID or username (e.g., @channelname or -1001234567890)",
		),
});

type GetChannelInfoParams = z.infer<typeof getChannelInfoParams>;

export const getChannelInfoTool = {
	name: "GET_CHANNEL_INFO",
	description: "Get information about a Telegram channel or chat",
	parameters: getChannelInfoParams,
	execute: async (params: GetChannelInfoParams) => {
		const telegramService = new TelegramService();

		try {
			const channelInfo = await telegramService.getChannelInfo(
				params.channelId,
			);

			return dedent`
				Channel Information:

				Title: ${channelInfo.title}
				ID: ${channelInfo.id}
				Type: ${channelInfo.type}
				Username: ${channelInfo.username || "N/A"}
				Description: ${channelInfo.description || "N/A"}
				Member Count: ${channelInfo.memberCount || "N/A"}
			`;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("BOT_TOKEN")) {
					return "Error: Telegram bot token is not configured. Please set the TELEGRAM_BOT_TOKEN environment variable.";
				}
				return `Error getting channel info: ${error.message}`;
			}
			return "An unknown error occurred while getting channel information";
		}
	},
} as const;
