import {
  getCoinGeckoCoinList,
  fetchCoinGeckoMarketChart,
  fetchCoinGeckoCoinData,
} from "../utils/http.js";
import { formatPrices, formatLabels } from "../utils/chartUtils.js";
import { getChartConfig } from "./chartConfig.js";
import { buildQuickChartUrl } from "./chartUrl.js";

export const chartHandler = async (symbol) => {
  try {
    // Validate input
    if (!symbol || typeof symbol !== "string") {
      throw new Error("Symbol must be a valid string");
    }

    // Fetch coin list and find the coin by symbol
    const { coins } = await getCoinGeckoCoinList(symbol);
    const coin = coins.find(
      (c) => c.symbol.toLowerCase() === symbol.toLowerCase(),
    );

    if (!coin) {
      throw new Error(`Coin with symbol "${symbol}" not found`);
    }

    // Fetch market chart data and coin data in parallel
    const [chart, coinData] = await Promise.all([
      fetchCoinGeckoMarketChart(coin.id),
      fetchCoinGeckoCoinData(coin.id),
    ]);

    // Validate API responses
    if (!chart?.prices || !coinData) {
      throw new Error("Invalid API response data");
    }

    // Prepare price and label arrays
    const prices = formatPrices(chart.prices);
    const labels = formatLabels(chart.prices);

    // Get chart config and build URL
    const chartConfig = getChartConfig(symbol, labels, prices, coinData);

    return buildQuickChartUrl(chartConfig);
  } catch (err) {
    console.error(`Failed to fetch chart for "${symbol}":`, err.message);
    throw err;
  }
};
