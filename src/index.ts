#!/usr/bin/env node
import { FastMCP, type FastMCPSession } from "fastmcp";
import { forwardMessageTool } from "./tools/forward-message.js";
import { getChannelInfoTool } from "./tools/get-channel-info.js";
import { getChannelMembersTool } from "./tools/get-channel-members.js";
import { pinMessageTool } from "./tools/pin-message.js";
import { sendMessageTool } from "./tools/send-message.js";
import { SamplingHandler } from "./sampling/handler.js";
import { samplingConfig } from "./config.js";

// =============================================================================
// CONSTANTS
// =============================================================================

const SERVER_CONFIG = {
	name: "Telegram MCP Server",
	version: "0.0.1" as const,
	transportType: "stdio" as const,
};

const AVAILABLE_TOOLS = [
	"SEND_MESSAGE",
	"GET_CHANNEL_INFO",
	"FORWARD_MESSAGE",
	"PIN_MESSAGE",
	"GET_CHANNEL_MEMBERS",
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function addTelegramTools(server: FastMCP): void {
	server.addTool(sendMessageTool);
	server.addTool(getChannelInfoTool);
	server.addTool(forwardMessageTool);
	server.addTool(pinMessageTool);
	server.addTool(getChannelMembersTool);
}

function setupSessionEventHandlers(server: FastMCP): SamplingHandler | null {
	let samplingHandler: SamplingHandler | null = null;

	server.on("connect", (event) => {
		console.log("🔌 Client connected:", event.session);

		if (samplingConfig.enabled) {
			if (!samplingHandler) {
				initializeSamplingHandler(event.session)
					.then((handler) => {
						samplingHandler = handler;
						console.log("✅ Telegram sampling handler initialized");
					})
					.catch((error) => {
						console.error("❌ Failed to initialize sampling handler:", error);
					});
			} else {
				samplingHandler.updateSession(event.session);
				console.log("🔄 Session updated for existing sampling handler");
			}
		} else {
			console.log("ℹ️  Sampling is disabled via SAMPLING_ENABLED=false");
		}
	});

	server.on("disconnect", (event) => {
		console.log("🔌 Client disconnected:", event.session);
	});

	return samplingHandler;
}

async function initializeSamplingHandler(
	session: FastMCPSession,
): Promise<SamplingHandler> {
	const handler = new SamplingHandler(session);

	await handler.start();
	console.log("🤖 Telegram bot started for AI sampling");

	return handler;
}

function setupGracefulShutdown(samplingHandler: SamplingHandler | null): void {
	const shutdown = async (signal: string) => {
		console.log(
			`\n🛑 Received ${signal}, shutting down Telegram MCP Server...`,
		);

		if (samplingHandler && samplingConfig.enabled) {
			try {
				await samplingHandler.stop();
				console.log("✅ Telegram bot stopped gracefully");
			} catch (error) {
				console.error("❌ Error stopping Telegram bot:", error);
			}
		} else if (samplingConfig.enabled) {
			console.log("ℹ️  No Telegram bot to stop (not initialized yet)");
		} else {
			console.log("ℹ️  No Telegram bot to stop (sampling was disabled)");
		}

		process.exit(0);
	};

	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));
}

function logStartupInfo(): void {
	console.log("✅ Telegram MCP Server started successfully over stdio");
	console.log("📡 Ready to accept MCP client connections");
	console.log(`🛠️  Available tools: ${AVAILABLE_TOOLS.join(", ")}`);

	if (samplingConfig.enabled) {
		console.log(
			"🤖 Telegram bot will start when first client connects for AI sampling",
		);
		console.log("💡 Make sure TELEGRAM_BOT_TOKEN environment variable is set");
	} else {
		console.log("⚠️  AI sampling is disabled (SAMPLING_ENABLED=false)");
		console.log("💡 Only core MCP tools will be available");
	}
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main(): Promise<void> {
	console.log("🚀 Initializing Telegram MCP Server...");

	// Create and configure server
	const server = new FastMCP({
		name: SERVER_CONFIG.name,
		version: SERVER_CONFIG.version,
	});

	// Add all Telegram tools
	addTelegramTools(server);

	// Set up session event handlers
	const samplingHandler = setupSessionEventHandlers(server);

	// Start the server
	try {
		await server.start({
			transportType: SERVER_CONFIG.transportType,
		});

		logStartupInfo();
	} catch (error) {
		console.error("❌ Failed to start Telegram MCP Server:", error);
		process.exit(1);
	}

	// Set up graceful shutdown
	setupGracefulShutdown(samplingHandler);
}

// =============================================================================
// ENTRY POINT
// =============================================================================

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the Telegram MCP Server:",
		error,
	);
	process.exit(1);
});
