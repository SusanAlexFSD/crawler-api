import puppeteer, { Browser } from "puppeteer";

import type {
  CrawlResult,
  CrawlSuccess,
  CrawlError,
} from "./types.js";

export async function crawlWebsite(
  url: string
): Promise<CrawlResult> {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 900,
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 2000)
    );

    const title = await page.title();

    const pageUrl = page.url();

    const metaDescription =
      await page.evaluate(() => {
        return (
          document
            .querySelector(
              'meta[name="description"]'
            )
            ?.getAttribute("content") ??
          null
        );
      });

    const links =
      await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll("a")
        ).filter((link) => {
          return (
            link.href &&
            link.href.trim() !== "" &&
            !link.href.startsWith(
              "javascript:"
            )
          );
        }).length;
      });

    const images = await page.$$eval(
      "img",
      (imgs) => imgs.length
    );

        const missingAltTags =
      await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll("img")
        ).filter((img) => {
          const alt =
            img.getAttribute("alt");

          return (
            !alt ||
            alt.trim() === ""
          );
        }).length;
      });

    const h1Count =
      await page.$$eval(
        "h1",
        (elements) =>
          elements.length
      );

    const h2Count =
      await page.$$eval(
        "h2",
        (elements) =>
          elements.length
      );

    const hasCanonical =
      await page.evaluate(() => {
        return !!document.querySelector(
          'link[rel="canonical"]'
        );
      });

    const hasOgTitle =
      await page.evaluate(() => {
        return !!document.querySelector(
          'meta[property="og:title"]'
        );
      });

    const hasOgDescription =
      await page.evaluate(() => {
        return !!document.querySelector(
          'meta[property="og:description"]'
        );
      });

    const hasOgImage =
      await page.evaluate(() => {
        return !!document.querySelector(
          'meta[property="og:image"]'
        );
      });

    const hasViewport =
      await page.evaluate(() => {
        return !!document.querySelector(
          'meta[name="viewport"]'
        );
      });

    const hasSchema =
      await page.evaluate(() => {
        return !!document.querySelector(
          'script[type="application/ld+json"]'
        );
      });

    const usesHttps =
      pageUrl.startsWith(
        "https://"
      );

          let hasRobots = false;

    try {
      const response = await fetch(
        new URL("/robots.txt", pageUrl).href
      );

      hasRobots = response.ok;
    } catch {
      hasRobots = false;
    }

    let hasSitemap = false;

    try {
      const response = await fetch(
        new URL("/sitemap.xml", pageUrl).href
      );

      hasSitemap = response.ok;
    } catch {
      hasSitemap = false;
    }

    const result: CrawlSuccess = {
      title,
      pageUrl,
      metaDescription,

      links,
      images,
      missingAltTags,

      h1Count,
      h2Count,

      hasCanonical,
      hasOgTitle,
      hasOgDescription,
      hasOgImage,

      hasViewport,
      hasSchema,
      usesHttps,
      hasRobots,
      hasSitemap,

      screenshot: "",
    };

    return result;

      } catch (error) {
    console.error(
      "========== CRAWLER ERROR =========="
    );

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);

      const result: CrawlError = {
        error: "Crawler failed",
        details: error.message,
      };

      return result;
    }

    console.error(error);

    const result: CrawlError = {
      error: "Crawler failed",
      details: "Unknown crawler error",
    };

    return result;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}