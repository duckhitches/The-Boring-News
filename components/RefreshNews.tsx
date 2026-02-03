'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function RefreshNews() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? 'Refresh failed');
        return;
      }
      setMessage('Updated. Refreshing…');
      router.refresh();
      setMessage(null);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Refresh failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
        aria-label="Fetch latest news and refresh"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Updating…' : 'Refresh news'}
      </button>
      {message && (
        <span className="text-sm text-amber-500" role="status">
          {message}
        </span>
      )}
    </div>
  );
}
