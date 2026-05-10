import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { DonationEvent } from '../types.js';
import { mapAmountToEventType } from '../services/eventMapping.service.js';

// Toonation 후원 알림 webhook payload
// https://toon.at 위젯 → 커스텀 webhook 설정 시 전송되는 형식
const ToonationPayloadSchema = z.object({
  nickname:  z.string().optional(),
  username:  z.string().optional(),
  name:      z.string().optional(),
  amount:    z.number().or(z.string()),
  message:   z.string().optional().default(''),
  currency:  z.string().optional(),
  type:      z.string().optional(),
}).passthrough();

export function normalizeToonationPayload(payload: unknown): DonationEvent {
  const parsed = ToonationPayloadSchema.parse(payload);

  // 금액: 문자열일 수도 있음
  const amount = typeof parsed.amount === 'string'
    ? Number(parsed.amount.replace(/[^0-9.]/g, ''))
    : parsed.amount;

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Invalid donation amount');
  }

  const nickname = parsed.nickname ?? parsed.username ?? parsed.name ?? '익명';

  return {
    id: randomUUID(),
    platform: 'toonation',
    nickname,
    amount,
    message: parsed.message ?? '',
    eventType: mapAmountToEventType(amount),
    receivedAt: new Date().toISOString(),
  };
}
