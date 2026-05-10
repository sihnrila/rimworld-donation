import { Router } from 'express';
import { createTestDonation } from '../adapters/test.adapter.js';
import {
  saveDonationEvent,
  getEventFilePath,
  getCurrentEvent,
  consumeCurrentEvent
} from '../services/event.service.js';
import { getRecentLogs } from '../services/log.service.js';
import { getMappings, updateMappings } from '../services/eventMapping.service.js';
import { getItemDrops, updateItemDrops } from '../services/itemDrop.service.js';
import { getAppSettings, updateAppSettings, getDefaultEventFilePath } from '../services/settings.service.js';
import { getRawLogs } from '../services/rawLog.service.js';
import type { DonationEventType, MappingEntry, ItemDropEntry } from '../types.js';

export const apiRouter = Router();

const VALID_EVENT_TYPES = new Set<DonationEventType>(['item', 'animal', 'raid', 'mech_raid', 'fire']);

// ─── 게임 모드 폴링 ─────────────────────────────────────────────────────────
apiRouter.get('/event', async (_req, res) => {
  const event = await consumeCurrentEvent();
  if (!event) return res.status(204).send();
  return res.json(event);
});

// ─── 이벤트 ─────────────────────────────────────────────────────────────────
apiRouter.post('/api/test-event', async (req, res) => {
  const amount = Number(req.body?.amount ?? 5000);
  const message = String(req.body?.message ?? '테스트 이벤트');
  const rawType = req.body?.eventType as string | undefined;
  const eventType = rawType && VALID_EVENT_TYPES.has(rawType as DonationEventType)
    ? (rawType as DonationEventType)
    : undefined;

  const event = createTestDonation(amount, message, eventType);
  const saved = await saveDonationEvent(event);
  return res.json({ ok: true, event: saved });
});

apiRouter.get('/api/logs', async (_req, res) => {
  const logs = await getRecentLogs(50);
  return res.json({ ok: true, logs });
});

apiRouter.get('/api/status', async (_req, res) => {
  const currentEvent = await getCurrentEvent();
  return res.json({ ok: true, eventFilePath: getEventFilePath(), currentEvent });
});

// ─── 설정: 이벤트 매핑 ───────────────────────────────────────────────────────
apiRouter.get('/api/config/event-mapping', (_req, res) => {
  return res.json({ ok: true, mappings: getMappings() });
});

apiRouter.put('/api/config/event-mapping', (req, res) => {
  try {
    const mappings = req.body?.mappings as MappingEntry[] | undefined;
    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({ ok: false, error: 'mappings 배열 필요' });
    }
    for (const m of mappings) {
      if (typeof m.minAmount !== 'number' || !m.eventType || !m.label) {
        return res.status(400).json({ ok: false, error: '각 mapping에 minAmount, eventType, label 필요' });
      }
    }
    const updated = updateMappings(mappings);
    return res.json({ ok: true, mappings: updated });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── 설정: 아이템 드랍 ───────────────────────────────────────────────────────
apiRouter.get('/api/config/item-drops', (_req, res) => {
  return res.json({ ok: true, items: getItemDrops() });
});

apiRouter.put('/api/config/item-drops', (req, res) => {
  try {
    const items = req.body?.items as ItemDropEntry[] | undefined;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'items 배열 필요' });
    }
    for (const item of items) {
      if (!item.defName || typeof item.minAmount !== 'number' || typeof item.maxAmount !== 'number' || typeof item.weight !== 'number') {
        return res.status(400).json({ ok: false, error: '각 item에 defName, minAmount, maxAmount, weight 필요' });
      }
    }
    const updated = updateItemDrops(items);
    return res.json({ ok: true, items: updated });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── 설정: 앱 설정 (event.json 경로 등) ────────────────────────────────────
apiRouter.get('/api/config/settings', (_req, res) => {
  return res.json({ ok: true, settings: getAppSettings() });
});

apiRouter.put('/api/config/settings', (req, res) => {
  try {
    const { eventFilePath } = req.body ?? {};
    if (eventFilePath !== undefined && typeof eventFilePath !== 'string') {
      return res.status(400).json({ ok: false, error: 'eventFilePath는 문자열이어야 합니다' });
    }
    const partial: Record<string, unknown> = {};
    if (typeof eventFilePath === 'string' && eventFilePath.trim()) {
      partial['eventFilePath'] = eventFilePath.trim();
    }
    if (Object.keys(partial).length === 0) {
      return res.status(400).json({ ok: false, error: '변경할 설정 없음' });
    }
    const updated = updateAppSettings(partial as Parameters<typeof updateAppSettings>[0]);
    return res.json({ ok: true, settings: updated });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── 원시 수신 로그 ──────────────────────────────────────────────────────────
apiRouter.get('/api/webhook/:platform/raw-logs', async (req, res) => {
  const allowed = new Set(['chzzk', 'toonation', 'soop']);
  const { platform } = req.params;
  if (!allowed.has(platform)) {
    return res.status(404).json({ ok: false, error: 'Unknown platform' });
  }
  const limit = Math.min(Number(req.query['limit'] ?? 20), 100);
  const logs = await getRawLogs(platform, limit);
  return res.json({ ok: true, platform, logs });
});

apiRouter.post('/api/config/settings/reset-event-path', (_req, res) => {
  try {
    const updated = updateAppSettings({ eventFilePath: getDefaultEventFilePath() });
    return res.json({ ok: true, settings: updated });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});
