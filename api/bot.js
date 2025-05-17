require('dotenv').config();

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  bot.command('eth', async (ctx) => {
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH';

    try {
      // Delete the user's command message before replying
      try {
        await ctx.deleteMessage(ctx.message.message_id);
      } catch (err) {
        // Ignore if can't delete (e.g. not enough rights)
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      const ethData = data.data.ETH.quote.USD;

      const ethPrice = ethData.price.toFixed(2);
      const percentChange1h = ethData.percent_change_1h.toFixed(2);
      const percentChange24h = ethData.percent_change_24h.toFixed(2);
      const percentChange7d = ethData.percent_change_7d.toFixed(2);
      const percentChange30d = ethData.percent_change_30d.toFixed(2);

      const changeSymbol1h = percentChange1h > 0 ? '🟢' : '🔴';
      const changeSymbol24h = percentChange24h > 0 ? '🟢' : '🔴';
      const changeSymbol7d = percentChange7d > 0 ? '🟢' : '🔴';
      const changeSymbol30d = percentChange30d > 0 ? '🟢' : '🔴';

      const formattedDate = new Date(ethData.last_updated).toLocaleString('uk-UA', {
        timeZone: 'Europe/Kyiv', // автоматично враховує UTC+2/UTC+3
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      const message = `
📊 Ethereum (ETH):
💰 Price: $${ethPrice}
${changeSymbol1h} 1h Change: ${percentChange1h}%
${changeSymbol24h} 24h Change: ${percentChange24h}%
${changeSymbol7d} 7d Change: ${percentChange7d}%
${changeSymbol30d} 30d Change: ${percentChange30d}%

🕒 ${formattedDate}`

      await ctx.reply(message, { disable_notification: true });
    } catch (error) {
      console.error('Помилка при отриманні даних:', error);
    }
  })

  try {
    await bot.handleUpdate(req.body)

    res.status(200).send('OK');
  } catch (err) {
    console.error('Bot handling failed:', err);
    res.status(500).send('Error processing bot handling.');
  }
}
