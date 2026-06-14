import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { letterTypes, getStatusBadgeColor, getStatusLabel } from '@/lib/data/mockData';
import { spktApi } from '@/lib/spktApi';
import { useLetters } from '@/hooks/useLetters';
import { SatisfactionForm } from './SatisfactionForm';
import { FileUploadZone } from './FileUploadZone';
import { Mail, Calendar, FileText, CheckCircle2, ArrowLeft, User, Save, ExternalLink } from 'lucide-react';
import { IconBadge, letterTypeIcons } from './iconStyles';
import { toast } from 'sonner';
import type { LetterRequest, LetterStatus } from '@/lib/types/spkt';

type LetterType = typeof letterTypes[number];

const LETTER_STATUS_OPTIONS: LetterStatus[] = [
  'submitted',
  'verified',
  'ready',
  'completed',
  'rejected',
];

export const LetterService: React.FC = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'petugas' || user?.role === 'admin';
  const nikFilter = isStaff ? undefined : user?.nik;

  const [selectedLetter, setSelectedLetter] = useState<LetterType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [lastReference, setLastReference] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    nik: user?.nik || '',
    phone: user?.phone || '',
    purpose: '',
    pickupDate: '',
    documents: [] as File[]
  });

  const { letters: userLetters, refresh: refreshLetters } = useLetters(nikFilter);
  const [submitting, setSubmitting] = useState(false);
  const [managingLetter, setManagingLetter] = useState<LetterRequest | null>(null);
  const [staffStatus, setStaffStatus] = useState<LetterStatus>('submitted');
  const [staffPickupDate, setStaffPickupDate] = useState('');
  const [staffSaving, setStaffSaving] = useState(false);

  useEffect(() => {
    if (managingLetter) {
      setStaffStatus(managingLetter.status);
      setStaffPickupDate(managingLetter.pickupDate ?? '');
    }
  }, [managingLetter]);

  const handleSelectLetter = (letter: LetterType) => {
    setSelectedLetter(letter);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLetter) return;

    setSubmitting(true);
    try {
      let attachmentFiles: string[] = [];
      if (formData.documents.length > 0) {
        const { files } = await spktApi.uploadFiles(formData.documents);
        attachmentFiles = files.map((f) => f.storedName);
      }

      const { letter } = await spktApi.createLetter({
        requesterUserId: user?.id,
        requesterName: formData.name,
        requesterNIK: formData.nik,
        requesterPhone: formData.phone,
        letterTypeId: selectedLetter.id,
        letterTypeName: selectedLetter.name,
        purpose: formData.purpose,
        pickupDate: formData.pickupDate || undefined,
        attachmentFiles,
      });

      setLastReference(letter.requestNumber);
      await refreshLetters();
      toast.success('Pengajuan berhasil!', {
        description: 'Pengajuan surat Anda sedang diproses',
      });
      setShowForm(false);
      setSelectedLetter(null);
      setFormData((prev) => ({ ...prev, purpose: '', pickupDate: '', documents: [] }));
      setShowSatisfaction(true);
    } catch (err) {
      toast.error('Gagal mengajukan surat', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStaffSave = async () => {
    if (!managingLetter) return;

    setStaffSaving(true);
    try {
      const { letter } = await spktApi.updateLetter(managingLetter.id, {
        status: staffStatus,
        pickupDate: staffStatus === 'ready' ? staffPickupDate || null : managingLetter.pickupDate ?? null,
      });
      await refreshLetters();
      setManagingLetter(letter);
      toast.success('Status pengajuan diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui status', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    } finally {
      setStaffSaving(false);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Layanan Surat</h1>
        <p className="text-blue-200 mt-1">
          {isStaff ? 'Kelola pengajuan surat masyarakat' : 'Ajukan berbagai surat keterangan'}
        </p>
      </div>

      {/* Staff queue */}
      {isStaff && !showForm && (
        <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Antrian Pengajuan Surat</CardTitle>
            <CardDescription className="text-blue-200">
              Verifikasi dokumen, tandai siap diambil, dan selesaikan pengajuan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userLetters.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto mb-3 text-blue-500/30" />
                <p className="text-blue-300">Belum ada pengajuan surat</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="border border-blue-600/50 rounded-xl p-4 hover:bg-blue-700/30 hover:border-blue-400 transition-all bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur cursor-pointer"
                    onClick={() => setManagingLetter(letter)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{letter.requestNumber}</h4>
                        <p className="text-sm text-blue-200">{letter.letterType}</p>
                        <p className="text-xs text-blue-300 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {letter.requesterName} · NIK {letter.requesterNIK}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadgeColor(letter.status)}`}>
                        {getStatusLabel(letter.status)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-200 truncate">Keperluan: {letter.purpose}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Letter Cards — user only */}
      {!isStaff && !showForm && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {letterTypes.map((letter) => {
              const iconConfig = letterTypeIcons[letter.id];
              const LetterIcon = iconConfig?.icon;
              return (
              <Card
                key={letter.id}
                className="cursor-pointer hover:shadow-lg transition-all border-2 border-blue-600/50 hover:border-blue-400 bg-gradient-to-b from-blue-900/80 to-blue-800/80 backdrop-blur"
                onClick={() => handleSelectLetter(letter)}
              >
                <CardContent className="p-6 text-center">
                  {LetterIcon && (
                    <div className="mb-4 flex justify-center">
                      <IconBadge icon={LetterIcon} wrap={iconConfig.wrap} color={iconConfig.color} size="lg" />
                    </div>
                  )}
                  <h3 className="font-semibold text-white mb-2">{letter.name}</h3>
                  <p className="text-sm text-blue-200 mb-4">{letter.description}</p>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md [&_svg]:text-sky-200">
                    <Mail className="w-4 h-4 mr-2" />
                    Ajukan Sekarang
                  </Button>
                </CardContent>
              </Card>
              );
            })}
          </div>

          {/* My Letter Requests */}
          <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Pengajuan Saya</CardTitle>
              <CardDescription className="text-blue-200">Riwayat pengajuan surat</CardDescription>
            </CardHeader>
            <CardContent>
              {userLetters.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-blue-500/30" />
                  <p className="text-blue-300">Belum ada pengajuan surat</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userLetters.map((letter) => (
                    <div
                      key={letter.id}
                      className="border border-blue-600/50 rounded-xl p-4 hover:bg-blue-700/30 hover:border-blue-400 transition-all bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{letter.requestNumber}</h4>
                          <p className="text-sm text-blue-200">{letter.letterType}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadgeColor(letter.status)}`}>
                          {getStatusLabel(letter.status)}
                        </span>
                      </div>
                      <div className="text-sm text-blue-200">
                        <p>Keperluan: {letter.purpose}</p>
                        <p className="text-xs text-blue-300 mt-2">
                          Diajukan: {new Date(letter.createdAt).toLocaleDateString('id-ID')}
                        </p>
                        {letter.pickupDate && letter.status === 'ready' && (
                          <div className="mt-3 p-3 bg-green-900/50 border border-green-500/50 rounded-lg backdrop-blur">
                            <p className="text-green-100 font-medium text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              Siap diambil pada: {new Date(letter.pickupDate).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-green-200 mt-1">
                              Bawa KTP asli dan fotokopi saat pengambilan
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Letter Form */}
      {showForm && selectedLetter && (
        <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setSelectedLetter(null);
              }}
              className="mb-2 -ml-2 text-blue-300 hover:bg-blue-700/50 hover:text-blue-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <CardTitle className="text-white">Pengajuan {selectedLetter.name}</CardTitle>
            <CardDescription className="text-blue-200">{selectedLetter.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Data */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Data Diri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-200">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nik" className="text-blue-200">NIK *</Label>
                    <Input
                      id="nik"
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                    required
                  />
                </div>
              </div>

              {/* Letter Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Detail Pengajuan</h3>
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-blue-200">Keperluan *</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                    placeholder="Jelaskan keperluan pengajuan surat..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupDate" className="text-blue-200">Tanggal Pengambilan (Estimasi)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="pl-10 pr-3 bg-blue-900/50 border-blue-500/50 text-white [color-scheme:dark]"
                      min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </div>
                  <p className="text-xs text-blue-300">
                    Proses pengajuan memerlukan minimal 7 hari kerja
                  </p>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Dokumen Pendukung</h3>
                <FileUploadZone
                  files={formData.documents}
                  onFilesChange={(documents) => setFormData((prev) => ({ ...prev, documents }))}
                  hint="Upload KTP, KK, atau dokumen lainnya"
                  subHint="PDF atau gambar, maksimal 5MB"
                  maxSizeMb={5}
                />
              </div>

              {/* Requirements Info */}
              <div className="bg-blue-900/50 border border-blue-500/50 rounded-lg p-4 backdrop-blur">
                <h4 className="font-medium text-white mb-2">Persyaratan:</h4>
                <ul className="text-sm text-blue-100 space-y-1 list-disc list-inside">
                  <li>Fotokopi KTP yang masih berlaku</li>
                  <li>Fotokopi Kartu Keluarga</li>
                  {selectedLetter.id === 'skck' && <li>Pas foto 4x6 (2 lembar)</li>}
                  {selectedLetter.id === 'kehilangan' && <li>Surat keterangan RT/RW</li>}
                  {selectedLetter.id === 'keramaian' && <li>Proposal kegiatan</li>}
                </ul>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md [&_svg]:text-sky-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ajukan Permohonan
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedLetter(null);
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>

    <SatisfactionForm
      open={showSatisfaction}
      onOpenChange={setShowSatisfaction}
      serviceType="letter"
      serviceLabel="Layanan Surat"
      referenceId={lastReference}
    />

    {/* Staff management dialog */}
    <Dialog open={!!managingLetter} onOpenChange={() => setManagingLetter(null)}>
      <DialogContent className="bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur max-w-2xl">
        {managingLetter && (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">{managingLetter.requestNumber}</DialogTitle>
              <DialogDescription className="text-blue-200">
                {managingLetter.letterType} · {managingLetter.requesterName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-800/50 border border-blue-600/50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-blue-300">NIK:</span> <span className="text-white">{managingLetter.requesterNIK}</span></p>
                <p><span className="text-blue-300">Keperluan:</span> <span className="text-white">{managingLetter.purpose}</span></p>
                <p><span className="text-blue-300">Diajukan:</span>{' '}
                  <span className="text-white">
                    {new Date(managingLetter.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </p>
              </div>

              {managingLetter.attachmentFiles && managingLetter.attachmentFiles.length > 0 && (
                <div>
                  <Label className="text-blue-200">Dokumen Pendukung</Label>
                  <div className="mt-2 space-y-2">
                    {managingLetter.attachmentFiles.map((file) => (
                      <a
                        key={file}
                        href={spktApi.getFileUrl(file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 border border-blue-500/40 rounded-lg p-2 bg-blue-900/40"
                      >
                        <FileText className="w-4 h-4" />
                        {file}
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-blue-200">Status</Label>
                <Select value={staffStatus} onValueChange={(v: LetterStatus) => setStaffStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LETTER_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {staffStatus === 'ready' && (
                <div className="space-y-2">
                  <Label className="text-blue-200">Tanggal Pengambilan</Label>
                  <Input
                    type="date"
                    value={staffPickupDate}
                    onChange={(e) => setStaffPickupDate(e.target.value)}
                    className="bg-blue-900/50 border-blue-500/50 text-white [color-scheme:dark]"
                  />
                </div>
              )}

              <Button
                onClick={handleStaffSave}
                disabled={staffSaving}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
