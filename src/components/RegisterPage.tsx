'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, AlertCircle, User, Phone, CreditCard } from 'lucide-react';
import { SpktLogo } from './SpktLogo';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    nik: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        nik: form.nik,
        phone: form.phone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 space-y-1">
          <SpktLogo className="mx-auto max-w-[160px]" />
          <p className="text-blue-200 text-sm">Buat akun masyarakat SPKT Digital</p>
        </div>

        <Card className="shadow-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-900 to-blue-800">
          <CardHeader>
            <CardTitle className="text-white">Registrasi</CardTitle>
            <CardDescription className="text-blue-200">Lengkapi data Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="text-blue-100">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-100">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-100">NIK</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    value={form.nik}
                    onChange={(e) => setForm({ ...form, nik: e.target.value })}
                    maxLength={16}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-100">Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-100">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-100">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>

            <p className="text-center text-sm text-blue-300 mt-4">
              Sudah punya akun?{' '}
              <button type="button" onClick={onBackToLogin} className="text-blue-400 hover:text-blue-300 hover:underline">
                Masuk
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
