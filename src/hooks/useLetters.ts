import { useCallback, useEffect, useState } from 'react';
import { spktApi } from '@/lib/spktApi';
import type { LetterRequest } from '@/lib/types/spkt';

export function useLetters(nik?: string) {
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { letters: data } = await spktApi.getLetters(nik);
      setLetters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat surat');
    } finally {
      setLoading(false);
    }
  }, [nik]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { letters, loading, error, refresh };
}
