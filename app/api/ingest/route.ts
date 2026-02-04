/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ingestAllFeeds } from '@/lib/ingestor';

/**
 * POST /api/ingest
 * Fetches all RSS feeds, inserts new articles, then invalidates the articles cache
 * so the home page shows updated news. Optional: ?secret=YOUR_CRON_SECRET
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = process.env.CRON_SECRET ?? process.env.INGEST_SECRET;
    if (secret && searchParams.get('secret') !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await ingestAllFeeds();
    revalidateTag('articles', 'max');

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error('Ingest API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingest failed' },
      { status: 500 }
    );
  }
}
