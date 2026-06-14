import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getStatusBadgeColor, getStatusLabel, Report, ReportStatus } from '@/lib/data/mockData';
import { spktApi } from '@/lib/spktApi';
import { spktDialogClass } from '@/lib/spktDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/hooks/useReports';
import { Inbox, Clock, CheckCircle2, AlertCircle, FileText, User, MapPin, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { reports: incomingReports, loading, refresh } = useReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [newStatus, setNewStatus] = useState<ReportStatus>('completed');

  const officerName = user?.name ?? '';
  const myReports = incomingReports.filter((r) => r.assignedTo === officerName);

  const unassignedReports = incomingReports.filter(
    (r) => (r.status === 'submitted' || r.status === 'verified') && !r.assignedTo,
  );
  const assignedToMe = myReports.filter((r) => r.status !== 'completed' && r.status !== 'rejected');

  const actionableReports = incomingReports.filter(
    (r) =>
      r.status !== 'draft' &&
      r.status !== 'completed' &&
      r.status !== 'rejected' &&
      (!r.assignedTo || r.assignedTo === officerName),
  );

  const stats = [
    {
      title: 'Belum Ditugaskan',
      value: unassignedReports.length,
      icon: <Inbox className="w-6 h-6 text-sky-300" />,
      bgColor: 'bg-sky-500/20'
    },
    {
      title: 'Ditugaskan ke Saya',
      value: assignedToMe.length,
      icon: <User className="w-6 h-6 text-indigo-300" />,
      bgColor: 'bg-indigo-500/20'
    },
    {
      title: 'Sedang Diproses',
      value: myReports.filter(r => r.status === 'processing').length,
      icon: <Clock className="w-6 h-6 text-amber-300" />,
      bgColor: 'bg-amber-500/20'
    },
    {
      title: 'Selesai Hari Ini',
      value: myReports.filter(r => r.status === 'completed').length,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-300" />,
      bgColor: 'bg-emerald-500/20'
    }
  ];

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;

    try {
      await spktApi.updateReport(selectedReport.id, {
        status: newStatus,
        timelineNote: actionNote || undefined,
        timelineOfficer: user?.name,
      });
      await refresh();
      toast.success('Status laporan diperbarui', {
        description: `Status diubah menjadi ${getStatusLabel(newStatus)}`,
      });
      setSelectedReport(null);
      setActionNote('');
    } catch (err) {
      toast.error('Gagal memperbarui status', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    }
  };

  const handleVerify = async () => {
    if (!selectedReport) return;

    try {
      await spktApi.updateReport(selectedReport.id, {
        status: 'verified',
        timelineNote: actionNote || undefined,
        timelineOfficer: user?.name,
      });
      await refresh();
      toast.success('Laporan diverifikasi');
      setSelectedReport(null);
      setActionNote('');
    } catch (err) {
      toast.error('Gagal memverifikasi laporan', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedReport || !user) return;

    try {
      await spktApi.updateReport(selectedReport.id, {
        status: 'assigned',
        assignedTo: user.name,
        assignedBy: user.name,
        timelineNote: actionNote || undefined,
        timelineOfficer: user.name,
      });
      await refresh();
      toast.success('Laporan ditugaskan', {
        description: `Laporan ${selectedReport.reportNumber} telah ditugaskan kepada Anda`,
      });
      setSelectedReport(null);
      setActionNote('');
    } catch (err) {
      toast.error('Gagal menugaskan laporan', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    }
  };

  const handleStartProcessing = async () => {
    if (!selectedReport) return;

    try {
      await spktApi.updateReport(selectedReport.id, {
        status: 'processing',
        timelineNote: actionNote || undefined,
        timelineOfficer: user?.name,
      });
      await refresh();
      toast.success('Mulai memproses', {
        description: 'Status diubah menjadi "Diproses"',
      });
      setSelectedReport(null);
      setActionNote('');
    } catch (err) {
      toast.error('Gagal memproses laporan', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Petugas</h1>
        <p className="text-blue-200 mt-1">Kelola dan proses laporan masyarakat</p>
      </div>

      {loading && (
        <div className="text-center py-8 text-blue-300">Memuat laporan...</div>
      )}

      {!loading && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-blue-200 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incoming Reports */}
      <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Laporan Masuk</CardTitle>
          <CardDescription className="text-blue-200">Laporan yang perlu ditindaklanjuti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionableReports.length === 0 ? (
              <p className="text-center py-8 text-blue-300">Tidak ada laporan yang perlu ditindaklanjuti</p>
            ) : (
            actionableReports.map((report) => (
              <div
                key={report.id}
                className="border border-blue-600/50 rounded-xl p-4 hover:shadow-lg hover:border-blue-400 transition-all bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{report.reportNumber}</h3>
                    <p className="text-sm text-blue-200 mt-1">{report.reporterName}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadgeColor(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-200">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {report.caseType}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-200">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {report.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-200">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {new Date(report.incidentDate).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-600/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  {report.assignedTo ? (
                    <p className="text-xs text-blue-300">
                      Ditugaskan ke: <span className="font-medium">{report.assignedTo}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-blue-300">Belum ditugaskan</p>
                  )}
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Lihat Detail
                  </Button>
                </div>
              </div>
            ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className={spktDialogClass('4xl')}>
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="pr-8">
                  <DialogTitle className="text-2xl text-white">{selectedReport.reportNumber}</DialogTitle>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <p className="text-sm text-blue-200">
                      Dibuat: {new Date(selectedReport.createdAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <span className={`px-3 py-1 text-sm rounded-full border ${getStatusBadgeColor(selectedReport.status)}`}>
                      {getStatusLabel(selectedReport.status)}
                    </span>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Reporter Data */}
                <div className="bg-blue-800/50 border border-blue-600/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Data Pelapor</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-200">Nama:</span>
                      <p className="font-medium">{selectedReport.reporterName}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">NIK:</span>
                      <p className="font-medium">{selectedReport.reporterNIK}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Telepon:</span>
                      <p className="font-medium">{selectedReport.reporterPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Incident Details */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Detail Kejadian</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm text-blue-200">Jenis Kasus</span>
                        <p className="font-medium">{selectedReport.caseType}</p>
                      </div>
                      <div>
                        <span className="text-sm text-blue-200">Tanggal Kejadian</span>
                        <p className="font-medium">
                          {new Date(selectedReport.incidentDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-blue-200">Lokasi</span>
                      <p className="font-medium">{selectedReport.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-blue-200">Kronologi</span>
                      <p className="mt-1 text-white leading-relaxed">{selectedReport.description}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                {selectedReport.evidenceFiles && selectedReport.evidenceFiles.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Bukti Pendukung</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedReport.evidenceFiles.map((file) => (
                        <div
                          key={file}
                          className="border border-blue-500/40 rounded-lg p-3 flex items-center gap-2 bg-blue-900/40"
                        >
                          <FileText className="w-4 h-4 text-blue-200 shrink-0" />
                          <span className="text-sm truncate text-blue-100 flex-1">{file}</span>
                          <Button
                            size="sm"
                            className="shrink-0 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-0 shadow-md"
                            asChild
                          >
                            <a href={spktApi.getFileUrl(file)} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-3 h-3 mr-1 text-sky-100" />
                              Review
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment Info */}
                {selectedReport.assignedTo && (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Info Penugasan</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-indigo-300">Ditugaskan ke:</span>
                        <p className="font-medium text-white">{selectedReport.assignedTo}</p>
                      </div>
                      {selectedReport.assignedBy && (
                        <div>
                          <span className="text-indigo-300">Oleh:</span>
                          <p className="font-medium text-white">{selectedReport.assignedBy}</p>
                        </div>
                      )}
                      {selectedReport.assignedAt && (
                        <div>
                          <span className="text-indigo-300">Pada:</span>
                          <p className="font-medium text-white">
                            {new Date(selectedReport.assignedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      {selectedReport.priority && (
                        <div>
                          <span className="text-indigo-300">Prioritas:</span>
                          <p className={`font-medium ${
                            selectedReport.priority === 'urgent' ? 'text-red-400' :
                            selectedReport.priority === 'high' ? 'text-orange-400' :
                            selectedReport.priority === 'medium' ? 'text-amber-300' :
                            'text-emerald-400'
                          }`}>
                            {selectedReport.priority.toUpperCase()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-blue-600/50 pt-6">
                  <h3 className="font-semibold text-white mb-4">Tindakan</h3>

                  {/* Step 0: Verify submitted report */}
                  {selectedReport.status === 'submitted' && !selectedReport.assignedTo && (
                    <div className="space-y-4 mb-4">
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                        <p className="text-sm text-cyan-100 mb-3">
                          <strong className="text-cyan-200">Langkah 1:</strong> Verifikasi kelengkapan laporan sebelum ditugaskan.
                        </p>
                        <Button
                          onClick={handleVerify}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Verifikasi Laporan
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Assign (if not assigned) */}
                  {!selectedReport.assignedTo &&
                    (selectedReport.status === 'submitted' || selectedReport.status === 'verified') && (
                    <div className="space-y-4">
                      <div className="bg-blue-800/50 border border-blue-500/40 rounded-xl p-4">
                        <p className="text-sm text-blue-100 mb-3">
                          <strong className="text-sky-200">Langkah 2:</strong> Ambil laporan ini untuk memproses.
                        </p>
                        <Button
                          onClick={handleAssignToMe}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Ambil Laporan Ini
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Start Processing (if assigned to me) */}
                  {selectedReport.assignedTo === officerName &&
                   (selectedReport.status === 'assigned' || selectedReport.status === 'verified') && (
                    <div className="space-y-4">
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <p className="text-sm text-amber-100 mb-3">
                          <strong className="text-amber-200">Langkah 3:</strong> Mulai memproses laporan ini.
                        </p>
                        <div className="space-y-2 mb-3">
                          <Label htmlFor="note" className="text-blue-200">Catatan Awal</Label>
                          <Textarea
                            id="note"
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                            placeholder="Tambahkan catatan tindak lanjut..."
                            rows={3}
                            className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                          />
                        </div>
                        <Button
                          onClick={handleStartProcessing}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-md"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Mulai Proses
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Update Status (if processing) */}
                  {selectedReport.assignedTo === officerName && selectedReport.status === 'processing' && (
                    <div className="space-y-4">
                      <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 mb-4">
                        <p className="text-sm text-violet-100">
                          <strong className="text-violet-200">Langkah 4:</strong> Update status laporan
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-blue-200">Status Baru</Label>
                        <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ReportStatus)}>
                          <SelectTrigger className="bg-blue-900/50 border-blue-500/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processing">Masih Diproses</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                            <SelectItem value="rejected">Tolak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="note" className="text-blue-200">Catatan</Label>
                        <Textarea
                          id="note"
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          placeholder="Tambahkan catatan tindak lanjut..."
                          rows={3}
                          className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                        />
                      </div>

                      <Button
                        onClick={handleUpdateStatus}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
                  )}

                  {/* If already completed */}
                  {selectedReport.status === 'completed' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-emerald-200">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <p className="text-sm font-medium">
                          Laporan ini sudah selesai diproses
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
};
