import { getArticles, getSources } from '@/lib/actions';
import { Header } from '@/components/Header';
import { ArticleFeed } from '@/components/ArticleFeed';
import { Search } from '@/components/Search';
import { RefreshNews } from '@/components/RefreshNews';
import { SourceFilter } from '@/components/SourceFilter';
import Balatro from '@/components/Balatro';

export const revalidate = 0; // Disable ISR to refresh on every request

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const source = typeof searchParams.source === 'string' ? searchParams.source : undefined;

  let articles: Awaited<ReturnType<typeof getArticles>>['articles'] = [];
  let sources: Awaited<ReturnType<typeof getSources>> = [];
  let dbError: string | null = null;

  try {
    const [articlesResult, sourcesResult] = await Promise.all([
      getArticles({ limit: 30, search, source }),
      getSources(),
    ]);
    articles = articlesResult.articles;
    sources = sourcesResult;
  } catch (err) {
    console.error('Home data fetch failed:', err);
    dbError = err instanceof Error ? err.message : 'Database unavailable';
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black font-mono text-black dark:text-white relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Layer - Raw, no blur */}
      <div className="fixed inset-0 z-0 pointer-events-auto opacity-30 dark:opacity-50 mix-blend-overlay">
        <Balatro 
          isRotate={true} 
          mouseInteraction={true}
          pixelFilter={700}
        />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main id='hero' className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex-1 flex flex-col gap-8 sm:gap-12 max-w-7xl">
          
          {/* Header Section */}
          <section className="flex flex-col gap-4 sm:gap-6 border-b-2 border-black dark:border-white pb-8 sm:pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 sm:gap-8">
              <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-boldonse uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-500 dark:from-white dark:to-zinc-500 [-webkit-text-stroke:1px_rgba(0,0,0,0.2)] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.2)] break-words">
                  The_<br/><span className="text-pink-500">Boring</span>_News
                </h1>
                <p className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest text-zinc-500">
                  // CURATED_TECH_UPDATES__V2.0
                </p>
              </div>
              
              <div className="flex flex-col items-stretch sm:items-end gap-3 sm:gap-4 w-full md:w-auto min-w-0">
                <RefreshNews />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full min-w-0">
                    <SourceFilter sources={sources} />
                    <Search />
                </div>
              </div>
            </div>
          </section>

          {/* Feed Section */}
          <section className="min-w-0">
             {dbError && (
               <div className="border-2 border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/5 p-4 mb-6 rounded-none">
                 <p className="text-sm font-mono uppercase tracking-wide text-amber-800 dark:text-amber-200">
                   Database connection failed. Check DATABASE_URL in .env and that your Neon project is not paused.
                 </p>
                 <p className="text-xs font-mono mt-2 opacity-80 truncate" title={dbError}>{dbError}</p>
               </div>
             )}
             {articles.length === 0 ? (
               <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-6 sm:p-8 md:p-12 text-center">
                 <p className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-widest text-zinc-500 break-words px-2">
                   {search ? `NO_MATCHES_FOR_"${search}"` : dbError ? "CONNECTION_ERROR" : "NO_DATA_AVAILABLE"}
                 </p>
               </div>
             ) : (
               <ArticleFeed initialArticles={articles} search={search} source={source} />
             )}
          </section>
        </main>

        <footer className="border-t-2 border-black dark:border-white bg-white dark:bg-black py-6 sm:py-8 mt-auto z-20 relative">
           <div className="container mx-auto px-3 sm:px-4 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 text-center md:text-left">
             <p>© {new Date().getFullYear()} TBN_CORP</p>
             <p className="truncate max-w-full">EST. 2024 // SYSTEM_STATUS: ONLINE</p>
           </div>
        </footer>
      </div>
    </div>
  );
}
