import { chartHandler } from "./chartHandler.js";
import { getCompareChartConfig } from "./compareChartConfig.js";
import { buildQuickChartUrl } from "./chartUrl.js";
import {
  fetchCryptoQuote,
  fetchFearAndGreed,
  fetchGlobalMetrics,
  fetchCoinGeckoGlobal,
  fetchCoinGeckoMarketChart,
} from "../utils/http.js";
import {
  formatCryptoMessage,
  safeFixed,
  getChangeSymbol,
} from "../utils/format.js";
import { formatLabels } from "../utils/chartUtils.js";
import { buildTimeframeKeyboard } from "../utils/keyboard.js";
import { cryptoList } from "../data/cryptoList.js";

const COIN_BY_SYMBOL = new Map(cryptoList.map((c) => [c.symbol, c]));

const formatSignedPct = (v) => {
  if (typeof v !== "number" || isNaN(v)) return "N/A";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
};

const handleCryptoCallback = async (ctx, parts) => {
  const [symbol, geckoId, daysStr] = parts;
  const days = Number(daysStr);
  const coin = COIN_BY_SYMBOL.get(symbol);
  if (!coin) return;

  const [data, chartResult, globalMetrics, fearAndGreed, cgGlobal] =
    await Promise.all([
      fetchCryptoQuote(symbol),
      chartHandler(symbol, geckoId, days),
      fetchGlobalMetrics(),
      fetchFearAndGreed(),
      fetchCoinGeckoGlobal(),
    ]);

  const message = formatCryptoMessage(
    coin.name,
    data,
    globalMetrics,
    fearAndGreed,
    { high24: chartResult.high24, low24: chartResult.low24 },
    cgGlobal,
  );

  const keyboard = buildTimeframeKeyboard(`c:${symbol}:${geckoId}`, days);

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: chartResult.url,
      caption: message,
    },
    { reply_markup: keyboard },
  );
};

const buildCompareCaption = (coinA, quoteA, coinB, quoteB) => {
  const periods = [
    { label: "1h", key: "percent_change_1h" },
    { label: "24h", key: "percent_change_24h" },
    { label: "7d", key: "percent_change_7d" },
    { label: "30d", key: "percent_change_30d" },
  ];

  const rows = periods.map(({ label, key }) => {
    const a = quoteA?.[key];
    const b = quoteB?.[key];
    return `${label.padStart(3)}  ${getChangeSymbol(a)} ${formatSignedPct(a).padStart(8)}  ${getChangeSymbol(b)} ${formatSignedPct(b).padStart(8)}`;
  });

  const changeKeyA = quoteA?.percent_change_7d;
  const changeKeyB = quoteB?.percent_change_7d;

  let verdict = "";
  if (typeof changeKeyA === "number" && typeof changeKeyB === "number") {
    const diff = Math.abs(changeKeyA - changeKeyB);
    if (changeKeyA > changeKeyB) {
      verdict = `\n📊 ${coinA.symbol} outperformed ${coinB.symbol} by ${diff.toFixed(2)}% over 7d`;
    } else if (changeKeyB > changeKeyA) {
      verdict = `\n📊 ${coinB.symbol} outperformed ${coinA.symbol} by ${diff.toFixed(2)}% over 7d`;
    } else {
      verdict = `\n📊 Both performed equally over 7d`;
    }
  }

  const priceA = safeFixed(quoteA?.price);
  const priceB = safeFixed(quoteB?.price);
  const header = `${"".padStart(3)}  ${coinA.symbol.padStart(8)}  ${coinB.symbol.padStart(8)}`;

  return [
    `⚖️ ${coinA.symbol} $${priceA}  vs  ${coinB.symbol} $${priceB}`,
    "",
    `<pre>${header}`,
    ...rows,
    `</pre>`,
    verdict,
  ].join("\n");
};

const handleCompareCallback = async (ctx, parts) => {
  const [geckoIdA, geckoIdB, daysStr] = parts;
  const days = Number(daysStr);

  const coinA = cryptoList.find((c) => c.geckoId === geckoIdA);
  const coinB = cryptoList.find((c) => c.geckoId === geckoIdB);
  if (!coinA || !coinB) return;

  const [chartA, chartB, quoteA, quoteB] = await Promise.all([
    fetchCoinGeckoMarketChart(coinA.geckoId, days),
    fetchCoinGeckoMarketChart(coinB.geckoId, days),
    fetchCryptoQuote(coinA.symbol),
    fetchCryptoQuote(coinB.symbol),
  ]);

  const pricesA = chartA.prices.map(([, p]) => p);
  const pricesB = chartB.prices.map(([, p]) => p);
  const labels = formatLabels(chartA.prices, days);

  const chartConfig = getCompareChartConfig(
    coinA.symbol,
    pricesA,
    coinB.symbol,
    pricesB,
    labels,
    quoteA?.percent_change_7d,
    quoteB?.percent_change_7d,
    days,
  );

  const chartUrl = buildQuickChartUrl(chartConfig);
  const caption = buildCompareCaption(coinA, quoteA, coinB, quoteB);
  const keyboard = buildTimeframeKeyboard(`x:${geckoIdA}:${geckoIdB}`, days);

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: chartUrl,
      caption,
      parse_mode: "HTML",
    },
    { reply_markup: keyboard },
  );
};

export const registerCallbackHandler = (bot) => {
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const [type, ...rest] = data.split(":");

    try {
      if (type === "c") {
        await handleCryptoCallback(ctx, rest);
      } else if (type === "x") {
        await handleCompareCallback(ctx, rest);
      }
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error("Callback query failed:", error);
      await ctx.answerCallbackQuery({ text: "Something went wrong." });
    }
  });
};
