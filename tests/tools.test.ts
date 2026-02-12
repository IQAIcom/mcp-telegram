import { describe, expect, it } from "vitest";
import { sendMessageTool } from "../src/tools/send-message.js";
import { getChannelInfoTool } from "../src/tools/get-channel-info.js";
import { forwardMessageTool } from "../src/tools/forward-message.js";
import { pinMessageTool } from "../src/tools/pin-message.js";
import { getChannelMembersTool } from "../src/tools/get-channel-members.js";

describe("MCP Tools", () => {
	describe("sendMessageTool", () => {
		it("should have correct name", () => {
			expect(sendMessageTool.name).toBe("SEND_MESSAGE");
		});

		it("should have a description", () => {
			expect(sendMessageTool.description).toBeDefined();
			expect(typeof sendMessageTool.description).toBe("string");
		});

		it("should have parameters schema", () => {
			expect(sendMessageTool.parameters).toBeDefined();
		});

		it("should validate valid parameters", () => {
			const result = sendMessageTool.parameters.safeParse({
				chatId: "@testchannel",
				text: "Hello world",
			});
			expect(result.success).toBe(true);
		});

		it("should reject empty text", () => {
			const result = sendMessageTool.parameters.safeParse({
				chatId: "@testchannel",
				text: "",
			});
			expect(result.success).toBe(false);
		});

		it("should accept numeric chatId", () => {
			const result = sendMessageTool.parameters.safeParse({
				chatId: -1001234567890,
				text: "Hello",
			});
			expect(result.success).toBe(true);
		});

		it("should accept optional topicId", () => {
			const result = sendMessageTool.parameters.safeParse({
				chatId: "@testchannel",
				text: "Hello",
				topicId: 123,
			});
			expect(result.success).toBe(true);
		});

		it("should accept optional parseMode", () => {
			const result = sendMessageTool.parameters.safeParse({
				chatId: "@testchannel",
				text: "Hello",
				parseMode: "HTML",
			});
			expect(result.success).toBe(true);
		});

		it("should accept parseMode Text for plain messages", () => {
			const result = sendMessageTool.parameters.safeParse({
				chatId: "@testchannel",
				text: "Hello",
				parseMode: "Text",
			});
			expect(result.success).toBe(true);
		});
	});

	describe("getChannelInfoTool", () => {
		it("should have correct name", () => {
			expect(getChannelInfoTool.name).toBe("GET_CHANNEL_INFO");
		});

		it("should have a description", () => {
			expect(getChannelInfoTool.description).toBeDefined();
		});

		it("should validate valid parameters", () => {
			const result = getChannelInfoTool.parameters.safeParse({
				channelId: "@testchannel",
			});
			expect(result.success).toBe(true);
		});

		it("should accept numeric channelId", () => {
			const result = getChannelInfoTool.parameters.safeParse({
				channelId: -1001234567890,
			});
			expect(result.success).toBe(true);
		});
	});

	describe("forwardMessageTool", () => {
		it("should have correct name", () => {
			expect(forwardMessageTool.name).toBe("FORWARD_MESSAGE");
		});

		it("should have a description", () => {
			expect(forwardMessageTool.description).toBeDefined();
		});

		it("should validate valid parameters", () => {
			const result = forwardMessageTool.parameters.safeParse({
				fromChatId: "@source",
				toChatId: "@destination",
				messageId: 123,
			});
			expect(result.success).toBe(true);
		});

		it("should accept optional disableNotification", () => {
			const result = forwardMessageTool.parameters.safeParse({
				fromChatId: "@source",
				toChatId: "@destination",
				messageId: 123,
				disableNotification: true,
			});
			expect(result.success).toBe(true);
		});
	});

	describe("pinMessageTool", () => {
		it("should have correct name", () => {
			expect(pinMessageTool.name).toBe("PIN_MESSAGE");
		});

		it("should have a description", () => {
			expect(pinMessageTool.description).toBeDefined();
		});

		it("should validate valid parameters", () => {
			const result = pinMessageTool.parameters.safeParse({
				chatId: "@testchannel",
				messageId: 123,
			});
			expect(result.success).toBe(true);
		});

		it("should accept optional disableNotification", () => {
			const result = pinMessageTool.parameters.safeParse({
				chatId: "@testchannel",
				messageId: 123,
				disableNotification: true,
			});
			expect(result.success).toBe(true);
		});
	});

	describe("getChannelMembersTool", () => {
		it("should have correct name", () => {
			expect(getChannelMembersTool.name).toBe("GET_CHANNEL_MEMBERS");
		});

		it("should have a description", () => {
			expect(getChannelMembersTool.description).toBeDefined();
		});

		it("should validate valid parameters", () => {
			const result = getChannelMembersTool.parameters.safeParse({
				channelId: "@testchannel",
			});
			expect(result.success).toBe(true);
		});

		it("should accept optional limit", () => {
			const result = getChannelMembersTool.parameters.safeParse({
				channelId: "@testchannel",
				limit: 25,
			});
			expect(result.success).toBe(true);
		});

		it("should reject limit over 50", () => {
			const result = getChannelMembersTool.parameters.safeParse({
				channelId: "@testchannel",
				limit: 100,
			});
			expect(result.success).toBe(false);
		});

		it("should reject limit under 1", () => {
			const result = getChannelMembersTool.parameters.safeParse({
				channelId: "@testchannel",
				limit: 0,
			});
			expect(result.success).toBe(false);
		});
	});
});
