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
import { mockReports, getStatusBadgeColor, getStatusLabel, Report, ReportStatus } from '../data/mockData';
import { mockOfficers, Officer } from '../data/officers';
import { Shield, UserX, RefreshCw, AlertTriangle, Search, Users, FileText, Ban } from 'lucide-react';
import { toast } from 'sonner';

export const AdminControl: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ReportStatus>('verified');
  const [reassignOfficer, setReassignOfficer] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);

  const filteredReports = mockReports.filter(report =>
    report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.caseType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOverrideStatus = () => {
    if (!selectedReport || !overrideReason) {
      toast.error('Lengkapi form', {
        description: 'Alasan override wajib diisi'
      });
      return;
    }

    toast.success('Status berhasil di-override', {
      description: `Laporan ${selectedReport.reportNumber} diubah menjadi ${getStatusLabel(overrideStatus)}`
    });

    setShowOverrideDialog(false);
    setSelectedReport(null);
    setOverrideReason('');
  };

  const handleReassignOfficer = () => {
    if (!selectedReport || !reassignOfficer) {
      toast.error('Pilih petugas', {
        description: 'Pilih petugas yang akan ditugaskan'
      });
      return;
    }

    const officer = mockOfficers.find(o => o.id === reassignOfficer);
    toast.success('Berhasil reassign', {
      description: `Laporan ditugaskan ulang ke ${officer?.name}`
    });

    setShowReassignDialog(false);
    setSelectedReport(null);
    setReassignOfficer('');
  };

  const handleSuspendUser = (reportId: string) => {
    toast.warning('User suspended', {
      description: 'Akun pelapor telah ditangguhkan sementara'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Control Center</h1>
        <p className="text-blue-200 mt-1">Kontrol penuh sistem & override capabilities</p>
      </div>

      {/* Admin Powers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Override Status</h3>
                <p className="text-sm text-red-700">Ubah status laporan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-10 h-10 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">Reassign Officer</h3>
                <p className="text-sm text-orange-700">Tugaskan ulang petugas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <UserX className="w-10 h-10 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">Suspend User</h3>
                <p className="text-sm text-purple-700">Tangguhkan akun</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Cari laporan (nomor, nama, jenis kasus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* All Reports with Admin Actions */}
      <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Semua Laporan</CardTitle>
          <CardDescription className="text-blue-200">Kontrol penuh terhadap semua laporan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="border border-blue-600/50 rounded-xl p-4 hover:shadow-md hover:border-blue-500/50 transition-all bg-gradient-to-r from-white to-blue-50/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{report.reportNumber}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadgeColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.priority && (
                        <Badge variant={
                          report.priority === 'urgent' ? 'destructive' :
                          report.priority === 'high' ? 'default' :
                          'secondary'
                        }>
                          {report.priority.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-blue-200">
                      <div>
                        <FileText className="w-3 h-3 inline mr-1" />
                        {report.caseType}
                      </div>
                      <div>
                        <Users className="w-3 h-3 inline mr-1" />
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
                    <Shield className="w-3 h-3 mr-1" />
                    Override
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setReassignOfficer(report.assignedTo || '');
                      setShowReassignDialog(true);
                    }}
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reassign
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSuspendUser(report.id)}
                    className="text-blue-200 hover:bg-blue-800/50 hover:text-blue-100"
                  >
                    <Ban className="w-3 h-3 mr-1" />
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
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Override Status Laporan
            </DialogTitle>
            <DialogDescription>
              Anda akan mengubah status laporan {selectedReport?.reportNumber}
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>PERHATIAN:</strong> Override akan tercatat dalam audit log sistem.
              Pastikan Anda memiliki alasan yang valid.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status Saat Ini</Label>
              <div className={`px-3 py-2 rounded-lg border ${getStatusBadgeColor(selectedReport?.status || 'submitted')}`}>
                {getStatusLabel(selectedReport?.status || 'submitted')}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStatus">Status Baru *</Label>
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
              <Label htmlFor="reason">Alasan Override *</Label>
              <Textarea
                id="reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Jelaskan alasan override status..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleOverrideStatus} variant="destructive" className="flex-1">
                <Shield className="w-4 h-4 mr-2" />
                Konfirmasi Override
              </Button>
              <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
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
            <DialogTitle>Tugaskan Ulang Petugas</DialogTitle>
            <DialogDescription>
              Laporan {selectedReport?.reportNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedReport?.assignedTo && (
              <div className="bg-blue-800/50 border border-blue-600/50 p-3 rounded-lg">
                <p className="text-sm text-blue-200">Petugas Saat Ini:</p>
                <p className="font-medium">{selectedReport.assignedTo}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="officer">Pilih Petugas Baru *</Label>
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
                          <Badge variant={
                            officer.status === 'available' ? 'default' :
                            officer.status === 'busy' ? 'secondary' :
                            'outline'
                          } className="text-xs">
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
              <Button onClick={handleReassignOfficer} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tugaskan Ulang
              </Button>
              <Button variant="outline" onClick={() => setShowReassignDialog(false)}>
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
