import { useCallback, useEffect, useState } from 'react';
import { spktApi } from '@/lib/spktApi';
import type { Report } from '@/lib/types/spkt';

export function useReports(params?: { nik?: string; assignedTo?: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { reports: data } = await spktApi.getReports(params);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  }, [params?.nik, params?.assignedTo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reports, loading, error, refresh };
}
