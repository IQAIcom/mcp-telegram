# Telegram MCP Server

An MCP (Model Context Protocol) server for interacting with Telegram bots and channels using the Telegraf library.

## Features

### Core Tools

- **SEND_MESSAGE**: Send messages to channels or chats
- **GET_CHANNEL_INFO**: Get information about channels/chats
- **FORWARD_MESSAGE**: Forward messages between chats
- **PIN_MESSAGE**: Pin messages in channels
- **GET_CHANNEL_MEMBERS**: Get list of channel administrators

### AI Sampling (Enhanced)

- **🤖 Intelligent Responses**: AI-powered responses using FastMCP sampling
- **🎯 Mention-Only Mode**: Smart filtering - responds when mentioned in groups
- **📱 Multi-Message Types**: Supports text, photos, documents, voice, video, stickers, locations, contacts, polls
- **🛡️ Access Control**: Configurable user/chat allow/block lists
- **⚡ Rate Limiting**: Per-user and per-chat rate limiting
- **🎛️ Advanced Configuration**: Highly customizable behavior and templates

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

The server includes a comprehensive AI sampling feature that automatically responds to Telegram messages using FastMCP's sampling capability. The system is highly configurable and supports multiple message types with advanced filtering and access control.

### Key Features

- **🎯 Mention-Only Mode**: By default, only responds when mentioned in groups (always responds in DMs)
- **📱 Multi-Message Support**: Handles text, photos, documents, voice, video, stickers, locations, contacts, and polls
- **🛡️ Access Control**: Allow/block specific users and chats
- **⚡ Rate Limiting**: Configurable per-user and per-chat rate limits
- **🎛️ Flexible Configuration**: Extensive customization options
- **👑 Admin Commands**: Special commands for authorized users

### How It Works

1. **Client Connection**: When an MCP client connects to the server, the Telegram bot starts automatically
2. **Message Processing**: The bot listens for various message types based on configuration
3. **Smart Filtering**: Messages are validated against access control, rate limits, and content filters
4. **AI Response**: Qualifying messages are sent to the AI using FastMCP's sampling feature
5. **Response Delivery**: The AI-generated response is sent back to the same chat

### Configuration

The sampling feature is configured via environment variables with Zod validation and sensible defaults:

#### Sampling Control

```bash
SAMPLING_ENABLED=true                # Enable/disable AI sampling entirely
```

#### Response Triggers

```bash
SAMPLING_MENTION_ONLY=true           # Only respond when mentioned in groups
SAMPLING_RESPOND_TO_DMS=true         # Always respond in DMs
```

#### Access Control

```bash
# Comma-separated lists of chat IDs (numeric or @usernames) and user IDs (numeric only)
SAMPLING_ALLOWED_CHATS=""            # Empty = all allowed, or "-1001234567890,@vaultAgentLogs,@mychannel"
SAMPLING_BLOCKED_CHATS=""            # Chat IDs/usernames to ignore
SAMPLING_ALLOWED_USERS=""            # Empty = all allowed, or "123456,789012"
SAMPLING_BLOCKED_USERS=""            # User IDs to ignore (numeric only)
SAMPLING_ADMIN_USERS=""              # Users who can use admin commands (numeric only)
```

#### Message Type Support

```bash
SAMPLING_ENABLE_TEXT=true            # Text messages
SAMPLING_ENABLE_PHOTO=true           # Photo messages with captions
SAMPLING_ENABLE_DOCUMENT=true        # Document uploads
SAMPLING_ENABLE_VOICE=true           # Voice messages
SAMPLING_ENABLE_VIDEO=true           # Video messages
SAMPLING_ENABLE_STICKER=true         # Sticker messages
SAMPLING_ENABLE_LOCATION=true        # Location sharing
SAMPLING_ENABLE_CONTACT=true         # Contact sharing
SAMPLING_ENABLE_POLL=true            # Poll messages
```

#### Response Behavior

```bash
SAMPLING_MAX_TOKENS=1000             # Max tokens per AI response
SAMPLING_SHOW_TYPING=true            # Show typing indicator
SAMPLING_SILENT_MODE=false           # Log but don't respond
```

#### Rate Limiting

```bash
SAMPLING_RATE_LIMIT_USER=10          # Max requests per user per minute
SAMPLING_RATE_LIMIT_CHAT=20          # Max requests per chat per minute
```

#### Content Filtering

```bash
SAMPLING_MIN_MESSAGE_LENGTH=1        # Minimum message length
SAMPLING_MAX_MESSAGE_LENGTH=1000     # Maximum message length
SAMPLING_KEYWORD_TRIGGERS=""         # Only respond to messages with these keywords (comma-separated)
SAMPLING_IGNORE_COMMANDS=true        # Ignore messages starting with /
```

### Bot Commands

- `/start`: Initialize the bot and get a welcome message
- `/help`: Get help information about available features
- `/config`: View current configuration (admin users only)

### Environment Variables

```bash
# Required: Your Telegram bot token
export TELEGRAM_BOT_TOKEN="your_bot_token_here"

# Optional: Sampling configuration (these show the defaults)
export SAMPLING_ENABLED=true
export SAMPLING_MENTION_ONLY=true
export SAMPLING_RESPOND_TO_DMS=true
export SAMPLING_MAX_TOKENS=1000
export SAMPLING_RATE_LIMIT_USER=10
export SAMPLING_RATE_LIMIT_CHAT=20

# Example: Restrict to specific chats (mix of IDs and usernames) and users
export SAMPLING_ALLOWED_CHATS="-1001234567890,@mychannel"
export SAMPLING_ADMIN_USERS="123456789,987654321"

# Example: Keyword-only mode
export SAMPLING_KEYWORD_TRIGGERS="help,support,question"

# Example: Disable certain message types
export SAMPLING_ENABLE_VOICE=false
export SAMPLING_ENABLE_STICKER=false

# Example: Disable sampling entirely (tools-only mode)
export SAMPLING_ENABLED=false
```

### Usage Examples

#### Basic Setup

1. Add your bot to a Telegram chat or channel
2. Start the MCP server with a connected client
3. **In groups**: Mention the bot (`@yourbotname hello`)
4. **In DMs**: Send any message directly
5. The bot will respond with an AI-generated message

#### Mention-Only Mode (Default)

```
User: @mybot Hello, how are you?
Bot: Hello! I'm doing well, thank you for asking. How can I assist you today?

User: @mybot What can you do?
Bot: I can help with various tasks, answer questions, and engage in conversations. I can also process different types of messages including photos, documents, and more!
```

#### Direct Messages

```
User: Hello!
Bot: Hi there! I'm your AI assistant. What would you like to talk about?

User: [Sends a photo with caption "What's in this image?"]
Bot: I can see you've shared a photo! While I can't analyze images directly, I can help you with questions about the photo or discuss related topics.
```

#### Advanced Configuration Examples

##### Restrict to Specific Chats

```bash
# Only respond in specific chats (supports both numeric IDs and @usernames)
export SAMPLING_ALLOWED_CHATS="-1001234567890,@vaultAgentLogs,@publicchannel"
```

##### Block Specific Users

```bash
# Ignore messages from specific users
export SAMPLING_BLOCKED_USERS="123456789,987654321"
```

##### Keyword-Only Mode

```bash
# Only respond to messages containing specific keywords
export SAMPLING_KEYWORD_TRIGGERS="help,question,support"
```

##### Admin Users

```bash
# Users who can use /config command
export SAMPLING_ADMIN_USERS="123456789"
```

##### Silent Mode (Logging Only)

```bash
# Log messages but don't respond
export SAMPLING_SILENT_MODE=true
```

##### Custom Rate Limiting

```bash
# Higher rate limits for busy chats
export SAMPLING_RATE_LIMIT_USER=25
export SAMPLING_RATE_LIMIT_CHAT=50
```

##### Tools-Only Mode

```bash
# Disable AI sampling entirely, use only core MCP tools
export SAMPLING_ENABLED=false
```

### Message Type Templates

The system uses customizable templates for different message types:

- **Text**: Standard text messages
- **Photo**: Image messages with caption analysis
- **Document**: File uploads with metadata
- **Voice**: Voice message duration tracking
- **Video**: Video messages with caption support
- **Sticker**: Sticker emoji and set information
- **Location**: GPS coordinates
- **Contact**: Contact information
- **Poll**: Poll questions and options

### Customization

To customize the sampling behavior:

1. **Set Environment Variables**: Configure via `.env` file or export statements
2. **Restart Server**: Restart the MCP server to apply changes
3. **Test Settings**: Use `/config` command (admin only) to verify settings

#### Example .env File

```bash
# Required
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Basic sampling settings
SAMPLING_ENABLED=true
SAMPLING_MENTION_ONLY=true
SAMPLING_RESPOND_TO_DMS=true
SAMPLING_MAX_TOKENS=1500

# Access control
SAMPLING_ADMIN_USERS=123456789
SAMPLING_ALLOWED_CHATS=-1001234567890,@vaultAgentLogs,@mychannel

# Rate limiting
SAMPLING_RATE_LIMIT_USER=15
SAMPLING_RATE_LIMIT_CHAT=30

# Message filtering
SAMPLING_KEYWORD_TRIGGERS=help,support
SAMPLING_MIN_MESSAGE_LENGTH=3
```

### Performance Features

- **Rate Limiting**: Prevents spam and overuse
- **Selective Processing**: Only processes enabled message types
- **Efficient Filtering**: Fast validation before AI processing
- **Graceful Degradation**: Continues working even if some features fail

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

### Required

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from [@BotFather](https://t.me/botfather)

### Optional

All sampling configuration is done via environment variables with sensible defaults. See the Configuration section above for all available options.

### Setup Example

```bash
# Set your bot token
export TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"

# Start the server
npm start
```

### Getting Your Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command
3. Follow the prompts to create your bot
4. Copy the bot token provided
5. Set it as an environment variable

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
