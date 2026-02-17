import "dotenv/config";
import { Telegraf } from "telegraf";

import {
  fetchFearAndGreed,
  fetchGlobalMetrics,
  fetchCoinGeckoTopData,
  fetchCoinGeckoGlobal,
} from "../utils/http.js";
import { formatTopCryptosMessage } from "../utils/format.js";
import { registerCryptoCommand } from "../utils/registerCryptoCommand.js";
import { cryptoList } from "../data/cryptoList.js";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.telegram.setMyCommands([
  ...cryptoList.map(({ command, name }) => ({
    command,
    description: `Current price of ${name}`,
  })),
  { command: "top", description: "General summary of market overview" },
]);

cryptoList.forEach(({ command, symbol, name }) => {
  registerCryptoCommand(bot, command, symbol, name);
});

bot.command("top", async (ctx) => {
  ctx.deleteMessage(ctx.message.message_id).catch(() => {});

  try {
    const [topData, globalMetrics, fearAndGreed, cgGlobal] = await Promise.all([
      fetchCoinGeckoTopData(),
      fetchGlobalMetrics(),
      fetchFearAndGreed(),
      fetchCoinGeckoGlobal(),
    ]);

    const reply = formatTopCryptosMessage(
      topData,
      globalMetrics,
      fearAndGreed,
      cgGlobal,
    );

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
