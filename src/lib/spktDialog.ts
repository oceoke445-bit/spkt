import { cn } from '@/components/ui/utils';

export const SPKT_DIALOG_SCROLLBAR =
  '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-400';

const MAX_WIDTHS = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
} as const;

export type SpktDialogMaxWidth = keyof typeof MAX_WIDTHS;

interface SpktDialogClassOptions {
  scroll?: boolean;
}

/** Kelas responsif standar untuk popup SPKT — aman di mobile & desktop */
export function spktDialogClass(
  maxWidth: SpktDialogMaxWidth = 'lg',
  options?: SpktDialogClassOptions,
) {
  const scroll = options?.scroll !== false;

  return cn(
    'w-[calc(100%-2rem)] max-h-[90dvh] p-4 sm:p-6',
    'bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur',
    scroll && 'overflow-y-auto',
    SPKT_DIALOG_SCROLLBAR,
    MAX_WIDTHS[maxWidth],
  );
}
