# Telegram MCP Server

An MCP (Model Context Protocol) server for interacting with Telegram bots and channels using the Telegraf library.

## Features

- **SEND_MESSAGE**: Send messages to channels or chats
- **GET_CHANNEL_INFO**: Get information about channels/chats
- **FORWARD_MESSAGE**: Forward messages between chats
- **PIN_MESSAGE**: Pin messages in channels
- **GET_CHANNEL_MEMBERS**: Get list of channel administrators
- **AI SAMPLING**: Automatic AI-powered responses to Telegram messages using FastMCP sampling

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up your Telegram bot token:

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
```

3. Build the project:

```bash
npm run build
```

4. Start the MCP server:

```bash
npm start
```

## Usage

The server communicates over stdio and can be used with any MCP-compatible client.

### Available Tools

#### SEND_MESSAGE

Send a message to a Telegram chat or channel.

- `chatId`: Chat ID or username (e.g., @channelname or -1001234567890)
- `text`: Message text
- `parseMode`: Optional formatting (HTML, Markdown, MarkdownV2)
- `disableWebPagePreview`: Optional boolean
- `disableNotification`: Optional boolean for silent messages

#### GET_CHANNEL_INFO

Get information about a channel or chat.

- `channelId`: Channel ID or username

#### FORWARD_MESSAGE

Forward a message from one chat to another.

- `fromChatId`: Source chat ID
- `toChatId`: Destination chat ID
- `messageId`: Message ID to forward
- `disableNotification`: Optional boolean for silent forwarding

#### PIN_MESSAGE

Pin a message in a chat or channel.

- `chatId`: Chat ID or username
- `messageId`: Message ID to pin
- `disableNotification`: Optional boolean for silent pinning

#### GET_CHANNEL_MEMBERS

Get channel administrators (limited by Telegram API).

- `channelId`: Channel ID or username
- `limit`: Maximum number of members to retrieve (1-50, default: 10)

## AI Sampling Feature

The server includes an AI sampling feature that automatically responds to Telegram messages using FastMCP's sampling capability. When a client connects to the MCP server, a Telegram bot is started that listens for incoming messages and generates AI-powered responses.

### How It Works

1. **Client Connection**: When an MCP client connects to the server, the Telegram bot starts automatically
2. **Message Processing**: The bot listens for text messages in any chat where it's present
3. **AI Response**: Each message is sent to the AI using FastMCP's sampling feature
4. **Response Delivery**: The AI-generated response is sent back to the same chat

### Bot Commands

- `/start`: Initialize the bot and get a welcome message
- `/help`: Get help information about the bot's capabilities

### Usage

1. Add your bot to a Telegram chat or channel
2. Start the MCP server with a connected client
3. Send any message to the bot in Telegram
4. The bot will respond with an AI-generated message

### Example Interaction

```
User: Hello, how are you?
Bot: Hello! I'm doing well, thank you for asking. I'm here to help you with any questions or tasks you might have. How can I assist you today?

User: What's the weather like?
Bot: I don't have access to real-time weather information, but I'd be happy to help you find weather resources or discuss weather-related topics. You might want to check a weather app or website for current conditions in your area.
```

### Configuration

The AI sampling feature uses the same `TELEGRAM_BOT_TOKEN` environment variable as the other tools. The AI responses are generated with:

- **System Prompt**: "You are a helpful AI assistant responding to messages in a Telegram chat. Be concise and helpful."
- **Max Tokens**: 1000
- **Context**: Includes the current server context for better responses

## Usage Examples

### SEND_MESSAGE

Send a message to a Telegram channel:

```json
{
  "tool_name": "SEND_MESSAGE",
  "arguments": {
    "chatId": "@mychannel",
    "text": "Hello from the Telegram MCP Server!"
  }
}
```

### GET_CHANNEL_INFO

Get information about a Telegram channel:

```json
{
  "tool_name": "GET_CHANNEL_INFO",
  "arguments": {
    "channelId": "@mychannel"
  }
}
```

## Response Examples

### SEND_MESSAGE

Successful response:

```json
{
  "success": true,
  "result": "Message sent successfully!\n\nMessage ID: 123\nChat ID: @mychannel\nSent at: 2024-03-15T12:34:56.789Z\nText: Hello from the Telegram MCP Server!"
}
```

### GET_CHANNEL_INFO

Successful response:

```json
{
  "success": true,
  "result": "Channel Information:\n\nTitle: My Channel\nID: -1001234567890\nType: channel\nUsername: mychannel\nDescription: This is my Telegram channel.\nMember Count: 1234"
}
```

## Error Handling

The tools will return an error message in the `result` field if an error occurs. Common errors include:

- **Missing bot token:** Ensure the `TELEGRAM_BOT_TOKEN` environment variable is set.
- **Invalid chat ID:** Double-check the chat ID or username.
- **Bot not in channel:** Add the bot to the channel with appropriate permissions.

## Environment Variables

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token (required)

## Bot Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Add your bot to channels with appropriate permissions
4. Use channel usernames (e.g., @mychannel) or chat IDs for interactions

To install the required dependencies, run:

```bash
npm install telegraf zod dedent fastmcp
```

```bash
npm install -D @types/node typescript tsx
```

This Telegram MCP server provides comprehensive tools for interacting with Telegram channels and chats, including sending messages, getting channel information, forwarding messages, pinning messages, and retrieving member lists. The bot uses the Telegraf library which is a modern and feature-rich Telegram bot framework for Node.js.
