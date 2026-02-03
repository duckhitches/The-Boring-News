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
      className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900"
      aria-hidden
    >
      <span className="sr-only">No image: {alt}</span>
      <Newspaper
        className={`text-zinc-400 dark:text-zinc-500 ${
          isCard ? 'w-12 h-12' : 'w-16 h-16'
        }`}
      />
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
        isCard ? 'aspect-video' : 'h-64 sm:h-72'
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
