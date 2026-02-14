/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

'use client';

import { Search as SearchIcon } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition, useRef } from 'react';

export function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  const debouncedHandleSearch = (term: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      handleSearch(term);
    }, 300);
  };

  return (
    <div className="relative flex flex-1 flex-shrink-0 w-full min-w-0 max-w-md font-mono group">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none">
         {isPending ? (
             <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 bg-pink-500 animate-pulse" />
         ) : (
             <SearchIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black dark:text-white" />
         )}
      </div>
      <input
        className="block w-full border-2 border-black dark:border-white py-2.5 sm:py-2 pl-9 sm:pl-10 text-sm min-h-[44px] sm:min-h-0 placeholder:text-zinc-500 text-black dark:text-white bg-background focus:outline-none focus:ring-0 focus:bg-pink-50 dark:focus:bg-zinc-900 transition-none rounded-none uppercase tracking-wide"
        placeholder="SEARCH_ARTICLES..."
        onChange={(e) => {
          debouncedHandleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('search')?.toString()}
      />
      {/* Hard shadow decoration */}
      <div className="absolute inset-0 border-2 border-black dark:border-white translate-x-1 translate-y-1 -z-10 group-focus-within:translate-x-0 group-focus-within:translate-y-0 transition-transform duration-75" />
    </div>
  );
}
