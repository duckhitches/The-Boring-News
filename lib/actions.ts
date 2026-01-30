'use server';

import { sql } from '@/lib/db';

export interface ArticleWithSource {
    id: string;
    title: string;
    summary: string | null;
    shortSummary: string | null;
    extendedSummary: string | null;
    url: string;
    image: string | null;
    author: string | null;
    publishedAt: Date;
    source: {
        id: string;
        name: string;
        websiteUrl: string | null;
    };
    categories: {
        id: string;
        name: string;
    }[];
}

export type ArticleWithRelations = ArticleWithSource;

export interface GetArticlesParams {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
}

export interface GetArticlesResult {
    articles: ArticleWithSource[];
    hasMore: boolean;
}

export async function getArticles(
    params: GetArticlesParams = {}
): Promise<GetArticlesResult> {
    const { limit = 30, offset = 0, category, search } = params;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let query;
        if (category) {
            // optimized query for category filtering
            query = await sql`
                SELECT 
                    a.id,
                    a.title,
                    a.summary,
                    a.short_summary as "shortSummary",
                    a.extended_summary as "extendedSummary",
                    a.url,
                    a.image,
                    a.author,
                    a.published_at as "publishedAt",
                    json_build_object(
                        'id', s.id,
                        'name', s.name,
                        'websiteUrl', s.website_url
                    ) as source,
                    COALESCE(
                        json_agg(
                            json_build_object('id', c.id, 'name', c.name)
                        ) FILTER (WHERE c.id IS NOT NULL),
                        '[]'
                    ) as categories
                FROM articles a
                JOIN sources s ON a.source_id = s.id
                LEFT JOIN article_categories ac ON a.id = ac.article_id
                LEFT JOIN categories c ON ac.category_id = c.id
                WHERE a.id IN (
                    SELECT a2.id 
                    FROM articles a2
                    JOIN article_categories ac2 ON a2.id = ac2.article_id
                    JOIN categories c2 ON ac2.category_id = c2.id
                    WHERE c2.name = ${category}
                )
                AND (${searchPattern}::text IS NULL OR (a.title ILIKE ${searchPattern} OR a.summary ILIKE ${searchPattern}))
                GROUP BY a.id, s.id
                ORDER BY a.published_at DESC
                LIMIT ${limit + 1}
                OFFSET ${offset}
            `;
        } else {
            // standard query
            query = await sql`
                SELECT 
                    a.id,
                    a.title,
                    a.summary,
                    a.short_summary as "shortSummary",
                    a.extended_summary as "extendedSummary",
                    a.url,
                    a.image,
                    a.author,
                    a.published_at as "publishedAt",
                    json_build_object(
                        'id', s.id,
                        'name', s.name,
                        'websiteUrl', s.website_url
                    ) as source,
                    COALESCE(
                        json_agg(
                            json_build_object('id', c.id, 'name', c.name)
                        ) FILTER (WHERE c.id IS NOT NULL),
                        '[]'
                    ) as categories
                FROM articles a
                JOIN sources s ON a.source_id = s.id
                LEFT JOIN article_categories ac ON a.id = ac.article_id
                LEFT JOIN categories c ON ac.category_id = c.id
                WHERE (${searchPattern}::text IS NULL OR (a.title ILIKE ${searchPattern} OR a.summary ILIKE ${searchPattern}))
                GROUP BY a.id, s.id
                ORDER BY a.published_at DESC
                LIMIT ${limit + 1}
                OFFSET ${offset}
            `;
        }

        // Map over rows to ensure raw query result shapes match our interface
        const articles = query.rows.map(row => ({
            ...row,
            categories: row.categories || []
        })) as ArticleWithSource[];

        const hasMore = articles.length > limit;
        const articlesToReturn = hasMore ? articles.slice(0, limit) : articles;

        return {
            articles: articlesToReturn,
            hasMore,
        };
    } catch (error) {
        console.error('Error fetching articles:', error);
        return {
            articles: [],
            hasMore: false,
        };
    }
}
