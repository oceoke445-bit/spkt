import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  type TooltipProps,
} from 'recharts';
import { caseTypes } from '@/lib/data/mockData';
import { useReports } from '@/hooks/useReports';
import { spktApi } from '@/lib/spktApi';

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';

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

const legendFormatter = (value: string) => <span style={{ color: '#93c5fd' }}>{value}</span>;

export const AdminStatistics: React.FC = () => {
  const { reports: allReports, loading: reportsLoading } = useReports({ paginate: false });
  const [stats, setStats] = useState<Awaited<ReturnType<typeof spktApi.getAdminStats>>['stats'] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    spktApi
      .getAdminStats()
      .then(({ stats: data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const loading = reportsLoading || statsLoading;

  const caseDistribution = (
    stats?.caseDistribution ??
    caseTypes.map((type, idx) => ({
      id: `case-${idx}`,
      name: type,
      value: allReports.filter((r) => r.caseType === type).length,
    }))
  )
    .map((item, idx) => ({ id: `case-${idx}`, name: item.name, value: item.value }))
    .filter((item) => item.value > 0);

  const monthlyData =
    stats?.monthlyTrend.map((m, i) => ({
      id: `month-${i}`,
      month: m.month,
      laporan: m.laporan,
      selesai: m.selesai,
    })) ?? [];

  const responseTimeData =
    stats?.responseTimeBuckets.map((b, i) => ({
      id: `time-${i}`,
      category: b.category,
      count: b.count,
    })) ?? [];

  const COLORS = useMemo(() => ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'], []);
  const axisStyle = { fontSize: '12px', fill: '#93c5fd' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Statistik Layanan</h1>
        <p className="text-blue-200 mt-1">Analitik laporan, tren, dan waktu respons</p>
      </div>

      {loading && <div className="text-center py-8 text-blue-300">Memuat statistik...</div>}

      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <Line type="monotone" dataKey="laporan" stroke="#60a5fa" strokeWidth={2} name="Laporan Masuk" dot={{ fill: '#60a5fa', r: 3 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="selesai" stroke="#34d399" strokeWidth={2} name="Selesai" dot={{ fill: '#34d399', r: 3 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className={cardClass}>
              <CardHeader>
                <CardTitle className="text-white">Distribusi Jenis Kasus</CardTitle>
                <CardDescription className="text-blue-200">Breakdown laporan berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={caseDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" nameKey="name" isAnimationActive={false}>
                      {caseDistribution.map((entry, index) => (
                        <Cell key={`cell-${entry.id}-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} formatter={legendFormatter} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

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
        </>
      )}
    </div>
  );
};
