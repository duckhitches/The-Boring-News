import { NextResponse } from 'next/server';
import { ingestAllFeeds } from '@/lib/ingestor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds for execution (Vercel hobby limit is 10s usually, but function config can extend)

export async function GET(request: Request) {
    try {
        // Optional: Secure this endpoint with a secret
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting ingestion via API...');
        const report = await ingestAllFeeds();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            report
        });
    } catch (error) {
        console.error('Ingestion API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Ingestion failed' },
            { status: 500 }
        );
    }
}
