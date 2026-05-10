import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { DonationEvent } from '../types.js';
import { mapAmountToEventType } from '../services/eventMapping.service.js';

// 별풍선 1개 = 110원 (SOOP 기준)
const STAR_BALLOON_PRICE = 110;

// SOOP(구 아프리카TV) 별풍선 / 후원 webhook payload
const SoopPayloadSchema = z.union([
  // 별풍선 형식
  z.object({
    fan_nickname:     z.string().optional(),
    nickname:         z.string().optional(),
    star_balloon_cnt: z.number().or(z.string()).optional(),
    balloon_cnt:      z.number().or(z.string()).optional(),
    message:          z.string().optional().default(''),
  }).passthrough(),
  // 현금 후원 형식
  z.object({
    nickname: z.string().optional(),
    username: z.string().optional(),
    amount:   z.number().or(z.string()).optional(),
    message:  z.string().optional().default(''),
  }).passthrough(),
]);

export function normalizeSoopPayload(payload: unknown): DonationEvent {
  const parsed = SoopPayloadSchema.parse(payload) as Record<string, unknown>;

  const nickname = String(parsed['fan_nickname'] ?? parsed['nickname'] ?? parsed['username'] ?? '익명');

  // 별풍선 개수 → 원으로 환산
  const balloonCnt =
    Number(parsed['star_balloon_cnt'] ?? parsed['balloon_cnt'] ?? 0);

  let amount: number;
  if (balloonCnt > 0) {
    amount = balloonCnt * STAR_BALLOON_PRICE;
  } else {
    amount = Number(parsed['amount'] ?? 0);
  }

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Invalid donation amount');
  }

  const message = String(parsed['message'] ?? '');

  return {
    id: randomUUID(),
    platform: 'soop',
    nickname,
    amount,
    message,
    eventType: mapAmountToEventType(amount),
    receivedAt: new Date().toISOString(),
  };
}
