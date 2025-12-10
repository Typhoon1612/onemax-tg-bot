require("dotenv").config();
const { Telegraf } = require("telegraf");

// Read token from .env
const bot = new Telegraf(process.env.BOT_TOKEN);


// /start command
bot.start((ctx) => {
  ctx.reply(
    `Welcome to 1MAX.com
    Available commands:
    /start - Start the bot
    /register - Open register module
    /deposit - Open deposit module
    /quest - Open quest module
    /help - Show this help`
  );
});
 
// /register command
bot.command("register", (ctx) => {
  // This URL will open your site directly on the register page
  const registerUrl = `https://www.1max.com/en_US/register`;

  ctx.reply("Tap the button to open the register module:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Register",
            web_app: {
              url: registerUrl,
            },
          },
        ],
      ],
    },
  });
});

// /quest command
bot.command("quest", (ctx) => {
  const questUrl = `https://quest.1max.com`;

  ctx.reply("Tap the button to open the quest module:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Quest",
            web_app: {
              url: questUrl,
            },
          },
        ],
      ],
    },
  });
});

// /deposit command (example of reading arguments)
bot.command("deposit", (ctx) => {
  // If user typed: /deposit 100
//   const text = ctx.message && ctx.message.text ? ctx.message.text : "";
//   const parts = text.split(" ").filter((p) => p.length > 0);
//   const amount = parts[1] || null; // second token is amount, if provided

  // This URL will open your site on the deposit page
  const depositUrl = `https://www.1max.com/en_US/assets/recharge`;

//   if (amount) {
//     ctx.reply(`You requested to deposit: ${amount}. Opening deposit module...`);
//   }

  ctx.reply("Tap the button to open the deposit module:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Deposit",
            web_app: {
              url: depositUrl,
            },
          },
        ],
      ],
    },
  });
});

// /help command
bot.command("help", (ctx) => {
  ctx.reply(
    `Available commands:
    /start - Start the bot
    /register - Open register module
    /deposit - Open deposit module
    /quest - Open quest module
    /help - Show this help`
  );
});

// Handle plain text messages (non-slash input)
bot.on("text", (ctx) => {
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
          inline_keyboard: [[{ text: `Open ${pageLabel}`, web_app: { url: pageUrl } }]],
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
    await bot.telegram.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "register", description: "Open register module" },
      { command: "deposit", description: "Open deposit module" },
      { command: "quest", description: "Open quest module" },
      { command: "help", description: "Show help" },
    ]);
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
bot.launch()
  .then(() => console.log('Bot running in polling mode ✓'))
  .catch(err => console.error('Failed to start bot:', err));

module.exports = bot;