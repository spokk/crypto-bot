# Crypto Bot

A Telegram bot that provides real-time cryptocurrency and stock prices, charts, and market overview data. Built with [grammY](https://grammy.dev/) and deployed as a Vercel serverless function.

## Features

- **Crypto commands** — `/btc`, `/eth`, `/gold`, `/silver` reply with a 7-day price chart, 24h high/low, percentage changes (1h/24h/7d/30d), and market overview.
- **Stock commands** — `/epam` replies with an EPAM Systems (NYSE: EPAM) price chart, daily change, and high/low range. Data sourced from Yahoo Finance.
- **Market overview** — `/top` shows a table of supported coins with prices and 24h changes, plus Fear & Greed index, BTC/ETH dominance, total market cap, and 24h volume.
- Dark-themed chart images rendered via QuickChart with annotation lines for high/low/avg and color-coded price segments.
- Crypto data sourced from CoinGecko (prices, charts) and CoinMarketCap (quotes, global metrics, Fear & Greed). Stock data sourced from Yahoo Finance.

## Commands

| Command   | Description                             |
| --------- | --------------------------------------- |
| `/btc`    | Bitcoin (BTC) price & chart             |
| `/eth`    | Ethereum (ETH) price & chart            |
| `/gold`   | Tether Gold (XAUt) price & chart        |
| `/silver` | Kinesis Silver (KAG) price & chart      |
| `/epam`   | EPAM Systems (NYSE: EPAM) price & chart |
| `/top`    | Market overview summary                 |

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file (see `.env.example`) with:
   - `TELEGRAM_BOT_TOKEN`
   - `COINGECKO_API_KEY`
   - `COINMARKETCAP_API_KEY`
3. Set up a Telegram webhook pointing to your Vercel deployment at `/api/bot`.

## Deployment

```
npm run deploy
```

Deploys to Vercel via `vercel --prod`.

## Project Structure

```
api/bot.js                        — Vercel entrypoint, grammY bot setup & webhook handler
handlers/chartConfig.js            — Chart.js config builder (theme, annotations, scales)
handlers/chartHandler.js           — Orchestrates crypto chart data fetching & rendering
handlers/stockChartHandler.js      — Orchestrates stock chart data fetching & rendering
handlers/chartUrl.js               — Builds QuickChart URL from chart config
utils/http.js                      — API clients for CoinGecko, CoinMarketCap & Yahoo Finance
utils/format.js                    — Message formatting & market overview builder
utils/stockFormat.js               — Stock-specific message formatting
utils/chartUtils.js                — Price/label/volume formatters for chart data
utils/registerCryptoCommand.js     — Registers per-coin bot commands
utils/registerStockCommand.js      — Registers per-stock bot commands
data/cryptoList.js                 — Supported coins list
data/stockList.js                  — Supported stocks list
```

## License

MIT
