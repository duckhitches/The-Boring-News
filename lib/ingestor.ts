import Parser from 'rss-parser';
import { xano } from './xano';

const parser = new Parser();

// Helper to enforce timeouts
function parseWithTimeout(url: string, timeoutMs: number = 10000): Promise<Parser.Output<any>> {
    return Promise.race([
        parser.parseURL(url),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

function cleanItem(item: any) {
    // Basic cleanup
    let summaryText = item.contentSnippet || item.content || item.summary || '';

    // Remove HTML tags and extra whitespace
    summaryText = summaryText.replace(/<[^>]*>?/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Helper to cut text by words
    const truncateWords = (text: string, maxWords: number) => {
        const words = text.split(' ');
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(' ') + '...';
    };

    const shortSummary = truncateWords(summaryText, 25);
    const extendedSummary = truncateWords(summaryText, 80);

    // Normalize Date
    const publishedAt = item.isoDate ? new Date(item.isoDate).toISOString() : new Date().toISOString();

    return {
        title: item.title,
        url: item.link,
        summary: shortSummary, // Map to legacy summary as well
        shortSummary: shortSummary,
        extendedSummary: extendedSummary,
        publishedAt: publishedAt,
        author: item.creator || item.author || null,
        image: item.enclosure?.url || item.image?.url || null,
    };
}

export async function ingestAllFeeds() {
    console.log("Starting ingestion...");

    // Get sources from Xano
    const sources = await xano.getSources();
    const enabledSources = sources.filter((s: any) => s.enabled);

    const report = [];
    const CONCURRENCY_LIMIT = 5;

    // Process sources in chunks to limit concurrency
    for (let i = 0; i < enabledSources.length; i += CONCURRENCY_LIMIT) {
        const chunk = enabledSources.slice(i, i + CONCURRENCY_LIMIT);

        const chunkResults = await Promise.all(chunk.map(async (source: any) => {
            try {
                console.log(`Fetching feed: ${source.name}`);
                const feed = await parseWithTimeout(source.feedUrl);
                let added = 0;

                for (const item of feed.items) {
                    if (!item.link || !item.title) continue;

                    // Clean and prepare data
                    const validItem = cleanItem(item);

                    try {
                        // Xano will handle duplicate checking (unique constraint on URL)
                        await xano.createArticle({
                            ...validItem,
                            sourceId: source.id,
                        });
                        added++;
                    } catch (e: any) {
                        // Ignore duplicate errors from Xano
                        if (!e.message?.includes('duplicate') && !e.message?.includes('unique')) {
                            console.warn(`Error creating article ${validItem.url}:`, e.message);
                        }
                    }
                }
                return { source: source.name, added, status: 'OK' };
            } catch (error: any) {
                console.error(`Failed to ingest ${source.name}: ${error.message}`);
                return { source: source.name, error: error.message, status: 'ERROR' };
            }
        }));

        report.push(...chunkResults);
    }

    console.log("Ingestion complete.");
    return report;
}
