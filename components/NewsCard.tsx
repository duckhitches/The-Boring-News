/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

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
        className="group relative flex flex-col bg-background border-2 border-border h-full min-h-0 cursor-pointer transition-colors duration-100 hover:bg-foreground hover:text-background active:scale-[0.99] sm:active:scale-100"
      >
        {article.image && !imageError && (
          <div className="border-b-2 border-border relative overflow-hidden h-36 sm:h-40 md:h-44 lg:h-48 shrink-0 lg:grayscale lg:group-hover:grayscale-0 transition-all duration-100">
            <ArticleImage
              src={article.image}
              alt={article.title}
              variant="card"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />
          </div>
        )}
        
        <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0 relative">
          {/* Header: Source & Time */}
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 text-[10px] sm:text-xs font-mono uppercase tracking-wider border-b border-dashed border-border/40 pb-1.5 sm:pb-2 group-hover:border-background/40 min-h-[28px] sm:min-h-0">
            <span className="flex items-center gap-1 font-bold truncate min-w-0">
              <span className="shrink-0">[SRC]</span>
              <span className="truncate">{article.source.name}</span>
            </span>
            <time dateTime={article.publishedAt.toString()} className="opacity-70 group-hover:opacity-100 shrink-0 text-[10px] sm:text-xs">
               {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </time>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold font-mono mb-2 sm:mb-3 leading-snug uppercase tracking-tight line-clamp-2 group-hover:text-background group-hover:bg-foreground break-words">
            {article.title}
          </h3>

          {/* Preview */}
          <div className="text-[11px] sm:text-xs font-mono opacity-80 line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 leading-relaxed flex-1 min-h-0">
            {getSummaryPoints(article.extendedSummary ?? null)[0] ?? article.shortSummary ?? article.summary ?? "NO DATA AVAILABLE"}
          </div>

          {/* Footer: Category & Action */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 sm:pt-3 border-t-2 border-border group-hover:border-background min-h-[44px] sm:min-h-0">
            <div className="flex gap-1.5 sm:gap-2 min-w-0">
              {article.categories.length > 0 ? (
                article.categories.slice(0, 1).map((cat: { id: string; name: string }) => (
                  <span key={cat.id} className="text-[9px] sm:text-[10px] font-bold uppercase px-1 border border-border group-hover:border-background group-hover:text-background truncate max-w-[120px] sm:max-w-none">
                    #{cat.name}
                  </span>
                ))
              ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1 border border-border group-hover:border-background group-hover:text-background">
                    #NEWS
                  </span>
              )}
            </div>
            
            <div className="flex items-center text-[10px] sm:text-xs font-bold uppercase shrink-0 group-hover:translate-x-1 transition-transform py-1">
              OPEN <ChevronRight className="w-3 h-3 ml-0.5 sm:ml-1" />
            </div>
          </div>
        </div>
      </article>

      {/* --- EXPANDED MODAL VIEW --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/90 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal: full height on small screens, centered box on sm+ */}
          <div className="relative w-full max-w-3xl h-[95dvh] sm:h-[90vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden bg-background border-4 border-foreground border-b-0 sm:border-b-4 shadow-[8px_8px_0px_0px_var(--color-foreground)] animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 flex flex-col">
            
            {/* Header Bar - touch-friendly close */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3 bg-foreground text-background border-b-4 border-background shrink-0">
                <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest min-w-0">
                    <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">READ_MODE_ACTIVE</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                  className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-background hover:text-foreground transition-colors border border-transparent hover:border-background touch-manipulation"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>

            {article.image && !imageError && (
              <div className="relative w-full border-b-4 border-foreground h-44 sm:h-56 md:h-64 lg:h-80 shrink-0 lg:grayscale">
                <ArticleImage
                  src={article.image}
                  alt={article.title}
                  variant="modal"
                  priority
                  onError={() => setImageError(true)}
                  className="h-full"
                />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />
              </div>
            )}

            <div className="p-4 sm:p-6 md:p-8 lg:p-10 font-mono flex-1 min-h-0 overflow-auto">
              {/* Meta: stack on very small screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[10px] sm:text-xs uppercase border-b-2 border-foreground/20 pb-4 sm:pb-6 mb-6 sm:mb-8 text-foreground/70">
                <div>
                    <span className="block font-bold mb-0.5 sm:mb-1">[SOURCE]</span>
                    <span className="break-words">{article.source.name}</span>
                </div>
                <div>
                    <span className="block font-bold mb-0.5 sm:mb-1">[PUBLISHED]</span>
                    {new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
                {article.author && (
                    <div className="sm:col-span-2">
                        <span className="block font-bold mb-0.5 sm:mb-1">[AUTHOR]</span>
                        {article.author}
                    </div>
                )}
              </div>

              {/* Title - responsive size, break long words */}
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-mono text-foreground leading-tight mb-6 sm:mb-8 uppercase tracking-tighter break-words">
                {article.title}
              </h2>

              {/* Content */}
              <div className="text-sm sm:text-base md:text-lg leading-relaxed space-y-4 sm:space-y-6">
                {(() => {
                  const points = getSummaryPoints(article.extendedSummary ?? null);
                  const fallback = article.extendedSummary || article.summary || "NO DETAILED SUMMARY DATA.";
                  
                  if (points.length > 0) {
                      return (
                          <div className="space-y-3 sm:space-y-4">
                              {points.map((point, i) => (
                                  <div key={i} className="flex gap-2 sm:gap-4 flex-col sm:flex-row">
                                      <span className="font-bold select-none shrink-0">{`0${i+1} //`}</span>
                                      <p className="min-w-0 break-words">{point}</p>
                                  </div>
                              ))}
                          </div>
                      )
                  }
                  
                  return <p className="break-words">{fallback}</p>;
                })()}
              </div>

              {/* Action Bar - full-width touch target on mobile */}
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-4 border-foreground">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3.5 sm:py-4 min-h-[48px] sm:min-h-0 flex items-center justify-center gap-2 bg-foreground text-background font-bold uppercase tracking-widest text-sm sm:text-base hover:bg-transparent hover:text-foreground border-2 border-foreground transition-all hover:shadow-[4px_4px_0px_0px_var(--color-foreground)] touch-manipulation"
                >
                  <span className="truncate">ACCESS_ORIGINAL_SOURCE</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
