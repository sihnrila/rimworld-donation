import { Router } from 'express';
import { normalizeChzzkPayload, ChzzkIgnoredError } from '../adapters/chzzk.adapter.js';
import { saveDonationEvent } from '../services/event.service.js';
import { appendRawLog } from '../services/rawLog.service.js';
import { chzzkHmac } from '../middleware/hmac.js';

export const chzzkRouter = Router();

chzzkRouter.post('/webhook/chzzk', chzzkHmac, async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
    ?? req.socket.remoteAddress
    ?? 'unknown';

  // 원본 payload 무조건 저장
  try {
    let event;
    try {
      event = normalizeChzzkPayload(req.body);
    } catch (err) {
      if (err instanceof ChzzkIgnoredError) {
        await appendRawLog('chzzk', {
          receivedAt: new Date().toISOString(),
          ip,
          payload: req.body,
          result: 'ignored',
          reason: err.message,
        });
        console.log(`[chzzk] 무시됨: ${err.message}`);
        return res.json({ ok: true, status: 'ignored', reason: err.message });
      }
      throw err;
    }

    const saved = await saveDonationEvent(event);
    await appendRawLog('chzzk', {
      receivedAt: new Date().toISOString(),
      ip,
      payload: req.body,
      result: 'ok',
    });
    console.log(`[chzzk] ${saved.nickname} | ${saved.amount}원 | ${saved.eventType}`);
    return res.json({ ok: true, event: saved });
  } catch (err) {
    await appendRawLog('chzzk', {
      receivedAt: new Date().toISOString(),
      ip,
      payload: req.body,
      result: 'error',
      reason: String(err),
    });
    console.error('[chzzk] 오류:', err);
    return res.status(400).json({ ok: false, error: String(err) });
  }
});
