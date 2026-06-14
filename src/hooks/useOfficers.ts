import { useCallback, useEffect, useState } from 'react';
import { spktApi } from '@/lib/spktApi';
import type { Officer } from '@/lib/types/spkt';

export function useOfficers() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { officers: data } = await spktApi.getOfficers();
      setOfficers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat petugas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { officers, loading, error, refresh };
}
