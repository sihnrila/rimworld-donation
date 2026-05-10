import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { DonationEvent } from '../types.js';
import { mapAmountToEventType } from '../services/eventMapping.service.js';

const ChzzkDonationPayloadSchema = z.object({
  nickname: z.string().optional(),
  userName: z.string().optional(),
  amount: z.number().or(z.string()),
  message: z.string().optional().default(''),
  donationMessage: z.string().optional()
}).passthrough();

export function normalizeChzzkPayload(payload: unknown): DonationEvent {
  const parsed = ChzzkDonationPayloadSchema.parse(payload);
  const amount = typeof parsed.amount === 'string' ? Number(parsed.amount) : parsed.amount;

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Invalid donation amount');
  }

  return {
    id: randomUUID(),
    platform: 'chzzk',
    nickname: parsed.nickname || parsed.userName || '익명',
    amount,
    message: parsed.message || parsed.donationMessage || '',
    eventType: mapAmountToEventType(amount),
    receivedAt: new Date().toISOString()
  };
}
