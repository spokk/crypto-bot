import 'dotenv/config';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Telegraf } from 'telegraf';

import { fetchCryptoQuote } from '../utils/http.js';
import { formatCryptoMessage } from '../utils/format.js';
import { registerCryptoCommandFactory } from '../utils/registerCryptoCommand.js';
import { cryptoList } from '../data/cryptoList.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const registerCryptoCommand = registerCryptoCommandFactory(bot, fetchCryptoQuote, formatCryptoMessage);

// Load help documentation text from a separate file
const helpText = fs.readFileSync(
  join(__dirname, '../docs/help.txt'),
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

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Bot handling failed:', err);
    res.status(500).send('Error processing bot handling.');
  }
};
