import { Router } from 'express';
import { createTestDonation } from '../adapters/test.adapter.js';
import { saveDonationEvent } from '../services/event.service.js';

export const testRouter = Router();

testRouter.post('/test/donation', async (req, res) => {
  const amount = Number(req.body?.amount ?? 5000);
  const message = String(req.body?.message ?? '테스트 이벤트');
  const event = createTestDonation(amount, message);
  await saveDonationEvent(event);
  res.json({ ok: true, event });
});
