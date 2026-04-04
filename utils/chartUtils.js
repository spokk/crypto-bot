import { trimSmallNumber } from "./format.js";

export const formatPrices = (prices) =>
  prices.map(([, price]) =>
    price >= 1 ? price.toFixed(2) : String(trimSmallNumber(price)),
  );

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Kyiv",
});

export const formatLabels = (prices, days = 7) =>
  prices.map(([timestamp]) => {
    const d = new Date(timestamp);
    return days <= 1 ? timeFormatter.format(d) : dateFormatter.format(d);
  });

export const formatVolumes = (volumes) => volumes.map(([, volume]) => volume);

const MAX_POINTS = 200;

export const downsample = (arr) => {
  if (arr.length <= MAX_POINTS) return arr;
  const step = arr.length / MAX_POINTS;
  return Array.from(
    { length: MAX_POINTS },
    (_, i) => arr[Math.round(i * step)],
  );
};
