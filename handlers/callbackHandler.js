import { InputFile } from "grammy";
import { chartHandler } from "./chartHandler.js";
import { stockChartHandler } from "./stockChartHandler.js";
import { getCompareChartConfig } from "./compareChartConfig.js";
import { fetchChartBuffer } from "./chartUrl.js";
import {
  fetchCryptoQuote,
  fetchFearAndGreed,
  fetchGlobalMetrics,
  fetchCoinGeckoGlobal,
  fetchCoinGeckoMarketChart,
} from "../utils/http.js";
import { formatCryptoMessage } from "../utils/format.js";
import { formatStockMessage } from "../utils/stockFormat.js";
import { formatLabels, downsample } from "../utils/chartUtils.js";
import { buildTimeframeKeyboard } from "../utils/keyboard.js";
import { cryptoList } from "../data/cryptoList.js";
import { stockList } from "../data/stockList.js";

const COIN_BY_SYMBOL = new Map(cryptoList.map((c) => [c.symbol, c]));
const STOCK_BY_TICKER = new Map(stockList.map((s) => [s.ticker, s]));

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
    { high24: chartResult.high24, low24: chartResult.low24, days },
    cgGlobal,
  );

  const keyboard = buildTimeframeKeyboard(`c:${symbol}:${geckoId}`, days);

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: new InputFile(chartResult.buffer, "chart.png"),
      caption: message,
    },
    { reply_markup: keyboard },
  );
};

const handleCompareCallback = async (ctx, parts) => {
  const [geckoIdA, geckoIdB, daysStr] = parts;
  const days = Number(daysStr);

  const coinA = cryptoList.find((c) => c.geckoId === geckoIdA);
  const coinB = cryptoList.find((c) => c.geckoId === geckoIdB);
  if (!coinA || !coinB) return;

  const [chartA, chartB] = await Promise.all([
    fetchCoinGeckoMarketChart(coinA.geckoId, days),
    fetchCoinGeckoMarketChart(coinB.geckoId, days),
  ]);

  const sampledA = downsample(chartA.prices);
  const sampledB = downsample(chartB.prices);
  const pricesA = sampledA.map(([, p]) => p);
  const pricesB = sampledB.map(([, p]) => p);
  const labels = formatLabels(sampledA, days);

  const firstA = pricesA[0];
  const lastA = pricesA.at(-1);
  const changeA =
    firstA != null && lastA != null && firstA !== 0
      ? ((lastA - firstA) / firstA) * 100
      : null;
  const firstB = pricesB[0];
  const lastB = pricesB.at(-1);
  const changeB =
    firstB != null && lastB != null && firstB !== 0
      ? ((lastB - firstB) / firstB) * 100
      : null;

  const chartConfig = getCompareChartConfig(
    coinA.symbol,
    pricesA,
    coinB.symbol,
    pricesB,
    labels,
    changeA,
    changeB,
    days,
  );

  const chartBuffer = await fetchChartBuffer(chartConfig);
  const caption = ctx.callbackQuery.message?.caption ?? "";
  const keyboard = buildTimeframeKeyboard(`x:${geckoIdA}:${geckoIdB}`, days);

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: new InputFile(chartBuffer, "chart.png"),
      caption,
      parse_mode: "HTML",
    },
    { reply_markup: keyboard },
  );
};

const handleStockCallback = async (ctx, parts) => {
  const [ticker, daysStr] = parts;
  const days = Number(daysStr);
  const stock = STOCK_BY_TICKER.get(ticker);
  if (!stock) return;

  const chartResult = await stockChartHandler(ticker, stock.symbol, days);

  const message = formatStockMessage(stock.name, chartResult.meta, {
    high24: chartResult.high24,
    low24: chartResult.low24,
    periodChange: chartResult.periodChange,
    days,
  });

  const keyboard = buildTimeframeKeyboard(`s:${ticker}`, days);

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: new InputFile(chartResult.buffer, "chart.png"),
      caption: message,
    },
    { reply_markup: keyboard },
  );
};

export const registerCallbackHandler = (bot) => {
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const [type, ...rest] = data.split(":");

    try {
      await Promise.all([
        ctx.answerCallbackQuery({ text: "Loading…" }),
        ctx.replyWithChatAction("upload_photo"),
      ]);

      if (type === "c") {
        await handleCryptoCallback(ctx, rest);
      } else if (type === "x") {
        await handleCompareCallback(ctx, rest);
      } else if (type === "s") {
        await handleStockCallback(ctx, rest);
      }
    } catch (error) {
      if (error?.description?.includes("message is not modified")) return;
      console.error("Callback query failed:", error);
      await ctx
        .answerCallbackQuery({ text: "Something went wrong." })
        .catch(() => {});
    }
  });
};
