import { safeFixed, getChangeSymbol, formatSignedPct } from "./format.js";

const DATE_FORMAT_OPTIONS = {
  timeZone: "America/New_York",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

export const formatStockMessage = (displayName, meta, range = {}) => {
  const price = safeFixed(meta?.regularMarketPrice);
  const change =
    range.periodChange ??
    (meta?.regularMarketPrice && meta?.previousClose
      ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) *
        100
      : null);

  const changeIcon = getChangeSymbol(change);

  const details = [];
  if (typeof range.high24 === "number" || typeof range.low24 === "number") {
    const high =
      typeof range.high24 === "number" ? `$${safeFixed(range.high24)}` : "-";
    const low =
      typeof range.low24 === "number" ? `$${safeFixed(range.low24)}` : "-";
    details.push(`⬆️ High ${high}  ·  ⬇️ Low ${low}`);
  }

  const marketTime = meta?.regularMarketTime;
  const formattedDate = marketTime
    ? new Date(marketTime * 1000).toLocaleString("en-US", DATE_FORMAT_OPTIONS)
    : "N/A";

  return [
    `📈 ${displayName} | 💵 $${price}`,
    "",
    `${changeIcon} Day ${formatSignedPct(change)}`,
    "",
    ...details,
    "",
    `🏛️ ${meta?.exchangeName ?? "NYSE"}: ${meta?.symbol ?? "EPAM"}`,
    `🕒 ${formattedDate} (ET)`,
  ].join("\n");
};
