import {
  fetchPrivatBankRates,
  fetchMonoBankRates,
  fetchNbuExchangeRates,
} from "../utils/http.js";
import { buildUahMessage } from "../utils/uahFormat.js";

const handleFetchResult = (result, source) => {
  if (result.status === "rejected") {
    console.error(`${source} fetch failed:`, result.reason);
  }
  const data = result.status === "fulfilled" ? result.value : [];
  console.log(`${source} data:`, JSON.stringify(data, null, 2));
  return data;
};

export const uahHandler = async () => {
  const [pbRes, monoRes, nbuRes] = await Promise.allSettled([
    fetchPrivatBankRates(),
    fetchMonoBankRates(),
    fetchNbuExchangeRates(),
  ]);

  return buildUahMessage(
    handleFetchResult(pbRes, "PrivatBank"),
    handleFetchResult(monoRes, "MonoBank"),
    handleFetchResult(nbuRes, "NBU"),
  );
};
