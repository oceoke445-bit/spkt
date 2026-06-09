import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { mockReports, caseTypes } from '../data/mockData';
import { FileText, Users, CheckCircle2, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const totalReports = mockReports.length;
  const completedReports = mockReports.filter(r => r.status === 'completed').length;
  const processingReports = mockReports.filter(r => r.status === 'processing' || r.status === 'verified').length;
  const completionRate = Math.round((completedReports / totalReports) * 100);

  // Case type distribution
  const caseDistribution = caseTypes.map((type, idx) => ({
    id: `case-${idx}`,
    name: type,
    value: mockReports.filter(r => r.caseType === type).length
  })).filter(item => item.value > 0);

  // Monthly trend data (mock)
  const monthlyData = [
    { id: 'month-1', month: 'Jan', laporan: 45, selesai: 38 },
    { id: 'month-2', month: 'Feb', laporan: 52, selesai: 45 },
    { id: 'month-3', month: 'Mar', laporan: 48, selesai: 42 },
    { id: 'month-4', month: 'Apr', laporan: 61, selesai: 55 },
    { id: 'month-5', month: 'Mei', laporan: 55, selesai: 48 }
  ];

  // Response time data (mock)
  const responseTimeData = [
    { id: 'time-1', category: '< 1 hari', count: 15 },
    { id: 'time-2', category: '1-3 hari', count: 28 },
    { id: 'time-3', category: '3-7 hari', count: 12 },
    { id: 'time-4', category: '> 7 hari', count: 5 }
  ];

  const COLORS = useMemo(() => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'], []);

  const stats = [
    {
      title: 'Total Laporan',
      value: totalReports,
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      change: '+12% dari bulan lalu',
      changePositive: true
    },
    {
      title: 'Sedang Diproses',
      value: processingReports,
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      change: '5 laporan baru hari ini',
      changePositive: true
    },
    {
      title: 'Selesai',
      value: completedReports,
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
      bgColor: 'bg-green-50',
      change: `${completionRate}% completion rate`,
      changePositive: true
    },
    {
      title: 'Rata-rata Waktu',
      value: '2.5 hari',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      change: '-15% lebih cepat',
      changePositive: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-blue-200 mt-1">Monitoring dan statistik sistem SPKT Digital</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={`stat-${stat.title}-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm text-blue-200 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              <p className={`text-xs flex items-center gap-1 ${stat.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Tren Bulanan</CardTitle>
            <CardDescription className="text-blue-200">Laporan masuk vs selesai per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="laporan"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Laporan Masuk"
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="selesai"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Selesai"
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Case Distribution */}
        <Card>
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {caseDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id}-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Waktu Respons</CardTitle>
            <CardDescription className="text-blue-200">Distribusi waktu penyelesaian laporan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="category"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  name="Jumlah Laporan"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-blue-200">Update sistem terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReports.slice(0, 5).map((report, index) => (
                <div key={`activity-${report.id}-${index}`} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    report.status === 'completed' ? 'bg-green-500' :
                    report.status === 'processing' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {report.reportNumber}
                    </p>
                    <p className="text-xs text-blue-200">{report.caseType}</p>
                    <p className="text-xs text-blue-300 mt-1">
                      {new Date(report.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' :
                    report.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
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
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Status Sistem</CardTitle>
          <CardDescription className="text-blue-200">Kondisi operasional SPKT Digital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-blue-200">Server Status</p>
                <p className="font-semibold text-green-900">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-blue-200">Database</p>
                <p className="font-semibold text-green-900">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-900/50 rounded-lg border border-blue-500/50 backdrop-blur">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-200">Active Users</p>
                <p className="font-semibold text-blue-900">247</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-blue-200">Uptime</p>
                <p className="font-semibold text-purple-900">99.9%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
