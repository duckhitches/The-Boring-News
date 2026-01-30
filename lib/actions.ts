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

    // Build query parts manually since we can't use composable sql`` with basic neon driver easily
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Helper to add param
    const addParam = (val: string | number | boolean | null) => {
        values.push(val);
        return `$${paramIndex++}`;
    };

    if (category) {
        conditions.push(`a.id IN (
            SELECT a2.id 
            FROM articles a2
            JOIN article_categories ac2 ON a2.id = ac2.article_id
            JOIN categories c2 ON ac2.category_id = c2.id
            WHERE c2.name = ${addParam(category)}
        )`);
    }

    if (search) {
        const searchPattern = `%${search}%`;
        const idx = paramIndex++; // use current index
        values.push(searchPattern);
        conditions.push(`(a.title ILIKE $${idx} OR a.summary ILIKE $${idx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const queryText = `
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
        ${whereClause}
        GROUP BY a.id, s.id
        ORDER BY a.published_at DESC
        LIMIT ${addParam(limit + 1)}
        OFFSET ${addParam(offset)}
    `;

    try {
        const result = await sql(queryText, ...values);

        // Map over rows to ensure raw query result shapes match our interface
        const articles = result.rows.map((row: any) => ({
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
