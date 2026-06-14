'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { spktApi, type TrackResult } from '@/lib/spktApi';
import { Search, Clock, ArrowLeft } from 'lucide-react';
import { SpktLogo } from './SpktLogo';

interface TrackServiceProps {
  onBack: () => void;
}

export const TrackService: React.FC<TrackServiceProps> = ({ onBack }) => {
  const [serviceType, setServiceType] = useState<'report' | 'letter' | 'complaint'>('report');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [nik, setNik] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { track } = await spktApi.trackService(serviceType, referenceNumber.trim(), nik.trim());
      setResult(track);
      if (!track.found) {
        setError('Data tidak ditemukan. Periksa nomor referensi dan NIK.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal melacak');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-4">
          <SpktLogo className="mx-auto max-w-[160px]" />
          <p className="text-blue-200 text-sm mt-1">Lacak status layanan tanpa login</p>
        </div>

        <Card className="shadow-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-900 to-blue-800">
          <CardHeader>
            <CardTitle className="text-white">Lacak Layanan</CardTitle>
            <CardDescription className="text-blue-200">
              Masukkan nomor referensi dan NIK pemohon/pelapor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="text-blue-100">Jenis Layanan</Label>
                <Select value={serviceType} onValueChange={(v) => setServiceType(v as typeof serviceType)}>
                  <SelectTrigger className="bg-blue-950/60 border-blue-400/60 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Laporan Polisi</SelectItem>
                    <SelectItem value="letter">Layanan Surat</SelectItem>
                    <SelectItem value="complaint">Pengaduan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-100">Nomor Referensi</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Contoh: LP/001/V/2026"
                  className="bg-blue-950/60 border-blue-400/60 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-100">NIK (16 digit)</Label>
                <Input
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="3201012345678901"
                  maxLength={16}
                  className="bg-blue-950/60 border-blue-400/60 text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Mencari...' : 'Lacak Status'}
              </Button>
            </form>

            {result?.found && (
              <div className="mt-6 space-y-4 border-t border-blue-500/40 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Status</span>
                  <span className="px-3 py-1 rounded-full bg-green-500/30 text-green-200 text-sm border border-green-400/50">
                    {result.statusLabel}
                  </span>
                </div>
                {result.summary && (
                  <p className="text-sm text-blue-100">
                    <span className="text-blue-300">Ringkasan: </span>
                    {result.summary}
                  </p>
                )}
                <p className="text-xs text-blue-400">
                  Dibuat: {new Date(result.createdAt).toLocaleString('id-ID')}
                </p>

                {result.timeline.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Riwayat
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.timeline.map((event, i) => (
                        <div key={i} className="text-xs bg-blue-950/50 rounded p-2 border border-blue-500/30">
                          <p className="text-white font-medium">{event.status}</p>
                          <p className="text-blue-400">
                            {new Date(event.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full mt-4 text-blue-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
