import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import {
  MessageSquare,
  Send,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

type ComplaintStatus = 'submitted' | 'reviewing' | 'processing' | 'resolved' | 'closed';
type ComplaintCategory = 'pelayanan' | 'petugas' | 'fasilitas' | 'sistem' | 'lainnya';

interface Complaint {
  id: string;
  complaintNumber: string;
  submitterName: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  response?: string;
  responseDate?: string;
  files?: string[];
}

const mockComplaints: Complaint[] = [
  {
    id: '1',
    complaintNumber: 'ADU/001/V/2026',
    submitterName: 'Budi Santoso',
    category: 'pelayanan',
    subject: 'Proses laporan terlalu lama',
    description: 'Sudah 2 minggu laporan saya belum diproses',
    status: 'resolved',
    createdAt: '2026-05-10T10:00:00',
    updatedAt: '2026-05-18T14:30:00',
    response: 'Terima kasih atas masukannya. Laporan Anda telah kami proses dan selesai.',
    responseDate: '2026-05-18T14:30:00'
  },
  {
    id: '2',
    complaintNumber: 'ADU/002/V/2026',
    submitterName: 'Budi Santoso',
    category: 'sistem',
    subject: 'Error saat upload dokumen',
    description: 'Sistem error ketika saya mencoba upload file PDF',
    status: 'processing',
    createdAt: '2026-05-15T09:00:00',
    updatedAt: '2026-05-16T11:00:00',
    response: 'Sedang dalam penanganan tim teknis kami.'
  }
];

const complaintCategories = [
  { value: 'pelayanan', label: 'Pelayanan' },
  { value: 'petugas', label: 'Petugas' },
  { value: 'fasilitas', label: 'Fasilitas' },
  { value: 'sistem', label: 'Sistem/Aplikasi' },
  { value: 'lainnya', label: 'Lainnya' }
];

const getStatusColor = (status: ComplaintStatus): string => {
  switch (status) {
    case 'submitted':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'reviewing':
      return 'bg-blue-100 text-blue-800 border-blue-500/50';
    case 'processing':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusLabel = (status: ComplaintStatus): string => {
  switch (status) {
    case 'submitted':
      return 'Terkirim';
    case 'reviewing':
      return 'Ditinjau';
    case 'processing':
      return 'Diproses';
    case 'resolved':
      return 'Selesai';
    case 'closed':
      return 'Ditutup';
    default:
      return status;
  }
};

export const Complaints: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    category: '' as ComplaintCategory | '',
    subject: '',
    description: '',
    files: [] as File[]
  });

  const userComplaints = mockComplaints;

  const filteredComplaints = userComplaints.filter(complaint =>
    complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pengaduan berhasil dikirim!', {
      description: 'Tim kami akan segera menindaklanjuti pengaduan Anda'
    });
    setShowForm(false);
    setFormData({ category: '', subject: '', description: '', files: [] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, files: Array.from(e.target.files!) }));
    }
  };

  const stats = [
    {
      label: 'Total Pengaduan',
      value: userComplaints.length,
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      color: 'bg-blue-900/50'
    },
    {
      label: 'Sedang Diproses',
      value: userComplaints.filter(c => c.status === 'processing' || c.status === 'reviewing').length,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      color: 'bg-yellow-50'
    },
    {
      label: 'Selesai',
      value: userComplaints.filter(c => c.status === 'resolved').length,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      color: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pengaduan</h1>
          <p className="text-blue-200 mt-1">Sampaikan keluhan dan saran Anda</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
        >
          <Send className="w-4 h-4 mr-2" />
          Buat Pengaduan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Cari pengaduan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400 focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Complaint List */}
      <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Daftar Pengaduan</CardTitle>
          <CardDescription className="text-blue-200">Riwayat pengaduan yang telah diajukan</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-blue-200 mx-auto mb-4" />
              <p className="text-blue-400 mb-4">Belum ada pengaduan</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100"
              >
                Buat Pengaduan Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="border border-blue-600/50 rounded-xl p-4 hover:shadow-md hover:border-blue-500/50 transition-all bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{complaint.complaintNumber}</h3>
                      <p className="text-sm text-blue-200 mt-1">{complaint.subject}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(complaint.status)}`}>
                      {getStatusLabel(complaint.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-blue-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(complaint.createdAt).toLocaleDateString('id-ID')}
                    </span>
                    <Badge variant="outline">{complaintCategories.find(c => c.value === complaint.category)?.label}</Badge>
                  </div>
                  {complaint.status === 'resolved' && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Pengaduan telah ditanggapi
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Pengaduan Baru</DialogTitle>
            <DialogDescription>
              Sampaikan keluhan atau saran Anda terkait layanan SPKT
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pengaduan akan ditanggapi dalam waktu maksimal 3x24 jam pada hari kerja.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-blue-200" htmlFor="category">Kategori Pengaduan *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ComplaintCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {complaintCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-200" htmlFor="subject">Subjek Pengaduan *</Label>
              <Input className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ringkasan singkat pengaduan Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-200" htmlFor="description">Detail Pengaduan *</Label>
              <Textarea className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan secara detail pengaduan Anda..."
                rows={6}
                required
              />
              <p className="text-xs text-blue-300">
                Berikan informasi selengkap mungkin agar kami dapat menangani dengan baik
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-200" htmlFor="files">Lampiran (Opsional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <Label htmlFor="files" className="text-blue-200 cursor-pointer">
                  <span className="text-sm text-blue-200">Upload bukti pendukung</span>
                  <p className="text-xs text-blue-300 mt-1">PNG, JPG, PDF maksimal 5MB</p>
                </Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {formData.files.length > 0 && (
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-800/50 border border-blue-600/50 rounded">
                      <span className="text-sm text-blue-100">{file.name}</span>
                      <span className="text-xs text-blue-300">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
              >
                <Send className="w-4 h-4 mr-2" />
                Kirim Pengaduan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100"
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur max-w-3xl">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedComplaint.complaintNumber}</DialogTitle>
                    <DialogDescription className="mt-2">
                      Dibuat pada {new Date(selectedComplaint.createdAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </DialogDescription>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(selectedComplaint.status)}`}>
                    {getStatusLabel(selectedComplaint.status)}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Detail */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Detail Pengaduan</h3>
                  <div className="bg-blue-800/50 border border-blue-600/50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm text-blue-200">Kategori</span>
                      <p className="font-medium">
                        {complaintCategories.find(c => c.value === selectedComplaint.category)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-blue-200">Subjek</span>
                      <p className="font-medium">{selectedComplaint.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm text-blue-200">Deskripsi</span>
                      <p className="text-white mt-1 leading-relaxed">{selectedComplaint.description}</p>
                    </div>
                  </div>
                </div>

                {/* Files */}
                {selectedComplaint.files && selectedComplaint.files.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Lampiran</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedComplaint.files.map((file, index) => (
                        <div key={index} className="border rounded-lg p-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-200" />
                          <span className="text-sm text-blue-100">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response */}
                {selectedComplaint.response && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-1">Tanggapan</h4>
                        <p className="text-sm text-green-800 mb-2">{selectedComplaint.response}</p>
                        {selectedComplaint.responseDate && (
                          <p className="text-xs text-green-700">
                            Ditanggapi pada {new Date(selectedComplaint.responseDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!selectedComplaint.response && selectedComplaint.status !== 'closed' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Pengaduan Anda sedang ditinjau oleh tim kami. Anda akan menerima notifikasi
                      saat ada update.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
