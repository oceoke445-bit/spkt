'use client';

import Image from 'next/image';
import { cn } from '@/components/ui/utils';

const EMBLEM_SRC = '/spkt-emblem.png';
const EMBLEM_WIDTH = 538;
const EMBLEM_HEIGHT = 340;

interface SpktLogoProps {
  className?: string;
  priority?: boolean;
  /** Sembunyikan teks (mis. header mobile yang sangat kecil) */
  showText?: boolean;
}

export function SpktLogo({ className, priority = false, showText = true }: SpktLogoProps) {
  return (
    <div className={cn('@container flex w-full flex-col items-center', className)}>
      <Image
        src={EMBLEM_SRC}
        alt={showText ? '' : 'SPKT Digital'}
        aria-hidden={showText}
        width={EMBLEM_WIDTH}
        height={EMBLEM_HEIGHT}
        priority={priority}
        className="h-auto w-full object-contain"
      />

      {showText && (
        <div className="mt-1 w-full text-center leading-none">
          <p className="bg-gradient-to-b from-white via-sky-100 to-sky-400 bg-clip-text text-[clamp(0.875rem,20cqw,1.35rem)] font-bold tracking-[0.14em] text-transparent drop-shadow-[0_1px_8px_rgba(56,189,248,0.35)]">
            SPKT
          </p>
          <div className="mt-[0.35em] flex items-center justify-center gap-[0.4em] px-1">
            <span className="h-px min-w-[0.5em] flex-1 max-w-[2em] bg-gradient-to-r from-transparent via-sky-400/50 to-sky-300/80" />
            <span className="text-[clamp(0.45rem,7.5cqw,0.65rem)] font-semibold uppercase tracking-[0.32em] text-sky-300/95">
              Digital
            </span>
            <span className="h-px min-w-[0.5em] flex-1 max-w-[2em] bg-gradient-to-l from-transparent via-sky-400/50 to-sky-300/80" />
          </div>
        </div>
      )}
    </div>
  );
}
