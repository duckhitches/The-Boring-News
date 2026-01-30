import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Calendar, User, X, ChevronRight } from 'lucide-react';
import { type ArticleWithRelations } from '@/lib/actions';


interface NewsCardProps {
  article: ArticleWithRelations;
}

export function NewsCard({ article }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* --- COLLAPSED CARD VIEW --- */}
      <article 
        onClick={() => setIsModalOpen(true)}
        className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full"
      >
        {article.image && (
          <div className="relative w-full h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
            <Image 
              src={article.image} 
              alt={article.title} 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-5 flex flex-col h-full">
          {/* Header: Source & Time */}
          <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
              {/* Fallback icon if no logo, or just name */}
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              {article.source.name}
            </span>
            <time dateTime={article.publishedAt.toString()}>
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </time>
          </div>

          {/* Title (max 2 lines) */}
          <h3 className="text-lg font-bold font-boldonse text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-500 transition-colors">
            {article.title}
          </h3>

          {/* Ultra-short Summary (1-2 lines) */}
          <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
            {article.shortSummary || article.summary || "Click to read more..."}
          </p>

          {/* Footer: Category & Read More Chevron */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-2">
              {article.categories.slice(0, 1).map((cat: { id: string; name: string }) => (
                <span key={cat.id} className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                  {cat.name}
                </span>
              ))}
              {article.categories.length === 0 && (
                 <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">News</span>
              )}
            </div>
            
            <div className="flex items-center text-xs font-medium text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-cyan-500 transition-colors">
              Read more <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </article>

      {/* --- EXPANDED MODAL VIEW --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl ring-1 ring-zinc-900/5 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Banner */}
            {article.image && (
              <div className="relative w-full h-64 sm:h-72">
                <Image 
                  src={article.image} 
                  alt={article.title} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent opacity-80" />
              </div>
            )}

            <div className="p-8 sm:p-10 relative">
              {/* Modal Header */}
              <div className="flex flex-col items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {article.source.name}
                </span>
                
                <span className="flex items-center gap-1">
                   <Calendar className="w-3 h-3" />
                   {new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
                {article.author && (
                   <>
                     
                     <span className="flex items-center gap-1">
                       <User className="w-3 h-3" />
                       {article.author}
                     </span>
                   </>
                )}
              </div>

              {/* Full Title */}
              <h2 className="text-2xl sm:text-3xl font-bold font-boldonse text-zinc-900 dark:text-zinc-50 leading-tight mb-6">
                {article.title}
              </h2>

              {/* Extended Summary */}
              <div className="prose dark:prose-invert font-mono max-w-none text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed mb-8">
                 <p>{article.extendedSummary || article.summary || "No detailed summary available."}</p>
              </div>

              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 italic">
                  Read the full story on the original site
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                >
                  Read on {article.source.name}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
