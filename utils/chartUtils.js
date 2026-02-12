import { trimSmallNumber } from "./format.js";

export const formatPrices = (prices) =>
  prices.map(([, price]) =>
    price >= 1 ? price.toFixed(2) : trimSmallNumber(price),
  );

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatLabels = (prices) =>
  prices.map(([timestamp]) => {
    const date = new Date(timestamp);
    return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`;
  });

export const formatVolumes = (volumes) => volumes.map(([, volume]) => volume);
