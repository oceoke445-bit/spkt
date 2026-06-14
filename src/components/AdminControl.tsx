import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { getStatusBadgeColor, getStatusLabel, Report, ReportStatus } from '@/lib/data/mockData';
import { spktApi } from '@/lib/spktApi';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/hooks/useReports';
import { useOfficers } from '@/hooks/useOfficers';
import type { Officer } from '@/lib/types/spkt';
import { Shield, UserX, RefreshCw, AlertTriangle, Search, Users, FileText, Ban } from 'lucide-react';
import { toast } from 'sonner';

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';
const reportItemClass =
  'border border-blue-600/50 rounded-xl p-4 hover:shadow-lg hover:border-blue-400 transition-all bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur';

export const AdminControl: React.FC = () => {
  const { user } = useAuth();
  const { reports: allReports, loading, refresh } = useReports();
  const { officers: mockOfficers } = useOfficers();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ReportStatus>('verified');
  const [reassignOfficer, setReassignOfficer] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);

  const filteredReports = allReports.filter(report =>
    report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.caseType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOverrideStatus = async () => {
    if (!selectedReport || !overrideReason) {
      toast.error('Lengkapi form', {
        description: 'Alasan override wajib diisi',
      });
      return;
    }

    try {
      await spktApi.updateReport(selectedReport.id, {
        status: overrideStatus,
        notes: overrideReason,
        timelineNote: overrideReason,
        timelineOfficer: user?.name,
        adminOverride: true,
      });
      await refresh();
      toast.success('Status berhasil di-override', {
        description: `Laporan ${selectedReport.reportNumber} diubah menjadi ${getStatusLabel(overrideStatus)}`,
      });
      setShowOverrideDialog(false);
      setSelectedReport(null);
      setOverrideReason('');
    } catch (err) {
      toast.error('Gagal mengubah status', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    }
  };

  const handleReassignOfficer = async () => {
    if (!selectedReport || !reassignOfficer) {
      toast.error('Pilih petugas', {
        description: 'Pilih petugas yang akan ditugaskan',
      });
      return;
    }

    const officer = mockOfficers.find(o => o.id === reassignOfficer);
    if (!officer) return;

    try {
      await spktApi.updateReport(selectedReport.id, {
        status: 'assigned',
        assignedTo: officer.name,
        assignedBy: user?.name,
        timelineNote: `Reassigned to ${officer.name}`,
        timelineOfficer: user?.name,
      });
      await refresh();
      toast.success('Berhasil reassign', {
        description: `Laporan ditugaskan ulang ke ${officer.name}`,
      });
      setShowReassignDialog(false);
      setSelectedReport(null);
      setReassignOfficer('');
    } catch (err) {
      toast.error('Gagal reassign', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    }
  };

  const handleSuspendUser = async (report: Report) => {
    try {
      await spktApi.suspendUserByNik(report.reporterNIK);
      toast.warning('User dinonaktifkan', {
        description: `Akun pelapor ${report.reporterName} telah ditangguhkan`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menonaktifkan user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Control Center</h1>
        <p className="text-blue-200 mt-1">Kontrol penuh sistem & override capabilities</p>
      </div>

      {loading && (
        <div className="text-center py-8 text-blue-300">Memuat data...</div>
      )}

      {!loading && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-900/50 to-blue-900/80 border-red-500/40 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Shield className="w-8 h-8 text-red-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Override Status</h3>
                <p className="text-sm text-blue-200">Ubah status laporan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/50 to-blue-900/80 border-amber-500/40 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <RefreshCw className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Reassign Officer</h3>
                <p className="text-sm text-blue-200">Tugaskan ulang petugas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/80 border-purple-500/40 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <UserX className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Suspend User</h3>
                <p className="text-sm text-blue-200">Tangguhkan akun</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className={cardClass}>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Cari laporan (nomor, nama, jenis kasus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400 focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* All Reports with Admin Actions */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-white">Semua Laporan</CardTitle>
          <CardDescription className="text-blue-200">Kontrol penuh terhadap semua laporan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div key={report.id} className={reportItemClass}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{report.reportNumber}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadgeColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.priority && (
                        <Badge
                          className={
                            report.priority === 'urgent'
                              ? 'bg-red-500/30 text-red-200 border border-red-400/50'
                              : report.priority === 'high'
                                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50'
                                : 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                          }
                        >
                          {report.priority.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-blue-200">
                      <div>
                        <FileText className="w-3 h-3 inline mr-1 text-sky-300" />
                        {report.caseType}
                      </div>
                      <div>
                        <Users className="w-3 h-3 inline mr-1 text-cyan-300" />
                        {report.reporterName}
                      </div>
                      {report.assignedTo && (
                        <div>
                          Petugas: <span className="font-medium">{report.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-600/50">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedReport(report);
                      setOverrideStatus(report.status);
                      setShowOverrideDialog(true);
                    }}
                    className="shadow-sm"
                  >
                    <Shield className="w-3 h-3 mr-1 text-rose-300" />
                    Override
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedReport(report);
                      setReassignOfficer(report.assignedTo || '');
                      setShowReassignDialog(true);
                    }}
                    className="bg-sky-500 hover:bg-sky-600 text-white border border-sky-400/50 shadow-sm [&_svg]:text-sky-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1 text-amber-300" />
                    Reassign
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuspendUser(report)}
                    className="border border-rose-500/50 bg-rose-900/30 text-rose-300 hover:bg-rose-900/50 hover:text-rose-100 hover:border-rose-400/60 shadow-sm"
                  >
                    <Ban className="w-3 h-3 mr-1 text-rose-300" />
                    Suspend User
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Override Status Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-400">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              Override Status Laporan
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Anda akan mengubah status laporan {selectedReport?.reportNumber}
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="bg-red-900/40 border-red-500/50 text-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>PERHATIAN:</strong> Override akan tercatat dalam audit log sistem.
              Pastikan Anda memiliki alasan yang valid.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-blue-200">Status Saat Ini</Label>
              <div className={`px-3 py-2 rounded-lg border ${getStatusBadgeColor(selectedReport?.status || 'submitted')}`}>
                {getStatusLabel(selectedReport?.status || 'submitted')}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-200" htmlFor="newStatus">Status Baru *</Label>
              <Select value={overrideStatus} onValueChange={(value) => setOverrideStatus(value as ReportStatus)}>
                <SelectTrigger className="bg-blue-900/50 border-blue-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 border-blue-500/50">
                  <SelectItem className="text-white hover:bg-blue-800" value="submitted">Dikirim</SelectItem>
                  <SelectItem className="text-white hover:bg-blue-800" value="verified">Diverifikasi</SelectItem>
                  <SelectItem className="text-white hover:bg-blue-800" value="assigned">Ditugaskan</SelectItem>
                  <SelectItem className="text-white hover:bg-blue-800" value="processing">Diproses</SelectItem>
                  <SelectItem className="text-white hover:bg-blue-800" value="completed">Selesai</SelectItem>
                  <SelectItem className="text-white hover:bg-blue-800" value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-200" htmlFor="reason">Alasan Override *</Label>
              <Textarea
                id="reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Jelaskan alasan override status..."
                rows={4}
                required
                className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleOverrideStatus} variant="destructive" className="flex-1">
                <Shield className="w-4 h-4 mr-2 text-rose-200" />
                Konfirmasi Override
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowOverrideDialog(false)}
                className="border-blue-500/50 text-blue-200 hover:bg-blue-800/50 hover:text-white"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Officer Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">Tugaskan Ulang Petugas</DialogTitle>
            <DialogDescription className="text-blue-200">
              Laporan {selectedReport?.reportNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedReport?.assignedTo && (
              <div className="bg-blue-800/50 border border-blue-600/50 p-3 rounded-lg">
                <p className="text-sm text-blue-200">Petugas Saat Ini:</p>
                <p className="font-medium text-white">{selectedReport.assignedTo}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-blue-200" htmlFor="officer">Pilih Petugas Baru *</Label>
              <Select value={reassignOfficer} onValueChange={setReassignOfficer}>
                <SelectTrigger className="bg-blue-900/50 border-blue-500/50 text-white">
                  <SelectValue placeholder="Pilih petugas..." />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 border-blue-500/50">
                  {mockOfficers.map((officer) => (
                    <SelectItem className="text-white hover:bg-blue-800" key={officer.id} value={officer.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{officer.name}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge
                            className={
                              officer.status === 'available'
                                ? 'bg-green-500/30 text-green-200 border border-green-400/50 text-xs'
                                : officer.status === 'busy'
                                  ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 text-xs'
                                  : 'bg-gray-500/30 text-gray-200 border border-gray-400/50 text-xs'
                            }
                          >
                            {officer.status}
                          </Badge>
                          <span className="text-xs text-blue-300">
                            {officer.assignedCases} cases
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleReassignOfficer}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2 text-sky-200" />
                Tugaskan Ulang
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReassignDialog(false)}
                className="border-blue-500/50 text-blue-200 hover:bg-blue-800/50 hover:text-white"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
};
