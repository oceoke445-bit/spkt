import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, type TooltipProps } from 'recharts';
import { mockReports, caseTypes } from '../data/mockData';
import { FileText, Users, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

const cardClass = "bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur";

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-blue-500/40 bg-[#0d1b2a] px-3 py-2 shadow-lg">
      {label && <p className="text-sm font-medium text-blue-100 mb-1">{label}</p>}
      {payload.map((entry) => (
        <p key={`${entry.name}-${entry.value}`} className="text-sm text-sky-300">
          {entry.name}: <span className="font-semibold text-blue-50">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

const legendFormatter = (value: string) => (
  <span style={{ color: '#93c5fd' }}>{value}</span>
);

export const AdminDashboard: React.FC = () => {
  const totalReports = mockReports.length;
  const completedReports = mockReports.filter(r => r.status === 'completed').length;
  const processingReports = mockReports.filter(r => r.status === 'processing' || r.status === 'verified').length;
  const completionRate = Math.round((completedReports / totalReports) * 100);

  const caseDistribution = caseTypes.map((type, idx) => ({
    id: `case-${idx}`,
    name: type,
    value: mockReports.filter(r => r.caseType === type).length
  })).filter(item => item.value > 0);

  const monthlyData = [
    { id: 'month-1', month: 'Jan', laporan: 45, selesai: 38 },
    { id: 'month-2', month: 'Feb', laporan: 52, selesai: 45 },
    { id: 'month-3', month: 'Mar', laporan: 48, selesai: 42 },
    { id: 'month-4', month: 'Apr', laporan: 61, selesai: 55 },
    { id: 'month-5', month: 'Mei', laporan: 55, selesai: 48 }
  ];

  const responseTimeData = [
    { id: 'time-1', category: '< 1 hari', count: 15 },
    { id: 'time-2', category: '1-3 hari', count: 28 },
    { id: 'time-3', category: '3-7 hari', count: 12 },
    { id: 'time-4', category: '> 7 hari', count: 5 }
  ];

  const COLORS = useMemo(() => ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'], []);

  const stats = [
    {
      title: 'Total Laporan',
      value: totalReports,
      icon: <FileText className="w-6 h-6 text-sky-300" />,
      iconBg: 'bg-sky-500/20',
      change: '+12% dari bulan lalu',
    },
    {
      title: 'Sedang Diproses',
      value: processingReports,
      icon: <Clock className="w-6 h-6 text-amber-300" />,
      iconBg: 'bg-amber-500/20',
      change: '5 laporan baru hari ini',
    },
    {
      title: 'Selesai',
      value: completedReports,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-300" />,
      iconBg: 'bg-emerald-500/20',
      change: `${completionRate}% completion rate`,
    },
    {
      title: 'Rata-rata Waktu',
      value: '2.5 hari',
      icon: <TrendingUp className="w-6 h-6 text-violet-300" />,
      iconBg: 'bg-violet-500/20',
      change: '-15% lebih cepat',
    }
  ];

  const axisStyle = { fontSize: '12px', fill: '#93c5fd' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-blue-200 mt-1">Monitoring dan statistik sistem SPKT Digital</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={`stat-${stat.title}-${index}`} className={cardClass}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm text-blue-200 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-violet-300" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white">Tren Bulanan</CardTitle>
            <CardDescription className="text-blue-200">Laporan masuk vs selesai per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#93c5fd" tick={axisStyle} />
                <YAxis stroke="#93c5fd" tick={axisStyle} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} formatter={legendFormatter} />
                <Line type="monotone" dataKey="laporan" stroke="#60a5fa" strokeWidth={2} name="Laporan Masuk" dot={{ fill: '#60a5fa', r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="selesai" stroke="#34d399" strokeWidth={2} name="Selesai" dot={{ fill: '#34d399', r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Case Distribution */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white">Distribusi Jenis Kasus</CardTitle>
            <CardDescription className="text-blue-200">Breakdown laporan berdasarkan kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={caseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {caseDistribution.map((entry, index) => (
                    <Cell key={`cell-${entry.id}-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  formatter={legendFormatter}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white">Waktu Respons</CardTitle>
            <CardDescription className="text-blue-200">Distribusi waktu penyelesaian laporan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="category" stroke="#93c5fd" tick={axisStyle} />
                <YAxis stroke="#93c5fd" tick={axisStyle} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#60a5fa" name="Jumlah Laporan" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-blue-200">Update sistem terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReports.slice(0, 5).map((report, index) => (
                <div key={`activity-${report.id}-${index}`} className="flex items-start gap-3 pb-3 border-b border-blue-500/20 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    report.status === 'completed' ? 'bg-emerald-400' :
                    report.status === 'processing' ? 'bg-blue-400' :
                    'bg-amber-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{report.reportNumber}</p>
                    <p className="text-xs text-blue-200">{report.caseType}</p>
                    <p className="text-xs text-blue-300 mt-1">
                      {new Date(report.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                    report.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    report.status === 'processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-white">Status Sistem</CardTitle>
          <CardDescription className="text-blue-200">Kondisi operasional SPKT Digital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm text-blue-200">Server Status</p>
                <p className="font-semibold text-emerald-300">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm text-blue-200">Database</p>
                <p className="font-semibold text-emerald-300">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-sky-500/10 rounded-lg border border-sky-500/30">
              <Users className="w-8 h-8 text-sky-400" />
              <div>
                <p className="text-sm text-blue-200">Active Users</p>
                <p className="font-semibold text-sky-300">247</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-violet-500/10 rounded-lg border border-violet-500/30">
              <TrendingUp className="w-8 h-8 text-violet-400" />
              <div>
                <p className="text-sm text-blue-200">Uptime</p>
                <p className="font-semibold text-violet-300">99.9%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
