import type { Context } from "telegraf";
import type { MessageTemplateData } from "./types.js";
import { MessageType } from "./types.js";

export function handleTextMessage(ctx: Context): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("text" in msg) || !msg.from || !ctx.chat) return null;

	return {
		content: msg.text,
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.TEXT,
	};
}

export function handlePhotoMessage(ctx: Context): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("photo" in msg) || !msg.from || !ctx.chat) return null;

	const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution

	return {
		content: msg.caption || "[Photo without caption]",
		caption: msg.caption || "",
		photoInfo: `${photo.width}x${photo.height}, ${photo.file_size || 0} bytes`,
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.PHOTO,
	};
}

export function handleDocumentMessage(
	ctx: Context,
): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("document" in msg) || !msg.from || !ctx.chat) return null;

	const doc = msg.document;

	return {
		content: msg.caption || "[Document without caption]",
		caption: msg.caption || "",
		fileName: doc.file_name || "unnamed",
		mimeType: doc.mime_type || "unknown",
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.DOCUMENT,
	};
}

export function handleVoiceMessage(ctx: Context): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("voice" in msg) || !msg.from || !ctx.chat) return null;

	const voice = msg.voice;

	return {
		content: "[Voice message]",
		duration: voice.duration,
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.VOICE,
	};
}

export function handleVideoMessage(ctx: Context): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("video" in msg) || !msg.from || !ctx.chat) return null;

	const video = msg.video;

	return {
		content: msg.caption || "[Video without caption]",
		caption: msg.caption || "",
		duration: video.duration,
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.VIDEO,
	};
}

export function handleStickerMessage(ctx: Context): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("sticker" in msg) || !msg.from || !ctx.chat) return null;

	const sticker = msg.sticker;

	return {
		content: `[Sticker: ${sticker.emoji || "no emoji"}]`,
		stickerEmoji: sticker.emoji || "",
		stickerSetName: sticker.set_name || "",
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.STICKER,
	};
}

export function handleLocationMessage(
	ctx: Context,
): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("location" in msg) || !msg.from || !ctx.chat) return null;

	const location = msg.location;

	return {
		content: `[Location: ${location.latitude}, ${location.longitude}]`,
		latitude: location.latitude,
		longitude: location.longitude,
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.LOCATION,
	};
}

export function handleContactMessage(ctx: Context): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("contact" in msg) || !msg.from || !ctx.chat) return null;

	const contact = msg.contact;

	return {
		content: `[Contact: ${contact.first_name} ${contact.last_name || ""}]`,
		contactName: `${contact.first_name} ${contact.last_name || ""}`.trim(),
		phoneNumber: contact.phone_number || "",
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.CONTACT,
	};
}

export function handlePollMessage(ctx: Context): MessageTemplateData | null {
	const msg = ctx.message;
	if (!msg || !("poll" in msg) || !msg.from || !ctx.chat) return null;

	const poll = msg.poll;

	return {
		content: `[Poll: ${poll.question}]`,
		pollQuestion: poll.question,
		pollOptions: poll.options.map((opt) => opt.text).join(", "),
		userId: msg.from.id,
		chatId: ctx.chat.id,
		isDM: ctx.chat.id === msg.from.id,
		messageId: msg.message_id,
		messageType: MessageType.POLL,
	};
}
