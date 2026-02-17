import { chartHandler } from "../handlers/chartHandler.js";
import {
  fetchCryptoQuote,
  fetchFearAndGreed,
  fetchGlobalMetrics,
  fetchCoinGeckoGlobal,
} from "./http.js";
import { formatCryptoMessage } from "./format.js";

export const registerCryptoCommand = (bot, command, symbol, displayName) => {
  bot.command(command, async (ctx) => {
    ctx.deleteMessage(ctx.message.message_id).catch(() => {});

    try {
      const [data, chartResult, globalMetrics, fearAndGreed, cgGlobal] =
        await Promise.all([
          fetchCryptoQuote(symbol),
          chartHandler(symbol),
          fetchGlobalMetrics(),
          fetchFearAndGreed(),
          fetchCoinGeckoGlobal(),
        ]);

      const message = formatCryptoMessage(
        displayName,
        data,
        globalMetrics,
        fearAndGreed,
        { high24: chartResult.high24, low24: chartResult.low24 },
        cgGlobal,
      );

      if (chartResult?.url) {
        await ctx.replyWithPhoto(chartResult.url, {
          caption: message,
          disable_notification: true,
        });
      } else {
        await ctx.reply(message, { disable_notification: true });
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
    }
  });
};
