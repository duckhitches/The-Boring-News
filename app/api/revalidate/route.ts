import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * GET or POST /api/revalidate
 * Invalidates the articles cache so the next page load shows fresh data.
 * Optional: ?secret=YOUR_CRON_SECRET (same as ingest).
 */
export async function GET(request: Request) {
  return revalidateRoute(request);
}

export async function POST(request: Request) {
  return revalidateRoute(request);
}

async function revalidateRoute(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = process.env.CRON_SECRET ?? process.env.INGEST_SECRET;
    if (secret && searchParams.get('secret') !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    revalidateTag('articles', 'max');
    return NextResponse.json({ ok: true, revalidated: true });
  } catch (error) {
    console.error('Revalidate API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Revalidate failed' },
      { status: 500 }
    );
  }
}
