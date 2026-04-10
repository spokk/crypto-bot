import { cryptoList } from "../data/cryptoList.js";

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

const fetchJson = async (url, headers = {}, errorMsg = "Request failed") => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    let body = "";
    try {
      body = await response.text();
    } catch {
      // ignore read failure
    }

    throw new Error(`${errorMsg} (status ${response.status}) ${body}`);
  }

  return response.json();
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

export const fetchCoinGeckoGlobal = async () =>
  fetchJson(
    buildUrl(COINGECKO_BASE_URL, "/global"),
    geckoHeaders(),
    "Global data not found",
  );

export const fetchPrivatBankRates = async () => {
  return fetchJson(
    "https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5",
    { Accept: "application/json" },
    "PrivatBank rates not found",
  );
};

export const fetchMonoBankRates = async () =>
  fetchJson(
    "https://api.monobank.ua/bank/currency",
    { Accept: "application/json" },
    "MonoBank rates not found",
  );

export const fetchNbuExchangeRates = async () =>
  fetchJson(
    "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json",
    { Accept: "application/json" },
    "NBU exchange rates not found",
  );

export const fetchCoinGeckoTopData = async () =>
  fetchJson(
    buildUrl(COINGECKO_BASE_URL, "/coins/markets", {
      vs_currency: "usd",
      ids: cryptoList.map((c) => c.geckoId).join(","),
      order: "market_cap_desc",
      per_page: "20",
      sparkline: "false",
    }),
    geckoHeaders(),
    "Top coins not found",
  );

export const fetchStockChart = async (ticker, range = "5d", interval = "1h") =>
  fetchJson(
    buildUrl(
      "https://query1.finance.yahoo.com",
      `/v8/finance/chart/${ticker}`,
      {
        range,
        interval,
        includePrePost: "false",
      },
    ),
    {},
    `Stock data not found for ${ticker}`,
  );
