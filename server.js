//
// Node.js Express Proxy Server for ZodiacPulse
//
// Exposes POST /api/aztro that accepts { sign, day } JSON body.
// Proxies to https://aztro.sameerkumar.website/ (Aztro Horoscope API).
//
// Usage:
//   1. Install dependencies:   npm install express node-fetch
//   2. Start server:           node server.js
//   3. By default, runs on PORT 5000 (can set PORT env).
//

// Imports
const express = require("express");
const fetch = require("node-fetch");

// Setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON
app.use(express.json());

// CORS headers (allow all origins for local React dev)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // For dev: allow all
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// PUBLIC_INTERFACE
// POST /api/aztro
// Expects: { sign: Zodiac sign string, day: "today"|"tomorrow"|"yesterday" }
app.post("/api/aztro", async (req, res) => {
  const { sign, day } = req.body;

  if (
    !sign ||
    typeof sign !== "string" ||
    !day ||
    !["today", "tomorrow", "yesterday"].includes(day.toLowerCase())
  ) {
    return res.status(400).json({ error: "Invalid request. Body must contain { sign, day }" });
  }

  try {
    // Construct Aztro API URL with URLSearchParams
    const aztroUrl = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(
      sign
    )}&day=${encodeURIComponent(day)}`;

    // Forward POST request to Aztro API, expect JSON reply
    const aztroRes = await fetch(aztroUrl, { method: "POST" }); // No body required
    if (!aztroRes.ok) throw new Error("Aztro API error");
    const aztroData = await aztroRes.json();

    // Forward Aztro API JSON response to frontend
    res.json(aztroData);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch from Aztro API." });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("ZodiacPulse backend proxy running.");
});

// Start server
app.listen(PORT, () => {
  console.log(`ZodiacPulse proxy server listening at http://localhost:${PORT}/`);
});

/*
======================
Instructions:

1. From your project root, install required dependencies:
      npm install express node-fetch

2. Start the backend with:
      node server.js

   By default, it runs on port 5000.
   You can change the port by setting the PORT environment variable.

3. How to connect from React frontend:
   - Send POST requests to http://localhost:5000/api/aztro with JSON body:
        { "sign": "<zodiac sign>", "day": "today" }
   - Example curl:
        curl -X POST http://localhost:5000/api/aztro -H "Content-Type: application/json" -d '{"sign":"aries","day":"today"}'

4. If you want to run both React and backend together in development:
   - Run backend: node server.js (port 5000)
   - Start React frontend as usual (e.g., npm start, usually on port 3000)
   - API calls to /api/aztro should be proxied to http://localhost:5000

5. For production: You can deploy this server (server.js) on any Node.js environment.

=======================
*/
