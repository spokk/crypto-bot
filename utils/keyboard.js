import { InlineKeyboard } from "grammy";

const TIMEFRAMES = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

export const buildTimeframeKeyboard = (callbackPrefix, activeDays = 7) => {
  const kb = new InlineKeyboard();

  TIMEFRAMES.forEach(({ label, days }) => {
    const text = days === activeDays ? `• ${label} •` : label;
    kb.text(text, `${callbackPrefix}:${days}`);
  });

  return kb;
};
