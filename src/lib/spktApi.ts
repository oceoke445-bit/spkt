import type {
  Report,
  LetterRequest,
  Complaint,
  Officer,
  ReportStatus,
  ComplaintCategory,
} from '@/lib/types/spkt';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(!(options?.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Terjadi kesalahan pada server');
  }

  return data as T;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'petugas' | 'admin';
    nik?: string;
    phone?: string;
  };
}

export interface CreateReportPayload {
  reporterUserId?: string;
  reporterName: string;
  reporterNIK: string;
  reporterPhone: string;
  caseType: string;
  incidentDate: string;
  location: string;
  description: string;
  status?: ReportStatus;
  evidenceFiles?: string[];
}

export interface UpdateReportPayload {
  status?: ReportStatus;
  assignedTo?: string;
  assignedBy?: string;
  notes?: string;
  timelineNote?: string;
  timelineOfficer?: string;
}

export interface CreateLetterPayload {
  requesterUserId?: string;
  requesterName: string;
  requesterNIK: string;
  requesterPhone?: string;
  letterTypeId: string;
  letterTypeName: string;
  purpose: string;
  pickupDate?: string;
}

export interface CreateComplaintPayload {
  submitterUserId?: string;
  submitterName: string;
  submitterNik?: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
}

export const spktApi = {
  getSession: () => request<{ user: LoginResponse['user'] | null }>('/auth/session'),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getReports: (params?: { nik?: string; assignedTo?: string }) => {
    const search = new URLSearchParams();
    if (params?.nik) search.set('nik', params.nik);
    if (params?.assignedTo) search.set('assignedTo', params.assignedTo);
    const qs = search.toString();
    return request<{ reports: Report[] }>(`/reports${qs ? `?${qs}` : ''}`);
  },

  getReport: (id: string) => request<{ report: Report }>(`/reports/${id}`),

  createReport: (payload: CreateReportPayload) =>
    request<{ report: Report }>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateReport: (id: string, payload: UpdateReportPayload) =>
    request<{ report: Report }>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getLetters: (nik?: string) => {
    const qs = nik ? `?nik=${encodeURIComponent(nik)}` : '';
    return request<{ letters: LetterRequest[] }>(`/letters${qs}`);
  },

  createLetter: (payload: CreateLetterPayload) =>
    request<{ letter: LetterRequest }>('/letters', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getComplaints: (nik?: string) => {
    const qs = nik ? `?nik=${encodeURIComponent(nik)}` : '';
    return request<{ complaints: Complaint[] }>(`/complaints${qs}`);
  },

  createComplaint: (payload: CreateComplaintPayload) =>
    request<{ complaint: Complaint }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOfficers: () => request<{ officers: Officer[] }>('/officers'),

  getUsers: () =>
    request<{ users: Array<{ id: string; name: string; email: string; role: string }> }>('/users'),

  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return request<{
      files: Array<{ storedName: string; originalName: string; size: number; mimeType: string }>;
    }>('/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getFileUrl: (storedName: string) => `/api/files/${encodeURIComponent(storedName)}`,
};
