import { trimSmallNumber } from './format.js';

export const formatPrices = (prices) => prices.map(([, price]) =>
  price >= 1 ? price.toFixed(2) : trimSmallNumber(price)
);

export const formatLabels = (prices) => prices.map(([timestamp]) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month} ${hour}:${min}`;
});