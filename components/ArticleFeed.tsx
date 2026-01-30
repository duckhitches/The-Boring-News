'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { getArticles, type ArticleWithRelations } from '@/lib/actions';
import { NewsCard } from './NewsCard';

type ArticleFeedProps = {
    initialArticles: ArticleWithRelations[];
};

export function ArticleFeed({ initialArticles }: ArticleFeedProps) {
    const [articles, setArticles] = useState<ArticleWithRelations[]>(initialArticles);
    const [page, setPage] = useState(2);
    const [hasMore, setHasMore] = useState(true);
    const [ref, inView] = useInView();

    async function loadMoreArticles() {
        if (!hasMore) return;
        
        const { articles: newArticles, metadata } = await getArticles({ page, limit: 30 });
        
        if (newArticles.length === 0) {
            setHasMore(false);
        } else {
            setArticles((prev) => [...prev, ...newArticles]);
            setPage((prev) => prev + 1);
            if (page >= metadata.totalPages) {
                setHasMore(false);
            }
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
        </>
    );
}
