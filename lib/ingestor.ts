import Parser from 'rss-parser';
import { prisma } from './prisma';

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
    const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();

    return {
        title: item.title,
        url: item.link,
        summary: shortSummary, // Map to legacy summary as well
        shortSummary: shortSummary,
        extendedSummary: extendedSummary,
        publishedAt: publishedAt,
        author: item.creator || item.author || null,
    };
}

export async function ingestAllFeeds() {
    console.log("Starting ingestion...");
    const sources = await prisma.source.findMany({
        where: { enabled: true },
    });

    const report = [];
    const CONCURRENCY_LIMIT = 5;

    // Process sources in chunks to limit concurrency
    for (let i = 0; i < sources.length; i += CONCURRENCY_LIMIT) {
        const chunk = sources.slice(i, i + CONCURRENCY_LIMIT);

        const chunkResults = await Promise.all(chunk.map(async (source) => {
            try {
                console.log(`Fetching feed: ${source.name}`);
                const feed = await parseWithTimeout(source.feedUrl);
                let added = 0;

                for (const item of feed.items) {
                    if (!item.link || !item.title) continue;

                    // Clean and prepare data
                    const validItem = cleanItem(item);

                    // Check for duplicates
                    const existing = await prisma.article.findUnique({
                        where: { url: validItem.url },
                    });

                    if (!existing) {
                        try {
                            await prisma.article.create({
                                data: {
                                    ...validItem,
                                    sourceId: source.id,
                                },
                            });
                            added++;
                        } catch (e) {
                            // Ignore unique constraint violations if they happen in race conditions
                            console.warn(`Skipping duplicate or error for ${validItem.url}`);
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
