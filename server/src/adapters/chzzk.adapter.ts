import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { DonationEvent } from '../types.js';
import { mapAmountToEventType } from '../services/eventMapping.service.js';

// ── Chzzk 후원 이벤트 타입 목록 ──────────────────────────────────────
const DONATION_EVENT_TYPES = new Set([
  // 공식 API eventType 값
  'DONATION', 'CHAT_DONATION', 'VIDEO_DONATION', 'MISSION_DONATION',
  // 소문자 변형
  'donation', 'chat_donation', 'video_donation',
]);

// ── 중첩 payload 스키마 (eventType + data 구조) ──────────────────────
const NestedPayloadSchema = z.object({
  eventType: z.string().optional(),
  channelId: z.string().optional(),
  data: z.object({
    nickname:     z.string().optional(),
    userName:     z.string().optional(),
    payAmount:    z.number().or(z.string()).optional(),
    amount:       z.number().or(z.string()).optional(),
    message:      z.string().optional(),
    payType:      z.string().optional(),
    donationType: z.string().optional(),
  }).passthrough().optional(),
}).passthrough();

// ── 플랫 payload 스키마 (기존 형식) ─────────────────────────────────
const FlatPayloadSchema = z.object({
  nickname:        z.string().optional(),
  userName:        z.string().optional(),
  amount:          z.number().or(z.string()).optional(),
  message:         z.string().optional().default(''),
  donationMessage: z.string().optional(),
}).passthrough();

export class ChzzkIgnoredError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'ChzzkIgnoredError';
  }
}

/**
 * payload가 후원 이벤트인지 판별.
 * 후원이 아니면 ChzzkIgnoredError를 throw.
 */
export function normalizeChzzkPayload(payload: unknown): DonationEvent {
  if (!payload || typeof payload !== 'object') {
    throw new ChzzkIgnoredError('빈 payload');
  }

  const p = payload as Record<string, unknown>;

  // ── 중첩 형식 (eventType + data) 처리 ────────────────────────────
  if ('eventType' in p || 'data' in p) {
    const parsed = NestedPayloadSchema.parse(p);
    const eventType = parsed.eventType ?? '';

    // eventType이 있는데 후원 타입이 아닌 경우 무시
    if (eventType && !DONATION_EVENT_TYPES.has(eventType)) {
      throw new ChzzkIgnoredError(`후원 아닌 이벤트: ${eventType}`);
    }

    const data = parsed.data ?? {};
    const rawAmount = data['payAmount'] ?? data['amount'];
    const amount = rawAmount !== undefined ? Number(rawAmount) : NaN;
    const nickname = String(data['nickname'] ?? data['userName'] ?? '익명');
    const message = String(data['message'] ?? '');

    if (!Number.isFinite(amount) || amount < 0) {
      throw new ChzzkIgnoredError(`유효하지 않은 금액: ${rawAmount}`);
    }

    return {
      id: randomUUID(),
      platform: 'chzzk',
      nickname,
      amount,
      message,
      eventType: mapAmountToEventType(amount),
      receivedAt: new Date().toISOString(),
    };
  }

  // ── 플랫 형식 처리 ────────────────────────────────────────────────
  const parsed = FlatPayloadSchema.parse(p);
  const rawAmount = parsed.amount;

  if (rawAmount === undefined || rawAmount === null) {
    throw new ChzzkIgnoredError('amount 필드 없음 — 후원이 아닌 이벤트로 간주');
  }

  const amount = typeof rawAmount === 'string' ? Number(rawAmount) : rawAmount;
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ChzzkIgnoredError(`유효하지 않은 금액: ${rawAmount}`);
  }

  return {
    id: randomUUID(),
    platform: 'chzzk',
    nickname: parsed.nickname ?? parsed.userName ?? '익명',
    amount,
    message: parsed.message ?? parsed.donationMessage ?? '',
    eventType: mapAmountToEventType(amount),
    receivedAt: new Date().toISOString(),
  };
}
