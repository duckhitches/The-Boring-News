/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

import 'dotenv/config';
import { sql } from '../lib/db';
import { ingestAllFeeds } from '../lib/ingestor';

const APP_URL = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET ?? process.env.INGEST_SECRET;

async function reingestAll() {
    console.log("⚠️  Clearing all articles from database...");
    try {
        await sql`DELETE FROM articles`;
        console.log("✓ All articles deleted.");
    } catch (e) {
        console.error("Failed to delete articles:", e);
        return;
    }

    console.log("\n🚀 Starting full ingestion...");
    try {
        const report = await ingestAllFeeds();
        console.log("Ingestion Report:", JSON.stringify(report, null, 2));

        // Invalidate Next.js cache
        try {
            const revalidateUrl = new URL('/api/revalidate', APP_URL);
            if (CRON_SECRET) revalidateUrl.searchParams.set('secret', CRON_SECRET);
            const res = await fetch(revalidateUrl.toString(), { method: 'POST' });
            if (res.ok) {
                console.log("\n✓ Cache revalidated.");
            } else {
                console.warn("\n! Revalidate failed (is the app running?):", res.status);
            }
        } catch (e) {
            console.warn("\n! Could not revalidate cache:", e);
        }
    } catch (e) {
        console.error("Ingestion failed:", e);
    }

    process.exit(0);
}

reingestAll();
