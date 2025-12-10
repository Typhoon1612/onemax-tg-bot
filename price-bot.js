/**
 * price-bot.js
 *
 * Simple helper script to fetch Bitcoin (BTC) price and percentage changes
 * from CoinMarketCap (CMC) and optionally log them to the console.
 *
 * This file is modular (exports `fetchBTC`) and also runnable directly
 * (`node price-bot.js`) where it will print a single line and exit.
 */

// Load environment variables from .env into process.env
require("dotenv").config();

// HTTP client used to call the CoinMarketCap API
const axios = require("axios");

// --- Configuration -----------------------------------------------------
// Read the CoinMarketCap API key from environment variables. This key is
// required to call the CMC pro endpoints.
const CMC_API_KEY = process.env.CMC_API_KEY;
if (!CMC_API_KEY) {
  // If the key is missing, log an error and exit early. The script cannot
  // function without a valid API key.
  console.error("Missing CMC_API_KEY in .env");
  process.exit(1);
}

const cryptoSymbols = ["BTC", "ETH", "TRX"];

// --- Data fetching helper ---------------------------------------------
/**
 * fetchBTC()
 * Fetches the latest BTC quote from CoinMarketCap and returns an object
 * containing the USD price and percentage change values.
 *
 * Returns:
 *   { price, percent_change_1h, percent_change_24h } on success
 *   null on failure
 */
async function fetchCryptoToken(symbol) {
  const url =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
  try {
    // Call CMC with the requested symbol and the X-CMC_PRO_API_KEY header
    const res = await axios.get(url, {
      params: { symbol },
      headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
      timeout: 10000,
    });

    // If DEBUG_CMC=true in env, print the full response JSON (pretty)
    if (process.env.DEBUG_CMC === "true") {
      try {
        console.log("CMC response received:");
        console.log(JSON.stringify(res.data, null, 2));
      } catch (e) {
        console.log("Failed to stringify CMC response", e);
      }
    }

    const respData = res.data && res.data.data ? res.data.data : {};
    const item = respData[symbol] || null;
    if (!item) return null;

    const quote = item.quote && item.quote.USD ? item.quote.USD : null;
    if (!quote) return null;

    // Return a simple token object for the requested symbol
    const token = {
      symbol: item.symbol || symbol,
      price:
        typeof quote.price === "number" ? quote.price : Number(quote.price),
      percent_change_1h: quote.percent_change_1h,
      percent_change_24h: quote.percent_change_24h,
    };

    // Also print the parsed data object when debugging
    if (process.env.DEBUG_CMC === "true") {
      try {
        console.log("CMC data object:");
        console.log(JSON.stringify(respData, null, 2));
      } catch (e) {
        console.log("Failed to stringify CMC data", e);
      }
    }

    return token;
  } catch (err) {
    // Provide helpful logging if CMC returns an error payload
    if (err.response && err.response.data)
      console.error("CMC error:", err.response.data);
    else console.error("Error fetching CMC data:", err.message || err);
    return null;
  }
}

async function check1hPriceChange() {
  for (const symbol of cryptoSymbols) {
    const data = await fetchCryptoToken(symbol);
    if (!data) {
      console.log(`${symbol}: No data returned`);
      continue; // try next symbol instead of stopping the whole loop
    }

    // Print a concise line per token: Price, 1h %, 24h %
    const t = data;
    if (!t) {
      console.log(`${symbol}: no data`);
      continue;
    }

    const p1hNum = Number(t.percent_change_1h);
    const p1hStr = !Number.isNaN(p1hNum) ? `${p1hNum.toFixed(2)}%` : "N/A";


    const priceStr = t.price ? `$${t.price.toFixed(2)}` : "N/A";

    if (!Number.isNaN(p1hNum) && p1hNum >= 0) {
      console.log(`${symbol}: 1h change is positive: ${p1hStr} the price now is ${priceStr}`);
	} else {
		return;
	}
  }
}

async function post24hPriceChange() { 
	// Randomly Generate a number according to Length of cryptoSymbols
	const randomIndex = Math.floor(Math.random() * cryptoSymbols.length);
	const symbol = cryptoSymbols[randomIndex];
	const data = await fetchCryptoToken(symbol);
	if (!data) {
	  console.log(`${symbol}: No data returned`);
	  return; // try next symbol instead of stopping the whole loop
	}
	// Print a concise line per token: Price, 1h %, 24h %
	const t = data;
	if (!t) {
	  console.log(`${symbol}: no data`);
	  return;
	}
	const p24Str =
    t.percent_change_24h !== null &&
    t.percent_change_24h !== undefined &&
    !Number.isNaN(Number(t.percent_change_24h))
      ? `${Number(t.percent_change_24h).toFixed(2)}%`
			: "N/A";
	
	console.log(`${symbol}: 24h change is ${p24Str}`);
}

async function run() {
	await check1hPriceChange();
	await post24hPriceChange();
  // // Default tokens for quick testing: BTC, ETH, TRX
  // const data = await fetchCryptoToken(cryptoSymbols[s]);
  // if (!data) {
  //   console.log("No data returned");
  //   process.exit(0);
  // }

  // //   check1hPricePercentgeChange();

  // // Print a concise line per token: Price, 1h %, 24h %

  // const t = data[s];
  // if (!t) {
  //   console.log(`${s}: no data`);
  //   continue;
  // }
  // const priceStr = t.price ? `$${t.price.toFixed(2)}` : "N/A";
  // const p1hStr =
  //   t.percent_change_1h !== null &&
  //   t.percent_change_1h !== undefined &&
  //   !Number.isNaN(Number(t.percent_change_1h))
  //     ? `${Number(t.percent_change_1h).toFixed(2)}%`
  //     : "N/A";
  // const p24Str =
  //   t.percent_change_24h !== null &&
  //   t.percent_change_24h !== undefined &&
  //   !Number.isNaN(Number(t.percent_change_24h))
  //     ? `${Number(t.percent_change_24h).toFixed(2)}%`
  //     : "N/A";
  // console.log(`${s}: ${priceStr} | 1h: ${p1hStr} | 24h: ${p24Str}`);

  process.exit(0);
}

// --- CLI / direct-run behavior ----------------------------------------
// When the file is executed directly (`node price-bot.js`) show a single
// line with BTC price, 1h and 24h percentage changes, then exit.
if (require.main === module) {
  run();
}

// Start bot in polling mode for local testing
// bot
//   .launch()
//   .then(() => console.log("Bot running in polling mode ✓"))
//   .catch((err) => console.error("Failed to start bot:", err));

// --- Module exports ---------------------------------------------------
// Export the fetchBTC function so other modules can import and reuse it.
// Export both the fetch helper and the runnable `run` function for reuse.
module.exports = { fetchCryptoToken, run };
