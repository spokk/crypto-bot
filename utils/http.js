const CMC_BASE_URL = "https://pro-api.coinmarketcap.com";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

const fetchCMC = async (path, errorMsg) => {
  const response = await fetch(`${CMC_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
      Accept: "application/json",
    },
  });
  const data = await response.json();

  if (!data.data) {
    console.error("CoinMarketCap API response:", JSON.stringify(data, null, 2));
    throw new Error(errorMsg);
  }

  return data.data;
};

const fetchCoinGecko = async (path, errorMsg) => {
  const response = await fetch(`${COINGECKO_BASE_URL}${path}`, {
    headers: {
      "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
      Accept: "application/json",
    },
  });

  if (!response.ok) throw new Error(errorMsg);

  return await response.json();
};

export const fetchCryptoQuote = async (symbol) => {
  const data = await fetchCMC(
    `/v1/cryptocurrency/quotes/latest?symbol=${symbol}`,
    `No data for symbol: ${symbol}`,
  );

  if (!data[symbol]) {
    throw new Error(`No data for symbol: ${symbol}`);
  }

  return data[symbol].quote.USD;
};

export const fetchFearAndGreed = async () =>
  fetchCMC("/v3/fear-and-greed/latest", "No data for fear and greed index");

export const fetchGlobalMetrics = async () =>
  fetchCMC("/v1/global-metrics/quotes/latest", "No data for global metrics");

export const getCoinGeckoCoinList = async (symbol) =>
  fetchCoinGecko(
    `/search?query=${symbol}`,
    "Failed to fetch CoinGecko coin list",
  );

export const fetchCoinGeckoMarketChart = async (
  coinId,
  days = 7,
  vsCurrency = "usd",
) =>
  fetchCoinGecko(
    `/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`,
    "Coin not found",
  );

export const fetchCoinGeckoCoinData = async (coinId) =>
  fetchCoinGecko(
    `/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
    "Coin not found",
  );

export const fetchCoinGeckoTopData = async () =>
  fetchCoinGecko(
    "/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether-gold,kinesis-silver&order=market_cap_desc&per_page=20&sparkline=false",
    "Top coins not found",
  );
