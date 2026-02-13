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
  
  const [ { articles }, sources ] = await Promise.all([
     getArticles({ limit: 30, search, source }),
     getSources()
  ]);

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
        
        <main id='hero' className="container mx-auto px-4 py-12 flex-1 flex flex-col gap-12">
          
          {/* Header Section */}
          <section className="flex flex-col gap-6 border-b-2 border-black dark:border-white pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-6xl font-bold font-boldonse uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-black to-zinc-500 dark:from-white dark:to-zinc-500 [-webkit-text-stroke:1px_rgba(0,0,0,0.2)] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.2)]">
                  The_<br/><span className="text-pink-500">Boring</span>_News
                </h1>
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-zinc-500">
                  // CURATED_TECH_UPDATES__V2.0
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                <RefreshNews />
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <SourceFilter sources={sources} />
                    <Search />
                </div>
              </div>
            </div>
          </section>

          {/* Feed Section */}
          <section>
             {articles.length === 0 ? (
               <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
                 <p className="text-xl font-bold uppercase tracking-widest text-zinc-500">
                   {search ? `NO_MATCHES_FOR_"${search}"` : "NO_DATA_AVAILABLE"}
                 </p>
               </div>
             ) : (
               <ArticleFeed initialArticles={articles} search={search} source={source} />
             )}
          </section>
        </main>

        <footer className="border-t-2 border-black dark:border-white bg-white dark:bg-black py-8 mt-auto z-20 relative">
           <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
             <p>© {new Date().getFullYear()} TBN_CORP</p>
             <p>EST. 2024 // SYSTEM_STATUS: ONLINE</p>
           </div>
        </footer>
      </div>
    </div>
  );
}
