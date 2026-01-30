import { getArticles } from '@/lib/actions';
import { Header } from '@/components/Header';
import { ArticleFeed } from '@/components/ArticleFeed';
import Balatro from '@/components/Balatro';

export const revalidate = 60; // Revalidate every 60 seconds (ISR) for better performance

export default async function Home() {
  const { articles } = await getArticles({ limit: 30 }); // Initial load

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 relative">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-auto backdrop-blur-lg">
        <Balatro 
          isRotate={true} 
          mouseInteraction={true}
          pixelFilter={700}
        />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-boldonse text-white tracking-tight mb-2">Detailed Tech News</h1>
          <p className="text-white dark:text-white">
            Curated technology updates from trusted sources.
          </p>
        </div>

        {articles.length === 0 ? (
           <div className="text-center py-20">
             <p className="text-xl text-zinc-500">No news articles found. Try triggering ingestion.</p>
           </div>
        ) : (
          <ArticleFeed initialArticles={articles} />
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
         <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
           <p>© {new Date().getFullYear()} The Boring News.</p>
         </div>
      </footer>
      </div>
    </div>
  );
}
