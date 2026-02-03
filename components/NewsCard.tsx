import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Calendar, User, X, ChevronRight, Terminal } from 'lucide-react';
import { type ArticleWithRelations } from '@/lib/actions';
import { getSummaryPoints } from '@/lib/utils';
import { ArticleImage } from './ArticleImage';


interface NewsCardProps {
  article: ArticleWithRelations;
}

export function NewsCard({ article }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [article.id]);

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
        className="group relative flex flex-col bg-background border-2 border-border h-full cursor-pointer transition-colors duration-100 hover:bg-foreground hover:text-background"
      >
        {/* Decorative corner brackets or lines could be added here if needed, but border-2 is stark enough */}
        
        {article.image && !imageError && (
          <div className="border-b-2 border-border relative overflow-hidden h-48 shrink-0 lg:grayscale lg:group-hover:grayscale-0 transition-all duration-100">
             {/* Overlay for hover state to invert image or keep it visible? Let's keep it visible but high contrast */}
            <ArticleImage
              src={article.image}
              alt={article.title}
              variant="card"
              onError={() => setImageError(true)}
            />
             {/* Scanline effect overlay */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />
          </div>
        )}
        
        <div className="p-4 flex flex-col h-full relative">
          {/* Header: Source & Time */}
          <div className="flex items-center justify-between mb-4 text-xs font-mono uppercase tracking-wider border-b border-dashed border-border/40 pb-2 group-hover:border-background/40">
            <span className="flex items-center gap-2 font-bold">
              <span className="text-[10px] mr-1">[SRC]</span>
              {article.source.name}
            </span>
            <time dateTime={article.publishedAt.toString()} className="opacity-70 group-hover:opacity-100">
               {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </time>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold font-mono mb-3 leading-snug uppercase tracking-tight group-hover:text-background group-hover:bg-foreground">
            {article.title}
          </h3>

          {/* Preview */}
          <div className="text-xs font-mono opacity-80 line-clamp-3 mb-6 leading-relaxed">
            {getSummaryPoints(article.extendedSummary ?? null)[0] ?? article.shortSummary ?? article.summary ?? "NO DATA AVAILABLE"}
          </div>

          {/* Footer: Category & Action */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-border group-hover:border-background">
            <div className="flex gap-2">
              {article.categories.length > 0 ? (
                article.categories.slice(0, 1).map((cat: { id: string; name: string }) => (
                  <span key={cat.id} className="text-[10px] font-bold uppercase px-1 border border-border group-hover:border-background group-hover:text-background">
                    #{cat.name}
                  </span>
                ))
              ) : (
                  <span className="text-[10px] font-bold uppercase px-1 border border-border group-hover:border-background group-hover:text-background">
                    #NEWS
                  </span>
              )}
            </div>
            
            <div className="flex items-center text-xs font-bold uppercase group-hover:translate-x-1 transition-transform">
              OPEN <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </article>

      {/* --- EXPANDED MODAL VIEW --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
          {/* Backdrop - Solid or very dark grid, no blur */}
          <div 
            className="absolute inset-0 bg-background/90 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content - Hard edges, solid borders */}
          <div className="relative w-full max-w-3xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header Bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-foreground text-background border-b-4 border-background">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                    <Terminal className="w-4 h-4" />
                    <span>READ_MODE_ACTIVE</span>
                </div>
                <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="p-1 hover:bg-background hover:text-foreground transition-colors border border-transparent hover:border-background"
                >
                <X className="w-5 h-5" />
                </button>
            </div>

            {article.image && !imageError && (
              <div className="relative w-full border-b-4 border-foreground h-64 sm:h-80 lg:grayscale">
                <ArticleImage
                  src={article.image}
                  alt={article.title}
                  variant="modal"
                  priority
                  onError={() => setImageError(true)}
                />
                 {/* Scanlines again */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />
              </div>
            )}

            <div className="p-6 sm:p-10 font-mono">
              {/* Meta Data Block */}
              <div className="grid grid-cols-2 gap-4 text-xs uppercase border-b-2 border-foreground/20 pb-6 mb-8 text-foreground/70">
                <div>
                    <span className="block font-bold mb-1">[SOURCE]</span>
                    {article.source.name}
                </div>
                <div>
                    <span className="block font-bold mb-1">[PUBLISHED]</span>
                     {new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
                {article.author && (
                    <div className="col-span-2">
                        <span className="block font-bold mb-1">[AUTHOR]</span>
                        {article.author}
                    </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-4xl font-bold font-mono text-foreground leading-tight mb-8 uppercase tracking-tighter">
                {article.title}
              </h2>

              {/* Content */}
              <div className="text-base sm:text-lg leading-relaxed space-y-6">
                {(() => {
                  const points = getSummaryPoints(article.extendedSummary ?? null);
                  const fallback = article.extendedSummary || article.summary || "NO DETAILED SUMMARY DATA.";
                  
                  if (points.length > 0) {
                      return (
                          <div className="space-y-4">
                              {points.map((point, i) => (
                                  <div key={i} className="flex gap-4">
                                      <span className="font-bold select-none">{`0${i+1} //`}</span>
                                      <p>{point}</p>
                                  </div>
                              ))}
                          </div>
                      )
                  }
                  
                  return <p>{fallback}</p>;
                })()}
              </div>

              {/* Action Bar */}
              <div className="mt-12 pt-8 border-t-4 border-foreground">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground border-2 border-foreground transition-all hover:shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                >
                  <span className="mr-2">ACCESS_ORIGINAL_SOURCE</span>
                  <ExternalLink className="w-4 h-4 inline-block mb-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
