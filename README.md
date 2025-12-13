# onemax-tg-bot

Small Node.js Telegram bot project that

- serves an Express webhook endpoint for interactive commands (`nav-bot.js`), and
- runs a scheduled price notifier that fetches CoinMarketCap data and posts updates (`price-bot.js`).

Files

- `index.js` — Express server, mounts `nav-bot` webhook handler, and starts the price scheduler.
- `nav-bot.js` — interactive bot command handlers (private-chat only). Exports the Telegraf `bot` instance.
- `price-bot.js` — price fetch helpers, `check1hPriceChange()` and `post24hPriceChange()` and `startScheduler()` which sends Telegram messages.
- `Dockerfile`, `.dockerignore`, `docker-compose.yml` — containerization helper files.

Requirements

- Node.js (v18+ recommended)
- npm
- Docker Desktop (optional, for container builds)

Environment variables (.env)

- `BOT_TOKEN` — Telegram bot token from BotFather (required)
- `CHAT_ID` — target chat id (user or group) for scheduled messages (required for price pushes)
- `CMC_API_KEY` — CoinMarketCap API key (required)
- `APP_URL` / `PUBLIC_URL` / `RENDER_EXTERNAL_URL` — public URL to register webhook (optional; if missing, webhook is not set automatically)

Run locally (development)

1. Install deps

```powershell
npm ci
```

2. Create `.env` with required keys (do not commit `.env`).
3. Start the server (Express + webhook mounting + scheduler):

```powershell
npm run start
```

4. Optional: run only the scheduler (standalone):

```powershell
node price-bot.js
```

Docker
Build image:

```powershell
docker build -t onemax-bot .
```

Run container (reads `.env`):

```powershell
docker run --env-file .env -p 3000:3000 --name onemax-bot onemax-bot
```

Or with Compose:

```powershell
docker compose up --build -d
```

Run using Docker (step-by-step)

1. Build the image (from repository root):

```powershell
docker build -t onemax-bot .
```

2. Run a single container that starts the server (`index.js`) and reads `.env`:

```powershell
docker run --env-file .env -p 3000:3000 --name onemax-bot onemax-bot
```

3. Use docker-compose (recommended for development):

```powershell
docker compose up --build -d
```

4. Stop and remove compose services:

```powershell
docker compose down
```

Separate scheduler worker (optional)

If you want the scheduled price checks to run in a separate container (recommended for deployment), add a `worker` service that runs only the scheduler. Example `docker-compose.yml` fragment:

```yaml
services:
  bot:
    build: .
    env_file: [ .env ]
    ports: [ "3000:3000" ]
  worker:
    build: .
    env_file: [ .env ]
    command: node price-bot.js
    restart: unless-stopped
```

Notes:
- Provide required env vars in `.env`: `BOT_TOKEN`, `CMC_API_KEY`, `CHAT_ID`.
- Ensure `price-bot.js` will start the scheduler when executed directly (add `if (require.main === module) startScheduler();` at the bottom) if you use the `worker` service.
- Do not commit `.env` to source control.

Notes & recommendations

- Exports: `price-bot.js` attaches helpers to the Telegraf `bot` and exports `bot`. `index.js` expects `priceBot.startScheduler()` to be available. If your `require('./price-bot')` returns a function instead, adjust `index.js` to call it or change `price-bot.js` to export the function directly.
- Scheduler guard: `startScheduler()` contains a one-time guard to avoid duplicate timers. Keep it to prevent multiple starts.
- Polling vs Webhook: Do not run polling and webhook for the same bot token in the same environment. If you run webhooks via `index.js`, wrap `bot.launch()` in `nav-bot.js` with `if (require.main === module) { bot.launch(); }` so polling only runs when `nav-bot.js` is executed directly.
- Troubleshooting Docker on Windows: ensure Docker Desktop is running; verify with `docker version` and `docker info`. If you see pipe errors, start Docker Desktop from Start menu and retry.

Troubleshooting

- Scheduler not starting: check `index.js` logs and verify `priceBot` shape. Add a debug log after require:

```js
console.log(
  "priceBot type:",
  typeof priceBot,
  "keys:",
  priceBot && Object.keys(priceBot)
);
```

- Missing env vars: server may exit or scheduler may not send messages — ensure `BOT_TOKEN`, `CHAT_ID`, `CMC_API_KEY` are set.

- Getting chat id: use a helper bot (e.g. @userinfobot) or call `getUpdates` after sending a message to your bot to capture your chat id.
