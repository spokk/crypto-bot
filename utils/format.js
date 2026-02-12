// — Constants —————————————————————————————————————————————————————————————————

const SHORT_NAME_MAP = {
  Bitcoin: "Bitcoin",
  Ethereum: "Ethereum",
  "Tether Gold": "Gold",
  "Kinesis Silver": "Silver",
};

const MARKET_CAP_FORMAT = {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
};

const DATE_FORMAT_OPTIONS = {
  timeZone: "Europe/Kyiv",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const CHANGE_PERIODS = [
  { label: "1h", key: "percent_change_1h" },
  { label: "24h", key: "percent_change_24h" },
  { label: "7d", key: "percent_change_7d" },
  { label: "30d", key: "percent_change_30d" },
];

// — Private helpers ———————————————————————————————————————————————————————————

const formatNumber = (num, decimals = 2) => {
  if (typeof num !== "number" || isNaN(num)) return "-";
  return num.toFixed(decimals);
};

const formatPercentage = (num) => {
  if (typeof num !== "number" || isNaN(num)) return "-";
  const absNum = Math.abs(num);

  if (absNum > 0 && absNum < 0.01) return "~0.01%";
  return num.toFixed(2) + "%";
};

// — Exported helpers ——————————————————————————————————————————————————————————

export const getChangeSymbol = (value) => {
  if (typeof value !== "number") return "⚪";
  return value > 0 ? "🟢" : value < 0 ? "🔴" : "⚪";
};

export const safeFixed = (value, digits = 2) => {
  if (typeof value !== "number") return "N/A";
  const num = value >= 1 ? value.toFixed(digits) : trimSmallNumber(value);
  return value >= 1 ? Number(num).toLocaleString("en-US") : num;
};

export const trimSmallNumber = (num, maxDecimals = 8) => {
  if (typeof num !== "number") return num;
  if (num === 0) return 0;
  let str = num.toFixed(maxDecimals);
  str = str.replace(/\.?0+$/, "");
  return Number(str);
};

// — Exported message builders —————————————————————————————————————————————————

export const getMarketOverview = (globalMetrics, fearAndGreed) => {
  const formattedTotalMarketCap = new Intl.NumberFormat(
    "en-US",
    MARKET_CAP_FORMAT,
  ).format(globalMetrics?.quote?.USD?.total_market_cap);

  return [
    `🧠 Fear & Greed Index: ${fearAndGreed?.value} (${fearAndGreed?.value_classification})`,
    `🟠 BTC Dominance: ${safeFixed(globalMetrics?.btc_dominance, 2)}%`,
    `💎 ETH Dominance: ${safeFixed(globalMetrics?.eth_dominance, 2)}%`,
    `💰 Total Market Cap: ${formattedTotalMarketCap}`,
  ].join("\n");
};

export const formatCryptoMessage = (
  symbol,
  data,
  globalMetrics,
  fearAndGreed,
) => {
  const price = safeFixed(data?.price);

  const changeLines = CHANGE_PERIODS.map(({ label, key }) => {
    const raw = data?.[key];
    const pct = Number(raw).toFixed(2);
    const icon = getChangeSymbol(raw);
    return `${icon} ${label} Change: ${pct}%`;
  });

  const formattedDate = data?.last_updated
    ? new Date(data.last_updated).toLocaleString("uk-UA", DATE_FORMAT_OPTIONS)
    : "N/A";

  return [
    `🪙 ${symbol}:`,
    `💵 Price: $${price}`,
    ...changeLines,
    "",
    `Market overview:`,
    getMarketOverview(globalMetrics, fearAndGreed),
    "",
    `🕒 ${formattedDate}`,
  ].join("\n");
};

export const formatTopCryptosMessage = (
  topData,
  globalMetrics,
  fearAndGreed,
) => {
  if (!Array.isArray(topData) || topData.length === 0) {
    return "No data available.";
  }

  const shortName = (name) => SHORT_NAME_MAP[name] ?? null;

  const rows = topData.map((coin) => {
    const name = shortName(coin.name) ?? coin.name;
    const price = `$${formatNumber(coin.current_price)}`;
    const change = formatPercentage(coin.price_change_percentage_24h);
    const changeIcon = coin.price_change_percentage_24h >= 0 ? "🟢" : "🔴";

    return { name, price, change, changeIcon };
  });

  const MAX_NAME_WIDTH = 8;
  const MAX_PRICE_WIDTH = 10;
  const MAX_CHANGE_WIDTH = 10;

  const colWidths = {
    name: Math.min(
      Math.max(...rows.map((r) => r.name.length), 4),
      MAX_NAME_WIDTH,
    ),
    price: Math.min(
      Math.max(...rows.map((r) => r.price.length), 5),
      MAX_PRICE_WIDTH,
    ),
    change: Math.min(
      Math.max(...rows.map((r) => (r.changeIcon + " " + r.change).length), 5),
      MAX_CHANGE_WIDTH,
    ),
  };

  const columnSeparator = " │ ";

  const header = [
    "Coin".padEnd(colWidths.name),
    "Price".padEnd(colWidths.price),
    "24h Δ".padEnd(colWidths.change),
  ].join(columnSeparator);

  let msg = "<pre>";
  msg += header + "\n";
  msg +=
    "─".repeat(colWidths.name) +
    "─┼─" +
    "─".repeat(colWidths.price) +
    "─┼─" +
    "─".repeat(colWidths.change) +
    "\n";

  rows.forEach((r) => {
    const changeCell = `${r.changeIcon} ${r.change}`.padEnd(colWidths.change);

    msg +=
      [
        r.name.padEnd(colWidths.name),
        r.price.padEnd(colWidths.price),
        changeCell,
      ].join(columnSeparator) + "\n";
  });

  msg += "</pre>";

  return `<b>Market overview:</b>\n${msg}\n\n${getMarketOverview(
    globalMetrics,
    fearAndGreed,
  )}`;
};
