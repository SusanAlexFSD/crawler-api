import express from "express";
import cors from "cors";

import { crawlWebsite } from "./crawler";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Crawler API is running.",
  });
});

app.post("/audit", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required.",
      });
    }

    const result = await crawlWebsite(url);

    if ("error" in result) {
      return res.status(400).json({
        success: false,
        ...result,
      });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
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