import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Lock,
  Shield,
  Save,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { spktApi } from '@/lib/spktApi';

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';
const tabsListClass = 'grid w-full grid-cols-2 h-auto gap-1 bg-blue-950/60 border border-blue-500/40 p-1';
const tabTriggerClass =
  'text-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-400/50 [&_svg]:text-blue-300 data-[state=active]:[&_svg]:text-sky-200';

/** Sembunyikan UI setup 2FA di Pengaturan > Keamanan (backend tetap aktif). */
const SHOW_2FA_SETTINGS = false;

export const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nik: user?.nik || '',
    address: '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    spktApi.getProfile().then(({ user: profile }) => {
      setProfileData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        nik: profile.nik || '',
        address: profile.address || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }).catch(() => {});
  }, []);

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpSetup, setTotpSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');

  useEffect(() => {
    if (!SHOW_2FA_SETTINGS) return;
    spktApi.getTotpStatus().then((s) => setTotpEnabled(s.enabled)).catch(() => {});
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = async () => {
    try {
      await spktApi.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
      });
      await refreshUser();
      toast.success('Profil berhasil diperbarui', {
        description: 'Perubahan data Anda telah disimpan',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Format tidak didukung', {
        description: 'Gunakan file gambar JPG, PNG, atau WEBP',
      });
      event.target.value = '';
      return;
    }

    setUploadingPhoto(true);
    try {
      const { files } = await spktApi.uploadFiles([file]);
      const storedName = files[0]?.storedName;
      if (!storedName) {
        throw new Error('Upload gagal');
      }
      await spktApi.updateProfile({ avatarUrl: storedName });
      setProfileData((prev) => ({ ...prev, avatarUrl: storedName }));
      await refreshUser();
      toast.success('Foto profil diperbarui');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah foto profil');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password tidak cocok', {
        description: 'Password baru dan konfirmasi password harus sama',
      });
      return;
    }
    try {
      await spktApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password berhasil diubah', {
        description: 'Silakan gunakan password baru Anda untuk login',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah password');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleExportData = async () => {
    try {
      await spktApi.exportMyData();
      toast.success('Data berhasil diunduh');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengunduh data');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await spktApi.deleteAccount(deletePassword);
      toast.success('Akun dihapus');
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus akun');
    }
  };

  const handleSetupTotp = async () => {
    try {
      const result = await spktApi.setupTotp();
      setTotpSetup({ secret: result.secret, uri: result.uri });
      toast.success('Secret 2FA dibuat. Masukkan ke aplikasi authenticator.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal setup 2FA');
    }
  };

  const handleEnableTotp = async () => {
    try {
      await spktApi.enableTotp(totpCode);
      setTotpEnabled(true);
      setTotpSetup(null);
      setTotpCode('');
      toast.success('2FA diaktifkan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kode tidak valid');
    }
  };

  const handleDisableTotp = async () => {
    try {
      await spktApi.disableTotp(totpCode);
      setTotpEnabled(false);
      setTotpCode('');
      toast.success('2FA dinonaktifkan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kode tidak valid');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Pengaturan</h1>
        <p className="text-blue-200 mt-1">Kelola profil dan keamanan akun Anda</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={tabsListClass}>
          <TabsTrigger value="profile" className={`text-xs sm:text-sm py-2 gap-1.5 ${tabTriggerClass}`}>
            <User className="w-4 h-4 shrink-0" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className={`text-xs sm:text-sm py-2 gap-1.5 ${tabTriggerClass}`}>
            <Shield className="w-4 h-4 shrink-0" />
            Keamanan
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Informasi Profil</CardTitle>
              <CardDescription className="text-blue-200">Kelola informasi pribadi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <Avatar className="w-24 h-24 border-2 border-blue-400/50">
                  {profileData.avatarUrl && (
                    <AvatarImage
                      src={spktApi.getFileUrl(profileData.avatarUrl)}
                      alt={profileData.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="text-2xl bg-blue-600 text-white">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">{profileData.name}</h3>
                  <p className="text-sm text-blue-200 capitalize">{user?.role}</p>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={uploadingPhoto}
                    className="mt-2 bg-sky-500 hover:bg-sky-600 text-white border border-sky-400/50 shadow-sm"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {uploadingPhoto ? 'Mengupload...' : 'Ubah Foto'}
                  </Button>
                </div>
              </div>

              <Separator className="bg-blue-500/30" />

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-200" htmlFor="name">Nama Lengkap</Label>
                  <Input className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200" htmlFor="email">Email</Label>
                  <Input className="bg-blue-900/50 border-blue-500/50 text-blue-300 placeholder:text-blue-400"
                    id="email"
                    type="email"
                    value={profileData.email}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-blue-400">Email tidak dapat diubah. Hubungi admin jika perlu koreksi.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200" htmlFor="phone">Nomor Telepon</Label>
                  <Input className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200" htmlFor="nik">NIK</Label>
                  <Input className="bg-blue-900/50 border-blue-500/50 text-blue-300 placeholder:text-blue-400"
                    id="nik"
                    value={profileData.nik}
                    readOnly
                    disabled
                    maxLength={16}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-200" htmlFor="address">Alamat</Label>
                <Input className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2 text-sky-200" />
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/50 border-blue-400/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-100">
                  <p className="font-medium mb-1">Verifikasi Data</p>
                  <p>Pastikan data yang Anda masukkan sesuai dengan dokumen resmi untuk memudahkan verifikasi.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Ubah Password</CardTitle>
              <CardDescription className="text-blue-200">Perbarui password akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-blue-200" htmlFor="currentPassword">Password Saat Ini</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pl-10 pr-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-blue-400 hover:text-blue-200"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-200" htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pl-10 pr-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-blue-400 hover:text-blue-200"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-blue-300">
                  Minimal 8 karakter, kombinasi huruf besar, kecil, dan angka
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-200" htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-blue-400 hover:text-blue-200"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
              >
                <Lock className="w-4 h-4 mr-2 text-sky-200" />
                Ubah Password
              </Button>
            </CardContent>
          </Card>

          {SHOW_2FA_SETTINGS && (
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Autentikasi Dua Faktor (2FA)</CardTitle>
              <CardDescription className="text-blue-200">
                Lindungi akun dengan kode dari aplikasi authenticator (Google Authenticator, Authy, dll.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-200">
                Status: {totpEnabled ? <span className="text-green-300 font-medium">Aktif</span> : <span className="text-amber-300">Nonaktif</span>}
              </p>
              {!totpEnabled && !totpSetup && (
                <Button onClick={handleSetupTotp} className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Key className="w-4 h-4 mr-2" /> Setup 2FA
                </Button>
              )}
              {totpSetup && (
                <div className="space-y-3 p-3 rounded-lg bg-blue-950/50 border border-blue-500/30">
                  <p className="text-xs text-blue-300 break-all">Secret: {totpSetup.secret}</p>
                  <p className="text-xs text-blue-400">Atau scan URI di aplikasi authenticator</p>
                  <Input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Kode 6 digit" className="bg-blue-900/50 border-blue-500/50 text-white" />
                  <Button onClick={handleEnableTotp} className="w-full bg-gradient-to-r from-green-500 to-green-600">Aktifkan 2FA</Button>
                </div>
              )}
              {totpEnabled && (
                <div className="space-y-3">
                  <Input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Kode untuk nonaktifkan" className="bg-blue-900/50 border-blue-500/50 text-white" />
                  <Button variant="destructive" onClick={handleDisableTotp} className="w-full">Nonaktifkan 2FA</Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Data & Akun</CardTitle>
              <CardDescription className="text-blue-200">Ekspor atau hapus data akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                onClick={handleExportData}
                className="w-full justify-start bg-sky-500 hover:bg-sky-600 text-white shadow-md border border-sky-400/50 [&_svg]:text-sky-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Data Saya
              </Button>
              <Button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full justify-start bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md [&_svg]:text-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Akun
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-blue-900 border-blue-500/50">
          <DialogHeader>
            <DialogTitle className="text-white">Hapus Akun</DialogTitle>
            <DialogDescription className="text-blue-200">
              Masukkan password untuk mengonfirmasi penghapusan permanen.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Password Anda"
            className="bg-blue-950/60 border-blue-500/50 text-white"
          />
          <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
            Hapus Akun Permanen
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
