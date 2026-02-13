/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

interface Source {
  id: string;
  name: string;
}

interface SourceFilterProps {
  sources: Source[];
}

export function SourceFilter({ sources }: SourceFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentSource = searchParams.get('source');

  const handleSelect = (sourceName: string) => {
    const params = new URLSearchParams(searchParams);
    if (sourceName === currentSource) {
      params.delete('source');
    } else {
      params.set('source', sourceName);
    }
    
    // Reset offset when filtering
    params.delete('offset');

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative group">
       <div className="absolute inset-0 bg-black dark:bg-white translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-75" />
       <select
        className="appearance-none block w-full md:w-48 border-2 border-black dark:border-white py-2 pl-3 pr-8 text-sm bg-background focus:outline-none focus:ring-0 focus:bg-pink-50 dark:focus:bg-zinc-900 transition-none rounded-none uppercase tracking-wide cursor-pointer text-black dark:text-white"
        onChange={(e) => handleSelect(e.target.value)}
        value={currentSource || ''}
        disabled={isPending}
      >
        <option value="">ALL_SOURCES</option>
        {sources.map((source) => (
          <option key={source.id} value={source.name}>
            {source.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black dark:text-white">
        {isPending ? (
            <div className="h-4 w-4 bg-pink-500 animate-pulse" />
        ) : (
            <ChevronsUpDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
}
