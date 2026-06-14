import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { surveyApi, type CsiSummary, type RecentSurvey } from '../api/surveyApi';
import { Star, TrendingUp, Users, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const cardClass = 'bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500/50 backdrop-blur';

const tooltipProps = {
  contentStyle: {
    backgroundColor: '#0d1b2a',
    border: '1px solid rgba(59,130,246,0.4)',
    borderRadius: '8px',
    color: '#e3f2fd',
  },
  labelStyle: { color: '#e3f2fd', fontWeight: 600 },
  itemStyle: { color: '#93c5fd' },
};

const axisStyle = { fontSize: '12px', fill: '#93c5fd' };

export const AdminCSI: React.FC = () => {
  const [summary, setSummary] = useState<CsiSummary | null>(null);
  const [recent, setRecent] = useState<RecentSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, recentData] = await Promise.all([
        surveyApi.getCsiSummary(),
        surveyApi.getRecentSurveys(15),
      ]);
      setSummary(summaryData);
      setRecent(recentData.surveys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data CSI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-blue-200">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        Memuat data kepuasan masyarakat...
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cardClass}>
        <CardContent className="p-8 text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <p className="text-blue-200 text-sm mb-4">Pastikan server backend berjalan (npm run dev:server)</p>
          <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  const overall = summary?.overall ?? { totalResponses: 0, averageCsi: 0, minCsi: 0, maxCsi: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Kepuasan Masyarakat (CSI)</h1>
          <p className="text-blue-200 mt-1">Rekap indeks kepuasan berdasarkan metode Customer Satisfaction Index</p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          className="w-full sm:w-auto border-blue-500/50 text-blue-200 hover:bg-blue-800/50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8 text-amber-400" />
              <p className="text-sm text-blue-200">CSI Keseluruhan</p>
            </div>
            <p className="text-4xl font-bold text-white">{overall.averageCsi}%</p>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-sky-400" />
              <p className="text-sm text-blue-200">Total Responden</p>
            </div>
            <p className="text-4xl font-bold text-white">{overall.totalResponses}</p>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <p className="text-sm text-blue-200">CSI Tertinggi</p>
            </div>
            <p className="text-4xl font-bold text-white">{overall.maxCsi}%</p>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-violet-400 rotate-180" />
              <p className="text-sm text-blue-200">CSI Terendah</p>
            </div>
            <p className="text-4xl font-bold text-white">{overall.minCsi}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white">CSI per Layanan</CardTitle>
            <CardDescription className="text-blue-200">Rata-rata indeks per jenis layanan</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.byService.length === 0 ? (
              <p className="text-blue-300 text-center py-8">Belum ada data penilaian</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={summary?.byService ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="serviceLabel" tick={axisStyle} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={axisStyle} />
                  <Tooltip {...tooltipProps} formatter={(v: number) => [`${v}%`, 'CSI']} />
                  <Bar dataKey="csi" fill="#60a5fa" name="CSI" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white">CSI per Dimensi</CardTitle>
            <CardDescription className="text-blue-200">Aspek penilaian kepuasan masyarakat</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={summary?.byDimension ?? []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" domain={[0, 100]} tick={axisStyle} />
                <YAxis type="category" dataKey="name" width={120} tick={axisStyle} />
                <Tooltip {...tooltipProps} formatter={(v: number) => [`${v}%`, 'CSI']} />
                <Bar dataKey="csi" fill="#34d399" radius={[0, 8, 8, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {summary && summary.monthly.length > 0 && (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white">Tren CSI Bulanan</CardTitle>
            <CardDescription className="text-blue-200">Perkembangan indeks kepuasan per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.monthly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" tick={axisStyle} />
                <YAxis domain={[0, 100]} tick={axisStyle} />
                <Tooltip {...tooltipProps} formatter={(v: number) => [`${v}%`, 'CSI']} />
                <Line
                  type="monotone"
                  dataKey="csi"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ fill: '#fbbf24', r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-white">Penilaian Terbaru</CardTitle>
          <CardDescription className="text-blue-200">Riwayat respon survei kepuasan</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-blue-300 text-center py-8">Belum ada penilaian masuk</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-blue-500/30 text-blue-200">
                    <th className="text-left py-3 px-2">Tanggal</th>
                    <th className="text-left py-3 px-2">Nama</th>
                    <th className="text-left py-3 px-2">Layanan</th>
                    <th className="text-left py-3 px-2">Referensi</th>
                    <th className="text-right py-3 px-2">CSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/20">
                  {recent.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-800/30">
                      <td className="py-3 px-2 text-blue-200">
                        {new Date(row.submitted_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-2 text-white">{row.user_name}</td>
                      <td className="py-3 px-2 text-blue-100">{row.service_label}</td>
                      <td className="py-3 px-2 text-blue-300">{row.reference_id ?? '-'}</td>
                      <td className="py-3 px-2 text-right font-semibold text-emerald-300">{row.csi_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-950/50 border-blue-400/40">
        <CardContent className="p-4 text-sm text-blue-100">
          <p className="font-medium mb-1">Metode Perhitungan CSI</p>
          <p>
            CSI = (Σ bobot × skor) / (Σ bobot × skor maksimum) × 100%.
            Skor menggunakan skala 1–4 (Tidak Puas hingga Sangat Puas) pada 5 dimensi pelayanan dengan bobot sama.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
