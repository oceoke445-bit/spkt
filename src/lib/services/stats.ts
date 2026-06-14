import { db, ensureDbReady } from '@/lib/db';

export interface AdminStats {
  totalReports: number;
  completedReports: number;
  processingReports: number;
  completionRate: number;
  reportsToday: number;
  avgCompletionDays: number;
  monthlyTrend: Array<{ month: string; laporan: number; selesai: number }>;
  responseTimeBuckets: Array<{ category: string; count: number }>;
  caseDistribution: Array<{ name: string; value: number }>;
}

export function getAdminStats(): AdminStats {
  ensureDbReady();

  const totalReports = (db.prepare('SELECT COUNT(*) as c FROM reports').get() as { c: number }).c;
  const completedReports = (
    db.prepare('SELECT COUNT(*) as c FROM reports WHERE status = ?').get('completed') as { c: number }
  ).c;
  const processingReports = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM reports WHERE status IN ('submitted', 'verified', 'assigned', 'processing')`,
      )
      .get() as { c: number }
  ).c;

  const today = new Date().toISOString().slice(0, 10);
  const reportsToday = (
    db.prepare('SELECT COUNT(*) as c FROM reports WHERE created_at >= ?').get(`${today}T00:00:00`) as {
      c: number;
    }
  ).c;

  const completionRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;

  const completedWithDates = db
    .prepare(
      `SELECT created_at, updated_at FROM reports WHERE status = 'completed' AND created_at IS NOT NULL`,
    )
    .all() as Array<{ created_at: string; updated_at: string }>;

  let avgCompletionDays = 0;
  if (completedWithDates.length > 0) {
    const totalDays = completedWithDates.reduce((sum, row) => {
      const start = new Date(row.created_at).getTime();
      const end = new Date(row.updated_at).getTime();
      return sum + (end - start) / (1000 * 60 * 60 * 24);
    }, 0);
    avgCompletionDays = Math.round((totalDays / completedWithDates.length) * 10) / 10;
  }

  const monthlyRows = db
    .prepare(
      `SELECT substr(created_at, 1, 7) as ym,
              COUNT(*) as total,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done
       FROM reports
       WHERE created_at >= date('now', '-5 months')
       GROUP BY ym ORDER BY ym`,
    )
    .all() as Array<{ ym: string; total: number; done: number }>;

  const monthLabels: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei',
    '06': 'Jun', '07': 'Jul', '08': 'Agu', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
  };

  const monthlyTrend = monthlyRows.map((row) => {
    const monthPart = row.ym.split('-')[1] ?? '01';
    return {
      month: monthLabels[monthPart] ?? row.ym,
      laporan: row.total,
      selesai: row.done,
    };
  });

  const buckets = [
    { category: '< 1 hari', maxDays: 1 },
    { category: '1-3 hari', maxDays: 3 },
    { category: '3-7 hari', maxDays: 7 },
    { category: '> 7 hari', maxDays: Infinity },
  ];

  const responseTimeBuckets = buckets.map((bucket, idx) => {
    const minDays = idx === 0 ? 0 : buckets[idx - 1].maxDays;
    const rows = completedWithDates.filter((row) => {
      const days =
        (new Date(row.updated_at).getTime() - new Date(row.created_at).getTime()) /
        (1000 * 60 * 60 * 24);
      if (bucket.maxDays === Infinity) return days > minDays;
      return days > minDays && days <= bucket.maxDays;
    });
    return { category: bucket.category, count: rows.length };
  });

  const caseRows = db
    .prepare('SELECT case_type, COUNT(*) as c FROM reports GROUP BY case_type ORDER BY c DESC')
    .all() as Array<{ case_type: string; c: number }>;

  return {
    totalReports,
    completedReports,
    processingReports,
    completionRate,
    reportsToday,
    avgCompletionDays,
    monthlyTrend,
    responseTimeBuckets,
    caseDistribution: caseRows.map((r) => ({ name: r.case_type, value: r.c })),
  };
}
