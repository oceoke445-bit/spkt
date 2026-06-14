import { db, MAX_SCORE, ensureDbReady } from '@/lib/db';

const SERVICE_LABELS: Record<string, string> = {
  report: 'Buat Laporan',
  letter: 'Layanan Surat',
  complaint: 'Pengaduan',
};

export interface SurveyResponseInput {
  dimensionId: number;
  score: number;
}

export interface SubmitSurveyPayload {
  userId?: string;
  userName: string;
  userEmail?: string;
  serviceType: string;
  serviceLabel?: string;
  referenceId?: string;
  comment?: string;
  responses: SurveyResponseInput[];
}

interface DimensionRow {
  id: number;
  code: string;
  name: string;
  weight: number;
}

export function getDimensions(): DimensionRow[] {
  ensureDbReady();
  return db
    .prepare('SELECT id, code, name, weight FROM survey_dimensions ORDER BY id')
    .all() as unknown as DimensionRow[];
}

export function hasSurvey(userId: string, serviceType: string, referenceId: string): boolean {
  ensureDbReady();
  const row = db
    .prepare(
      `SELECT id FROM satisfaction_surveys
       WHERE user_id = ? AND reference_id = ? AND service_type = ?`,
    )
    .get(userId, referenceId, serviceType) as { id: number } | undefined;
  return Boolean(row);
}

export function submitSurvey(payload: SubmitSurveyPayload) {
  ensureDbReady();
  const dimensions = getDimensions();
  const dimensionMap = new Map(dimensions.map((d) => [d.id, d]));

  const scores = payload.responses.map((r) => {
    const dimension = dimensionMap.get(r.dimensionId);
    if (!dimension) {
      throw new Error(`Dimensi tidak valid: ${r.dimensionId}`);
    }
    if (r.score < 1 || r.score > MAX_SCORE) {
      throw new Error('Skor harus antara 1 dan 4');
    }
    return { score: r.score, weight: dimension.weight };
  });

  if (scores.length !== dimensions.length) {
    throw new Error('Semua dimensi penilaian harus diisi');
  }

  if (payload.referenceId && payload.userId) {
    const dup = db
      .prepare(
        `SELECT id FROM satisfaction_surveys
         WHERE user_id = ? AND reference_id = ? AND service_type = ?`,
      )
      .get(payload.userId, payload.referenceId, payload.serviceType) as { id: number } | undefined;
    if (dup) {
      throw new Error('Anda sudah memberikan penilaian untuk layanan ini');
    }
  }

  let weightedSum = 0;
  let maxWeighted = 0;
  for (const { score, weight } of scores) {
    weightedSum += weight * score;
    maxWeighted += weight * MAX_SCORE;
  }
  const csiScore = maxWeighted === 0 ? 0 : Math.round((weightedSum / maxWeighted) * 10000) / 100;

  const insertSurvey = db.prepare(`
    INSERT INTO satisfaction_surveys
      (user_id, user_name, user_email, service_type, service_label, reference_id, comment, csi_score, submitted_at)
    VALUES (@userId, @userName, @userEmail, @serviceType, @serviceLabel, @referenceId, @comment, @csiScore, datetime('now'))
  `);

  const insertResponse = db.prepare(`
    INSERT INTO survey_responses (survey_id, dimension_id, score)
    VALUES (@surveyId, @dimensionId, @score)
  `);

  db.exec('BEGIN');
  try {
    const result = insertSurvey.run({
      userId: payload.userId ?? null,
      userName: payload.userName,
      userEmail: payload.userEmail ?? null,
      serviceType: payload.serviceType,
      serviceLabel: payload.serviceLabel ?? SERVICE_LABELS[payload.serviceType] ?? payload.serviceType,
      referenceId: payload.referenceId ?? null,
      comment: payload.comment ?? null,
      csiScore,
    });

    const surveyId = Number(result.lastInsertRowid);

    for (const response of payload.responses) {
      insertResponse.run({
        surveyId,
        dimensionId: response.dimensionId,
        score: response.score,
      });
    }

    db.exec('COMMIT');
    return { id: surveyId, csiScore };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function getCsiSummary() {
  ensureDbReady();
  const overall = db
    .prepare(`
    SELECT
      COUNT(*) as total_responses,
      ROUND(AVG(csi_score), 2) as average_csi,
      ROUND(MIN(csi_score), 2) as min_csi,
      ROUND(MAX(csi_score), 2) as max_csi
    FROM satisfaction_surveys
  `)
    .get() as {
    total_responses: number;
    average_csi: number;
    min_csi: number;
    max_csi: number;
  } | undefined;

  const byService = db
    .prepare(`
    SELECT
      service_type,
      service_label,
      COUNT(*) as count,
      ROUND(AVG(csi_score), 2) as csi
    FROM satisfaction_surveys
    GROUP BY service_type, service_label
    ORDER BY count DESC
  `)
    .all() as Array<{
    service_type: string;
    service_label: string;
    count: number;
    csi: number | null;
  }>;

  const byDimension = db
    .prepare(`
    SELECT
      d.id as dimension_id,
      d.code,
      d.name,
      d.weight,
      COUNT(sr.id) as response_count,
      ROUND(AVG(sr.score), 2) as average_score,
      ROUND((SUM(d.weight * sr.score) / SUM(d.weight * ${MAX_SCORE})) * 100, 2) as csi
    FROM survey_dimensions d
    LEFT JOIN survey_responses sr ON sr.dimension_id = d.id
    GROUP BY d.id
    ORDER BY d.id
  `)
    .all() as Array<{
    dimension_id: number;
    code: string;
    name: string;
    weight: number;
    response_count: number;
    average_score: number | null;
    csi: number | null;
  }>;

  const monthly = db
    .prepare(`
    SELECT
      strftime('%Y-%m', submitted_at) as month,
      COUNT(*) as count,
      ROUND(AVG(csi_score), 2) as csi
    FROM satisfaction_surveys
    GROUP BY strftime('%Y-%m', submitted_at)
    ORDER BY month ASC
  `)
    .all() as Array<{ month: string; count: number; csi: number | null }>;

  return {
    overall: {
      totalResponses: overall?.total_responses ?? 0,
      averageCsi: overall?.average_csi ?? 0,
      minCsi: overall?.min_csi ?? 0,
      maxCsi: overall?.max_csi ?? 0,
    },
    byService: byService.map((row) => ({
      serviceType: row.service_type,
      serviceLabel: row.service_label,
      count: row.count,
      csi: row.csi ?? 0,
    })),
    byDimension: byDimension.map((row) => ({
      dimensionId: row.dimension_id,
      code: row.code,
      name: row.name,
      weight: row.weight,
      responseCount: row.response_count,
      averageScore: row.average_score ?? 0,
      csi: row.csi ?? 0,
    })),
    monthly: monthly.map((row) => ({
      month: row.month,
      count: row.count,
      csi: row.csi ?? 0,
    })),
  };
}

export function getRecentSurveys(limit = 20) {
  ensureDbReady();
  return db
    .prepare(`
    SELECT
      id,
      user_name,
      user_email,
      service_type,
      service_label,
      reference_id,
      comment,
      csi_score,
      submitted_at
    FROM satisfaction_surveys
    ORDER BY submitted_at DESC
    LIMIT ?
  `)
    .all(limit);
}
