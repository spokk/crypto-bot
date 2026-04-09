import { InputFile } from "grammy";
import { stockChartHandler } from "../handlers/stockChartHandler.js";
import { formatStockMessage } from "./stockFormat.js";
import { buildTimeframeKeyboard } from "./keyboard.js";

export const registerStockCommand = (
  bot,
  command,
  ticker,
  symbol,
  displayName,
) => {
  bot.command(command, async (ctx) => {
    ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id).catch(() => {});

    try {
      const chartResult = await stockChartHandler(ticker, symbol);

      const message = formatStockMessage(displayName, chartResult.meta, {
        high24: chartResult.high24,
        low24: chartResult.low24,
      });

      if (chartResult?.buffer) {
        const keyboard = buildTimeframeKeyboard(`s:${ticker}`);
        await ctx.replyWithPhoto(
          new InputFile(chartResult.buffer, "chart.png"),
          {
            caption: message,
            disable_notification: true,
            reply_markup: keyboard,
          },
        );
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
