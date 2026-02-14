/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * Licensed under the MIT License. See LICENSE-MIT for details.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';

type ArticleImageProps = {
  src: string | null;
  alt: string;
  variant: 'card' | 'modal';
  className?: string;
  priority?: boolean;
  onError?: () => void;
};

const CARD_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
const MODAL_SIZES = '(max-width: 768px) 100vw, 800px';

function Placeholder({ alt, variant }: { alt: string; variant: 'card' | 'modal' }) {
  const isCard = variant === 'card';
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 border-2 border-transparent"
      aria-hidden
    >
      <span className="sr-only">No image: {alt}</span>
      <Newspaper
        className={`text-zinc-400 dark:text-zinc-500 opacity-50 ${
          isCard ? 'w-12 h-12' : 'w-16 h-16'
        }`}
      />
      {/* Pattern overlay for missing image */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:8px_8px] opacity-10 pointer-events-none" />
    </div>
  );
}

export function ArticleImage({
  src,
  alt,
  variant,
  className = '',
  priority = false,
  onError,
}: ArticleImageProps) {
  const [error, setError] = useState(false);
  const showImage = src && !error;
  const isCard = variant === 'card';

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${
        isCard ? 'aspect-video min-h-[8rem] sm:min-h-0' : 'h-full min-h-48 sm:min-h-64'
      } ${className}`}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300"
          sizes={isCard ? CARD_SIZES : MODAL_SIZES}
          priority={priority}
          onError={handleError}
          unoptimized={false}
        />
      ) : null}
      {!showImage && src && !error && <Placeholder alt={alt} variant={variant} />}
    </div>
  );
}
