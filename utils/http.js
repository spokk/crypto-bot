const CMC_BASE_URL = "https://pro-api.coinmarketcap.com";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

const cmcHeaders = () => ({
  "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
  Accept: "application/json",
});

const geckoHeaders = () => ({
  "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
  Accept: "application/json",
});

const fetchJson = async (url, headers, errorMsg) => {
  const response = await fetch(url, { headers });

  if (!response.ok) throw new Error(errorMsg);

  return await response.json();
};

const fetchCMC = async (url, errorMsg) => {
  const json = await fetchJson(url, cmcHeaders(), errorMsg);

  if (!json.data) {
    console.error("CoinMarketCap API response:", JSON.stringify(json, null, 2));
    throw new Error(errorMsg);
  }

  return json.data;
};

const buildUrl = (base, path, params) => {
  const url = new URL(`${base}${path}`);
  if (params) {
    url.search = new URLSearchParams(params).toString();
  }
  return url;
};

export const fetchCryptoQuote = async (symbol) => {
  const url = buildUrl(CMC_BASE_URL, "/v1/cryptocurrency/quotes/latest", {
    symbol,
  });
  const data = await fetchCMC(url, `No data for symbol: ${symbol}`);

  if (!data[symbol]) {
    throw new Error(`No data for symbol: ${symbol}`);
  }

  return data[symbol].quote.USD;
};

export const fetchFearAndGreed = async () =>
  fetchCMC(
    buildUrl(CMC_BASE_URL, "/v3/fear-and-greed/latest"),
    "No data for fear and greed index",
  );

export const fetchGlobalMetrics = async () =>
  fetchCMC(
    buildUrl(CMC_BASE_URL, "/v1/global-metrics/quotes/latest"),
    "No data for global metrics",
  );

export const getCoinGeckoCoinList = async (symbol) =>
  fetchJson(
    buildUrl(COINGECKO_BASE_URL, "/search", { query: symbol }),
    geckoHeaders(),
    "Failed to fetch CoinGecko coin list",
  );

export const fetchCoinGeckoMarketChart = async (
  coinId,
  days = 7,
  vsCurrency = "usd",
) =>
  fetchJson(
    buildUrl(COINGECKO_BASE_URL, `/coins/${coinId}/market_chart`, {
      vs_currency: vsCurrency,
      days,
    }),
    geckoHeaders(),
    "Coin not found",
  );

export const fetchCoinGeckoCoinData = async (coinId) =>
  fetchJson(
    buildUrl(COINGECKO_BASE_URL, `/coins/${coinId}`, {
      localization: "false",
      tickers: "false",
      market_data: "true",
      community_data: "false",
      developer_data: "false",
      sparkline: "false",
    }),
    geckoHeaders(),
    "Coin not found",
  );

export const fetchCoinGeckoGlobal = async () =>
  fetchJson(
    buildUrl(COINGECKO_BASE_URL, "/global"),
    geckoHeaders(),
    "Global data not found",
  );

export const fetchCoinGeckoTopData = async () =>
  fetchJson(
    buildUrl(COINGECKO_BASE_URL, "/coins/markets", {
      vs_currency: "usd",
      ids: "bitcoin,ethereum,tether-gold,kinesis-silver",
      order: "market_cap_desc",
      per_page: "20",
      sparkline: "false",
    }),
    geckoHeaders(),
    "Top coins not found",
  );
