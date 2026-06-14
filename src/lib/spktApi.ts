import type {
  Report,
  LetterRequest,
  Complaint,
  Officer,
  ReportStatus,
  LetterStatus,
  ComplaintStatus,
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
    avatarUrl?: string;
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
  adminOverride?: boolean;
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
  attachmentFiles?: string[];
}

export interface UpdateLetterPayload {
  status?: LetterStatus;
  pickupDate?: string | null;
  rejectionReason?: string | null;
}

export interface UpdateUserReportPayload {
  caseType?: string;
  incidentDate?: string;
  location?: string;
  description?: string;
  reporterPhone?: string;
  evidenceFiles?: string[];
  submit?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  nik: string;
  phone: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string | null;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface UserPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  reportUpdate: boolean;
  letterReady: boolean;
  systemNews: boolean;
}

export interface InfoArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  date: string;
}

export interface CreateComplaintPayload {
  submitterUserId?: string;
  submitterName: string;
  submitterNik?: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  files?: string[];
}

export interface UpdateComplaintPayload {
  status?: ComplaintStatus;
  response?: string;
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

  register: (payload: RegisterPayload) =>
    request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () =>
    request<{ user: LoginResponse['user'] & { address?: string; avatarUrl?: string } }>('/users/me'),

  updateProfile: (payload: UpdateProfilePayload) =>
    request<{ user: LoginResponse['user'] & { address?: string; avatarUrl?: string } }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/users/me/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  updateUser: (id: string, payload: { name?: string; email?: string; role?: string; active?: boolean }) =>
    request<{ message: string }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
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

  updateUserReport: (id: string, payload: UpdateUserReportPayload) =>
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

  getLetter: (id: string) => request<{ letter: LetterRequest }>(`/letters/${id}`),

  updateLetter: (id: string, payload: UpdateLetterPayload) =>
    request<{ letter: LetterRequest }>(`/letters/${id}`, {
      method: 'PATCH',
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

  getComplaint: (id: string) => request<{ complaint: Complaint }>(`/complaints/${id}`),

  updateComplaint: (id: string, payload: UpdateComplaintPayload) =>
    request<{ complaint: Complaint }>(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getOfficers: () => request<{ officers: Officer[] }>('/officers'),

  getUsers: () =>
    request<{
      users: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        active: boolean;
        nik?: string;
        phone?: string;
      }>;
    }>('/users'),

  getAdminStats: () =>
    request<{
      stats: {
        totalReports: number;
        completedReports: number;
        processingReports: number;
        completionRate: number;
        reportsToday: number;
        avgCompletionDays: number;
        activeUsers: number;
        monthlyTrend: Array<{ month: string; laporan: number; selesai: number }>;
        responseTimeBuckets: Array<{ category: string; count: number }>;
        caseDistribution: Array<{ name: string; value: number }>;
      };
    }>('/stats/admin'),

  getNotifications: () => request<{ notifications: NotificationItem[] }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications', { method: 'PATCH' }),

  createOfficer: (payload: {
    name: string;
    rank: string;
    email: string;
    phone: string;
    status?: string;
    userId?: string;
  }) =>
    request<{ message: string }>('/officers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateOfficer: (
    id: string,
    payload: Partial<{ name: string; rank: string; email: string; phone: string; status: string }>,
  ) =>
    request<{ message: string }>(`/officers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteOfficer: (id: string) =>
    request<{ message: string }>(`/officers/${id}`, {
      method: 'DELETE',
    }),

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

  getPreferences: () => request<{ preferences: UserPreferences }>('/users/me/preferences'),

  updatePreferences: (payload: Partial<UserPreferences>) =>
    request<{ preferences: UserPreferences }>('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getInfoArticles: () => request<{ articles: InfoArticle[] }>('/info/articles'),

  suspendUserByNik: async (nik: string) => {
    const { users } = await request<{ users: Array<{ id: string; nik?: string }> }>('/users');
    const target = users.find((u) => u.nik === nik);
    if (!target) {
      throw new Error('Akun pelapor tidak ditemukan');
    }
    return request<{ message: string }>(`/users/${target.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
    });
  },
};
