import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const sqlClient = neon(process.env.DATABASE_URL);

// Wrapper to match previous usage: await sql`...` or await sql(text, ...params)
export async function sql(strings: TemplateStringsArray | string, ...values: any[]) {
    // If called as a function sql(string, ...values)
    if (typeof strings === 'string') {
        const result = await (sqlClient as any).query(strings, values);
        return { rows: result, rowCount: result.length };
    }

    // We need to reconstruct the query from template strings and values
    // reduce(callback, initialValue) - if no initial, takes first element.
    // strings has N parts, values has N-1.
    // e.g. sql`select * from t where id=${1}` -> strings=["select * from t where id=", ""], values=[1]

    // We want: "select * from t where id=$1"

    let text = strings[0];
    for (let i = 1; i < strings.length; i++) {
        text += '$' + i + strings[i];
    }

    const result = await (sqlClient as any).query(text, values);
    return { rows: result, rowCount: result.length };
}
