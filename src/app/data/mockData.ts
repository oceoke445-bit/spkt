export type ReportStatus = 'draft' | 'submitted' | 'verified' | 'assigned' | 'processing' | 'completed' | 'rejected';
export type LetterStatus = 'draft' | 'submitted' | 'verified' | 'ready' | 'completed' | 'rejected';

export interface Report {
  id: string;
  reportNumber: string;
  reporterName: string;
  reporterNIK: string;
  reporterPhone: string;
  caseType: string;
  incidentDate: string;
  location: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string;
  notes?: string;
  evidenceFiles?: string[];
  timeline: TimelineEvent[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
  officer?: string;
}

export interface LetterRequest {
  id: string;
  requestNumber: string;
  requesterName: string;
  requesterNIK: string;
  letterType: string;
  purpose: string;
  status: LetterStatus;
  createdAt: string;
  pickupDate?: string;
}

export const caseTypes = [
  'Kehilangan',
  'Pencurian',
  'Penipuan',
  'Kecelakaan Lalu Lintas',
  'Kekerasan',
  'Narkoba',
  'Penganiayaan',
  'Lainnya'
];

export const letterTypes = [
  {
    id: 'skck',
    name: 'SKCK (Surat Keterangan Catatan Kepolisian)',
    description: 'Surat keterangan untuk keperluan administratif',
    icon: '📋'
  },
  {
    id: 'kehilangan',
    name: 'Surat Keterangan Kehilangan',
    description: 'Surat keterangan barang hilang',
    icon: '📄'
  },
  {
    id: 'keramaian',
    name: 'Izin Keramaian',
    description: 'Izin untuk mengadakan acara atau keramaian',
    icon: '🎉'
  }
];

export const mockReports: Report[] = [
  {
    id: 'R001',
    reportNumber: 'LP/001/V/2026',
    reporterName: 'Budi Santoso',
    reporterNIK: '3201012345678901',
    reporterPhone: '081234567890',
    caseType: 'Kehilangan',
    incidentDate: '2026-05-18',
    location: 'Jl. Sudirman No. 123, Jakarta Pusat',
    description: 'Kehilangan dompet berisi KTP, SIM, dan uang tunai Rp 500.000',
    status: 'processing',
    createdAt: '2026-05-18T10:30:00',
    updatedAt: '2026-05-19T14:20:00',
    assignedTo: 'Ipda. Ahmad Wijaya',
    assignedBy: 'Admin System',
    assignedAt: '2026-05-18T15:30:00',
    priority: 'medium',
    evidenceFiles: ['foto_tkp.jpg', 'kronologi.pdf'],
    timeline: [
      { status: 'Laporan dikirim', timestamp: '2026-05-18T10:30:00' },
      { status: 'Diverifikasi', timestamp: '2026-05-18T15:00:00', officer: 'Kompol. Sarah Putri' },
      { status: 'Ditugaskan', timestamp: '2026-05-18T15:30:00', officer: 'Ipda. Ahmad Wijaya', note: 'Assigned to officer' },
      { status: 'Diproses', timestamp: '2026-05-19T09:00:00', officer: 'Ipda. Ahmad Wijaya', note: 'Tim sedang menindaklanjuti laporan' }
    ]
  },
  {
    id: 'R002',
    reportNumber: 'LP/002/V/2026',
    reporterName: 'Siti Rahayu',
    reporterNIK: '3201012345678902',
    reporterPhone: '081234567891',
    caseType: 'Pencurian',
    incidentDate: '2026-05-17',
    location: 'Jl. Thamrin No. 45, Jakarta Pusat',
    description: 'Pencurian sepeda motor Honda Beat warna merah, Nopol B 1234 XYZ',
    status: 'assigned',
    createdAt: '2026-05-17T16:00:00',
    updatedAt: '2026-05-18T11:00:00',
    assignedTo: 'Bripka. Andi Pratama',
    assignedBy: 'Kompol. Sarah Putri',
    assignedAt: '2026-05-18T11:00:00',
    priority: 'high',
    timeline: [
      { status: 'Laporan dikirim', timestamp: '2026-05-17T16:00:00' },
      { status: 'Diverifikasi', timestamp: '2026-05-18T10:00:00', officer: 'Kompol. Sarah Putri' },
      { status: 'Ditugaskan', timestamp: '2026-05-18T11:00:00', officer: 'Bripka. Andi Pratama', note: 'High priority case' }
    ]
  },
  {
    id: 'R003',
    reportNumber: 'LP/003/V/2026',
    reporterName: 'Ahmad Hidayat',
    reporterNIK: '3201012345678903',
    reporterPhone: '081234567892',
    caseType: 'Kecelakaan Lalu Lintas',
    incidentDate: '2026-05-20',
    location: 'Perempatan Semanggi, Jakarta Selatan',
    description: 'Kecelakaan tunggal, mobil menabrak pembatas jalan',
    status: 'completed',
    createdAt: '2026-05-20T08:00:00',
    updatedAt: '2026-05-20T12:00:00',
    assignedTo: 'Bripka. Andi Pratama',
    assignedBy: 'Admin System',
    assignedAt: '2026-05-20T08:30:00',
    priority: 'urgent',
    notes: 'Kasus telah diselesaikan, laporan telah dibuat',
    timeline: [
      { status: 'Laporan dikirim', timestamp: '2026-05-20T08:00:00' },
      { status: 'Diverifikasi', timestamp: '2026-05-20T08:20:00', officer: 'Kompol. Sarah Putri' },
      { status: 'Ditugaskan', timestamp: '2026-05-20T08:30:00', officer: 'Bripka. Andi Pratama', note: 'Urgent case - accident' },
      { status: 'Diproses', timestamp: '2026-05-20T09:00:00', officer: 'Bripka. Andi Pratama' },
      { status: 'Selesai', timestamp: '2026-05-20T12:00:00', officer: 'Bripka. Andi Pratama', note: 'Laporan kecelakaan telah dibuat dan diserahkan' }
    ]
  },
  {
    id: 'R004',
    reportNumber: 'LP/004/V/2026',
    reporterName: 'Dewi Lestari',
    reporterNIK: '3201012345678904',
    reporterPhone: '081234567893',
    caseType: 'Penipuan',
    incidentDate: '2026-05-19',
    location: 'Online - Platform E-Commerce',
    description: 'Penipuan jual beli online, sudah transfer tapi barang tidak dikirim',
    status: 'submitted',
    createdAt: '2026-05-20T14:00:00',
    updatedAt: '2026-05-20T14:00:00',
    priority: 'medium',
    evidenceFiles: ['bukti_transfer.jpg', 'chat_penjual.pdf'],
    timeline: [
      { status: 'Laporan dikirim', timestamp: '2026-05-20T14:00:00' }
    ]
  }
];

export const mockLetterRequests: LetterRequest[] = [
  {
    id: 'L001',
    requestNumber: 'SKCK/001/V/2026',
    requesterName: 'Budi Santoso',
    requesterNIK: '3201012345678901',
    letterType: 'SKCK',
    purpose: 'Melamar pekerjaan',
    status: 'ready',
    createdAt: '2026-05-15T10:00:00',
    pickupDate: '2026-05-22T00:00:00'
  },
  {
    id: 'L002',
    requestNumber: 'SKH/002/V/2026',
    requesterName: 'Budi Santoso',
    requesterNIK: '3201012345678901',
    letterType: 'Surat Keterangan Kehilangan',
    purpose: 'Penggantian SIM',
    status: 'verified',
    createdAt: '2026-05-18T14:00:00'
  }
];

export const getStatusBadgeColor = (status: ReportStatus | LetterStatus): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'submitted':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'verified':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'assigned':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'processing':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'ready':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getStatusLabel = (status: ReportStatus | LetterStatus): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Dikirim';
    case 'verified':
      return 'Diverifikasi';
    case 'assigned':
      return 'Ditugaskan';
    case 'processing':
      return 'Diproses';
    case 'ready':
      return 'Siap Diambil';
    case 'completed':
      return 'Selesai';
    case 'rejected':
      return 'Ditolak';
    default:
      return status;
  }
};
