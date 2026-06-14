import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { getStatusBadgeColor, getStatusLabel, Report } from '@/lib/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/hooks/useReports';
import { Search, FileText, Calendar, MapPin, User, Phone, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { spktApi } from '@/lib/spktApi';
import { CsiPromptButton } from './CsiPromptButton';
import { useCsiEligibility } from '@/hooks/useCsiEligibility';

interface MyReportsProps {
  onContinueDraft?: (reportId: string) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({ onContinueDraft }) => {
  const { user } = useAuth();
  const { reports: userReports, loading } = useReports({ nik: user?.nik });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { eligible: csiEligible, checking: csiChecking, refresh: refreshCsi } = useCsiEligibility(
    'report',
    selectedReport?.reportNumber,
    selectedReport?.status === 'completed',
  );

  const filteredReports = userReports.filter(report => {
    const matchesSearch =
      report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.caseType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getTimelineIcon = (index: number, total: number) => {
    if (index < total - 1) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Laporan Saya</h1>
        <p className="text-blue-200 mt-1">Kelola dan lacak status laporan Anda</p>
      </div>

      {loading && (
        <div className="text-center py-8 text-blue-300">Memuat laporan...</div>
      )}

      {!loading && (
      <>
      {/* Search and Filter */}
      <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
              <Input
                placeholder="Cari nomor laporan atau jenis kasus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400 focus:border-blue-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md' : 'border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100'}
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('processing')}
                className={filterStatus === 'processing' ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md' : 'border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100'}
              >
                Proses
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
                className={filterStatus === 'completed' ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md' : 'border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100'}
              >
                Selesai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Daftar Laporan</CardTitle>
          <CardDescription className="text-blue-200">Total {filteredReports.length} laporan</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-blue-500/30 mx-auto mb-4" />
              <p className="text-blue-300">Tidak ada laporan ditemukan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-blue-600/50 rounded-xl p-4 hover:shadow-lg hover:border-blue-400 transition-all bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{report.reportNumber}</h3>
                      <p className="text-sm text-blue-100 font-medium mt-1">{report.caseType}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadgeColor(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-blue-200">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {new Date(report.incidentDate).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      {report.location.substring(0, 30)}...
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-500/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs text-blue-300">
                      Dibuat: {new Date(report.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <div className="flex gap-2">
                      {report.status === 'draft' && onContinueDraft && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-400/50 text-amber-200 hover:bg-amber-900/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            onContinueDraft(report.id);
                          }}
                        >
                          Lanjutkan Draft
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                      >
                      <FileText className="w-3 h-3 mr-1" />
                      Detail
                    </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-950/50 [&::-webkit-scrollbar-thumb]:bg-blue-500/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-400">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl text-white">{selectedReport.reportNumber}</DialogTitle>
                    <DialogDescription className="mt-2 text-blue-200">
                      Dibuat pada {new Date(selectedReport.createdAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </DialogDescription>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full border ${getStatusBadgeColor(selectedReport.status)}`}>
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Timeline */}
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Status Tracking
                  </h3>
                  <div className="relative">
                    {selectedReport.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="relative z-10 bg-blue-900">
                            {getTimelineIcon(index, selectedReport.timeline.length)}
                          </div>
                          {index < selectedReport.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-blue-600/50 -mt-1" />
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <div className="bg-blue-800/50 rounded-lg p-4 border border-blue-600/50">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-white">{event.status}</h4>
                              <span className="text-xs text-blue-300">
                                {new Date(event.timestamp).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {event.officer && (
                              <p className="text-sm text-blue-200">Oleh: {event.officer}</p>
                            )}
                            {event.note && (
                              <p className="text-sm text-blue-200 mt-2">{event.note}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Pelapor */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Data Pelapor</h3>
                  <div className="bg-blue-800/50 rounded-lg p-4 space-y-2 border border-blue-600/50">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-200">Nama:</span>
                      <span className="font-medium text-white">{selectedReport.reporterName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-200">NIK:</span>
                      <span className="font-medium text-white">{selectedReport.reporterNIK}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-200">Telepon:</span>
                      <span className="font-medium text-white">{selectedReport.reporterPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Detail Kejadian */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Detail Kejadian</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-blue-200">Jenis Kasus</label>
                      <p className="font-medium text-white">{selectedReport.caseType}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-blue-200">Tanggal Kejadian</label>
                        <p className="font-medium text-white">
                          {new Date(selectedReport.incidentDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-blue-200">Lokasi</label>
                        <p className="font-medium text-white">{selectedReport.location}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-blue-200">Kronologi</label>
                      <p className="mt-1 text-white leading-relaxed">{selectedReport.description}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence Files */}
                {selectedReport.evidenceFiles && selectedReport.evidenceFiles.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Bukti Pendukung</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedReport.evidenceFiles.map((file) => (
                        <a
                          key={file}
                          href={spktApi.getFileUrl(file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-blue-600/50 rounded-lg p-3 flex items-center gap-2 bg-blue-800/50 text-blue-100 hover:text-cyan-200"
                        >
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-sm truncate">{file}</span>
                          <ExternalLink className="w-3 h-3 ml-auto shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes from Officer */}
                {selectedReport.notes && (
                  <div className="bg-blue-900/50 border-2 border-blue-500/50 rounded-xl p-4 shadow-sm backdrop-blur">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white">Catatan Petugas</h4>
                        <p className="text-sm text-blue-100 mt-1">{selectedReport.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport.status === 'completed' && (
                  <CsiPromptButton
                    serviceType="report"
                    serviceLabel="Buat Laporan"
                    referenceId={selectedReport.reportNumber}
                    eligible={csiEligible}
                    checking={csiChecking}
                    onSubmitted={refreshCsi}
                  />
                )}
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
