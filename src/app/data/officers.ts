// Database: officers table
export interface Officer {
  id: string;
  name: string;
  rank: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  assignedCases: number;
  completedCases: number;
}

export const mockOfficers: Officer[] = [
  {
    id: 'OFF001',
    name: 'Ipda. Ahmad Wijaya',
    rank: 'Inspektur Polisi Dua',
    email: 'petugas@spkt.id',
    phone: '081234567890',
    status: 'busy',
    assignedCases: 3,
    completedCases: 45
  },
  {
    id: 'OFF002',
    name: 'Bripka. Andi Pratama',
    rank: 'Brigadir Polisi Kepala',
    email: 'andi.pratama@spkt.id',
    phone: '081234567891',
    status: 'available',
    assignedCases: 1,
    completedCases: 38
  },
  {
    id: 'OFF003',
    name: 'Aipda. Rini Kusuma',
    rank: 'Ajun Inspektur Polisi Dua',
    email: 'rini.kusuma@spkt.id',
    phone: '081234567892',
    status: 'available',
    assignedCases: 2,
    completedCases: 52
  },
  {
    id: 'OFF004',
    name: 'Briptu. Dedi Saputra',
    rank: 'Brigadir Polisi Satu',
    email: 'dedi.saputra@spkt.id',
    phone: '081234567893',
    status: 'offline',
    assignedCases: 0,
    completedCases: 21
  }
];
