/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Terminal } from 'lucide-react';

export const TRIGGER_REFRESH_NEWS_EVENT = 'trigger-refresh-news';

export function RefreshNews() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    const onTrigger = () => handleRefresh();
    window.addEventListener(TRIGGER_REFRESH_NEWS_EVENT, onTrigger);
    return () => window.removeEventListener(TRIGGER_REFRESH_NEWS_EVENT, onTrigger);
  }, [handleRefresh]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 font-mono w-full sm:w-auto">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs sm:text-sm font-bold uppercase tracking-wider bg-pink-500 text-black dark:text-white border-2 border-black dark:border-white bg-background hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-[2px] active:translate-y-[2px] touch-manipulation"
        aria-label="Fetch latest news and refresh"
      >
        <div className="absolute inset-0 group-hover:opacity-10 transition-opacity" />
        <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />
        <span className="truncate">{loading ? 'SYNCING...' : 'REFRESH_FEED'}</span>
      </button>
      {message && ( 
        <span className="text-[10px] sm:text-xs font-bold uppercase text-pink-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2 truncate">
          <Terminal className="w-3 h-3 shrink-0" />
          <span className="truncate">[{message}]</span>
        </span>
      )}  
    </div>
  );
}
