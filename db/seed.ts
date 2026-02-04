/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function main() {
    const sources = [
        {
            name: 'TechCrunch',
            feedUrl: 'https://techcrunch.com/feed/',
            websiteUrl: 'https://techcrunch.com',
        },
        {
            name: 'The Verge',
            feedUrl: 'https://www.theverge.com/rss/index.xml',
            websiteUrl: 'https://www.theverge.com',
        },
        {
            name: 'Wired',
            feedUrl: 'https://www.wired.com/feed/rss',
            websiteUrl: 'https://www.wired.com',
        },
        {
            name: 'Ars Technica',
            feedUrl: 'https://arstechnica.com/feed/',
            websiteUrl: 'https://arstechnica.com',
        },
        {
            name: 'VentureBeat',
            feedUrl: 'https://venturebeat.com/feed/',
            websiteUrl: 'https://venturebeat.com',
        },
        {
            name: 'Hacker News (Show HN)',
            feedUrl: 'https://hnrss.org/show',
            websiteUrl: 'https://news.ycombinator.com/show',
        },
        {
            name: 'Smashing Magazine',
            feedUrl: 'https://www.smashingmagazine.com/feed/',
            websiteUrl: 'https://www.smashingmagazine.com',
        },
        {
            name: 'CSS-Tricks',
            feedUrl: 'https://css-tricks.com/feed/',
            websiteUrl: 'https://css-tricks.com',
        },
        {
            name: 'OpenAI Blog',
            feedUrl: 'https://openai.com/blog/rss.xml',
            websiteUrl: 'https://openai.com/blog',
        },
        {
            name: 'AWS News',
            feedUrl: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
            websiteUrl: 'https://aws.amazon.com/new',
        }
    ];

    for (const s of sources) {
        await sql`
            INSERT INTO sources (name, feed_url, website_url)
            VALUES (${s.name}, ${s.feedUrl}, ${s.websiteUrl})
            ON CONFLICT (feed_url) DO NOTHING
        `;
        console.log(`Processed source: ${s.name}`);
    }
}

main()
    .then(() => {
        console.log('Seeding complete');
        process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
