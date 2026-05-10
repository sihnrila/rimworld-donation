import { Router } from 'express';
import { normalizeToonationPayload } from '../adapters/toonation.adapter.js';
import { saveDonationEvent } from '../services/event.service.js';

export const toonationRouter = Router();

toonationRouter.post('/webhook/toonation', async (req, res) => {
  try {
    const event = normalizeToonationPayload(req.body);
    const saved = await saveDonationEvent(event);
    console.log(`[toonation] ${saved.nickname} | ${saved.amount}원`);
    return res.json({ ok: true, event: saved });
  } catch (err) {
    console.error('[toonation] 파싱 오류:', err);
    return res.status(400).json({ ok: false, error: String(err) });
  }
});
