import { sql } from './db';
import Parser from 'rss-parser';

const parser = new Parser();

interface IngestReport {
    source: string;
    newArticles: number;
    skipped: number;
    errors: number;
}

export async function ingestAllFeeds(): Promise<IngestReport[]> {
    // Get all enabled sources
    const sources = await sql`
        SELECT id, name, feed_url
        FROM sources
        WHERE enabled = true
    `;

    const reports: IngestReport[] = [];

    for (const source of (sources.rows as any[])) {
        const report = await ingestFeed(source.id, source.name, source.feed_url);
        reports.push(report);
    }

    return reports;
}

async function ingestFeed(sourceId: string, sourceName: string, feedUrl: string): Promise<IngestReport> {
    const report: IngestReport = {
        source: sourceName,
        newArticles: 0,
        skipped: 0,
        errors: 0,
    };

    try {
        console.log(`Fetching feed for ${sourceName}...`);
        const feed = await parser.parseURL(feedUrl);

        for (const item of feed.items) {
            if (!item.link || !item.title) {
                report.skipped++;
                continue;
            }

            try {
                // Check if article already exists
                const existing = await sql`
                    SELECT id FROM articles WHERE url = ${item.link}
                `;

                if (existing.rows.length > 0) {
                    report.skipped++;
                    continue;
                }

                // Create short summary (first 150 chars of content/description)
                const fullContent = item.contentSnippet || item.content || item.description || '';
                const shortSummary = fullContent.slice(0, 150) + (fullContent.length > 150 ? '...' : '');
                const extendedSummary = fullContent.slice(0, 400) + (fullContent.length > 400 ? '...' : '');

                // Insert new article
                await sql`
                    INSERT INTO articles (
                        title,
                        summary,
                        short_summary,
                        extended_summary,
                        url,
                        image,
                        author,
                        published_at,
                        source_id
                    ) VALUES (
                        ${item.title},
                        ${item.contentSnippet || item.description || null},
                        ${shortSummary},
                        ${extendedSummary},
                        ${item.link},
                        ${item.enclosure?.url || null},
                        ${item.creator || item.author || null},
                        ${item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()},
                        ${sourceId}
                    )
                `;

                report.newArticles++;
            } catch (err) {
                console.error(`Error inserting article: ${item.title}`, err);
                report.errors++;
            }
        }

        console.log(`✓ ${sourceName}: ${report.newArticles} new, ${report.skipped} skipped, ${report.errors} errors`);
    } catch (err) {
        console.error(`Error fetching feed for ${sourceName}:`, err);
        report.errors++;
    }

    return report;
}
