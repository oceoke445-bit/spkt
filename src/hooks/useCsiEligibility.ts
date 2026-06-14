'use client';

import { useCallback, useEffect, useState } from 'react';
import { surveyApi } from '@/lib/surveyApi';

export function useCsiEligibility(
  serviceType: 'report' | 'letter' | 'complaint',
  referenceId: string | undefined,
  enabled: boolean,
) {
  const [eligible, setEligible] = useState(false);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled || !referenceId) {
      setEligible(false);
      return;
    }
    setChecking(true);
    try {
      const { submitted } = await surveyApi.checkSurvey(serviceType, referenceId);
      setEligible(!submitted);
    } catch {
      setEligible(false);
    } finally {
      setChecking(false);
    }
  }, [enabled, referenceId, serviceType]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { eligible, checking, refresh };
}
