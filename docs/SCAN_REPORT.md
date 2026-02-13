# Project Scan Report — Features & Optimizations

Scan date: February 2026. This document lists suggested new features and optimizations for The Boring News. No code was changed; this is a roadmap only.

---

## 1. New Features

### 1.1 Filter by source
- **Current:** Backend supports `category` in `getArticles()` but there is no category filter in the UI. Categories are not populated in `db/seed.ts` or in the ingestor (`article_categories` is never inserted).
- **Suggestion:** Add a **“Filter by source”** dropdown (e.g. TechCrunch, The Verge) using existing `sources` and a new query param (e.g. `?source=...`). Extend `getArticles()` to filter by `source_id` or source name. Quick win and reuses existing data.

### 1.2 Category filter (if you want categories)
- **Current:** Schema has `categories` and `article_categories`; `lib/actions.ts` supports `category`; seed does not create categories; ingestor does not assign articles to categories.
- **Suggestion:** Either:
  - **Option A:** In ingestor, map articles to categories (e.g. from RSS category/tags, or keyword rules). Seed a small set of categories. Add category chips or dropdown on the home page and pass `?category=...` to `getArticles()`.
  - **Option B:** If you do not need categories, consider removing or hiding category UI and documenting that category support is reserved for future use to avoid “dead” UI.

### 1.3 Sort options
- **Current:** Articles are ordered by `published_at DESC` only.
- **Suggestion:** Add a sort control (e.g. “Newest” / “Oldest”) and a query param (e.g. `?sort=oldest`). In `fetchArticlesFromDb`, order by `published_at ASC` when requested. Keeps the same API shape.

### 1.4 Share article
- **Suggestion:** In the article modal, add “Copy link” and optional “Share” (Web Share API where supported, or Twitter/LinkedIn links). Improves sharing and perceived polish.

### 1.5 Reading time
- **Suggestion:** Estimate reading time from summary length (e.g. ~200 words/min) and show it on the card or in the modal. Optionally store a `reading_time_min` at ingest if you prefer consistency.

### 1.6 Aggregator RSS feed
- **Current:** App consumes RSS; it does not expose its own feed.
- **Suggestion:** Add a route (e.g. `app/feed.xml/route.ts`) that returns RSS/Atom of the latest N articles (e.g. 50). Lets users subscribe to “The Boring News” in a feed reader. Reuses existing article data.

### 1.7 Theme toggle
- **Current:** UI supports dark/light via Tailwind; no explicit toggle (relies on system preference).
- **Suggestion:** Add a theme toggle (e.g. in the header) that sets a class or cookie and overrides system preference. Improves control and demo value.

### 1.8 Keyboard shortcuts
- **Suggestion:** Optional shortcuts: `/` to focus search, `Escape` to close modal (already in place). Could add `j`/`k` for next/previous card in the feed for power users.

### 1.9 Save / bookmark (later)
- **Suggestion:** “Save for later” could use `localStorage` (no backend) or a `user_bookmarks` table if you add auth later. Lower priority for a portfolio demo.

---

## 2. Optimizations

### 2.1 Sitemap
- **Current:** `app/sitemap.ts` returns only `/` and `/about`.
- **Suggestion:** Add dynamic article URLs (e.g. last 100–500 articles, or paginated) so search engines can index individual stories. Use `getArticles()` or direct SQL with a limit; keep `lastModified` and reasonable `priority`/`changeFrequency`.

### 2.2 SEO and metadata
- **Current:** Root layout has good default metadata; article modal is client-rendered so there is no per-article meta.
- **Suggestion:** If you add canonical article pages (e.g. `/article/[id]` or `/a/[slug]`), add `generateMetadata` with title/description from article. Improves SEO and sharing previews.

### 2.3 Error handling
- **Current:** Errors in feed or server actions are logged; no global error boundary for the feed.
- **Suggestion:** Wrap the main feed (or page content) in an React error boundary and show a simple “Something went wrong” message and retry. Prevents one failing component from breaking the whole page.

### 2.4 Ingest API protection
- **Current:** `POST /api/ingest` is protected by optional `?secret=...`; if no secret is set, anyone can trigger ingest.
- **Suggestion:** If `CRON_SECRET`/`INGEST_SECRET` is not set, reject the request (e.g. 401 or 503) instead of allowing unauthenticated ingest. Reduces abuse risk.

### 2.5 Database indexes
- **Current:** `idx_articles_published_at` exists; search uses `ILIKE` on `title` and `summary`.
- **Suggestion:** If search is slow on large datasets, consider PostgreSQL full-text search (`tsvector`/`tsquery`) and an index on the search column. Optional; only if you hit performance issues.

### 2.6 Environment and docs
- **Current:** README mentions `DATABASE_URL` and `PERPLEXITY_API_KEY`; ingestor uses `GEMINI_API_KEY` (and possibly others).
- **Suggestion:** Add a single “Environment variables” section in the README listing all used env vars (`DATABASE_URL`, `PERPLEXITY_API_KEY`, `GEMINI_API_KEY`, `CRON_SECRET`/`INGEST_SECRET`, `NEXT_PUBLIC_BASE_URL`, etc.) and whether each is required or optional. Reduces setup friction.

### 2.7 Dependencies
- **Current:** `package.json` includes both `@perplexity-ai/perplexity_ai` and direct Perplexity REST usage in `lib/perplexity.ts` (or similar).
- **Suggestion:** Confirm whether the SDK is used anywhere; if not, remove it to avoid confusion and keep the bundle smaller.

---

## 3. Summary Table

| Area            | Suggestion                    | Effort  | Impact |
|-----------------|-------------------------------|---------|--------|
| Filter by source| Add dropdown + query param    | Low     | High   |
| Categories      | Populate + filter or hide     | Medium  | Medium |
| Sort (newest/oldest) | Query param + ORDER BY  | Low     | Low    |
| Share article   | Copy link + share buttons     | Low     | Medium |
| Reading time    | Estimate on card/modal        | Low     | Low    |
| Aggregator RSS  | `/feed.xml` route             | Low     | Medium |
| Theme toggle    | Header toggle + persistence   | Low     | Medium |
| Keyboard shortcuts | / and j/k                  | Low     | Low    |
| Sitemap         | Include article URLs          | Low     | SEO    |
| Error boundary  | Wrap feed/content             | Low     | Robustness |
| Ingest API      | Require secret when set       | Low     | Security |
| Env docs        | List all env vars in README   | Low     | DX      |

---

## 4. What’s Already in Good Shape

- RSS ingestion: parallel feeds, timeouts, retries, OG image scraping, Gemini summarization.
- Caching: server-side `unstable_cache` for articles, client-side cache and throttle for infinite scroll.
- UI: Search (debounced), infinite scroll, responsive cards, modal with AI summary, image fallback.
- API: `/api/ingest` and `/api/revalidate` with optional secret; revalidation after ingest.
- Licensing and README: Dual licensing (BSL/MIT) and structure are clearly described.

Use this document as a backlog; implement items in the order that best fits your portfolio and time.
