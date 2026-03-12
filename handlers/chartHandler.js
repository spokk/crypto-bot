import {
  fetchCoinGeckoMarketChart,
  fetchCoinGeckoCoinData,
} from "../utils/http.js";
import {
  formatPrices,
  formatLabels,
  formatVolumes,
} from "../utils/chartUtils.js";
import { getChartConfig } from "./chartConfig.js";
import { buildQuickChartUrl } from "./chartUrl.js";

export const chartHandler = async (symbol, geckoId) => {
  const [chart, coinData] = await Promise.all([
    fetchCoinGeckoMarketChart(geckoId),
    fetchCoinGeckoCoinData(geckoId),
  ]);

  const prices = formatPrices(chart.prices);
  const labels = formatLabels(chart.prices);
  const volumes = chart.total_volumes ? formatVolumes(chart.total_volumes) : [];

  const chartConfig = getChartConfig(symbol, labels, prices, coinData, volumes);
  const marketData = coinData?.market_data ?? {};

  return {
    url: buildQuickChartUrl(chartConfig),
    high24: marketData.high_24h?.usd ?? null,
    low24: marketData.low_24h?.usd ?? null,
  };
};
