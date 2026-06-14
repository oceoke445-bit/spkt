import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    if (role === 'user') {
      setEmail('user@spkt.id');
      setPassword('password');
    } else if (role === 'petugas') {
      setEmail('petugas@spkt.id');
      setPassword('password');
    } else if (role === 'admin') {
      setEmail('admin@spkt.id');
      setPassword('password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-2xl ring-4 ring-blue-400/30">
            <ShieldCheck className="w-12 h-12 text-sky-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">SPKT Digital</h1>
          <p className="text-blue-200">Sistem Pelayanan Kepolisian Terpadu</p>
        </div>

        <Card className="shadow-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-900 to-blue-800">
          <CardHeader>
            <CardTitle className="text-white">Login</CardTitle>
            <CardDescription className="text-blue-200">Masuk ke akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-100">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white placeholder:text-blue-400 focus:border-blue-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-100">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-blue-950/60 border-blue-400/60 text-white placeholder:text-blue-400 focus:border-blue-300"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-blue-500/40">
              <p className="text-sm text-blue-300 mb-3 text-center">Demo Login:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('user')}
                  className="text-xs border-blue-400/60 text-blue-100 bg-blue-800/40 hover:bg-blue-700/60 hover:text-white hover:border-blue-300"
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('petugas')}
                  className="text-xs border-blue-400/60 text-blue-100 bg-blue-800/40 hover:bg-blue-700/60 hover:text-white hover:border-blue-300"
                >
                  Petugas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('admin')}
                  className="text-xs border-blue-400/60 text-blue-100 bg-blue-800/40 hover:bg-blue-700/60 hover:text-white hover:border-blue-300"
                >
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-blue-300 mt-6">
          Belum punya akun?{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline">
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
};
