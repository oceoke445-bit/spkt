import { useCallback, useEffect, useState } from 'react';
import { spktApi } from '@/lib/spktApi';
import type { Complaint } from '@/lib/types/spkt';

export function useComplaints(nik?: string) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { complaints: data } = await spktApi.getComplaints(nik);
      setComplaints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pengaduan');
    } finally {
      setLoading(false);
    }
  }, [nik]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { complaints, loading, error, refresh };
}
