import { getCoinGeckoCoinList, fetchCoinGeckoMarketChart, fetchCoinGeckoCoinData } from '../utils/http.js';
import { formatPrices, formatLabels } from '../utils/chartUtils.js';
import { getChartConfig } from './chartConfig.js';
import { buildQuickChartUrl } from './chartUrl.js';

export const chartHandler = async (symbol) => {
  try {
    // Fetch coin list and find the coin by symbol
    const { coins } = await getCoinGeckoCoinList(symbol);
    const coin = coins.find(c => c.symbol === symbol);

    if (!coin) return;

    // Fetch market chart data
    const chart = await fetchCoinGeckoMarketChart(coin.id);
    const coinData = await fetchCoinGeckoCoinData(coin.id);

    // Prepare price and label arrays
    const prices = formatPrices(chart.prices);
    const labels = formatLabels(chart.prices);

    // Get chart config from separate file
    const chartConfig = getChartConfig(symbol, labels, prices, coinData);

    return buildQuickChartUrl(chartConfig);
  } catch (err) {
    console.error('Could not fetch chart for this coin.', err);
  }
};