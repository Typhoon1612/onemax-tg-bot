require("dotenv").config();
const { Telegraf } = require("telegraf");

// Read token from .env
const bot = new Telegraf(process.env.BOT_TOKEN);

// /start command
bot.start((ctx) => {
  try {
    ctx.reply(`Welcome to the 1MAX Mini App!😁

Press or type to get started:
📲 /download – Get the 1MAX app (Android & iOS)
🎯 /quest – Complete quests & earn rewards
📝 /register – Create your 1MAX account
💰 /deposit – Deposit funds to start trading
💬 /discord – Join our Discord community
🛠 /support – Get help, support, or partnership info
❓/help – Show available commands

👉 Tap “Launch” to start trading on 1MAX😄`);
  } catch (err) {
    console.error("Failed to reply to /start:", err?.message || err);
  }
});

// /register command
bot.command("register", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // only respond in private chats

  // This URL will open your site directly on the register page
  const registerUrl = `https://www.1max.com/en_US/register`;

  try {
    ctx.reply("Sign up on 1MAX👇", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Register Now", web_app: { url: registerUrl } }],
        ],
      },
    });
  } catch (err) {
    console.error(
      "Failed to send register button:",
      err?.response?.description || err?.message || err
    );
  }
});

// /quest command
bot.command("quest", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // only respond in private chats

  const questUrl = `https://quest.1max.com`;

  try {
    ctx.reply("Ready to earn? Tap below and start completing quests👇", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Start Quest", web_app: { url: questUrl } }],
        ],
      },
    });
  } catch (err) {
    console.error(
      "Failed to send quest button:",
      err?.response?.description || err?.message || err
    );
  }
});

// /deposit command (example of reading arguments)
bot.command("deposit", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // only respond in private chats
  // If user typed: /deposit 100
  //   const text = ctx.message && ctx.message.text ? ctx.message.text : "";
  //   const parts = text.split(" ").filter((p) => p.length > 0);
  //   const amount = parts[1] || null; // second token is amount, if provided

  // This URL will open your site on the deposit page
  const depositUrl = `https://www.1max.com/en_US/assets/recharge`;

  //   if (amount) {
  //     ctx.reply(`You requested to deposit: ${amount}. Opening deposit module...`);
  //   }

  try {
    ctx.reply("Deposit funds to begin trading on 1MAX 👇", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Deposit Now", web_app: { url: depositUrl } }],
        ],
      },
    });
  } catch (err) {
    console.error(
      "Failed to send deposit button:",
      err?.response?.description || err?.message || err
    );
  }
});

bot.command("discord", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // only respond in private chats

  // This URL will open your site on the deposit page
  const discordUrl = `https://discord.gg/jU4FsV4M7v`;

  try {
    ctx.reply("Enter the 1MAX Discord community 👇", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Join Discord", web_app: { url: discordUrl } }],
        ],
      },
    });
  } catch (err) {
    console.error(
      "Failed to send deposit button:",
      err?.response?.description || err?.message || err
    );
  }
});

bot.command("support", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // only respond in private chats
  try {
    ctx.reply(`Need help or have feedback? We’ve got you covered✅
📧 Support & issues: support@1max.com
🤝 Partnerships: partnerships@1max.com`);
  } catch (err) {
    console.error(
      "Failed to send support info:",
      err?.response?.description || err?.message || err
    );
  }
});

// /download command
// Shows an inline keyboard asking the user to choose Android or iOS.
// The buttons use `callback_data` so the bot will receive an action
// and can edit the message to show the appropriate download link.
bot.command("download", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // only respond in private chats

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Android", callback_data: "download_android" },
          { text: "iOS", callback_data: "download_ios" },
        ],
      ],
    },
  };

  try {
    ctx.reply("Select your device👇", keyboard);
  } catch (err) {
    console.error(
      "Failed to send download options:",
      err?.response?.description || err?.message || err
    );
  }
});

// Callback handlers for download flow
// These constants hold the target download URLs for each platform.
const ANDROID_URL =
  "https://capp-build.oss-cn-hangzhou.aliyuncs.com/1MAX/1MAX_Release_6.4.9_6030016.apk";
const IOS_URL = "https://testflight.apple.com/join/BUWC6Bjf";

// Handler: user tapped the Android button
// - verifies chat is private, then edits the original message to show
//   the Android download link and a Back button (keeps the UI tidy).
bot.action("download_android", async (ctx) => {
  try {
    const isPrivate = ctx.chat && ctx.chat.type === "private";
    if (!isPrivate) return ctx.answerCbQuery();

    const opts = {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "download_back" }]],
      },
    };

    if (ctx.updateType === "callback_query") {
      await ctx.editMessageText(
        `📲 Tap the link below to download the 1MAX Android app:\n\n${ANDROID_URL}`,
        opts
      );
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(
        `📲 Tap the link below to download the 1MAX Android app:\n\n${ANDROID_URL}`,
        opts
      );
    }
  } catch (err) {
    console.error("download_android handler failed:", err?.message || err);
  }
});

// Handler: user tapped the iOS button
// - verifies chat is private, then edits the original message to show
//   the iOS/TestFlight link and a Back button.
bot.action("download_ios", async (ctx) => {
  try {
    const isPrivate = ctx.chat && ctx.chat.type === "private";
    if (!isPrivate) return ctx.answerCbQuery();

    const opts = {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "download_back" }]],
      },
    };

    if (ctx.updateType === "callback_query") {
      await ctx.editMessageText(
        `📲 Tap the link below to download the 1MAX iOS app:\n\n${IOS_URL}`,
        opts
      );
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(
        `📲 Tap the link below to download the 1MAX iOS app:\n\n${IOS_URL}`,
        opts
      );
    }
  } catch (err) {
    console.error("download_ios handler failed:", err?.message || err);
  }
});

// Handler: user tapped Back
// - returns the message to the initial choice screen with Android/iOS buttons
bot.action("download_back", async (ctx) => {
  try {
    const isPrivate = ctx.chat && ctx.chat.type === "private";
    if (!isPrivate) return ctx.answerCbQuery();

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Android", callback_data: "download_android" },
            { text: "iOS", callback_data: "download_ios" },
          ],
        ],
      },
    };

    if (ctx.updateType === "callback_query") {
      await ctx.editMessageText("Choose one type to install:", keyboard);
      await ctx.answerCbQuery();
    } else {
      await ctx.reply("Choose one type to install:", keyboard);
    }
  } catch (err) {
    console.error("download_back handler failed:", err?.message || err);
  }
});

// /help command
bot.command("help", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // ignore in groups/channels

  try {
    ctx.reply(`Press or type to get started:

📲 /download – Get the 1MAX app

🎯 /quest – Complete quests & earn rewards

📝 /register – Create your 1MAX account

💰 /deposit – Deposit funds to start trading

💬 /discord – Join our Discord community

🤝 /support – Get help, support, or partnership info 

👉 Tap “Launch” to start trading on 1MAX`);
  } catch (err) {
    console.error("Failed to reply to /help:", err?.message || err);
  }
});

// Handle plain text messages (non-slash input)
bot.on("text", (ctx) => {
  const isPrivate = ctx.chat && ctx.chat.type === "private";
  if (!isPrivate) return; // ignore plain text in groups

  const text = ctx.message.text.trim();

  // Example: allow users to type "deposit 50" without slash
  const tokens = text.split(/\s+/);
  const first = tokens[0].toLowerCase();

  //   if (first === "deposit") {
  //     const amount = tokens[1] || null;
  //     const depositUrl = `${ONEMAX_BASE_URL}/deposit`;
  //     if (amount) ctx.reply(`Got deposit amount: ${amount}. Opening deposit...`);
  //     ctx.reply("Tap the button to open the Deposit module:", {
  //       reply_markup: {
  //         inline_keyboard: [
  //           [
  //             {
  //               text: "Open Deposit",
  //               web_app: { url: depositUrl },
  //             },
  //           ],
  //         ],
  //       },
  //     });
  //     return;
  //   }

  // allow "register" and "quest" as plain text too
  if (first === "register" || first === "quest" || first === "deposit") {
    let pageUrl = null;
    let pageLabel = first;
    if (first === "register") {
      pageUrl = `https://www.1max.com/en_US/register`;
    } else if (first === "deposit") {
      pageUrl = `https://www.1max.com/en_US/assets/recharge`;
    } else if (first === "quest") {
      pageUrl = `https://quest.1max.com`;
    }

    if (pageUrl) {
      ctx.reply(`Tap the button to open the ${pageLabel} module:`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Open ${pageLabel}`, web_app: { url: pageUrl } }],
          ],
        },
      });
    } else {
      ctx.reply("Sorry, I can't open that page right now.");
    }

    return;
  }

  // Fallback for other text
  // Optionally ignore common small messages
  if (text.length < 50 && text.indexOf(" ") === -1) {
    // short single-word messages: offer help
    ctx.reply("I didn't recognize that. Type /help to see available commands.");
  }
});

// Register commands so they appear in Telegram's UI (optional but helpful).
// Do NOT launch the bot here — the server (index.js) will set up webhooks and start the bot.
(async () => {
  try {
    const isPrivate = ctx.chat && ctx.chat.type === "private";
    if (!isPrivate) {
      // ignore plain text in groups
      await bot.telegram.setMyCommands([]);
      return;
    }
    // Register commands only for private chats so the menu doesn't appear in groups
    await bot.telegram.setMyCommands(
      [
        { command: "start", description: "Start the bot" },
        { command: "download", description: "Get app download links" },
        { command: "register", description: "Open register module" },
        { command: "deposit", description: "Open deposit module" },
        { command: "quest", description: "Open quest module" },
        { command: "help", description: "Show help" },
      ],
      { scope: { type: "all_private_chats" } }
    );
    console.log("Commands cleared and private-only commands registered.");
  } catch (err) {
    // ignore setMyCommands errors in case of missing token during dev
  }
})();

// For clean exit (safe: only call stop if bot is running)
process.once("SIGINT", async () => {
  try {
    await bot.stop("SIGINT");
  } catch (e) {
    // ignore if bot not running
  }
});
process.once("SIGTERM", async () => {
  try {
    await bot.stop("SIGTERM");
  } catch (e) {
    // ignore if bot not running
  }
});

// Start bot in polling mode for local testing
bot
  .launch()
  .then(() => console.log("Bot running in polling mode ✓"))
  .catch((err) => console.error("Failed to start bot:", err));

module.exports = bot;
