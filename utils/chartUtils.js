import { trimSmallNumber } from "./format.js";

export const formatPrices = (prices) =>
  prices.map(([, price]) =>
    price >= 1 ? price.toFixed(2) : trimSmallNumber(price),
  );

const labelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export const formatLabels = (prices) =>
  prices.map(([timestamp]) => labelFormatter.format(new Date(timestamp)));

export const formatVolumes = (volumes) => volumes.map(([, volume]) => volume);
