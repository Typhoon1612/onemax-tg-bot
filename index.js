const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Simple route so Render detects a port is open
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
