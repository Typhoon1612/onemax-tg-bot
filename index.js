const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Simple route so Render detects a port is open
app.get("/", (req, res) => {
  res.send("Bot is running");
});

// Import Telegraf bot instance
const navBot = require("./nav-bot");
// Import price-bot so we can start its scheduler
const priceBot = require("./price-bot");

// Webhook path (keep it obscure)
const PATH = `/nav-bot${process.env.BOT_TOKEN}`;

// mount Telegraf webhook handler
app.use(navBot.webhookCallback(PATH));

app.listen(PORT, async () => {
  console.log("Server running on port " + PORT);

  // Determine public URL for webhook registration
  const PUBLIC_URL =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_URL ||
    process.env.PUBLIC_URL;
  if (!PUBLIC_URL) {
    console.warn(
      "No PUBLIC_URL/APP_URL/RENDER_EXTERNAL_URL set — webhook not registered automatically. Set APP_URL env var to your service URL."
    );
    return;
  }

  const webhookUrl = `${PUBLIC_URL}${PATH}`;
  try {
    // remove any existing webhook and set the new one
    await navBot.telegram.deleteWebhook();
    try {
      await navBot.telegram.setWebhook(webhookUrl);
      console.log("Webhook set to", webhookUrl);
    } catch (err) {
      // Handle conflict when another instance set the webhook concurrently
      const code = err && err.response && err.response.error_code;
      if (code === 409) {
        console.warn(
          "setWebhook conflict (409). Deleting existing webhook and retrying..."
        );
        try {
          await navBot.telegram.deleteWebhook({ drop_pending_updates: true });
          await navBot.telegram.setWebhook(webhookUrl);
          console.log("Webhook set to", webhookUrl, "(retry)");
        } catch (retryErr) {
          console.error("Failed to set webhook on retry:", retryErr);
        }
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("Failed to set webhook:", err);
  }
});

// Start price scheduler
try {
  if (priceBot && typeof priceBot.startScheduler === "function") {
    priceBot.startScheduler();
    console.log("Price scheduler started");
  }
} catch (err) {
  console.error("Failed to start price scheduler:", err?.message || err);
}

// Keep Render awake: ping self every 14 minutes (only for Web Service)
if (process.env.RENDER_EXTERNAL_URL) {
  console.log("Keep-alive enabled. URL:", process.env.RENDER_EXTERNAL_URL);
  setInterval(() => {
    const now = new Date().toISOString();
    fetch(process.env.RENDER_EXTERNAL_URL)
      .then((res) => console.log(`[${now}] Keep-alive ping: ${res.status}`))
      .catch((err) => console.log(`[${now}] Keep-alive error:`, err.message));
  }, 14 * 60_000); // 14 minutes
  console.log("Keep-alive timer started (every 14 min)");
} else {
  console.log("Keep-alive disabled (no RENDER_EXTERNAL_URL)");
}
