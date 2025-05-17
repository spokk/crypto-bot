function registerCryptoCommandFactory(bot, fetchCryptoQuote, formatCryptoMessage) {
  return (command, symbol, displayName) => {
    bot.command(command, async (ctx) => {
      ctx.deleteMessage(ctx.message.message_id).catch(() => { });
      try {
        const apiKey = process.env.COINMARKETCAP_API_KEY;
        const data = await fetchCryptoQuote(symbol, apiKey);
        const message = formatCryptoMessage(displayName, data);
        await ctx.reply(message, { disable_notification: true });
      } catch (error) {
        console.error(`Помилка при отриманні даних для ${symbol}:`, error);
      }
    });
  };
}

module.exports = { registerCryptoCommandFactory }