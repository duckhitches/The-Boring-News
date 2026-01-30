'use server';

import { prisma } from './prisma';

import { Prisma } from '@prisma/client';

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
    include: {
        source: true;
        categories: true;
    };
}>;

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
    const skip = (page - 1) * limit;

    const where = categoryId
        ? {
            categories: {
                some: {
                    id: categoryId,
                },
            },
        }
        : {};

    const [articles, total] = await Promise.all([
        prisma.article.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                publishedAt: 'desc',
            },
            include: {
                source: true,
                categories: true,
            },
        }),
        prisma.article.count({ where }),
    ]);

    return {
        articles,
        metadata: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getCategories() {
    return await prisma.category.findMany({
        orderBy: {
            name: 'asc',
        },
    });
}
