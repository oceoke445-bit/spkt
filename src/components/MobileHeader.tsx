import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { getViewLabel } from './Sidebar';

interface MobileHeaderProps {
  currentView: string;
  onMenuOpen: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ currentView, onMenuOpen }) => {
  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 border-b border-blue-500/30 bg-blue-950/95 backdrop-blur supports-[backdrop-filter]:bg-blue-950/80">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Buka menu navigasi"
          onClick={onMenuOpen}
          className="shrink-0 border-blue-500/50 text-blue-100 hover:bg-blue-800/60 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-sm font-semibold text-white truncate">SPKT Digital</p>
          </div>
          <p className="text-xs text-blue-300 truncate">{getViewLabel(currentView)}</p>
        </div>
      </div>
    </header>
  );
};
