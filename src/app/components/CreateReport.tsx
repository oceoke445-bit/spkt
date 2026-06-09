import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { caseTypes } from '../data/mockData';
import { CheckCircle2, Upload, MapPin, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CreateReportProps {
  onNavigate: (view: string) => void;
}

export const CreateReport: React.FC<CreateReportProps> = ({ onNavigate }) => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, files: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Laporan berhasil dikirim!', {
        description: 'Tim kami akan segera memproses laporan Anda'
      });
    }, 1000);
  };

  const handleSaveDraft = () => {
    toast.success('Draft tersimpan', {
      description: 'Anda dapat melanjutkan nanti'
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-500/50 bg-gradient-to-br from-green-900/80 to-green-800/80 shadow-lg backdrop-blur">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Laporan Berhasil Dikirim!</h2>
            <p className="text-green-100 mb-1">Nomor Laporan: <strong>LP/004/V/2026</strong></p>
            <p className="text-sm text-green-200 mb-6">
              Laporan Anda telah diterima dan akan segera diproses oleh petugas kami.
              Anda dapat melacak status laporan melalui nomor laporan di atas.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => onNavigate('my-reports')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
              >
                Lihat Laporan Saya
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('dashboard')}
                className="border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100"
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Buat Laporan</h1>
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
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                    className="pl-10 bg-blue-900/50 border-blue-500/50 text-white"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
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
            <div className="border-2 border-dashed border-blue-500/50 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-blue-800/30">
              <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <Label htmlFor="files" className="cursor-pointer">
                <span className="text-sm text-blue-200">
                  Klik untuk upload atau drag & drop
                </span>
                <p className="text-xs text-blue-300 mt-1">
                  PNG, JPG, PDF hingga 10MB (Maksimal 5 file)
                </p>
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
              <div className="mt-3 space-y-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-800/50 rounded border border-blue-600/50">
                    <span className="text-sm text-blue-100">{file.name}</span>
                    <span className="text-xs text-blue-300">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
          >
            <FileText className="w-4 h-4 mr-2" />
            Kirim Laporan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleSaveDraft}
            className="border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:text-blue-100"
          >
            Simpan Draft
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => onNavigate('dashboard')}
            className="text-blue-300 hover:bg-blue-700/50 hover:text-blue-100"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};
