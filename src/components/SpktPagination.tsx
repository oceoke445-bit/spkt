'use client';

import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SpktPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const SpktPagination: React.FC<SpktPaginationProps> = ({
  page,
  totalPages,
  total,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-blue-500/30">
      <p className="text-sm text-blue-300">
        Halaman {page} dari {totalPages} ({total} item)
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border-blue-500/50 text-blue-200 hover:bg-blue-800/60"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Sebelumnya
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="border-blue-500/50 text-blue-200 hover:bg-blue-800/60"
        >
          Berikutnya
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
