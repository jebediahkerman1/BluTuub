const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

const openaiApiKey = defineSecret("OPENAI_API_KEY");
const ALLOWED_ORIGINS = new Set([
  "https://jebediahkerman1.github.io",
  "http://localhost:5000",
  "http://127.0.0.1:5000"
]);

exports.moderateUpload = onRequest(
  {
    region: "us-central1",
    secrets: [openaiApiKey],
    cors: false,
    maxInstances: 5,
    timeoutSeconds: 30
  },
  async (req, res) => {
    const origin = req.get("origin") || "";
    if (ALLOWED_ORIGINS.has(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Vary", "Origin");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    }

    if (req.method === "OPTIONS") return res.status(204).send("");
    if (!ALLOWED_ORIGINS.has(origin)) {
      return res.status(403).json({ error: "This website is not allowed to use the moderation service." });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST to check an upload." });
    }

    try {
      const authHeader = req.get("authorization") || "";
      const match = authHeader.match(/^Bearer (.+)$/i);
      if (!match) return res.status(401).json({ error: "Sign in to use AI moderation." });

      await getAuth().verifyIdToken(match[1]);

      const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
      const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
      if (title.length < 3 || title.length > 100 || description.length > 1000) {
        return res.status(400).json({ error: "Enter a title between 3 and 100 characters and a description up to 1,000 characters." });
      }

      const input = [`Video title: ${title}`, description ? `Video description: ${description}` : ""]
        .filter(Boolean).join("\n");

      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey.value()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: "omni-moderation-latest", input })
      });

      if (!response.ok) {
        console.error("OpenAI moderation returned status", response.status);
        return res.status(502).json({ error: "The AI moderation service is temporarily unavailable. Your upload was not added; try again later." });
      }

      const data = await response.json();
      const result = data.results?.[0];
      if (!result) {
        return res.status(502).json({ error: "The AI moderation service returned no result. Your upload was not added." });
      }

      const flaggedCategories = Object.entries(result.categories || {})
        .filter(([, flagged]) => flagged === true)
        .map(([category]) => category);

      if (result.flagged) {
        return res.status(200).json({
          ok: false,
          flagged: true,
          message: "AI moderation flagged this title or description. Edit it and try again, or request a human review.",
          categories: flaggedCategories
        });
      }

      return res.status(200).json({
        ok: true,
        flagged: false,
        message: "AI moderation passed the title and description check.",
        categories: []
      });
    } catch (error) {
      if (error?.code === "auth/id-token-expired" || error?.code === "auth/argument-error" || error?.code === "auth/invalid-id-token") {
        return res.status(401).json({ error: "Your sign-in session expired. Sign in again to use AI moderation." });
      }
      console.error("AI moderation request failed:", error);
      return res.status(500).json({ error: "AI moderation failed. Your upload was not added; please try again." });
    }
  }
);
