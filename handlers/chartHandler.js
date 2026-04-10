import { fetchCoinGeckoMarketChart } from "../utils/http.js";
import {
  formatPrices,
  formatLabels,
  formatVolumes,
  downsample,
} from "../utils/chartUtils.js";
import { getChartConfig } from "./chartConfig.js";
import { fetchChartBuffer } from "./chartUrl.js";

export const chartHandler = async (symbol, geckoId, days = 7) => {
  const chart = await fetchCoinGeckoMarketChart(geckoId, days);

  const sampled = downsample(chart.prices);
  const prices = formatPrices(sampled);
  const labels = formatLabels(sampled, days);
  const sampledVolumes = chart.total_volumes
    ? downsample(chart.total_volumes)
    : [];
  const volumes = sampledVolumes.length ? formatVolumes(sampledVolumes) : [];

  const numPrices = sampled.map(([, p]) => p);
  const high = numPrices.length ? Math.max(...numPrices) : null;
  const low = numPrices.length ? Math.min(...numPrices) : null;
  const firstPrice = numPrices[0];
  const lastPrice = numPrices.at(-1);
  const periodChange =
    firstPrice != null && lastPrice != null && firstPrice !== 0
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : null;

  const coinData = {
    market_data: {
      high_24h: { usd: high },
      low_24h: { usd: low },
    },
    periodChange,
  };

  const chartConfig = getChartConfig(
    symbol,
    labels,
    prices,
    coinData,
    volumes,
    days,
  );

  return {
    buffer: await fetchChartBuffer(chartConfig),
    high24: high,
    low24: low,
    periodChange,
  };
};
