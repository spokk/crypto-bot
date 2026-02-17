import {
  getCoinGeckoCoinList,
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

export const chartHandler = async (symbol) => {
  const { coins } = await getCoinGeckoCoinList(symbol);
  const coin = coins.find(
    (c) => c.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  if (!coin) {
    throw new Error(`Coin with symbol "${symbol}" not found`);
  }

  const [chart, coinData] = await Promise.all([
    fetchCoinGeckoMarketChart(coin.id),
    fetchCoinGeckoCoinData(coin.id),
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
