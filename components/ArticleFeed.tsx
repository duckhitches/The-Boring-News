/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, Terminal } from 'lucide-react';
import { getArticles, type ArticleWithRelations } from '@/lib/actions';
import { NewsCard } from './NewsCard';

const PAGE_SIZE = 30;
const LAZY_LOAD_THROTTLE_MS = 300;

type CacheEntry = { articles: ArticleWithRelations[]; hasMore: boolean };

function cacheKey(offset: number, search: string | undefined, source: string | undefined) {
    return `${search ?? ''}:${source ?? ''}:${offset}`;
}

type ArticleFeedProps = {
    initialArticles: ArticleWithRelations[];
    search?: string;
    source?: string;
};

export function ArticleFeed({ initialArticles, search, source }: ArticleFeedProps) {
    const [articles, setArticles] = useState<ArticleWithRelations[]>(initialArticles);
    const [offset, setOffset] = useState(initialArticles.length);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [ref, inView] = useInView({ rootMargin: '200px', threshold: 0 });
    const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
    const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Seed cache with initial page so we don't re-fetch it
    useEffect(() => {
        const key = cacheKey(0, search, source);
        if (!cacheRef.current.has(key) && initialArticles.length > 0) {
            cacheRef.current.set(key, {
                articles: initialArticles,
                hasMore: initialArticles.length >= PAGE_SIZE,
            });
        }
    }, [search, source, initialArticles]);

    // Reset state when search or source changes
    useEffect(() => {
        setArticles(initialArticles);
        setOffset(initialArticles.length);
        setHasMore(true);
    }, [initialArticles, search, source]);

    const loadMoreArticles = useCallback(async () => {
        if (!hasMore || isLoading) return;

        const key = cacheKey(offset, search, source);
        const cached = cacheRef.current.get(key);
        if (cached) {
            if (cached.articles.length === 0) {
                setHasMore(false);
            } else {
                setArticles((prev) => {
                    const existingIds = new Set(prev.map((a) => a.id));
                    const unique = cached.articles.filter((a) => !existingIds.has(a.id));
                    return unique.length ? [...prev, ...unique] : prev;
                });
                setOffset((prev) => prev + cached.articles.length);
                setHasMore(cached.hasMore);
            }
            return;
        }

        setIsLoading(true);
        try {
            const { articles: newArticles, hasMore: moreAvailable } = await getArticles({
                offset,
                limit: PAGE_SIZE,
                search,
                source,
            });

            cacheRef.current.set(key, { articles: newArticles, hasMore: moreAvailable });

            if (newArticles.length === 0) {
                setHasMore(false);
            } else {
                setArticles((prev) => {
                    const existingIds = new Set(prev.map((a) => a.id));
                    const uniqueNewArticles = newArticles.filter((a) => !existingIds.has(a.id));
                    return [...prev, ...uniqueNewArticles];
                });
                setOffset((prev) => prev + newArticles.length);
                setHasMore(moreAvailable);
            }
        } catch (error) {
            console.error('Failed to load more articles:', error);
        } finally {
            setIsLoading(false);
        }
    }, [offset, search, source, hasMore, isLoading]);

    useEffect(() => {
        if (!inView || !hasMore || isLoading) return;

        if (throttleRef.current) clearTimeout(throttleRef.current);
        throttleRef.current = setTimeout(() => {
            throttleRef.current = null;
            loadMoreArticles();
        }, LAZY_LOAD_THROTTLE_MS);

        return () => {
            if (throttleRef.current) clearTimeout(throttleRef.current);
        };
    }, [inView, hasMore, isLoading, loadMoreArticles]);

    return (
        <div className="font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                ))}
            </div>
            
            {hasMore && (
                <div ref={ref} className="flex justify-center p-12 mt-4">
                    <div className="flex items-center gap-2 text-black dark:text-white uppercase font-bold tracking-widest animate-pulse">
                        <div className="w-3 h-3 bg-pink-500" />
                        LOADING_MORE_DATA...
                    </div>
                </div>
            )}
            
            {!hasMore && articles.length > 0 && (
                <div className="text-center py-12 text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 mt-12">
                    [END_OF_STREAM]
                </div>
            )}
             
            {articles.length === 0 && (
                <div className="text-center py-32 flex flex-col items-center gap-4 text-zinc-500">
                    <Terminal className="w-12 h-12 opacity-50" />
                    <div className="font-bold uppercase tracking-widest text-lg">
                        NO_DATA_MATCHING_QUERY
                    </div>
                    <div className="text-xs max-w-sm mx-auto opacity-70">
                        Try adjusting your search filters or check back later for new ingestion cycles.
                    </div>
                </div>
            )}
        </div>
    );
}
