# ChatGPT WhatsApp Bot + Puppeteer API

![API coverage](badges/api-coverage.svg)
![Bot coverage](badges/bot-coverage.svg)

This repo contains a WhatsApp bot that responds to chat commands and a local API
that drives ChatGPT (and Sora video generation) via a Puppeteer browser. The bot
talks to the API over HTTP and handles WhatsApp messaging, media replies, and
command routing.

## High level architecture

- `bot/` connects to WhatsApp Web and exposes commands like chat, image, video,
  and audio replies.
- `api/` runs a local Express server that automates chatgpt.com and sora.chatgpt.com
  using Puppeteer (stealth plugin) and exposes endpoints the bot calls.
- `shared/` holds shared type definitions.

## Features

- ChatGPT responses inside WhatsApp (conversation state preserved per chat).
- Command whitelist and registration flow.
- Optional audio replies using TTS (node-gtts).
- Image generation via DeepAI.
- Sora video generation with progress updates and credit checks.

## Commands

All commands use the `COMMAND_PREFIX` unless noted otherwise.

- `@me <prompt>` or `@<USER_WHATSAPP_ID> <prompt>`: Chat with ChatGPT.
- `!help`: List commands (always allowed).
- `!register <access_key>`: Register a WhatsApp chat (always allowed).
- `!context <text>`: Set context for the current conversation.
- `!getContext`: Show stored context.
- `!clearContext`: Clear stored context.
- `!enableAudio <language_code>`: Enable TTS replies.
- `!disableAudio`: Disable TTS replies.
- `!image <prompt>`: Generate an image via DeepAI.
- `!videoCredits`: Check remaining Sora video credits.
- `!video <prompt>`: Generate a Sora video.

## Project structure

- `bot/src/index.ts`: WhatsApp client setup and event handlers.
- `bot/src/command/`: Command implementations and routing.
- `bot/src/queue/`: Chat/video job queues and retry logic.
- `bot/src/util/request.ts`: Bot -> API HTTP calls.
- `api/src/index.ts`: Express server and Puppeteer bootstrapping.
- `api/src/request/`: HTTP handlers for chat/video endpoints.
- `api/src/client/`: Browser-evaluated logic for ChatGPT/Sora requests.

## Setup

### Prerequisites

- Node.js + Yarn
- Chrome/Chromium installed (used by WhatsApp Web and Puppeteer)
- Access to chatgpt.com and sora.chatgpt.com in the automated browser

### Install dependencies

From the repo root:

```bash
yarn --cwd api install
yarn --cwd bot install
```

Optional (for lint/build at the root):

```bash
yarn install
```

### Environment variables

Create `.env` files from the examples:

```bash
cp api/.env.example api/.env
cp bot/.env.example bot/.env
```

`api/.env`:

- `TMP_FOLDER`: Puppeteer user data dir (required).
- `PORT`: Express server port (required).
- `VPN_EXTENSION_PATH`: Path to a VPN extension folder (optional, used for Sora
  if access is restricted in your region).

`bot/.env`:

- `API_URL`: Base URL for the local API (e.g. `http://localhost:3001`).
- `USER_PHONE_ID`: Phone number used for the WhatsApp account.
- `USER_WHATSAPP_ID`: WhatsApp ID of the registered account.
- `CHROME_DIR`: Chrome executable path for WhatsApp Web.
- `OWNER_ID`: Optional owner phone number for access key hints.
- `BOT_PREFIX`: Message prefix used by the bot (if applicable).
- `COMMAND_PREFIX`: Command prefix (e.g. `!`).

## Running locally

Start the API first so the bot can reach it:

```bash
yarn start:api
```

Then start the bot:

```bash
yarn start:bot
```

The API launches a visible browser session. Log into chatgpt.com and
sora.chatgpt.com in that browser before sending commands from WhatsApp.

## Data and state

The bot stores local state under `bot/output/`:

- whitelist data
- access keys
- conversation context
- prompts and audio files
- generated images/videos (DeepAI/Sora)

WhatsApp Web auth and cache data are stored in `bot/.wwebjs_auth/` and
`bot/.wwebjs_cache/`.

## API endpoints

These are consumed by the bot:

- `POST /conversations`: Send a chat prompt to ChatGPT.
- `POST /video`: Start a Sora video request.
- `GET /video-credits`: Check Sora usage/credits.
- `GET /pending?taskId=...`: Poll Sora task progress.
- `GET /draft?taskId=...`: Fetch finished video draft info.

## Development scripts

From the repo root:

- `yarn lint`: Lint bot and API code.
- `yarn format`: Format bot and API code.
- `yarn build`: TypeScript build for bot and API.
- `yarn type-check`: Type-check both projects.
