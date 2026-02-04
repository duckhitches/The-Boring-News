/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

import { sql } from './db';
import Parser from 'rss-parser';
import { extractFirstImageFromHtml, scrapeOgImagesBatch } from './image-utils';
import { generateGeminiSummary } from './gemini';

const parser = new Parser();

const RSS_FETCH_TIMEOUT_MS = 15_000;
const RSS_MAX_ITEMS_PER_FEED = 80;
const RSS_RETRIES = 2;
const RSS_RETRY_BASE_MS = 1_000;

/** Delimiter for storing 2 summary points in extended_summary (for bullet display) */
export const SUMMARY_POINTS_DELIMITER = '|||';

/** Max chars per summary point (aim for ~2 short paragraphs) */
const SUMMARY_POINT_CHARS = 220;

/**
 * Split content into 2 summary points for better insights (paragraph-style, shown as bullets).
 * Uses sentence boundaries where possible so each point reads cleanly.
 */
function extractTwoSummaryPoints(text: string): { point1: string; point2: string; extendedSummary: string } {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (!trimmed) {
        return { point1: '', point2: '', extendedSummary: '' };
    }
    if (trimmed.length <= SUMMARY_POINT_CHARS) {
        return { point1: trimmed, point2: '', extendedSummary: trimmed };
    }
    // Split on sentence boundaries
    const sentences = trimmed.match(/[^.!?]+[.!?]*/g) ?? [trimmed];
    let point1 = '';
    let point2 = '';
    let i = 0;
    for (; i < sentences.length && (point1 + sentences[i]).length <= SUMMARY_POINT_CHARS; i++) {
        point1 += sentences[i];
    }
    point1 = point1.trim();
    for (; i < sentences.length; i++) {
        point2 += sentences[i];
    }
    point2 = point2.trim();
    if (!point2 && trimmed.length > SUMMARY_POINT_CHARS) {
        point1 = trimmed.slice(0, SUMMARY_POINT_CHARS);
        const rest = trimmed.slice(SUMMARY_POINT_CHARS).trim();
        point2 = rest.slice(0, SUMMARY_POINT_CHARS) + (rest.length > SUMMARY_POINT_CHARS ? '...' : '');
    }
    const extendedSummary = point2
        ? `${point1}${SUMMARY_POINTS_DELIMITER}${point2}`
        : point1;
    return { point1, point2, extendedSummary };
}

interface IngestReport {
    source: string;
    newArticles: number;
    skipped: number;
    errors: number;
}

/** Normalize URL for dedupe: strip fragment and trailing slash */
function normalizeUrl(url: string): string {
    try {
        const u = new URL(url);
        u.hash = '';
        let path = u.pathname.replace(/\/+$/, '') || '/';
        u.pathname = path;
        return u.toString();
    } catch {
        return url;
    }
}

/** Fetch with timeout and optional retries */
async function fetchWithTimeout(
    url: string,
    options: { signal?: AbortSignal; retries?: number } = {}
): Promise<string> {
    const { retries = RSS_RETRIES } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), RSS_FETCH_TIMEOUT_MS);
        const signal = controller.signal;

        try {
            const res = await fetch(url, {
                signal,
                headers: {
                    'User-Agent': 'NewsProvider/1.0 (RSS Reader)',
                    Accept: 'application/rss+xml, application/xml, text/xml',
                },
            });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.text();
        } catch (err) {
            clearTimeout(timeoutId);
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < retries) {
                const delay = RSS_RETRY_BASE_MS * Math.pow(2, attempt);
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }

    throw lastError ?? new Error('Fetch failed');
}

/** Parse RSS/Atom XML string */
async function parseFeedXml(xml: string): Promise<Parser.Output<Record<string, unknown>>> {
    return parser.parseString(xml);
}

export async function ingestAllFeeds(): Promise<IngestReport[]> {
    const sourcesResult = await sql`
        SELECT id, name, feed_url
        FROM sources
        WHERE enabled = true
    `;
    const sources = sourcesResult.rows as { id: string; name: string; feed_url: string }[];

    const results = await Promise.allSettled(
        sources.map((s) => ingestFeed(s.id, s.name, s.feed_url))
    );

    return results.map((r) =>
        r.status === 'fulfilled' ? r.value : { source: 'unknown', newArticles: 0, skipped: 0, errors: 1 }
    );
}

async function ingestFeed(sourceId: string, sourceName: string, feedUrl: string): Promise<IngestReport> {
    const report: IngestReport = {
        source: sourceName,
        newArticles: 0,
        skipped: 0,
        errors: 0,
    };

    let feed: Parser.Output<Record<string, unknown>>;
    try {
        const xml = await fetchWithTimeout(feedUrl, { retries: RSS_RETRIES });
        feed = await parseFeedXml(xml);
    } catch (err) {
        console.error(`Error fetching feed for ${sourceName}:`, err);
        report.errors++;
        return report;
    }

    const items = (feed.items ?? []).slice(0, RSS_MAX_ITEMS_PER_FEED);

    // 1. Identify potential URLs to ingest
    const candidates: { item: any, url: string }[] = [];
    for (const item of items) {
        if (!item.link || !item.title) {
            report.skipped++;
            continue;
        }
        candidates.push({ item, url: normalizeUrl(item.link) });
    }

    if (candidates.length === 0) {
        return report;
    }

    // 2. Check DB for duplicates
    const candidateUrls = candidates.map(c => c.url);
    const existingResult = await sql(
        `SELECT url FROM articles WHERE url = ANY($1::text[])`,
        [candidateUrls]
    );
    const existingSet = new Set((existingResult.rows as { url: string }[]).map((r) => r.url));

    const newCandidates = candidates.filter(c => !existingSet.has(c.url));
    report.skipped += (candidates.length - newCandidates.length);

    if (newCandidates.length === 0) {
        console.log(`✓ ${sourceName}: 0 new, ${report.skipped} skipped`);
        return report;
    }

    // 3. Process new unique articles
    const toInsert: {
        title: string;
        summary: string | null;
        shortSummary: string;
        extendedSummary: string;
        url: string;
        image: string | null;
        author: string | null;
        publishedAt: string;
    }[] = [];

    // Process in chunks to avoid overwhelming APIs if needed, but for now sequential is safer for rate limits
    // or small parallel batches.
    for (const { item, url } of newCandidates) {
        const rawContent =
            item.contentSnippet ?? item.content ?? item.description ?? '';
        const fullContent = String(rawContent).replace(/\s+/g, ' ').trim();

        // Try Gemini first
        let shortSummary: string;
        let extendedSummary: string;

        const geminiResult = await generateGeminiSummary(fullContent);
        if (geminiResult) {
            shortSummary = geminiResult.shortSummary;
            extendedSummary = geminiResult.extendedSummary;
        } else {
            // Fallback
            const { point1, extendedSummary: ext } = extractTwoSummaryPoints(fullContent);
            shortSummary = point1
                ? point1.slice(0, 150) + (point1.length > 150 ? '...' : '')
                : fullContent.slice(0, 150) + (fullContent.length > 150 ? '...' : '');
            extendedSummary = ext;
        }

        const publishedAt = item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString();

        const summaryRaw = item.contentSnippet ?? item.description ?? null;
        const htmlContent = item.content ?? item.description ?? '';
        const imageFromRss = item.enclosure?.url ?? null;
        const imageFromHtml = htmlContent
            ? extractFirstImageFromHtml(String(htmlContent), item.link)
            : null;
        const image = imageFromRss ?? imageFromHtml ?? null;

        toInsert.push({
            title: item.title.trim(),
            summary: summaryRaw != null ? String(summaryRaw) : null,
            shortSummary,
            extendedSummary,
            url,
            image,
            author: (item.creator ?? item.author) != null ? String(item.creator ?? item.author) : null,
            publishedAt,
        });
    }

    // 4. Scrape missing OG images
    const SCRAPE_LIMIT = 20;
    const withoutImage = toInsert.filter((r) => !r.image);
    if (withoutImage.length > 0) {
        const toScrape = withoutImage.slice(0, SCRAPE_LIMIT).map((r) => r.url);
        try {
            const scraped = await scrapeOgImagesBatch(toScrape, 5);
            // In-place update
            for (const r of toInsert) {
                if (!r.image) {
                    const img = scraped.get(r.url);
                    if (img) r.image = img;
                }
            }
        } catch (e) {
            console.warn(`OG scrape failed for ${sourceName}:`, e);
        }
    }

    if (toInsert.length === 0) {
        // Should not happen if newCandidates > 0
        return report;
    }

    try {
        const placeholders: string[] = [];
        const values: (string | null)[] = [];
        let idx = 1;
        for (const row of toInsert) {
            placeholders.push(
                `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
            );
            values.push(
                row.title,
                row.summary,
                row.shortSummary,
                row.extendedSummary,
                row.url,
                row.image,
                row.author,
                row.publishedAt,
                sourceId
            );
        }

        const insertText = `
            INSERT INTO articles (
                title, summary, short_summary, extended_summary,
                url, image, author, published_at, source_id
            ) VALUES ${placeholders.join(', ')}
        `;
        await sql(insertText, ...values);
        report.newArticles = toInsert.length;
    } catch (err) {
        console.error(`Error inserting articles for ${sourceName}:`, err);
        report.errors++;
    }

    console.log(
        `✓ ${sourceName}: ${report.newArticles} new, ${report.skipped} skipped, ${report.errors} errors`
    );
    return report;
}
