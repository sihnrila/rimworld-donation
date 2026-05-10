import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { chzzkRouter } from './routes/chzzk.js';
import { toonationRouter } from './routes/toonation.js';
import { soopRouter } from './routes/soop.js';
import { testRouter } from './routes/test.js';
import { apiRouter } from './routes/api.js';
import { getEventFilePath } from './services/event.service.js';
import { dashboardHtml } from './ui/dashboard.js';
import { settingsHtml } from './ui/settings.js';

const app = express();
const port = Number(process.env.PORT || 33210);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(dashboardHtml);
});

app.get('/settings', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(settingsHtml);
});

app.use(chzzkRouter);
app.use(toonationRouter);
app.use(soopRouter);
app.use(testRouter);
app.use(apiRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, eventFilePath: getEventFilePath() });
});

app.listen(port, () => {
  console.log(`[RimDonation] 서버 시작 → http://localhost:${port}`);
  console.log(`[RimDonation] 대시보드  → http://localhost:${port}/`);
  console.log(`[RimDonation] 설정      → http://localhost:${port}/settings`);
  console.log(`[RimDonation] event 파일 → ${getEventFilePath()}`);
});
