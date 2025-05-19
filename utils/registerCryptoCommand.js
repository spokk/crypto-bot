import { chartHandler } from '../handlers/chartHandler.js';

export const registerCryptoCommandFactory = (bot, fetchCryptoQuote, formatCryptoMessage) =>
  (command, symbol, displayName) => {
    bot.command(command, async (ctx) => {
      ctx.deleteMessage(ctx.message.message_id).catch(() => { });

      try {
        const [data, chartUrl] = await Promise.all([
          fetchCryptoQuote(symbol),
          chartHandler(symbol)
        ]);

        const message = formatCryptoMessage(displayName, data);

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