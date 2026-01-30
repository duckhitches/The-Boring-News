import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    const sources = [
        {
            name: 'TechCrunch',
            feedUrl: 'https://techcrunch.com/feed/',
            websiteUrl: 'https://techcrunch.com',
        },
        {
            name: 'The Verge',
            feedUrl: 'https://www.theverge.com/rss/index.xml',
            websiteUrl: 'https://www.theverge.com',
        },
        {
            name: 'Wired',
            feedUrl: 'https://www.wired.com/feed/rss',
            websiteUrl: 'https://www.wired.com',
        },
        {
            name: 'Ars Technica',
            feedUrl: 'https://arstechnica.com/feed/',
            websiteUrl: 'https://arstechnica.com',
        },
        {
            name: 'VentureBeat',
            feedUrl: 'https://venturebeat.com/feed/',
            websiteUrl: 'https://venturebeat.com',
        },
        {
            name: 'Hacker News (Show HN)',
            feedUrl: 'https://hnrss.org/show',
            websiteUrl: 'https://news.ycombinator.com/show',
        },
        {
            name: 'Smashing Magazine',
            feedUrl: 'https://www.smashingmagazine.com/feed/',
            websiteUrl: 'https://www.smashingmagazine.com',
        },
        {
            name: 'CSS-Tricks',
            feedUrl: 'https://css-tricks.com/feed/',
            websiteUrl: 'https://css-tricks.com',
        },
        {
            name: 'OpenAI Blog',
            feedUrl: 'https://openai.com/blog/rss.xml',
            websiteUrl: 'https://openai.com/blog',
        },
        {
            name: 'AWS News',
            feedUrl: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
            websiteUrl: 'https://aws.amazon.com/new',
        }
    ];

    for (const s of sources) {
        const exists = await prisma.source.findUnique({
            where: { feedUrl: s.feedUrl }
        });
        if (!exists) {
            await prisma.source.create({ data: s });
            console.log(`Created source: ${s.name}`);
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
