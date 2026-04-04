import { InputFile } from "grammy";
import { cryptoList } from "../data/cryptoList.js";
import { fetchCoinGeckoMarketChart, fetchCryptoQuote } from "../utils/http.js";
import { formatLabels, downsample } from "../utils/chartUtils.js";
import { getCompareChartConfig } from "./compareChartConfig.js";
import { fetchChartBuffer } from "./chartUrl.js";
import { buildTimeframeKeyboard } from "../utils/keyboard.js";
import { formatCompareMessage } from "../utils/compareFormat.js";

const COIN_LOOKUP = new Map(
  cryptoList.flatMap((c) => [
    [c.command, c],
    [c.symbol.toLowerCase(), c],
  ]),
);

const resolveCoin = (input) => COIN_LOOKUP.get(input.toLowerCase().trim());

const parseCoins = (text) => {
  const args = text.trim().split(/\s+/).filter(Boolean);

  if (args.length === 0) {
    return [resolveCoin("btc"), resolveCoin("eth")];
  }

  if (args.length === 1) {
    const coin = resolveCoin(args[0]);
    return [coin, coin ? resolveCoin("btc") : null];
  }

  return [resolveCoin(args[0]), resolveCoin(args[1])];
};

export const compareHandler = async (ctx) => {
  const text = ctx.match ?? "";
  const [coinA, coinB] = parseCoins(text);

  const supported = cryptoList.map((c) => c.command.toUpperCase()).join(", ");

  if (!coinA || !coinB) {
    await ctx.reply(
      `Unknown coin. Supported: ${supported}\nUsage: /compare BTC ETH`,
      { disable_notification: true },
    );
    return;
  }

  if (coinA.symbol === coinB.symbol) {
    await ctx.reply("Pick two different coins to compare.", {
      disable_notification: true,
    });
    return;
  }

  const [chartA, chartB, quoteA, quoteB] = await Promise.all([
    fetchCoinGeckoMarketChart(coinA.geckoId),
    fetchCoinGeckoMarketChart(coinB.geckoId),
    fetchCryptoQuote(coinA.symbol),
    fetchCryptoQuote(coinB.symbol),
  ]);

  const sampledA = downsample(chartA.prices);
  const sampledB = downsample(chartB.prices);
  const pricesA = sampledA.map(([, p]) => p);
  const pricesB = sampledB.map(([, p]) => p);
  const labels = formatLabels(sampledA);

  const change7dA = quoteA?.percent_change_7d;
  const change7dB = quoteB?.percent_change_7d;

  const chartConfig = getCompareChartConfig(
    coinA.symbol,
    pricesA,
    coinB.symbol,
    pricesB,
    labels,
    change7dA,
    change7dB,
  );

  const chartBuffer = await fetchChartBuffer(chartConfig);
  const message = formatCompareMessage(
    coinA.symbol,
    quoteA,
    coinB.symbol,
    quoteB,
  );

  const keyboard = buildTimeframeKeyboard(
    `x:${coinA.geckoId}:${coinB.geckoId}`,
  );

  await ctx.replyWithPhoto(new InputFile(chartBuffer, "chart.png"), {
    caption: message,
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: keyboard,
  });
};
