'use server';

import { xano } from './xano';

export type Article = {
    id: string;
    title: string;
    summary?: string;
    shortSummary?: string;
    extendedSummary?: string;
    url: string;
    image?: string;
    author?: string;
    publishedAt: string;
    sourceId: string;
    source: Source;
    categories: Category[];
    createdAt: string;
};

export type Source = {
    id: string;
    name: string;
    feedUrl: string;
    websiteUrl?: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Category = {
    id: string;
    name: string;
};

export type ArticleWithRelations = Article;

export type GetArticlesResponse = {
    articles: ArticleWithRelations[];
    metadata: {
        total: number;
        page: number;
        totalPages: number;
    };
};

export async function getArticles({
    page = 1,
    limit = 20,
    categoryId,
}: {
    page?: number;
    limit?: number;
    categoryId?: string;
}): Promise<GetArticlesResponse> {
    const offset = (page - 1) * limit;

    try {
        const articles = await xano.getArticles({
            limit,
            offset,
            category: categoryId,
        });

        // Assuming Xano returns the total count in the response or we need to handle it
        // For now, we'll estimate total pages based on the returned data
        const total = articles.length; // This might need adjustment based on Xano's response structure
        const totalPages = Math.ceil(total / limit);

        return {
            articles: articles as ArticleWithRelations[],
            metadata: {
                total,
                page,
                totalPages,
            },
        };
    } catch (error) {
        console.error('Error fetching articles from Xano:', error);
        return {
            articles: [],
            metadata: {
                total: 0,
                page,
                totalPages: 0,
            },
        };
    }
}
