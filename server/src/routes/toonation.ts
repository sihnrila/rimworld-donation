import { Router } from 'express';
import { normalizeToonationPayload, ToonationIgnoredError } from '../adapters/toonation.adapter.js';
import { saveDonationEvent } from '../services/event.service.js';
import { appendRawLog } from '../services/rawLog.service.js';

export const toonationRouter = Router();

toonationRouter.post('/webhook/toonation', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
    ?? req.socket.remoteAddress
    ?? 'unknown';

  try {
    let event;
    try {
      event = normalizeToonationPayload(req.body);
    } catch (err) {
      if (err instanceof ToonationIgnoredError) {
        await appendRawLog('toonation', {
          receivedAt: new Date().toISOString(),
          ip,
          payload: req.body,
          result: 'ignored',
          reason: err.message,
        });
        console.log(`[toonation] 무시됨: ${err.message}`);
        return res.json({ ok: true, status: 'ignored', reason: err.message });
      }
      throw err;
    }

    const saved = await saveDonationEvent(event);
    await appendRawLog('toonation', {
      receivedAt: new Date().toISOString(),
      ip,
      payload: req.body,
      result: 'ok',
    });
    console.log(`[toonation] ${saved.nickname} | ${saved.amount}원 | ${saved.eventType}`);
    return res.json({ ok: true, event: saved });
  } catch (err) {
    await appendRawLog('toonation', {
      receivedAt: new Date().toISOString(),
      ip,
      payload: req.body,
      result: 'error',
      reason: String(err),
    });
    console.error('[toonation] 오류:', err);
    return res.status(400).json({ ok: false, error: String(err) });
  }
});
