export interface CrawlSuccess {
  title: string;
  pageUrl: string;
  metaDescription: string | null;

  links: number;
  images: number;
  missingAltTags: number;

  h1Count: number;
  h2Count: number;

  hasCanonical: boolean;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;

  hasViewport: boolean;
  hasSchema: boolean;
  usesHttps: boolean;
  hasRobots: boolean;
  hasSitemap: boolean;

  screenshot: string;
}

export interface CrawlError {
  error: string;
  details: string;
}

export type CrawlResult =
  | CrawlSuccess
  | CrawlError;