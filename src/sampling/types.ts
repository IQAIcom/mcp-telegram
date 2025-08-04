import type { Context } from "telegraf";

export enum MessageType {
	TEXT = "text",
	PHOTO = "photo",
	DOCUMENT = "document",
	VOICE = "voice",
	VIDEO = "video",
	STICKER = "sticker",
	LOCATION = "location",
	CONTACT = "contact",
	POLL = "poll",
}

export enum TemplateType {
	TEXT = "text",
	PHOTO = "photo",
	DOCUMENT = "document",
	VOICE = "voice",
	VIDEO = "video",
	STICKER = "sticker",
	LOCATION = "location",
	CONTACT = "contact",
	POLL = "poll",
	FALLBACK = "fallback",
}

export interface SamplingRequest {
	userId: number;
	sessionId: string;
	content: string;
	chatId: number;
	messageId: number;
	messageType: MessageType;
	templateData: MessageTemplateData;
}

export interface RateLimitEntry {
	count: number;
	resetTime: number;
}

export interface MessageEntity {
	type: string;
	offset: number;
	length: number;
}

export interface MessageTemplateData {
	content: string;
	userId: number;
	chatId: number;
	isDM: boolean;
	messageId: number;
	topicId?: number;
	messageType?: string;
	caption?: string;
	photoInfo?: string;
	fileName?: string;
	mimeType?: string;
	duration?: number;
	stickerEmoji?: string;
	stickerSetName?: string;
	latitude?: number;
	longitude?: number;
	contactName?: string;
	phoneNumber?: string;
	pollQuestion?: string;
	pollOptions?: string;
	[key: string]: string | number | boolean | undefined;
}

export type TelegramMessage = NonNullable<Context["message"]>;
