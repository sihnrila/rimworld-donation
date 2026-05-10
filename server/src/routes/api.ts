import { Router } from 'express';
import { createTestDonation } from '../adapters/test.adapter.js';
import {
  saveDonationEvent,
  getEventFilePath,
  getCurrentEvent,
  consumeCurrentEvent
} from '../services/event.service.js';
import { getRecentLogs } from '../services/log.service.js';
import type { DonationEventType } from '../types.js';

export const apiRouter = Router();

const VALID_EVENT_TYPES = new Set<DonationEventType>(['item', 'animal', 'raid', 'mech_raid', 'fire']);

// RimWorld 모드가 폴링하는 엔드포인트 — 1회성 consume (읽으면 event.json 삭제)
apiRouter.get('/event', async (_req, res) => {
  const event = await consumeCurrentEvent();
  if (!event) {
    return res.status(204).send();
  }
  return res.json(event);
});

// 대시보드 테스트 버튼용
apiRouter.post('/api/test-event', async (req, res) => {
  const amount = Number(req.body?.amount ?? 5000);
  const message = String(req.body?.message ?? '테스트 이벤트');
  const rawType = req.body?.eventType as string | undefined;
  const eventType = rawType && VALID_EVENT_TYPES.has(rawType as DonationEventType)
    ? (rawType as DonationEventType)
    : undefined;

  const event = createTestDonation(amount, message, eventType);
  await saveDonationEvent(event);
  return res.json({ ok: true, event });
});

// 최근 이벤트 로그
apiRouter.get('/api/logs', async (_req, res) => {
  const logs = await getRecentLogs(50);
  return res.json({ ok: true, logs });
});

// 현재 event.json 상태 (비소비 — 대시보드 표시용)
apiRouter.get('/api/status', async (_req, res) => {
  const currentEvent = await getCurrentEvent();
  return res.json({ ok: true, eventFilePath: getEventFilePath(), currentEvent });
});
