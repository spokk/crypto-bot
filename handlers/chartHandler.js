import {
  fetchCoinGeckoMarketChart,
  fetchCoinGeckoCoinData,
} from "../utils/http.js";
import {
  formatPrices,
  formatLabels,
  formatVolumes,
  downsample,
} from "../utils/chartUtils.js";
import { getChartConfig } from "./chartConfig.js";
import { fetchChartBuffer } from "./chartUrl.js";

export const chartHandler = async (symbol, geckoId, days = 7) => {
  const [chart, coinData] = await Promise.all([
    fetchCoinGeckoMarketChart(geckoId, days),
    fetchCoinGeckoCoinData(geckoId),
  ]);

  const sampled = downsample(chart.prices);
  const prices = formatPrices(sampled);
  const labels = formatLabels(sampled, days);
  const sampledVolumes = chart.total_volumes
    ? downsample(chart.total_volumes)
    : [];
  const volumes = sampledVolumes.length ? formatVolumes(sampledVolumes) : [];

  const chartConfig = getChartConfig(
    symbol,
    labels,
    prices,
    coinData,
    volumes,
    days,
  );
  const marketData = coinData?.market_data ?? {};

  return {
    buffer: await fetchChartBuffer(chartConfig),
    high24: marketData.high_24h?.usd ?? null,
    low24: marketData.low_24h?.usd ?? null,
  };
};
