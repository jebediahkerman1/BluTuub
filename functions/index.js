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

function validImageDataUrl(value) {
  return typeof value === "string"
    && value.length <= 220000
    && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
}

exports.moderateUpload = onRequest(
  {
    region: "us-central1",
    secrets: [openaiApiKey],
    cors: false,
    maxInstances: 5,
    timeoutSeconds: 45
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
    if (!ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: "This website is not allowed to use moderation." });
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST to check an upload." });

    try {
      const match = (req.get("authorization") || "").match(/^Bearer (.+)$/i);
      if (!match) return res.status(401).json({ error: "Sign in to use AI moderation." });
      await getAuth().verifyIdToken(match[1]);

      const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
      const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
      const thumbnail = req.body?.thumbnail;
      const frames = req.body?.frames;
      if (title.length < 3 || title.length > 100 || description.length > 1000) {
        return res.status(400).json({ error: "Enter a title between 3 and 100 characters and a description up to 1,000 characters." });
      }
      if (!validImageDataUrl(thumbnail) || !Array.isArray(frames) || frames.length !== 4 || !frames.every(validImageDataUrl)) {
        return res.status(400).json({ error: "Thumbnail and all 4 video-frame samples are required. The upload was not approved." });
      }

      const input = [
        { type: "text", text: "Review this proposed video upload. Title: " + title + "\nDescription: " + description + "\nPolicy: Block sexually explicit content and graphic violence. Evaluate the images as a video thumbnail or sampled video frames." },
        { type: "image_url", image_url: { url: thumbnail } },
        ...frames.map((url) => ({ type: "image_url", image_url: { url } }))
      ];

      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: { "Authorization": "Bearer " + openaiApiKey.value(), "Content-Type": "application/json" },
        body: JSON.stringify({ model: "omni-moderation-latest", input })
      });
      if (!response.ok) {
        console.error("OpenAI moderation returned status", response.status);
        return res.status(502).json({ error: "AI moderation is unavailable. The upload was not approved; try again later." });
      }
      const data = await response.json();
      const results = data.results;
      if (!Array.isArray(results) || results.length < 2) {
        return res.status(502).json({ error: "AI moderation returned an incomplete result. The upload was not approved." });
      }

      const flaggedCategories = [...new Set(results.flatMap(result =>
        Object.entries(result.categories || {}).filter(([, flagged]) => flagged).map(([category]) => category)
      ))];
      const blocked = results.some(result => result.flagged) ||
        flaggedCategories.includes("sexual") ||
        flaggedCategories.includes("violence/graphic");

      if (blocked) {
        return res.status(200).json({
          ok: false,
          flagged: true,
          message: "AI moderation flagged the title, thumbnail, or a sampled video frame. Edit the content and try again.",
          categories: flaggedCategories
        });
      }

      return res.status(200).json({
        ok: true,
        flagged: false,
        message: "AI moderation passed the title, thumbnail, and 4 sampled video frames.",
        categories: []
      });
    } catch (error) {
      if (error?.code === "auth/id-token-expired" || error?.code === "auth/argument-error" || error?.code === "auth/invalid-id-token") {
        return res.status(401).json({ error: "Your sign-in session expired. Sign in again to use AI moderation." });
      }
      console.error("AI moderation request failed:", error);
      return res.status(500).json({ error: "AI moderation failed. The upload was not approved; please try again." });
    }
  }
);
