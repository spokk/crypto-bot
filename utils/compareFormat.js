import { safeFixed, getChangeSymbol } from "./format.js";

const PERIODS = [
  { label: "1h", key: "percent_change_1h" },
  { label: "24h", key: "percent_change_24h" },
  { label: "7d", key: "percent_change_7d" },
  { label: "30d", key: "percent_change_30d" },
];

const fmtPct = (v) => {
  if (typeof v !== "number" || isNaN(v)) return "   N/A";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
};

export const formatCompareMessage = (nameA, quoteA, nameB, quoteB) => {
  const priceA = safeFixed(quoteA?.price);
  const priceB = safeFixed(quoteB?.price);

  const rows = PERIODS.map(({ label, key }) => {
    const a = fmtPct(quoteA?.[key]).padStart(7);
    const b = fmtPct(quoteB?.[key]).padStart(7);
    return `${label.padStart(3)}  ${a}  ${b}`;
  });

  const header = `${"".padStart(3)}  ${nameA.padStart(7)}  ${nameB.padStart(7)}`;

  const change7dA = quoteA?.percent_change_7d;
  const change7dB = quoteB?.percent_change_7d;

  let verdict = "";
  if (typeof change7dA === "number" && typeof change7dB === "number") {
    const diff = Math.abs(change7dA - change7dB);
    const winner = change7dA > change7dB ? nameA : nameB;
    const loser = change7dA > change7dB ? nameB : nameA;

    if (diff > 0) {
      verdict = `${getChangeSymbol(1)} ${winner} outperformed ${loser} by ${diff.toFixed(2)}% over 7d`;
    } else {
      verdict = "⚪ Both performed equally over 7d";
    }
  }

  return [
    `⚖️ ${nameA} $${priceA}  vs  ${nameB} $${priceB}`,
    "",
    `<pre>${header}`,
    ...rows,
    "</pre>",
    verdict,
  ].join("\n");
};
