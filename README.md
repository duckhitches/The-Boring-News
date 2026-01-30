# The Boring News

> "Boring software is software that works."

**The Boring News** is a minimalist, developer-focused tech news aggregator designed to cut through the noise. It automatically curates, summarizes, and categorizes technology updates from trusted engineering sources, presenting them in a clean, distraction-free interface.

## 🏗 System Design & Architecture

The system follows a modern, server-centric architecture optimized for performance and maintainability.

### Core Architecture
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [SQLite](https://sqlite.org/) via [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: TypeScript

### Key Components

1.  **Ingestion Engine**
    - Runs as a background process (`scripts/test-ingest.ts`).
    - Fetches RSS feeds from configured sources (e.g., engineering blogs, news outlets).
    - Parses content, deduplicates articles based on URL, and strictly links back to the original source.
    - Stores structured metadata (Title, Summary, Source, Category) in the SQLite database.

2.  **Frontend Interface**
    - **Server Components**: The main feed uses React Server Components for efficient data fetching.
    - **Client Interactivity**:
        - `StaggeredMenu`: A GSAP/Framer powered navigation menu.
        - `Balatro`: An interactive WebGL background shader (OGL) for visual depth.
        - `NewsCard`: Optimized masonry-style cards with `next/image` for performance.
    - **SEO & Metadata**: Automatic sitemap generation, `robots.txt`, and rich Open Graph/Twitter Card metadata for social sharing.

3.  **Caching Strategy (ISR)**
    - The application uses **Incremental Static Regeneration**.
    - The home page revalidates every **60 seconds**. This ensures the database is not hammered on every request while keeping news reasonably fresh.

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Lucide React
- **Animation/WebGL**: GSAP, OGL (for the `Balatro` background)
- **Backend/Data**: Server Actions, Prisma, SQLite, RSS Parser
- **Utilities**: `date-fns` (time formatting), `clsx`/`tailwind-merge` (class handling)

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js 18+ installed.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/boring-news.git
cd boring-news
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup the Database
Initialize the SQLite database and generate the Prisma client.
```bash
npx prisma db push
```

*(Optional) Seed the database if a seed script exists:*
```bash
npx prisma db seed
```

### 4. Run the Development Server
Start the Next.js app.
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

### 5. Ingest News
To populate the database with real news, run the ingestion script in a separate terminal window:
```bash
npx tsx scripts/test-ingest.ts
```
*Note: In a production environment, this would be a scheduled Cron job.*

## 🔒 Security & Performance

- **Headers**: Strict security headers (HSTS, Anti-clickjacking) are enforced via `next.config.ts`.
- **Images**: Remote images are optimized and lazy-loaded via `next/image`.
- **Type Safety**: Full end-to-end type safety with Prisma generated types.

---

© The Boring Project. Engineered to be dull.
# The-Boring-News
