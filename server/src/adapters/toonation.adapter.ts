import { randomUUID } from 'node:crypto';
import type { DonationEvent } from '../types.js';
import { mapAmountToEventType } from '../services/eventMapping.service.js';

export class ToonationIgnoredError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'ToonationIgnoredError';
  }
}

/**
 * 투네이션 webhook payload 정규화.
 *
 * 투네이션은 공식 webhook 표준이 없고 alertbox URL 기반이므로
 * 다양한 payload 형태를 fallback으로 처리합니다.
 *
 * 확인된 payload 패턴:
 *   1) { nickname, amount, message }            — 직접 후원
 *   2) { username, amount, message, type }      — username 필드 변형
 *   3) { nickname, payAmount, message }         — payAmount 사용
 *   4) { data: { nickname, amount, message } }  — 중첩 형식
 *   5) { name, point, comment }                 — 포인트 후원 변형
 */
export function normalizeToonationPayload(payload: unknown): DonationEvent {
  if (!payload || typeof payload !== 'object') {
    throw new ToonationIgnoredError('빈 payload');
  }

  const p = payload as Record<string, unknown>;

  // 중첩 data 필드가 있으면 unwrap
  const root: Record<string, unknown> =
    p['data'] && typeof p['data'] === 'object'
      ? (p['data'] as Record<string, unknown>)
      : p;

  // nickname 추출 (우선순위 순)
  const nickname = String(
    root['nickname'] ?? root['username'] ?? root['name'] ??
    root['user_name'] ?? root['donorName'] ?? '익명'
  );

  // amount 추출 (여러 필드명 시도)
  const rawAmount =
    root['amount'] ?? root['payAmount'] ?? root['point'] ??
    root['pay_amount'] ?? root['donationAmount'];

  if (rawAmount === undefined || rawAmount === null) {
    throw new ToonationIgnoredError('amount 필드 없음 — 후원이 아닌 이벤트로 간주');
  }

  const amount = Number(String(rawAmount).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ToonationIgnoredError(`유효하지 않은 금액: ${rawAmount}`);
  }

  // message 추출
  const message = String(
    root['message'] ?? root['comment'] ?? root['text'] ?? root['memo'] ?? ''
  );

  return {
    id: randomUUID(),
    platform: 'toonation',
    nickname,
    amount,
    message,
    eventType: mapAmountToEventType(amount),
    receivedAt: new Date().toISOString(),
  };
}
