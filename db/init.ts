import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function main() {
    console.log('Creating database tables...');

    // Create sources table
    await sql`
        CREATE TABLE IF NOT EXISTS sources (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            feed_url TEXT UNIQUE NOT NULL,
            website_url TEXT,
            enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    console.log('✓ Created sources table');

    // Create articles table
    await sql`
        CREATE TABLE IF NOT EXISTS articles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            summary TEXT,
            short_summary TEXT,
            extended_summary TEXT,
            url TEXT UNIQUE NOT NULL,
            image TEXT,
            author TEXT,
            published_at TIMESTAMP NOT NULL,
            source_id UUID REFERENCES sources(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    console.log('✓ Created articles table');

    // Create index
    await sql`
        CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)
    `;
    console.log('✓ Created articles index');

    // Create categories table
    await sql`
        CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT UNIQUE NOT NULL
        )
    `;
    console.log('✓ Created categories table');

    // Create article_categories junction table
    await sql`
        CREATE TABLE IF NOT EXISTS article_categories (
            article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
            category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
            PRIMARY KEY (article_id, category_id)
        )
    `;
    console.log('✓ Created article_categories table');

    console.log('\n✅ Database schema created successfully!');
}

main()
    .then(() => {
        console.log('Done');
        process.exit(0);
    })
    .catch((e) => {
        console.error('Error creating schema:', e);
        process.exit(1);
    });
