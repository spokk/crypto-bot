require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { Telegraf } = require('telegraf');

const { fetchCryptoQuote } = require('../utils/coinmarketcap');
const { formatCryptoMessage } = require('../utils/format');
const { registerCryptoCommandFactory } = require('../utils/registerCryptoCommand');

const { cryptoList } = require('../data/cryptoList');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const registerCryptoCommand = registerCryptoCommandFactory(bot, fetchCryptoQuote, formatCryptoMessage);

// Load help documentation text from a separate file
const helpText = fs.readFileSync(
  path.join(__dirname, '../docs/help.txt'),
  'utf-8'
);

// Register help command
bot.command('help', async (ctx) => {
  await ctx.replyWithHTML(helpText, { disable_notification: true });
});

// Register all crypto commands
cryptoList.forEach(({ command, symbol, name }) => {
  registerCryptoCommand(command, symbol, name);
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Bot handling failed:', err);
    res.status(500).send('Error processing bot handling.');
  }
};
