import { Router } from 'express';
import { normalizeChzzkPayload } from '../adapters/chzzk.adapter.js';
import { saveDonationEvent } from '../services/event.service.js';

export const chzzkRouter = Router();

chzzkRouter.post('/webhook/chzzk', async (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    const incomingSecret = req.header('x-webhook-secret');

    if (secret && secret !== 'change-me' && incomingSecret !== secret) {
      return res.status(401).json({ ok: false, error: 'Invalid webhook secret' });
    }

    const event = normalizeChzzkPayload(req.body);
    await saveDonationEvent(event);

    return res.json({ ok: true, event });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
