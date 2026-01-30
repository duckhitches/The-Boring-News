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
    <div className="relative flex flex-1 flex-shrink-0 w-full max-w-md">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="block w-full rounded-full border border-white py-[9px] pl-10 text-sm placeholder:text-pink-500 text-zinc-900 dark:text-zinc-100 bg-white/10 backdrop-blur-md focus:bg-white/20 dark:focus:bg-black/40 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        placeholder="Search articles..."
        onChange={(e) => {
          debouncedHandleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('search')?.toString()}
      />
      <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 peer-focus:text-zinc-900 dark:peer-focus:text-zinc-100" />
      {isPending && (
         <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"></div>
         </div>
      )}
    </div>
  );
}
