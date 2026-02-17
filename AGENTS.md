# Crypto Bot — Agent Guide

## Commands

- `npm run format` — lint (ESLint) and format (Prettier) all files.
- `npm run deploy` — deploy to Vercel.
- No test framework is configured; there are no tests.

## Architecture

Telegram bot (Telegraf) deployed as a Vercel serverless function (`api/bot.js`).

- **api/** — Vercel entrypoint; creates bot, registers commands, handles webhook POST.
- **handlers/** — chart generation: config builder, URL builder (QuickChart), and orchestration via `chartHandler`.
- **utils/** — shared helpers: HTTP clients (`fetchJson`/`buildUrl` for CoinGecko & CoinMarketCap), formatting, chart data utilities, command registration.
- **data/** — static data (`cryptoList.js` defines supported coins).
- External APIs: CoinGecko (prices/charts), CoinMarketCap (quotes/global metrics/Fear & Greed), QuickChart (chart images).
- Env vars: `TELEGRAM_BOT_TOKEN`, `COINGECKO_API_KEY`, `COINMARKETCAP_API_KEY`.

## Code Style

- **ES Modules** (`"type": "module"`); use `import`/`export`, include `.js` extensions in relative imports.
- Node ≥ 24. Prettier with default settings for formatting; ESLint with recommended config.
- Functions are `const` arrow functions, exported individually (no default exports except the Vercel handler).
- Guard with early type checks (e.g., `typeof value !== "number"`) and return safe fallbacks (`"N/A"`, `"-"`) only at data boundaries, not for internal calls.
- Use `Promise.all` for parallel async calls; wrap handler-level code in try/catch logging to `console.error`.
- Naming: camelCase for variables/functions, UPPER_SNAKE_CASE for constants, grouped constants in objects (e.g., `THEME`). Keep files small and single-purpose.
