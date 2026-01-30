const XANO_BASE_URL = process.env.NEXT_PUBLIC_XANO_BASE_URL!;

interface XanoResponse<T> {
    data?: T;
    error?: string;
}

async function xanoFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${XANO_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Xano API error: ${response.statusText}`);
    }

    return response.json();
}

export const xano = {
    async getArticles(params: { limit?: number; offset?: number; category?: string } = {}) {
        const { limit = 30, offset = 0, category } = params;
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            ...(category && { category }),
        });

        return xanoFetch<any[]>(`/articles?${queryParams}`);
    },

    async createArticle(data: any) {
        return xanoFetch<any>('/articles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async getSources() {
        return xanoFetch<any[]>('/sources');
    },

    async triggerIngest() {
        return xanoFetch<any>('/ingest', {
            method: 'POST',
        });
    },
};
