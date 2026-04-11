import { cryptoList } from "../data/cryptoList.js";
import { getCached } from "./cache.js";

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

const RETRYABLE_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
]);

const isRetryableError = (err) => {
  const code = err?.code || err?.cause?.code;
  return code && RETRYABLE_CODES.has(code);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, headers = {}, errorMsg = "Request failed") => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        let body = "";
        try {
          body = await response.text();
        } catch {
          // ignore read failure
        }

        if (response.status >= 500 && attempt < maxAttempts) {
          await sleep(200 * attempt);
          continue;
        }

        throw new Error(`${errorMsg} (status ${response.status}) ${body}`);
      }

      return await response.json();
    } catch (err) {
      const retryable = isRetryableError(err) || err?.name === "TimeoutError";

      if (retryable && attempt < maxAttempts) {
        await sleep(200 * attempt);
        continue;
      }

      throw err;
    }
  }
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

export const fetchCryptoQuote = async (symbol) =>
  getCached(`quote:${symbol}`, async () => {
    const url = buildUrl(CMC_BASE_URL, "/v1/cryptocurrency/quotes/latest", {
      symbol,
    });
    const data = await fetchCMC(url, `No data for symbol: ${symbol}`);

    if (!data[symbol]) {
      throw new Error(`No data for symbol: ${symbol}`);
    }

    return data[symbol].quote.USD;
  });

export const fetchFearAndGreed = async () =>
  getCached("fng", () =>
    fetchCMC(
      buildUrl(CMC_BASE_URL, "/v3/fear-and-greed/latest"),
      "No data for fear and greed index",
    ),
  );

export const fetchGlobalMetrics = async () =>
  getCached("global-metrics", () =>
    fetchCMC(
      buildUrl(CMC_BASE_URL, "/v1/global-metrics/quotes/latest"),
      "No data for global metrics",
    ),
  );

export const fetchCoinGeckoMarketChart = async (
  coinId,
  days = 7,
  vsCurrency = "usd",
) =>
  getCached(`gecko-chart:${coinId}:${days}:${vsCurrency}`, () =>
    fetchJson(
      buildUrl(COINGECKO_BASE_URL, `/coins/${coinId}/market_chart`, {
        vs_currency: vsCurrency,
        days,
      }),
      geckoHeaders(),
      "Coin not found",
    ),
  );

export const fetchCoinGeckoGlobal = async () =>
  getCached("gecko-global", () =>
    fetchJson(
      buildUrl(COINGECKO_BASE_URL, "/global"),
      geckoHeaders(),
      "Global data not found",
    ),
  );

export const fetchPrivatBankRates = async () =>
  getCached("privatbank", () =>
    fetchJson(
      "https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5",
      { Accept: "application/json" },
      "PrivatBank rates not found",
    ),
  );

export const fetchMonoBankRates = async () =>
  getCached("monobank", () =>
    fetchJson(
      "https://api.monobank.ua/bank/currency",
      { Accept: "application/json" },
      "MonoBank rates not found",
    ),
  );

export const fetchNbuExchangeRates = async () =>
  getCached("nbu", () =>
    fetchJson(
      "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json",
      { Accept: "application/json" },
      "NBU exchange rates not found",
    ),
  );

export const fetchCoinGeckoTopData = async () =>
  getCached("gecko-top", () =>
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
    ),
  );

export const fetchStockChart = async (ticker, range = "5d", interval = "1h") =>
  getCached(`stock:${ticker}:${range}:${interval}`, () =>
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
    ),
  );
