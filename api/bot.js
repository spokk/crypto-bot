import "dotenv/config";
import { Bot, webhookCallback } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";

import {
  fetchFearAndGreed,
  fetchGlobalMetrics,
  fetchCoinGeckoTopData,
  fetchCoinGeckoGlobal,
} from "../utils/http.js";
import { formatTopCryptosMessage } from "../utils/format.js";
import { registerCryptoCommand } from "../utils/registerCryptoCommand.js";
import { uahHandler } from "../handlers/uahHandler.js";
import { cryptoList } from "../data/cryptoList.js";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.api.config.use(autoRetry());

bot.api.setMyCommands([
  ...cryptoList.map(({ command, name }) => ({
    command,
    description: `Current price of ${name}`,
  })),
  { command: "top", description: "General summary of market overview" },
  { command: "uah", description: "UAH exchange rates (USD & EUR)" },
]);

cryptoList.forEach(({ command, symbol, geckoId, name }) => {
  registerCryptoCommand(bot, command, symbol, geckoId, name);
});

bot.command("top", async (ctx) => {
  ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id).catch(() => {});

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

    await ctx.reply(reply, {
      parse_mode: "HTML",
      disable_notification: true,
    });
  } catch (error) {
    console.error("Failed to fetch data for top:", error);
  }
});

bot.command("uah", async (ctx) => {
  ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id).catch(() => {});

  try {
    const message = await uahHandler();
    await ctx.reply(message, {
      parse_mode: "HTML",
      disable_notification: true,
    });
  } catch (error) {
    console.error("Failed to fetch UAH rates:", error);
  }
});

export default webhookCallback(bot, "http");
