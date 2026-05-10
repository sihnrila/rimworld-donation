import { Router } from 'express';
import { normalizeSoopPayload } from '../adapters/soop.adapter.js';
import { saveDonationEvent } from '../services/event.service.js';

export const soopRouter = Router();

soopRouter.post('/webhook/soop', async (req, res) => {
  try {
    const event = normalizeSoopPayload(req.body);
    const saved = await saveDonationEvent(event);
    console.log(`[soop] ${saved.nickname} | ${saved.amount}원`);
    return res.json({ ok: true, event: saved });
  } catch (err) {
    console.error('[soop] 파싱 오류:', err);
    return res.status(400).json({ ok: false, error: String(err) });
  }
});
