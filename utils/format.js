export const getChangeSymbol = (value) => {
  if (typeof value !== "number") return "⚪";
  return value > 0 ? "🟢" : value < 0 ? "🔴" : "⚪";
};

export const safeFixed = (value, digits = 2) => {
  if (typeof value !== "number") return "N/A";
  const num =
    value >= 1 ? Number(value).toFixed(digits) : trimSmallNumber(value);
  return value >= 1 ? Number(num).toLocaleString("en-US") : num;
};

export const trimSmallNumber = (num, maxDecimals = 8) => {
  if (typeof num !== "number") return num;
  if (num === 0) return 0;
  // Convert to string with up to maxDecimals, remove trailing zeros
  let str = num.toFixed(maxDecimals);
  str = str.replace(/\.?0+$/, "");
  return Number(str);
};

export const getMarketOverview = (globalMetrics, fearAndGreed) => {
  const formattedTotalMarketCap = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(globalMetrics?.quote?.USD?.total_market_cap);

  return (
    `🧠 Fear & Greed Index: ${fearAndGreed?.value} (${fearAndGreed?.value_classification})\n` +
    `🟠 BTC Dominance: ${safeFixed(globalMetrics?.btc_dominance, 2)}%\n` +
    `💎 ETH Dominance: ${safeFixed(globalMetrics?.eth_dominance, 2)}%\n` +
    `💰 Total Market Cap: ${formattedTotalMarketCap}`
  );
};

export const formatCryptoMessage = (
  symbol,
  data,
  globalMetrics,
  fearAndGreed,
) => {
  const price = safeFixed(data?.price);
  const percentChange1h = Number(data?.percent_change_1h).toFixed(2);
  const percentChange24h = Number(data?.percent_change_24h).toFixed(2);
  const percentChange7d = Number(data?.percent_change_7d).toFixed(2);
  const percentChange30d = Number(data?.percent_change_30d).toFixed(2);

  const changeSymbol1h = getChangeSymbol(data?.percent_change_1h);
  const changeSymbol24h = getChangeSymbol(data?.percent_change_24h);
  const changeSymbol7d = getChangeSymbol(data?.percent_change_7d);
  const changeSymbol30d = getChangeSymbol(data?.percent_change_30d);

  const formattedDate = data?.last_updated
    ? new Date(data.last_updated).toLocaleString("uk-UA", {
        timeZone: "Europe/Kyiv",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    `🪙 ${symbol}:\n` +
    `💵 Price: $${price}\n` +
    `${changeSymbol1h} 1h Change: ${percentChange1h}%\n` +
    `${changeSymbol24h} 24h Change: ${percentChange24h}%\n` +
    `${changeSymbol7d} 7d Change: ${percentChange7d}%\n` +
    `${changeSymbol30d} 30d Change: ${percentChange30d}%\n\n` +
    `Market overview:\n` +
    `${getMarketOverview(globalMetrics, fearAndGreed)}\n\n` +
    `🕒 ${formattedDate}`
  );
};

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

export const formatTopCryptosMessage = (
  topData,
  globalMetrics,
  fearAndGreed,
) => {
  if (!Array.isArray(topData) || topData.length === 0) {
    return "No data available.";
  }

  // --- Helpers --------------------------------------------------

  const shortName = (name) => {
    const map = {
      Bitcoin: "Bitcoin",
      Ethereum: "Ethereum",
      "Tether Gold": "Gold",
      "Kinesis Silver": "Silver",
    };
    return map[name] ?? null;
  };

  // --- Normalize rows -------------------------------------------

  const rows = topData.map((coin) => {
    const name = shortName(coin.name) ?? coin.name;
    const price = `$${formatNumber(coin.current_price)}`;
    const change = formatPercentage(coin.price_change_percentage_24h);
    const changeIcon = coin.price_change_percentage_24h >= 0 ? "🟢" : "🔴";

    return { name, price, change, changeIcon };
  });

  // --- Column widths (hard limits for Telegram) -----------------

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

  // --- Build table ----------------------------------------------

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

  // --- Final message --------------------------------------------

  return `<b>Market overview:</b>\n${msg}\n\n${getMarketOverview(
    globalMetrics,
    fearAndGreed,
  )}`;
};
