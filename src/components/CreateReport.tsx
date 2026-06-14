import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { FileUploadZone } from './FileUploadZone';
import { useAuth } from '@/contexts/AuthContext';
import { caseTypes } from '@/lib/data/mockData';
import { spktApi } from '@/lib/spktApi';
import { CheckCircle2, MapPin, FileText } from 'lucide-react';
import { DatePickerField } from '@/components/DatePickerField';
import { toast } from 'sonner';

interface CreateReportProps {
  onNavigate: (view: string) => void;
  draftId?: string | null;
  onDraftConsumed?: () => void;
}

export const CreateReport: React.FC<CreateReportProps> = ({ onNavigate, draftId, onDraftConsumed }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    nik: user?.nik || '',
    phone: user?.phone || '',
    caseType: '',
    incidentDate: '',
    location: '',
    description: '',
    files: [] as File[]
  });
  const [submitted, setSubmitted] = useState(false);
  const [reportNumber, setReportNumber] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [existingEvidenceFiles, setExistingEvidenceFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!draftId) return;
    spktApi.getReport(draftId).then(({ report }) => {
      if (report.status !== 'draft') return;
      setEditingDraftId(draftId);
      setExistingEvidenceFiles(report.evidenceFiles ?? []);
      setFormData({
        name: report.reporterName,
        nik: report.reporterNIK,
        phone: report.reporterPhone,
        caseType: report.caseType,
        incidentDate: report.incidentDate,
        location: report.location,
        description: report.description,
        files: [],
      });
      onDraftConsumed?.();
    }).catch(() => {});
  }, [draftId, onDraftConsumed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let evidenceFiles: string[] = [...existingEvidenceFiles];
      if (formData.files.length > 0) {
        const { files: uploaded } = await spktApi.uploadFiles(formData.files);
        evidenceFiles = [...evidenceFiles, ...uploaded.map((f) => f.storedName)];
      }

      const { report } = editingDraftId
        ? await spktApi.updateUserReport(editingDraftId, {
            caseType: formData.caseType,
            incidentDate: formData.incidentDate,
            location: formData.location,
            description: formData.description,
            reporterPhone: formData.phone,
            evidenceFiles,
            submit: true,
          })
        : await spktApi.createReport({
            reporterUserId: user?.id,
            reporterName: formData.name,
            reporterNIK: formData.nik,
            reporterPhone: formData.phone,
            caseType: formData.caseType,
            incidentDate: formData.incidentDate,
            location: formData.location,
            description: formData.description,
            evidenceFiles,
          });

      setReportNumber(report.reportNumber);
      setSubmitted(true);
      toast.success('Laporan berhasil dikirim!', {
        description: 'Tim kami akan segera memproses laporan Anda',
      });
    } catch (err) {
      toast.error('Gagal mengirim laporan', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      let evidenceFiles: string[] = [...existingEvidenceFiles];
      if (formData.files.length > 0) {
        const { files: uploaded } = await spktApi.uploadFiles(formData.files);
        evidenceFiles = [...evidenceFiles, ...uploaded.map((f) => f.storedName)];
      }

      if (editingDraftId) {
        await spktApi.updateUserReport(editingDraftId, {
          caseType: formData.caseType || 'Lainnya',
          incidentDate: formData.incidentDate || new Date().toISOString().slice(0, 10),
          location: formData.location || '-',
          description: formData.description || 'Draft laporan',
          reporterPhone: formData.phone,
          evidenceFiles,
        });
      } else {
        const { report } = await spktApi.createReport({
          reporterUserId: user?.id,
          reporterName: formData.name,
          reporterNIK: formData.nik,
          reporterPhone: formData.phone,
          caseType: formData.caseType || 'Lainnya',
          incidentDate: formData.incidentDate || new Date().toISOString().slice(0, 10),
          location: formData.location || '-',
          description: formData.description || 'Draft laporan',
          status: 'draft',
          evidenceFiles,
        });
        setEditingDraftId(report.id);
      }
      toast.success('Draft tersimpan', {
        description: 'Anda dapat melanjutkan nanti',
      });
    } catch (err) {
      toast.error('Gagal menyimpan draft', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    }
  };

  if (submitted) {
    return (
      <div className="w-full">
        <Card className="border-green-500/50 bg-gradient-to-br from-green-900/80 to-green-800/80 shadow-lg backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <CheckCircle2 className="w-10 h-10 text-emerald-100" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Laporan Berhasil Dikirim!</h2>
              <p className="text-green-100 mb-1">Nomor Laporan: <strong>{reportNumber}</strong></p>
              <p className="text-sm text-green-200 mb-6">
                Laporan Anda telah diterima dan akan segera diproses oleh petugas kami.
                Anda dapat melacak status laporan melalui nomor laporan di atas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => onNavigate('my-reports')}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                >
                  Lihat Laporan Saya
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('dashboard')}
                  className="w-full sm:w-auto border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100"
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Buat Laporan</h1>
        <p className="text-blue-200 mt-1">Laporkan kejadian yang Anda alami</p>
      </div>

      <Alert className="bg-blue-900/50 border-blue-500/50">
        <FileText className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-100">
          Pastikan semua informasi yang Anda berikan akurat dan lengkap.
          Laporan palsu dapat dikenakan sanksi hukum.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Pelapor */}
        <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Data Pelapor</CardTitle>
            <CardDescription className="text-blue-200">Informasi identitas pelapor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-200">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik" className="text-blue-200">NIK *</Label>
                <Input
                  id="nik"
                  value={formData.nik}
                  onChange={(e) => handleInputChange('nik', e.target.value)}
                  className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                  maxLength={16}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-blue-200">Nomor Telepon *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Kejadian */}
        <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Data Kejadian</CardTitle>
            <CardDescription className="text-blue-200">Detail kejadian yang dilaporkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caseType" className="text-blue-200">Jenis Kasus *</Label>
              <Select value={formData.caseType} onValueChange={(value) => handleInputChange('caseType', value)}>
                <SelectTrigger className="bg-blue-900/50 border-blue-500/50 text-white">
                  <SelectValue placeholder="Pilih jenis kasus" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 border-blue-500/50">
                  {caseTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-white hover:bg-blue-800">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incidentDate" className="text-blue-200">Tanggal Kejadian *</Label>
                <DatePickerField
                  id="incidentDate"
                  value={formData.incidentDate}
                  onChange={(v) => handleInputChange('incidentDate', v)}
                  placeholder="Pilih tanggal kejadian"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-blue-200">Lokasi Kejadian *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                    placeholder="Alamat lengkap"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-blue-200">Kronologi Kejadian *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                placeholder="Jelaskan kronologi kejadian secara detail..."
                rows={6}
                required
              />
              <p className="text-xs text-blue-300">
                Minimal 50 karakter. Jelaskan sejelas mungkin apa yang terjadi.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Bukti */}
        <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Upload Bukti</CardTitle>
            <CardDescription className="text-blue-200">Foto, video, atau dokumen pendukung (opsional)</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              files={formData.files}
              onFilesChange={(files) => setFormData((prev) => ({ ...prev, files }))}
              existingStoredFiles={existingEvidenceFiles}
              onExistingFilesChange={setExistingEvidenceFiles}
              subHint="PNG, JPG, PDF hingga 10MB (Maksimal 5 file)"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md [&_svg]:text-sky-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            Kirim Laporan
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white shadow-md"
          >
            Simpan Draft
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};
