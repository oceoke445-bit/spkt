import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, Mail, Clock, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { mockReports, mockLetterRequests, getStatusBadgeColor, getStatusLabel } from '../data/mockData';

interface UserDashboardProps {
  onNavigate: (view: string) => void;
}

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';

const quickActions = [
  {
    view: 'create-report',
    title: 'Buat Laporan',
    description: 'Laporkan kejadian',
    icon: FileText,
    iconBg: 'bg-sky-500/25',
    iconColor: 'text-sky-300',
  },
  {
    view: 'letter-service',
    title: 'Ajukan Surat',
    description: 'SKCK, Kehilangan, dll',
    icon: Mail,
    iconBg: 'bg-violet-500/25',
    iconColor: 'text-violet-300',
  },
  {
    view: 'my-reports',
    title: 'Lacak Status',
    description: 'Cek laporan Anda',
    icon: Clock,
    iconBg: 'bg-cyan-500/25',
    iconColor: 'text-cyan-300',
  },
];

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const userReports = mockReports.filter(r => r.reporterNIK === '3201012345678901');
  const userLetters = mockLetterRequests.filter(l => l.requesterNIK === '3201012345678901');

  const stats = [
    {
      title: 'Total Laporan',
      value: userReports.length,
      icon: <FileText className="w-6 h-6 text-sky-300" />,
      iconBg: 'bg-sky-500/20',
      change: '+2 bulan ini'
    },
    {
      title: 'Sedang Diproses',
      value: userReports.filter(r => r.status === 'processing' || r.status === 'verified').length,
      icon: <Clock className="w-6 h-6 text-amber-300" />,
      iconBg: 'bg-amber-500/20',
      change: 'Dalam proses'
    },
    {
      title: 'Selesai',
      value: userReports.filter(r => r.status === 'completed').length,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-300" />,
      iconBg: 'bg-emerald-500/20',
      change: '1 minggu terakhir'
    },
    {
      title: 'Layanan Surat',
      value: userLetters.length,
      icon: <Mail className="w-6 h-6 text-violet-300" />,
      iconBg: 'bg-violet-500/20',
      change: userLetters.filter(l => l.status === 'ready').length + ' siap diambil'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-blue-200 mt-1">Selamat datang di SPKT Digital</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={cardClass}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-blue-200 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-sky-300" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-lg backdrop-blur`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-white">Aksi Cepat</CardTitle>
          <CardDescription className="text-blue-200">Layanan yang sering digunakan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.view}
                  type="button"
                  onClick={() => onNavigate(action.view)}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-800/70 to-blue-900/80 p-5 text-white transition-all hover:border-blue-400/60 hover:from-blue-700/80 hover:to-blue-800/90 hover:shadow-lg hover:shadow-blue-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
                >
                  <div className={`rounded-xl p-3 ${action.iconBg} transition-transform group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="mt-1 text-xs text-blue-200">{action.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className={cardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Laporan Terbaru</CardTitle>
              <CardDescription className="text-blue-200">Aktivitas laporan Anda</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('my-reports')} className="text-blue-300 hover:text-blue-100 hover:bg-blue-700/50">
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userReports.length === 0 ? (
            <div className="text-center py-8 text-blue-300">
              <FileText className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <p>Belum ada laporan</p>
              <Button
                onClick={() => onNavigate('create-report')}
                variant="link"
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Buat laporan pertama Anda
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {userReports.slice(0, 3).map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border border-blue-600/50 rounded-xl hover:shadow-lg hover:border-blue-400 transition-all bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-white">{report.reportNumber}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadgeColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-100 font-medium">{report.caseType}</p>
                    <p className="text-xs text-blue-300 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    onClick={() => onNavigate('my-reports')}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Detail
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications/Alerts */}
      {userLetters.some(l => l.status === 'ready') && (
        <Card className="border-green-500/50 bg-gradient-to-br from-green-900/80 to-green-800/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-white">Surat Siap Diambil</h4>
                <p className="text-sm text-green-100 mt-1">
                  {userLetters.filter(l => l.status === 'ready').length} surat Anda sudah siap diambil.
                  Silakan datang ke kantor polisi dengan membawa identitas.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-green-300 hover:text-green-200 p-0 h-auto mt-2"
                  onClick={() => onNavigate('letter-service')}
                >
                  Lihat detail →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
