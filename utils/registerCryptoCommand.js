import { chartHandler } from "../handlers/chartHandler.js";
import {
  fetchCryptoQuote,
  fetchFearAndGreed,
  fetchGlobalMetrics,
  fetchCoinGeckoGlobal,
} from "./http.js";
import { formatCryptoMessage } from "./format.js";
import { buildTimeframeKeyboard } from "./keyboard.js";

export const registerCryptoCommand = (
  bot,
  command,
  symbol,
  geckoId,
  displayName,
) => {
  bot.command(command, async (ctx) => {
    ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id).catch(() => {});

    try {
      const [data, chartResult, globalMetrics, fearAndGreed, cgGlobal] =
        await Promise.all([
          fetchCryptoQuote(symbol),
          chartHandler(symbol, geckoId),
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
        const keyboard = buildTimeframeKeyboard(`c:${symbol}:${geckoId}`);
        await ctx.replyWithPhoto(chartResult.url, {
          caption: message,
          disable_notification: true,
          reply_markup: keyboard,
        });
      } else {
        await ctx.reply(message, { disable_notification: true });
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
      await ctx.reply("Something went wrong. Please try again later.", {
        disable_notification: true,
      });
    }
  });
};
