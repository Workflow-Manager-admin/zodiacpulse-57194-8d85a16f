/**
 * ZodiacPulse Deepseek Proxy
 * Provides a secure Express POST endpoint '/chat' that proxies Deepseek/OpenRouter API calls,
 * injects the Deepseek API key from process.env, never leaks the key, and relays JSON responses.
 * Only the backend knows the API key; the frontend must never see it.
 * See README for setup instructions.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

// PUBLIC_INTERFACE
// Enable CORS for development (configure appropriately for production).
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);
app.use(express.json());

// PUBLIC_INTERFACE
// POST /chat - securely proxies Deepseek API calls.
// Never leaks API key. Only backend has the key.
app.post("/chat", async (req, res) => {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekApiKey) {
    return res
      .status(500)
      .json({ error: "Deepseek API key not configured on server." });
  }

  try {
    const upstreamResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deepseekApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    // Relay status and response body exactly; do not leak key.
    const contentType = upstreamResponse.headers.get("content-type") || "";
    res.status(upstreamResponse.status);

    if (contentType.includes("application/json")) {
      const data = await upstreamResponse.json();
      return res.json(data);
    } else {
      const rawText = await upstreamResponse.text();
      return res.send(rawText);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to call Deepseek API." });
  }
});

// PUBLIC_INTERFACE
// Start Express proxy server.
app.listen(PORT, () => {
  console.log(`Proxy server for Deepseek listening on port ${PORT}`);
});
