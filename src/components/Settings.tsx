import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Bell,
  Lock,
  Shield,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';
const itemClass = 'flex items-center justify-between p-4 border border-blue-500/30 rounded-lg bg-blue-950/30';
const tabsListClass = 'grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 bg-blue-950/60 border border-blue-500/40 p-1';
const tabTriggerClass =
  'text-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-400/50 [&_svg]:text-blue-300 data-[state=active]:[&_svg]:text-sky-200';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    reportUpdate: true,
    letterReady: true,
    systemNews: false
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nik: user?.nik || '',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = () => {
    toast.success('Profil berhasil diperbarui', {
      description: 'Perubahan data Anda telah disimpan'
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password tidak cocok', {
        description: 'Password baru dan konfirmasi password harus sama'
      });
      return;
    }
    toast.success('Password berhasil diubah', {
      description: 'Silakan gunakan password baru Anda untuk login'
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success('Pengaturan notifikasi diperbarui');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Pengaturan</h1>
        <p className="text-blue-200 mt-1">Kelola akun dan preferensi Anda</p>
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
          <TabsTrigger value="notifications" className={`text-xs sm:text-sm py-2 gap-1.5 ${tabTriggerClass}`}>
            <Bell className="w-4 h-4 shrink-0" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="preferences" className={`text-xs sm:text-sm py-2 gap-1.5 ${tabTriggerClass}`}>
            <Globe className="w-4 h-4 shrink-0" />
            Preferensi
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
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl bg-blue-600 text-white">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">{profileData.name}</h3>
                  <p className="text-sm text-blue-200 capitalize">{user?.role}</p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 bg-sky-500 hover:bg-sky-600 text-white border border-sky-400/50 shadow-sm"
                  >
                    Ubah Foto
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
                  <Input className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
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
                  <Input className="bg-blue-900/50 border-blue-500/50 text-white placeholder:text-blue-400"
                    id="nik"
                    value={profileData.nik}
                    onChange={(e) => setProfileData({ ...profileData, nik: e.target.value })}
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

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Autentikasi Dua Faktor</CardTitle>
              <CardDescription className="text-blue-200">Tambahkan lapisan keamanan ekstra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`${itemClass} items-start`}>
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-200 mt-1" />
                  <div>
                    <h4 className="font-medium text-white">SMS Verification</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Terima kode verifikasi via SMS
                    </p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className={`${itemClass} items-start`}>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-200 mt-1" />
                  <div>
                    <h4 className="font-medium text-white">Email Verification</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Terima kode verifikasi via email
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Riwayat Login</CardTitle>
              <CardDescription className="text-blue-200">Aktivitas login terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on Windows', location: 'Jakarta', time: '2 jam yang lalu', current: true },
                  { device: 'Mobile App', location: 'Jakarta', time: '1 hari yang lalu', current: false },
                  { device: 'Firefox on MacOS', location: 'Bandung', time: '3 hari yang lalu', current: false }
                ].map((login, index) => (
                  <div key={index} className={`${itemClass} p-3`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-white">{login.device}</p>
                        {login.current && (
                          <Badge className="text-xs bg-blue-500/30 text-blue-100 border border-blue-400/50">Saat ini</Badge>
                        )}
                      </div>
                      <p className="text-xs text-blue-300 mt-1">
                        {login.location} • {login.time}
                      </p>
                    </div>
                    {!login.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-rose-900/40 text-rose-300 hover:text-white hover:bg-rose-800/60 border border-rose-500/40"
                      >
                        Logout
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Saluran Notifikasi</CardTitle>
              <CardDescription className="text-blue-200">Pilih bagaimana Anda ingin menerima notifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={itemClass}>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-200" />
                  <div>
                    <h4 className="font-medium text-white">Email</h4>
                    <p className="text-sm text-blue-200">Notifikasi via email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>

              <div className={itemClass}>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-200" />
                  <div>
                    <h4 className="font-medium text-white">Push Notification</h4>
                    <p className="text-sm text-blue-200">Notifikasi di aplikasi</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>

              <div className={itemClass}>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-200" />
                  <div>
                    <h4 className="font-medium text-white">SMS</h4>
                    <p className="text-sm text-blue-200">Notifikasi via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Jenis Notifikasi</CardTitle>
              <CardDescription className="text-blue-200">Pilih informasi yang ingin Anda terima</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={itemClass}>
                <div>
                  <h4 className="font-medium text-white">Update Laporan</h4>
                  <p className="text-sm text-blue-200">Notifikasi saat status laporan berubah</p>
                </div>
                <Switch
                  checked={notifications.reportUpdate}
                  onCheckedChange={(checked) => handleNotificationChange('reportUpdate', checked)}
                />
              </div>

              <div className={itemClass}>
                <div>
                  <h4 className="font-medium text-white">Surat Siap Diambil</h4>
                  <p className="text-sm text-blue-200">Notifikasi saat surat sudah siap</p>
                </div>
                <Switch
                  checked={notifications.letterReady}
                  onCheckedChange={(checked) => handleNotificationChange('letterReady', checked)}
                />
              </div>

              <div className={itemClass}>
                <div>
                  <h4 className="font-medium text-white">Berita & Update Sistem</h4>
                  <p className="text-sm text-blue-200">Informasi terbaru dari SPKT</p>
                </div>
                <Switch
                  checked={notifications.systemNews}
                  onCheckedChange={(checked) => handleNotificationChange('systemNews', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Tampilan</CardTitle>
              <CardDescription className="text-blue-200">Sesuaikan tampilan aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={itemClass}>
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-5 h-5 text-blue-200" /> : <Sun className="w-5 h-5 text-amber-300" />}
                  <div>
                    <h4 className="font-medium text-white">Mode Gelap</h4>
                    <p className="text-sm text-blue-200">Aktifkan tema gelap</p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={(checked) => {
                    setIsDarkMode(checked);
                    toast.success(checked ? 'Mode gelap diaktifkan' : 'Mode terang diaktifkan');
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-200">Bahasa</Label>
                <Button
                  type="button"
                  className="w-full justify-start bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md border border-sky-400/40"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2 text-sky-100" />
                  Bahasa Indonesia
                </Button>
                <p className="text-xs text-blue-300">Aplikasi saat ini menggunakan Bahasa Indonesia.</p>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-white">Privasi</CardTitle>
              <CardDescription className="text-blue-200">Kontrol data dan privasi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={itemClass}>
                <div>
                  <h4 className="font-medium text-white">Tampilkan Profil Publik</h4>
                  <p className="text-sm text-blue-200">Izinkan orang lain melihat profil Anda</p>
                </div>
                <Switch />
              </div>

              <div className={itemClass}>
                <div>
                  <h4 className="font-medium text-white">Riwayat Aktivitas</h4>
                  <p className="text-sm text-blue-200">Simpan riwayat aktivitas Anda</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator className="bg-blue-500/30" />

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() =>
                    toast.success('Data sedang disiapkan', {
                      description: 'File akan tersedia untuk diunduh dalam beberapa saat',
                    })
                  }
                  className="w-full justify-start bg-sky-500 hover:bg-sky-600 text-white shadow-md border border-sky-400/50 [&_svg]:text-sky-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data Saya
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    toast.error('Penghapusan akun memerlukan verifikasi', {
                      description: 'Hubungi admin SPKT untuk proses penghapusan akun',
                    })
                  }
                  className="w-full justify-start bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md [&_svg]:text-red-100"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Akun
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-900/40 border-amber-500/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div className="text-sm text-amber-100">
                  <p className="font-medium mb-1">Perhatian</p>
                  <p>Menghapus akun akan menghapus semua data Anda secara permanen dan tidak dapat dikembalikan.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
