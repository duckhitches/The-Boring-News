'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { getArticles, type ArticleWithRelations } from '@/lib/actions';
import { NewsCard } from './NewsCard';

const PAGE_SIZE = 30;
const LAZY_LOAD_THROTTLE_MS = 300;

type CacheEntry = { articles: ArticleWithRelations[]; hasMore: boolean };

function cacheKey(offset: number, search: string | undefined) {
    return `${search ?? ''}:${offset}`;
}

type ArticleFeedProps = {
    initialArticles: ArticleWithRelations[];
    search?: string;
};

export function ArticleFeed({ initialArticles, search }: ArticleFeedProps) {
    const [articles, setArticles] = useState<ArticleWithRelations[]>(initialArticles);
    const [offset, setOffset] = useState(initialArticles.length);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [ref, inView] = useInView({ rootMargin: '200px', threshold: 0 });
    const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
    const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Seed cache with initial page so we don't re-fetch it
    useEffect(() => {
        const key = cacheKey(0, search);
        if (!cacheRef.current.has(key) && initialArticles.length > 0) {
            cacheRef.current.set(key, {
                articles: initialArticles,
                hasMore: initialArticles.length >= PAGE_SIZE,
            });
        }
    }, [search, initialArticles]);

    // Reset state when search changes
    useEffect(() => {
        setArticles(initialArticles);
        setOffset(initialArticles.length);
        setHasMore(true);
    }, [initialArticles, search]);

    const loadMoreArticles = useCallback(async () => {
        if (!hasMore || isLoading) return;

        const key = cacheKey(offset, search);
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
    }, [offset, search, hasMore, isLoading]);

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
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                ))}
            </div>
            
            {hasMore && (
                <div ref={ref} className="flex justify-center p-8 mt-4">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                </div>
            )}
            
            {!hasMore && articles.length > 0 && (
                <div className="text-center py-8 text-zinc-500">
                    You've reached the end of the news feed.
                </div>
            )}
             
            {articles.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                    No articles found matching your search.
                </div>
            )}
        </>
    );
}
