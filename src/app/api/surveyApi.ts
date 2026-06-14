const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server');
  }

  return data as T;
}

export interface SurveyDimension {
  id: number;
  code: string;
  name: string;
  weight: number;
}

export interface SubmitSurveyPayload {
  userId?: string;
  userName: string;
  userEmail?: string;
  serviceType: 'report' | 'letter' | 'complaint';
  serviceLabel?: string;
  referenceId?: string;
  comment?: string;
  responses: Array<{ dimensionId: number; score: number }>;
}

export interface CsiSummary {
  overall: {
    totalResponses: number;
    averageCsi: number;
    minCsi: number;
    maxCsi: number;
  };
  byService: Array<{
    serviceType: string;
    serviceLabel: string;
    count: number;
    csi: number;
  }>;
  byDimension: Array<{
    dimensionId: number;
    code: string;
    name: string;
    weight: number;
    responseCount: number;
    averageScore: number;
    csi: number;
  }>;
  monthly: Array<{
    month: string;
    count: number;
    csi: number;
  }>;
}

export interface RecentSurvey {
  id: number;
  user_name: string;
  user_email: string | null;
  service_type: string;
  service_label: string;
  reference_id: string | null;
  comment: string | null;
  csi_score: number;
  submitted_at: string;
}

export const surveyApi = {
  getDimensions: () =>
    request<{ dimensions: SurveyDimension[] }>('/survey/dimensions'),

  submitSurvey: (payload: SubmitSurveyPayload) =>
    request<{ message: string; surveyId: number; csiScore: number }>('/survey/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCsiSummary: () => request<CsiSummary>('/survey/csi/summary'),

  getRecentSurveys: (limit = 20) =>
    request<{ surveys: RecentSurvey[] }>(`/survey/recent?limit=${limit}`),
};

export const SCORE_LABELS: Record<number, string> = {
  1: 'Tidak Puas',
  2: 'Kurang Puas',
  3: 'Puas',
  4: 'Sangat Puas',
};
