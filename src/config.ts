import { config } from "dotenv";
import { z } from "zod";
import { MessageType, TemplateType } from "./sampling/types.js";

config();

const envSchema = z.object({
	// Required
	TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN environment variable must be set"),

	// Sampling control
	SAMPLING_ENABLED: z.coerce.boolean().default(true),

	// Response trigger settings
	SAMPLING_MENTION_ONLY: z.coerce.boolean().default(true),
	SAMPLING_RESPOND_TO_DMS: z.coerce.boolean().default(true),

	// Access control (comma-separated lists)
	SAMPLING_ALLOWED_CHATS: z
		.string()
		.default("")
		.transform((val) =>
			val
				? val
						.split(",")
						.map((id) => id.trim())
						.filter((id) => id.length > 0)
						.map((id) => {
							// Handle numeric IDs
							const numId = Number.parseInt(id);
							if (!Number.isNaN(numId)) return numId;
							// Handle username strings (normalize to include @)
							return id.startsWith("@") ? id : `@${id}`;
						})
				: [],
		),
	SAMPLING_BLOCKED_CHATS: z
		.string()
		.default("")
		.transform((val) =>
			val
				? val
						.split(",")
						.map((id) => id.trim())
						.filter((id) => id.length > 0)
						.map((id) => {
							// Handle numeric IDs
							const numId = Number.parseInt(id);
							if (!Number.isNaN(numId)) return numId;
							// Handle username strings (normalize to include @)
							return id.startsWith("@") ? id : `@${id}`;
						})
				: [],
		),
	SAMPLING_ALLOWED_USERS: z
		.string()
		.default("")
		.transform((val) =>
			val
				? val
						.split(",")
						.map((id) => Number.parseInt(id.trim()))
						.filter((id) => !Number.isNaN(id))
				: [],
		),
	SAMPLING_BLOCKED_USERS: z
		.string()
		.default("")
		.transform((val) =>
			val
				? val
						.split(",")
						.map((id) => Number.parseInt(id.trim()))
						.filter((id) => !Number.isNaN(id))
				: [],
		),
	SAMPLING_ADMIN_USERS: z
		.string()
		.default("")
		.transform((val) =>
			val
				? val
						.split(",")
						.map((id) => Number.parseInt(id.trim()))
						.filter((id) => !Number.isNaN(id))
				: [],
		),

	// Message type handlers
	SAMPLING_ENABLE_TEXT: z.coerce.boolean().default(true),
	SAMPLING_ENABLE_PHOTO: z.coerce.boolean().default(false),
	SAMPLING_ENABLE_DOCUMENT: z.coerce.boolean().default(false),
	SAMPLING_ENABLE_VOICE: z.coerce.boolean().default(false),
	SAMPLING_ENABLE_VIDEO: z.coerce.boolean().default(false),
	SAMPLING_ENABLE_STICKER: z.coerce.boolean().default(false),
	SAMPLING_ENABLE_LOCATION: z.coerce.boolean().default(false),
	SAMPLING_ENABLE_CONTACT: z.coerce.boolean().default(false),
	SAMPLING_ENABLE_POLL: z.coerce.boolean().default(false),

	// Response behavior
	SAMPLING_MAX_TOKENS: z.coerce.number().default(1000),
	SAMPLING_SHOW_TYPING: z.coerce.boolean().default(true),
	SAMPLING_SILENT_MODE: z.coerce.boolean().default(false),

	// Rate limiting
	SAMPLING_RATE_LIMIT_USER: z.coerce.number().default(10),
	SAMPLING_RATE_LIMIT_CHAT: z.coerce.number().default(20),

	// Message filters
	SAMPLING_MIN_MESSAGE_LENGTH: z.coerce.number().default(1),
	SAMPLING_MAX_MESSAGE_LENGTH: z.coerce.number().default(1000),
	SAMPLING_KEYWORD_TRIGGERS: z
		.string()
		.default("")
		.transform((val) =>
			val
				? val
						.split(",")
						.map((keyword) => keyword.trim())
						.filter((keyword) => keyword.length > 0)
				: [],
		),
	SAMPLING_IGNORE_COMMANDS: z.coerce.boolean().default(true),
});

export const env = envSchema.parse(process.env);

// Create sampling config object from env variables
export const samplingConfig = {
	// Sampling control
	enabled: env.SAMPLING_ENABLED,

	// Response trigger settings
	mentionOnly: env.SAMPLING_MENTION_ONLY,
	respondToPrivateMessages: env.SAMPLING_RESPOND_TO_DMS,

	// Access control
	allowedChats: env.SAMPLING_ALLOWED_CHATS,
	blockedChats: env.SAMPLING_BLOCKED_CHATS,
	allowedUsers: env.SAMPLING_ALLOWED_USERS,
	blockedUsers: env.SAMPLING_BLOCKED_USERS,
	adminUsers: env.SAMPLING_ADMIN_USERS,

	// Message type handlers
	enabledListeners: {
		[MessageType.TEXT]: env.SAMPLING_ENABLE_TEXT,
		[MessageType.PHOTO]: env.SAMPLING_ENABLE_PHOTO,
		[MessageType.DOCUMENT]: env.SAMPLING_ENABLE_DOCUMENT,
		[MessageType.VOICE]: env.SAMPLING_ENABLE_VOICE,
		[MessageType.VIDEO]: env.SAMPLING_ENABLE_VIDEO,
		[MessageType.STICKER]: env.SAMPLING_ENABLE_STICKER,
		[MessageType.LOCATION]: env.SAMPLING_ENABLE_LOCATION,
		[MessageType.CONTACT]: env.SAMPLING_ENABLE_CONTACT,
		[MessageType.POLL]: env.SAMPLING_ENABLE_POLL,
	},

	// Response behavior
	maxTokens: env.SAMPLING_MAX_TOKENS,
	showTypingIndicator: env.SAMPLING_SHOW_TYPING,
	silentMode: env.SAMPLING_SILENT_MODE,

	// Rate limiting
	rateLimitPerUser: env.SAMPLING_RATE_LIMIT_USER,
	rateLimitPerChat: env.SAMPLING_RATE_LIMIT_CHAT,

	// Message filters
	minMessageLength: env.SAMPLING_MIN_MESSAGE_LENGTH,
	maxMessageLength: env.SAMPLING_MAX_MESSAGE_LENGTH,
	keywordTriggers: env.SAMPLING_KEYWORD_TRIGGERS,
	ignoreCommands: env.SAMPLING_IGNORE_COMMANDS,

	// Response templates
	templates: {
		[TemplateType.TEXT]: `NEW TELEGRAM MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.TEXT}
content: {content}`,

		[TemplateType.PHOTO]: `NEW PHOTO MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.PHOTO}
caption: {caption}
photo_info: {photoInfo}`,

		[TemplateType.DOCUMENT]: `NEW DOCUMENT MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.DOCUMENT}
filename: {fileName}
mime_type: {mimeType}
caption: {caption}`,

		[TemplateType.VOICE]: `NEW VOICE MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.VOICE}
duration: {duration}s`,

		[TemplateType.VIDEO]: `NEW VIDEO MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.VIDEO}
caption: {caption}
duration: {duration}s`,

		[TemplateType.STICKER]: `NEW STICKER MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.STICKER}
emoji: {stickerEmoji}
set_name: {stickerSetName}`,

		[TemplateType.LOCATION]: `NEW LOCATION MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.LOCATION}
latitude: {latitude}
longitude: {longitude}`,

		[TemplateType.CONTACT]: `NEW CONTACT MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.CONTACT}
contact_name: {contactName}
phone_number: {phoneNumber}`,

		[TemplateType.POLL]: `NEW POLL MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: ${MessageType.POLL}
question: {pollQuestion}
options: {pollOptions}`,

		[TemplateType.FALLBACK]: `NEW MESSAGE FROM:
user_id: {userId}
chat_id: {chatId}
isDM: {isDM}
message_id: {messageId}
message_type: {messageType}
content: {content}`,
	},
} as const;
