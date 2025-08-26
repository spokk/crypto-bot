import { chartHandler } from '../handlers/chartHandler.js';

export const registerCryptoCommandFactory = (bot, fetchCryptoQuote, fetchFearAndGreed, fetchGlobalMetrics, formatCryptoMessage) =>
  (command, symbol, displayName) => {
    bot.command(command, async (ctx) => {
      ctx.deleteMessage(ctx.message.message_id).catch(() => { });

      try {
        const [data, chartUrl, globalMetrics, fearAndGreed] = await Promise.all([
          fetchCryptoQuote(symbol),
          chartHandler(symbol),
          fetchGlobalMetrics(),
          fetchFearAndGreed()
        ]);

        const message = formatCryptoMessage(displayName, data, globalMetrics, fearAndGreed);

        if (chartUrl) {
          await ctx.replyWithPhoto(chartUrl, { caption: message, disable_notification: true });
        } else {
          await ctx.reply(message, { disable_notification: true });
        }
      } catch (error) {
        console.error(`Помилка при отриманні даних для ${symbol}:`, error);
      }
    });
  };