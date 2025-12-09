const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Simple route so Render detects a port is open
app.get("/", (req, res) => {
  res.send("Bot is running");
});

// Import Telegraf bot instance
const bot = require("./bot");

// Webhook path (keep it obscure)
const PATH = `/bot${process.env.BOT_TOKEN}`;

// mount Telegraf webhook handler
app.use(bot.webhookCallback(PATH));

app.listen(PORT, async () => {
  console.log("Server running on port " + PORT);

  // Determine public URL for webhook registration
  const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || process.env.PUBLIC_URL;
  if (!PUBLIC_URL) {
    console.warn('No PUBLIC_URL/APP_URL/RENDER_EXTERNAL_URL set — webhook not registered automatically. Set APP_URL env var to your service URL.');
    return;
  }

  const webhookUrl = `${PUBLIC_URL}${PATH}`;
  try {
    // remove any existing webhook and set the new one
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(webhookUrl);
    console.log('Webhook set to', webhookUrl);
  } catch (err) {
    console.error('Failed to set webhook:', err);
  }
});
