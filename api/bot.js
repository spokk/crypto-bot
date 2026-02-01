import "dotenv/config";
import { Telegraf } from "telegraf";

import {
  fetchCryptoQuote,
  fetchFearAndGreed,
  fetchGlobalMetrics,
  fetchCoinGeckoTopData,
} from "../utils/http.js";
import {
  formatCryptoMessage,
  formatTopCryptosMessage,
} from "../utils/format.js";
import { registerCryptoCommandFactory } from "../utils/registerCryptoCommand.js";
import { cryptoList } from "../data/cryptoList.js";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const registerCryptoCommand = registerCryptoCommandFactory(
  bot,
  fetchCryptoQuote,
  fetchFearAndGreed,
  fetchGlobalMetrics,
  formatCryptoMessage,
);

bot.telegram.setMyCommands([
  { command: "eth", description: "Current price of Ethereum (ETH)" },
  { command: "btc", description: "Current price of Bitcoin (BTC)" },
  { command: "gold", description: "Current price of Gold (XAUt)" },
  { command: "silver", description: "Current price of Silver (KAG)" },
  { command: "top", description: "General summary of market overview" },
]);

// Register all crypto commands
cryptoList.forEach(({ command, symbol, name }) => {
  registerCryptoCommand(command, symbol, name);
});

bot.command("top", async (ctx) => {
  ctx.deleteMessage(ctx.message.message_id).catch(() => {});

  const [topData, globalMetrics, fearAndGreed] = await Promise.all([
    fetchCoinGeckoTopData(),
    fetchGlobalMetrics(),
    fetchFearAndGreed(),
  ]);

  const reply = formatTopCryptosMessage(topData, globalMetrics, fearAndGreed);

  await ctx.replyWithHTML(reply, { disable_notification: true });
});

export default async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Bot handling failed:", err);
    res.status(500).send("Error processing bot handling.");
  }
};
