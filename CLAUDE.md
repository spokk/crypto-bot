# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run format` — lint (ESLint fix) then format (Prettier) all files
- `npm run deploy` — deploy to Vercel (`vercel --prod`)
- No test framework; there are no tests

## Architecture

Telegram bot built with **grammY** + `@grammyjs/auto-retry`, deployed as a single **Vercel serverless function** (`api/bot.js`). The bot receives updates via webhook POST to `/api/bot`.

**Request flow for crypto commands** (`/btc`, `/eth`, `/gold`, `/silver`):
`api/bot.js` → `registerCryptoCommand` registers each coin from `data/cryptoList.js` → handler fetches quote (CoinMarketCap), chart data (CoinGecko), global metrics, and Fear & Greed index in parallel via `Promise.all` → formats message via `utils/format.js` → replies with chart image (QuickChart URL) + caption.

**Chart pipeline**: `handlers/chartHandler.js` orchestrates fetching → `handlers/chartConfig.js` builds Chart.js config (dark theme, annotation lines for high/low/avg, color-coded segments) → `handlers/chartUrl.js` encodes config into a QuickChart URL.

**`/top` command**: Fetches market overview data from CoinGecko + CoinMarketCap in parallel, formats a table of supported coins with Fear & Greed, dominance, market cap.

**`/uah` command**: Fetches UAH exchange rates from PrivatBank, MonoBank, and NBU APIs via `Promise.allSettled` (graceful degradation) → formats via `utils/uahFormat.js`.

**External APIs**: CoinGecko (prices, chart data, global stats), CoinMarketCap (quotes, global metrics, Fear & Greed), QuickChart (chart image rendering).

## Code Style

- **ES Modules** (`"type": "module"`); use `import`/`export` with `.js` extensions in relative imports
- Node >= 24; Prettier defaults; ESLint recommended config
- Functions are `const` arrow functions, exported individually (no default exports except the Vercel handler)
- Guard with early type checks at data boundaries; return safe fallbacks (`"N/A"`, `"-"`) only at boundaries, not internal calls
- `Promise.all` for parallel async; `Promise.allSettled` when partial failure is acceptable
- Handler-level try/catch logging to `console.error`
- camelCase for variables/functions, UPPER_SNAKE_CASE for constants, grouped constants in objects (e.g., `THEME`)

## Environment Variables

`TELEGRAM_BOT_TOKEN`, `COINGECKO_API_KEY`, `COINMARKETCAP_API_KEY` (see `.env.example`)
