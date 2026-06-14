'use client';

import Image from 'next/image';
import { cn } from '@/components/ui/utils';

const LOGO_SRC = '/spkt-logo.png';

interface SpktLogoProps {
  className?: string;
  priority?: boolean;
}

export function SpktLogo({ className, priority = false }: SpktLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="SPKT Digital"
      width={538}
      height={511}
      priority={priority}
      className={cn('block h-auto w-full object-contain', className)}
    />
  );
}
