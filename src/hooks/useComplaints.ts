import { useCallback, useEffect, useState } from 'react';
import { spktApi } from '@/lib/spktApi';
import type { Complaint } from '@/lib/types/spkt';
import { DEFAULT_LIMIT } from '@/lib/pagination';

export function useComplaints(nik?: string, options?: { limit?: number; paginate?: boolean }) {
  const limit = options?.limit ?? (options?.paginate === false ? 100 : DEFAULT_LIMIT);
  const [page, setPage] = useState(1);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { complaints: data, pagination } = await spktApi.getComplaints(
        nik ? { nik, page, limit } : { page, limit },
      );
      setComplaints(data);
      setTotal(pagination?.total ?? data.length);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pengaduan');
    } finally {
      setLoading(false);
    }
  }, [nik, page, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { complaints, loading, error, refresh, page, setPage, total, totalPages };
}
