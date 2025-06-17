require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

// PUBLIC_INTERFACE
// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Adjust this if frontend runs on a different port/URL in deployment
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// PUBLIC_INTERFACE
// Proxy endpoint for Deepseek/OpenRouter API
app.post("/chat", async (req, res) => {
  // Ensure API key is present in env
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekApiKey) {
    return res.status(500).json({ error: "Deepseek API key not configured on server." });
  }

  try {
    // Relay request to openrouter.ai
    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    if (!openrouterRes.ok) {
      // Pass along a more descriptive error if possible
      const error = await openrouterRes.text();
      return res.status(openrouterRes.status).send(error);
    }

    const data = await openrouterRes.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to call Deepseek API." });
  }
});

// PUBLIC_INTERFACE
// Start server
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
