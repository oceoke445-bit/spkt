import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getDimensions,
  submitSurvey,
  getCsiSummary,
  getRecentSurveys,
} from './csi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;
const distPath = path.join(__dirname, '..', 'dist');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/survey/dimensions', (_req, res) => {
  try {
    res.json({ dimensions: getDimensions() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/survey/submit', (req, res) => {
  try {
    const { userId, userName, userEmail, serviceType, serviceLabel, referenceId, comment, responses } = req.body;

    if (!userName || !serviceType || !Array.isArray(responses) || responses.length === 0) {
      res.status(400).json({ error: 'Data penilaian tidak lengkap' });
      return;
    }

    const result = submitSurvey({
      userId,
      userName,
      userEmail,
      serviceType,
      serviceLabel,
      referenceId,
      comment,
      responses,
    });

    res.status(201).json({
      message: 'Penilaian kepuasan berhasil disimpan',
      surveyId: result.id,
      csiScore: result.csiScore,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/survey/csi/summary', (_req, res) => {
  try {
    res.json(getCsiSummary());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/survey/recent', (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    res.json({ surveys: getRecentSurveys(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (isProduction) {
  app.use(express.static(distPath));

  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`SPKT server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
});
