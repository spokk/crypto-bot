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

const botCommands = [
  ...cryptoList.map(({ command, name }) => ({
    command,
    description: `Current price of ${name}`,
  })),
  { command: "top", description: "General summary of market overview" },
];
bot.telegram.setMyCommands(botCommands);

// Register all crypto commands
cryptoList.forEach(({ command, symbol, name }) => {
  registerCryptoCommand(command, symbol, name);
});

bot.command("top", async (ctx) => {
  ctx.deleteMessage(ctx.message.message_id).catch(() => {});

  try {
    const [topData, globalMetrics, fearAndGreed] = await Promise.all([
      fetchCoinGeckoTopData(),
      fetchGlobalMetrics(),
      fetchFearAndGreed(),
    ]);

    const reply = formatTopCryptosMessage(topData, globalMetrics, fearAndGreed);

    await ctx.replyWithHTML(reply, { disable_notification: true });
  } catch (error) {
    console.error("Failed to fetch data for top:", error);
  }
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
