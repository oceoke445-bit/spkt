import { useCallback, useEffect, useState } from 'react';
import { spktApi } from '@/lib/spktApi';
import type { LetterRequest } from '@/lib/types/spkt';
import { DEFAULT_LIMIT } from '@/lib/pagination';

export function useLetters(nik?: string, options?: { limit?: number; paginate?: boolean }) {
  const limit = options?.limit ?? (options?.paginate === false ? 100 : DEFAULT_LIMIT);
  const [page, setPage] = useState(1);
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { letters: data, pagination } = await spktApi.getLetters(
        nik ? { nik, page, limit } : { page, limit },
      );
      setLetters(data);
      setTotal(pagination?.total ?? data.length);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat surat');
    } finally {
      setLoading(false);
    }
  }, [nik, page, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { letters, loading, error, refresh, page, setPage, total, totalPages };
}
