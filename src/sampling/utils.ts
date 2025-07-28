import type { RateLimitEntry, MessageTemplateData } from "./types.js";
import { samplingConfig } from "../config.js";

export class RateLimiter {
	private userRateLimit = new Map<number, RateLimitEntry>();
	private chatRateLimit = new Map<number, RateLimitEntry>();

	checkRateLimit(userId: number, chatId: number): boolean {
		const now = Date.now();
		const minute = 60 * 1000;

		// Check user rate limit
		const userLimit = this.userRateLimit.get(userId);
		if (userLimit) {
			if (now < userLimit.resetTime) {
				if (userLimit.count >= samplingConfig.rateLimitPerUser) {
					return false;
				}
				userLimit.count++;
			} else {
				this.userRateLimit.set(userId, { count: 1, resetTime: now + minute });
			}
		} else {
			this.userRateLimit.set(userId, { count: 1, resetTime: now + minute });
		}

		// Check chat rate limit
		const chatLimit = this.chatRateLimit.get(chatId);
		if (chatLimit) {
			if (now < chatLimit.resetTime) {
				if (chatLimit.count >= samplingConfig.rateLimitPerChat) {
					return false;
				}
				chatLimit.count++;
			} else {
				this.chatRateLimit.set(chatId, { count: 1, resetTime: now + minute });
			}
		} else {
			this.chatRateLimit.set(chatId, { count: 1, resetTime: now + minute });
		}

		return true;
	}

	getRateLimitStatus(
		userId: number,
		chatId: number,
	): {
		userLimit: RateLimitEntry | undefined;
		chatLimit: RateLimitEntry | undefined;
	} {
		return {
			userLimit: this.userRateLimit.get(userId),
			chatLimit: this.chatRateLimit.get(chatId),
		};
	}

	resetRateLimits(): void {
		this.userRateLimit.clear();
		this.chatRateLimit.clear();
	}
}

export function formatTemplate(
	template: string,
	data: MessageTemplateData,
): string {
	return template.replace(/\{(\w+)\}/g, (match, key) => {
		return data[key]?.toString() || match;
	});
}

export function getEnabledFeatures(): string[] {
	const features = [
		"🤖 AI-powered responses to messages",
		"📝 Text message processing",
	];

	if (samplingConfig.enabledListeners.photo) features.push("📸 Photo analysis");
	if (samplingConfig.enabledListeners.document)
		features.push("📄 Document processing");
	if (samplingConfig.enabledListeners.voice)
		features.push("🎵 Voice message handling");
	if (samplingConfig.enabledListeners.video)
		features.push("🎥 Video processing");
	if (samplingConfig.enabledListeners.sticker)
		features.push("😄 Sticker responses");
	if (samplingConfig.enabledListeners.location)
		features.push("📍 Location awareness");
	if (samplingConfig.enabledListeners.contact)
		features.push("👤 Contact processing");
	if (samplingConfig.enabledListeners.poll)
		features.push("📊 Poll interaction");

	return features;
}

export function getActiveListeners(): string {
	return Object.entries(samplingConfig.enabledListeners)
		.filter(([_, enabled]) => enabled)
		.map(([type]) => type)
		.join(", ");
}
