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
  return result.status === "fulfilled" ? result.value : [];
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
