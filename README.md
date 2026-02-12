# Telegram MCP Server

[![npm version](https://img.shields.io/npm/v/@iqai/mcp-telegram.svg)](https://www.npmjs.com/package/@iqai/mcp-telegram)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

An MCP (Model Context Protocol) server for interacting with Telegram bots and channels using the Telegraf library. This server enables AI agents to send messages, manage channels, forward content, and respond intelligently to Telegram conversations.

By implementing the Model Context Protocol (MCP), this server allows Large Language Models (LLMs) to interact with Telegram directly through their context window, bridging the gap between AI and messaging platforms.

## Features

### Core Tools

*   **SEND_MESSAGE**: Send messages to channels or chats with optional topic support
*   **GET_CHANNEL_INFO**: Get information about channels/chats
*   **FORWARD_MESSAGE**: Forward messages between chats
*   **PIN_MESSAGE**: Pin messages in channels
*   **GET_CHANNEL_MEMBERS**: Get list of channel administrators

### AI Sampling (Enhanced)

*   **Intelligent Responses**: AI-powered responses using FastMCP sampling
*   **Mention-Only Mode**: Smart filtering - responds when mentioned in groups
*   **Multi-Message Types**: Supports text, photos, documents, voice, video, stickers, locations, contacts, polls
*   **Access Control**: Configurable user/chat allow/block lists
*   **Rate Limiting**: Per-user and per-chat rate limiting
*   **Advanced Configuration**: Highly customizable behavior and templates

## Installation

### Using npx (Recommended)

To use this server without installing it globally:

```bash
npx @iqai/mcp-telegram
```

### Build from Source

```bash
git clone https://github.com/IQAIcom/mcp-telegram.git
cd mcp-telegram
pnpm install
pnpm run build
```

## Running with an MCP Client

Add the following configuration to your MCP client settings (e.g., `claude_desktop_config.json`).

### Minimal Configuration

```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["-y", "@iqai/mcp-telegram"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_bot_token_here"
      }
    }
  }
}
```

### Advanced Configuration (Local Build)

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-telegram/dist/index.js"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_bot_token_here",
        "SAMPLING_ENABLED": "true",
        "SAMPLING_MENTION_ONLY": "true"
      }
    }
  }
}
```

## Configuration (Environment Variables)

### Required

| Variable | Required | Description |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Yes | Your Telegram bot token from [@BotFather](https://t.me/botfather) |

### Sampling Configuration

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SAMPLING_ENABLED` | `true` | Enable/disable AI sampling entirely |
| `SAMPLING_MENTION_ONLY` | `true` | Only respond when mentioned in groups |
| `SAMPLING_RESPOND_TO_DMS` | `true` | Always respond in DMs |
| `SAMPLING_MAX_TOKENS` | `1000` | Max tokens per AI response |
| `SAMPLING_SHOW_TYPING` | `true` | Show typing indicator |
| `SAMPLING_SILENT_MODE` | `false` | Log but don't respond |

### Access Control

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SAMPLING_ALLOWED_CHATS` | `""` | Comma-separated chat IDs/usernames to allow (empty = all) |
| `SAMPLING_BLOCKED_CHATS` | `""` | Comma-separated chat IDs/usernames to ignore |
| `SAMPLING_ALLOWED_USERS` | `""` | Comma-separated user IDs to allow (empty = all) |
| `SAMPLING_BLOCKED_USERS` | `""` | Comma-separated user IDs to ignore |
| `SAMPLING_ADMIN_USERS` | `""` | Comma-separated user IDs who can use admin commands |

### Rate Limiting

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SAMPLING_RATE_LIMIT_USER` | `10` | Max requests per user per minute |
| `SAMPLING_RATE_LIMIT_CHAT` | `20` | Max requests per chat per minute |

### Message Type Support

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SAMPLING_ENABLE_TEXT` | `true` | Enable text messages |
| `SAMPLING_ENABLE_PHOTO` | `true` | Enable photo messages |
| `SAMPLING_ENABLE_DOCUMENT` | `true` | Enable document uploads |
| `SAMPLING_ENABLE_VOICE` | `true` | Enable voice messages |
| `SAMPLING_ENABLE_VIDEO` | `true` | Enable video messages |
| `SAMPLING_ENABLE_STICKER` | `true` | Enable sticker messages |
| `SAMPLING_ENABLE_LOCATION` | `true` | Enable location sharing |
| `SAMPLING_ENABLE_CONTACT` | `true` | Enable contact sharing |
| `SAMPLING_ENABLE_POLL` | `true` | Enable poll messages |

### Content Filtering

| Variable | Default | Description |
| :--- | :--- | :--- |
| `SAMPLING_MIN_MESSAGE_LENGTH` | `1` | Minimum message length |
| `SAMPLING_MAX_MESSAGE_LENGTH` | `1000` | Maximum message length |
| `SAMPLING_KEYWORD_TRIGGERS` | `""` | Only respond to messages with these keywords |
| `SAMPLING_IGNORE_COMMANDS` | `true` | Ignore messages starting with / |

## Usage Examples

### Market Discovery
*   "Send a message to @mychannel saying hello"
*   "Get information about @telegram channel"
*   "Forward message 123 from @source to @destination"

### Bot Commands
*   `/start`: Initialize the bot and get a welcome message
*   `/help`: Get help information about available features
*   `/config`: View current configuration (admin users only)

## MCP Tools

<!-- AUTO-GENERATED TOOLS START -->

### `FORWARD_MESSAGE`
Forward a message from one chat to another

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromChatId` | string | number | Yes | Source chat ID or username |
| `toChatId` | string | number | Yes | Destination chat ID or username |
| `messageId` | number | Yes | ID of the message to forward |
| `disableNotification` | boolean |  | Forward message silently |

### `GET_CHANNEL_INFO`
Get information about a Telegram channel or chat

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channelId` | string | number | Yes | The channel ID or username (e.g., @channelname or -1001234567890) |

### `GET_CHANNEL_MEMBERS`
Get a list of channel administrators and members

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channelId` | string | number | Yes |  | The channel ID or username |
| `limit` | number |  | 10 | Maximum number of members to retrieve (1-50) |

### `PIN_MESSAGE`
Pin a message in a Telegram chat or channel

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chatId` | string | number | Yes | The chat ID or channel username |
| `messageId` | number | Yes | ID of the message to pin |
| `disableNotification` | boolean |  | Pin message silently |

### `SEND_MESSAGE`
Send a message to a Telegram chat or channel

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chatId` | string | number | Yes | The chat ID or channel username (e.g., @channelname or -1001234567890) |
| `text` | string | Yes | The message text to send |
| `topicId` | number |  | The topic ID for forum channels (optional) |
| `parseMode` | string |  | Parse mode for Telegram rendering. Use Text for plain text without formatting. |

<!-- AUTO-GENERATED TOOLS END -->

## Development

### Build Project
```bash
pnpm run build
```

### Development Mode (Watch)
```bash
pnpm run watch
```

### Linting & Formatting
```bash
pnpm run lint
pnpm run format
```

### Project Structure
*   `src/tools/`: Individual tool definitions
*   `src/services/`: Telegram service and bot logic
*   `src/sampling/`: AI sampling feature implementation
*   `src/config.ts`: Configuration with Zod validation
*   `src/index.ts`: Server entry point

## Getting Your Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command
3. Follow the prompts to create your bot
4. Copy the bot token provided
5. Set it as an environment variable

## Resources

*   [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
*   [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
*   [Telegraf Documentation](https://telegraf.js.org/)

## Disclaimer

This project is an unofficial tool. Users should ensure their bot usage complies with Telegram's Terms of Service and Bot API policies.

## License

[MIT](LICENSE)
