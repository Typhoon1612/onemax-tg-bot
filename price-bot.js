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

// Telegraf framework for Telegram bot functionality
const { Telegraf } = require("telegraf");

// Read token from .env
const bot = new Telegraf(process.env.BOT_TOKEN);

// Read Chat ID from .env
const CHAT_ID = process.env.CHAT_ID;

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

const cryptoSymbols = [
  "BTC",
  "ETH",
  "SOL",
  "XRP",
  "TRX",
  "SUI",
  "LTC",
  "PEPE",
  "DOGE",
  "BNB",
  "ATOM",
  "UNI",
  "DOT",
  "FLOKI",
  "ADA",
  "ENA",
  "LINK",
  "XLM",
  "POL",
];

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
  const lines = [];
  for (const symbol of cryptoSymbols) {
    const data = await fetchCryptoToken(symbol);
    if (!data) {
      const line = `${symbol}: No data returned`;
      console.log(line);
      lines.push(line);
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

    // const line = `${symbol}: ${priceStr} | 1h: ${p1hStr}`;
    // console.log(line);
    // lines.push(line);

    if (!Number.isNaN(p1hNum) && (p1hNum >= 5 || p1hNum <= -5)) {
      const extra = `${symbol}: 1h change is positive: ${p1hStr} the price now is ${priceStr}`;
      console.log(extra);
      lines.push(extra);
      continue;
    } else {
      continue;
    }
  }

  // Send summary to Telegram if configured
  try {
    if (bot && CHAT_ID && lines.length > 0) {
      const text = `1h price check:\n${lines.join("\n")}`;
      await bot.telegram.sendMessage(CHAT_ID, text);
    }
  } catch (err) {
    console.error(
      "Failed to send 1h summary to Telegram:",
      err?.response?.description || err?.message || err
    );
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

  // Send summary to Telegram if configured
  try {
    if (bot && CHAT_ID) {
      const msg = `${symbol}: 24h change is ${p24Str}`;
      await bot.telegram.sendMessage(CHAT_ID, msg);
    }
  } catch (err) {
    console.error(
      "Failed to send 24h summary to Telegram:",
      err?.response?.description || err?.message || err
    );
  }
}

// --- CLI / direct-run behavior ----------------------------------------
// When the file is executed directly (`node price-bot.js`) show a single
// line with BTC price, 1h and 24h percentage changes, then exit.
/**
 * startScheduler()
 * Starts recurring tasks:
 * - `check1hPriceChange()` every 15 minutes
 * - `post24hPriceChange()` every 6 hours
 * The function performs an immediate run of both tasks, then schedules
 * the recurring calls. It also listens for SIGINT / SIGTERM to clean up.
 */
function startScheduler() {
  console.log(
    "Starting scheduler: `check1hPriceChange` every 15 minutes, `post24hPriceChange` every 6 hours"
  );

  // Run once immediately
  check1hPriceChange().catch((err) =>
    console.error("Initial check1hPriceChange failed:", err)
  );
  post24hPriceChange().catch((err) =>
    console.error("Initial post24hPriceChange failed:", err)
  );

  const FIFTEEN_MIN = 15 * 60 * 1000;
  const SIX_HOURS = 6 * 60 * 60 * 1000;

  const interval1 = setInterval(() => {
    check1hPriceChange().catch((err) =>
      console.error("check1hPriceChange error:", err)
    );
  }, FIFTEEN_MIN);

  const interval2 = setInterval(() => {
    post24hPriceChange().catch((err) =>
      console.error("post24hPriceChange error:", err)
    );
  }, SIX_HOURS);

  function stop() {
    console.log("Stopping scheduler...");
    clearInterval(interval1);
    clearInterval(interval2);
    process.exit(0);
  }

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

// Start bot in polling mode for local testing

// --- Module exports ---------------------------------------------------
// Export the fetchBTC function so other modules can import and reuse it.
// Export both the fetch helper and the runnable `run` function for reuse.
// Export the helpers and the scheduler so other modules can control behavior
// Attach helpers onto the Telegraf bot instance so other modules can use
// the same pattern as `nav-bot.js` (require returns a bot instance).
try {
  bot.fetchCryptoToken = fetchCryptoToken;
  bot.check1hPriceChange = check1hPriceChange;
  bot.post24hPriceChange = post24hPriceChange;
  bot.startScheduler = startScheduler;
} catch (e) {
  // ignore if bot not available for some reason
}

module.exports = bot;
