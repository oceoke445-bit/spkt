'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { spktApi } from '@/lib/spktApi';
import { ArrowLeft, Lock } from 'lucide-react';
import { SpktLogo } from './SpktLogo';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const [form, setForm] = useState({ email: '', nik: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (!/^\d{16}$/.test(form.nik)) {
      setError('NIK harus 16 digit');
      return;
    }

    setLoading(true);
    try {
      await spktApi.forgotPassword(form.email, form.nik, form.newPassword);
      setSuccess('Password berhasil direset. Silakan login.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <SpktLogo className="mx-auto max-w-[160px]" />
        </div>
        <Card className="shadow-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-900 to-blue-800">
          <CardHeader>
            <CardTitle className="text-white">Lupa Password</CardTitle>
            <CardDescription className="text-blue-200">
              Verifikasi identitas dengan email dan NIK terdaftar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
              )}
              {success && (
                <Alert><AlertDescription className="text-green-200">{success}</AlertDescription></Alert>
              )}
              <div className="space-y-2">
                <Label className="text-blue-100">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-blue-950/60 border-blue-400/60 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-100">NIK</Label>
                <Input value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })} className="bg-blue-950/60 border-blue-400/60 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-100">Password Baru</Label>
                <Input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="bg-blue-950/60 border-blue-400/60 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-100">Konfirmasi Password</Label>
                <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="bg-blue-950/60 border-blue-400/60 text-white" required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Memproses...' : 'Reset Password'}
              </Button>
            </form>
            <Button type="button" variant="ghost" onClick={onBack} className="w-full mt-3 text-blue-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
