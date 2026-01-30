'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { getArticles, type ArticleWithRelations } from '@/lib/actions';
import { NewsCard } from './NewsCard';

type ArticleFeedProps = {
    initialArticles: ArticleWithRelations[];
    search?: string;
};

export function ArticleFeed({ initialArticles, search }: ArticleFeedProps) {
    const [articles, setArticles] = useState<ArticleWithRelations[]>(initialArticles);
    const [offset, setOffset] = useState(initialArticles.length);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [ref, inView] = useInView();

    // Reset state when search changes
    useEffect(() => {
        setArticles(initialArticles);
        setOffset(initialArticles.length);
        setHasMore(true);
    }, [initialArticles, search]);

    async function loadMoreArticles() {
        if (!hasMore || isLoading) return;
        
        setIsLoading(true);
        try {
            const { articles: newArticles, hasMore: moreAvailable } = await getArticles({ 
                offset, 
                limit: 30,
                search
            });
            
            if (newArticles.length === 0) {
                setHasMore(false);
            } else {
                setArticles((prev) => {
                    // Filter out any duplicates based on ID
                    const existingIds = new Set(prev.map(a => a.id));
                    const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a.id));
                    return [...prev, ...uniqueNewArticles];
                });
                setOffset((prev) => prev + newArticles.length);
                setHasMore(moreAvailable);
            }
        } catch (error) {
            console.error("Failed to load more articles:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (inView) {
            loadMoreArticles();
        }
    }, [inView]);

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
