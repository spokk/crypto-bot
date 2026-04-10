import { fetchStockChart } from "../utils/http.js";
import { getChartConfig } from "./chartConfig.js";
import { fetchChartBuffer } from "./chartUrl.js";

const RANGE_MAP = {
  1: { range: "1d", interval: "5m" },
  7: { range: "5d", interval: "1h" },
  30: { range: "1mo", interval: "1d" },
  90: { range: "3mo", interval: "1d" },
};

export const stockChartHandler = async (ticker, displaySymbol, days = 7) => {
  const { range, interval } = RANGE_MAP[days] ?? RANGE_MAP[7];
  const raw = await fetchStockChart(ticker, range, interval);
  const result = raw?.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${ticker}`);

  const timestamps = result.timestamp ?? [];
  const quotes = result.indicators?.quote?.[0] ?? {};
  const closes = quotes.close ?? [];
  const volumes = quotes.volume ?? [];
  const highs = quotes.high ?? [];
  const lows = quotes.low ?? [];
  const meta = result.meta ?? {};

  const pricePairs = timestamps
    .map((ts, i) => [ts * 1000, closes[i]])
    .filter(([, p]) => p != null);

  const volumePairs = timestamps
    .map((ts, i) => [ts * 1000, volumes[i]])
    .filter(([, v]) => v != null);

  const prices = pricePairs.map(([, p]) => p.toFixed(2));

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  });
  const labels = pricePairs.map(([ts]) => {
    const d = new Date(ts);
    return days <= 1 ? timeFormatter.format(d) : dateFormatter.format(d);
  });

  const formattedVolumes = volumePairs.map(([, v]) => v);

  const validHighs = highs.filter((h) => h != null);
  const validLows = lows.filter((l) => l != null);
  const high24 = validHighs.length ? Math.max(...validHighs) : null;
  const low24 = validLows.length ? Math.min(...validLows) : null;

  const firstPrice = pricePairs.length ? pricePairs[0][1] : null;
  const lastPrice = pricePairs.length
    ? pricePairs[pricePairs.length - 1][1]
    : null;
  const periodChange =
    firstPrice != null && lastPrice != null && firstPrice !== 0
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : null;

  const coinData = {
    market_data: {
      high_24h: { usd: high24 },
      low_24h: { usd: low24 },
    },
    periodChange,
  };

  const chartConfig = getChartConfig(
    displaySymbol,
    labels,
    prices,
    coinData,
    formattedVolumes,
    days,
  );
  return {
    buffer: await fetchChartBuffer(chartConfig),
    high24,
    low24,
    meta,
    periodChange,
  };
};
