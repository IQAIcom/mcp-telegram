#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { forwardMessageTool } from "./tools/forward-message.js";
import { getChannelInfoTool } from "./tools/get-channel-info.js";
import { getChannelMembersTool } from "./tools/get-channel-members.js";
import { pinMessageTool } from "./tools/pin-message.js";
import { sendMessageTool } from "./tools/send-message.js";

async function main() {
	console.log("Initializing Telegram MCP Server...");

	const server = new FastMCP({
		name: "Telegram MCP Server",
		version: "0.0.1",
	});

	// Add Telegram tools
	server.addTool(sendMessageTool);
	server.addTool(getChannelInfoTool);
	server.addTool(forwardMessageTool);
	server.addTool(pinMessageTool);
	server.addTool(getChannelMembersTool);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log("✅ Telegram MCP Server started successfully over stdio.");
		console.log("   You can now connect to it using an MCP client.");
		console.log(
			"   Available tools: SEND_MESSAGE, GET_CHANNEL_INFO, FORWARD_MESSAGE, PIN_MESSAGE, GET_CHANNEL_MEMBERS",
		);
	} catch (error) {
		console.error("❌ Failed to start Telegram MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the Telegram MCP Server:",
		error,
	);
	process.exit(1);
});
