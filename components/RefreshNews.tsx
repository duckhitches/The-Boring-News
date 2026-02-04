/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Terminal } from 'lucide-react';

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
        setMessage(data.error ?? 'FAILED');
        return;
      }
      setMessage('SYNC_COMPLETE');
      router.refresh();
      // Clear success message after delay
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'ERROR');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4 font-mono">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider bg-pink-500 text-black dark:text-white border-2 border-black dark:border-white bg-background hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-[2px] active:translate-y-[2px]"
        aria-label="Fetch latest news and refresh"
      >
        <div className="absolute inset-0 group-hover:opacity-10 transition-opacity" />
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'SYNCING...' : 'REFRESH_FEED'}</span>
      </button>
      {message && ( 
        <span className="text-xs font-bold uppercase text-pink-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
          <Terminal className="w-3 h-3" />
          [{message}]
        </span>
      )}  
    </div>
  );
}
