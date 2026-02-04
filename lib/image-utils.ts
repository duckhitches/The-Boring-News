/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

/**
 * Image fetching & scraping: extract images from HTML, scrape og:image from article URLs.
 */
import * as cheerio from 'cheerio';

const SCRAPE_TIMEOUT_MS = 8_000;
// Use a standard browser UA to avoid blocking
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function resolveUrl(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

function isValidImageUrl(href: string): boolean {
  try {
    const u = new URL(href);
    return (u.protocol === 'https:' || u.protocol === 'http:') &&
      !u.pathname.endsWith('.svg'); // Skip SVGs usually for news thumbnails
  } catch {
    return false;
  }
}

/**
 * Extract first image URL from HTML using Cheerio.
 * Prioritizes:
 * 1. og:image
 * 2. twitter:image
 * 3. JSON-LD Schema image
 * 4. link[rel="image_src"]
 * 5. First large <img src> (heuristic)
 */
export function extractFirstImageFromHtml(
  html: string,
  baseUrl?: string
): string | null {
  if (!html?.trim()) return null;
  const base = baseUrl ?? 'https://example.com';

  const $ = cheerio.load(html);

  // Helper to check and return
  const check = (val: string | undefined): string | null => {
    if (!val?.trim()) return null;
    const resolved = resolveUrl(val.trim(), base);
    return isValidImageUrl(resolved) ? resolved : null;
  };

  // 1. Open Graph
  const ogImage = check($('meta[property="og:image"]').attr('content'));
  if (ogImage) return ogImage;

  // 2. Twitter Card
  const twitterImage = check($('meta[name="twitter:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content'));
  if (twitterImage) return twitterImage;

  // 3. JSON-LD (basic check for 'image' property in NewsArticle or Article)
  try {
    const jsonLd = $('script[type="application/ld+json"]').get();
    for (const el of jsonLd) {
      if (el.children[0] && 'data' in el.children[0]) {
        const data = JSON.parse((el.children[0] as any).data);
        // Normalize to array
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (typeof item === 'object' && item !== null) {
            // Look for image property which can be string or object
            if (item.image) {
              if (typeof item.image === 'string') return check(item.image) ?? null;
              if (typeof item.image === 'object' && item.image.url) return check(item.image.url) ?? null;
              if (Array.isArray(item.image) && item.image[0]) return check(item.image[0]) ?? null;
            }
          }
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  // 4. link rel="image_src" (old standard but sometimes used)
  const linkImage = check($('link[rel="image_src"]').attr('href'));
  if (linkImage) return linkImage;

  // 5. First significant image
  // Skip small icons, spacers, etc.
  const imgs = $('img').get();
  for (const imgEl of imgs) {
    const src = $(imgEl).attr('src');
    if (src) {
      // Optional: check width/height attributes if available?
      // For now, just take the first valid http(s) image
      const valid = check(src);
      if (valid) return valid;
    }
  }

  return null;
}

/**
 * Fetch article page and extract og:image (or twitter:image).
 */
export async function scrapeOgImage(articleUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);
  try {
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    // Read text (limit slightly to avoid massive memory usage on huge pages, but generous)
    const buffer = await res.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer);

    const url = extractFirstImageFromHtml(text, articleUrl);
    return url ?? null;
  } catch (e) {
    clearTimeout(timeoutId);
    // console.warn(`Scrape failed for ${articleUrl}:`, e);
    return null;
  }
}

/**
 * Run scrapeOgImage for multiple URLs with limited concurrency. Returns map url -> imageUrl.
 */
export async function scrapeOgImagesBatch(
  articleUrls: string[],
  concurrency = 4
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  for (let i = 0; i < articleUrls.length; i += concurrency) {
    const chunk = articleUrls.slice(i, i + concurrency);
    const pairs = await Promise.all(
      chunk.map(async (url) => {
        const img = await scrapeOgImage(url);
        return [url, img] as const;
      })
    );
    pairs.forEach(([url, img]) => result.set(url, img));
  }
  return result;
}
