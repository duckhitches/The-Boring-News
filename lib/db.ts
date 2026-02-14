/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is not defined. Set it in .env (e.g. from Neon dashboard).');
}

function isConnectionError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return (
        msg.includes('fetch failed') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('connect') ||
        msg.includes('Connection') ||
        (err as { code?: string })?.code === 'NEON_CONNECTION_ERROR'
    );
}

const sqlClient = neon(DATABASE_URL);

async function runQuery(text: string, values: any[]) {
    try {
        return await (sqlClient as any).query(text, values);
    } catch (err) {
        if (isConnectionError(err)) {
            const hint =
                'Check: (1) DATABASE_URL in .env is correct and starts with postgres:// or postgresql://, ' +
                '(2) network access to Neon, (3) Neon project is not paused (unpause in Neon dashboard).';
            throw new Error(
                `Database connection failed: ${err instanceof Error ? err.message : String(err)}. ${hint}`,
                { cause: err }
            );
        }
        throw err;
    }
}

// Wrapper to match previous usage: await sql`...` or await sql(text, ...params)
export async function sql(strings: TemplateStringsArray | string, ...values: any[]) {
    if (typeof strings === 'string') {
        const result = await runQuery(strings, values);
        return { rows: result, rowCount: result.length };
    }

    let text = strings[0];
    for (let i = 1; i < strings.length; i++) {
        text += '$' + i + strings[i];
    }

    const result = await runQuery(text, values);
    return { rows: result, rowCount: result.length };
}
