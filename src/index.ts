import express from "express";
import cors from "cors";

import { crawlWebsite } from "./crawler.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
  console.log("✅ GET / reached");

  res.json({
    success: true,
    message: "Crawler API is running.",
  });
});

app.post("/audit", async (req, res) => {
  console.log("🚀 POST /audit received");

  try {
    const { url } = req.body;

    console.log("📄 URL:", url);

    if (!url) {
      console.log("❌ No URL supplied");

      return res.status(400).json({
        success: false,
        message: "URL is required.",
      });
    }

    console.log("🕷️ Starting crawler...");

    const result = await crawlWebsite(url);

    console.log("✅ Crawler finished");

    if ("error" in result) {
      console.log("❌ Crawler returned an error:", result);

      return res.status(400).json({
        success: false,
        ...result,
      });
    }

    console.log("✅ Returning successful audit");

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("💥 API ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Crawler API running on port ${PORT}`);
});