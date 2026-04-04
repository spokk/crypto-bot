import { cryptoList } from "../data/cryptoList.js";
import { fetchCoinGeckoMarketChart, fetchCryptoQuote } from "../utils/http.js";
import { formatLabels } from "../utils/chartUtils.js";
import { safeFixed, getChangeSymbol } from "../utils/format.js";
import { getCompareChartConfig } from "./compareChartConfig.js";
import { buildQuickChartUrl } from "./chartUrl.js";
import { buildTimeframeKeyboard } from "../utils/keyboard.js";

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

const formatSignedPct = (v) => {
  if (typeof v !== "number" || isNaN(v)) return "N/A";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
};

const formatCompareMessage = (nameA, quoteA, nameB, quoteB) => {
  const priceA = safeFixed(quoteA?.price);
  const priceB = safeFixed(quoteB?.price);

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

  const change7dA = quoteA?.percent_change_7d;
  const change7dB = quoteB?.percent_change_7d;

  let verdict = "";
  if (typeof change7dA === "number" && typeof change7dB === "number") {
    const diff = Math.abs(change7dA - change7dB);
    if (change7dA > change7dB) {
      verdict = `\n📊 ${nameA} outperformed ${nameB} by ${diff.toFixed(2)}% over 7d`;
    } else if (change7dB > change7dA) {
      verdict = `\n📊 ${nameB} outperformed ${nameA} by ${diff.toFixed(2)}% over 7d`;
    } else {
      verdict = `\n📊 Both performed equally over 7d`;
    }
  }

  const header = `${"".padStart(3)}  ${nameA.padStart(8)}  ${nameB.padStart(8)}`;

  return [
    `⚖️ ${nameA} $${priceA}  vs  ${nameB} $${priceB}`,
    "",
    `<pre>${header}`,
    ...rows,
    `</pre>`,
    verdict,
  ].join("\n");
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

  const pricesA = chartA.prices.map(([, p]) => p);
  const pricesB = chartB.prices.map(([, p]) => p);
  const labels = formatLabels(chartA.prices);

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

  const chartUrl = buildQuickChartUrl(chartConfig);
  const message = formatCompareMessage(
    coinA.symbol,
    quoteA,
    coinB.symbol,
    quoteB,
  );

  const keyboard = buildTimeframeKeyboard(
    `x:${coinA.geckoId}:${coinB.geckoId}`,
  );

  if (chartUrl) {
    await ctx.replyWithPhoto(chartUrl, {
      caption: message,
      parse_mode: "HTML",
      disable_notification: true,
      reply_markup: keyboard,
    });
  } else {
    await ctx.reply(message, {
      parse_mode: "HTML",
      disable_notification: true,
    });
  }
};
