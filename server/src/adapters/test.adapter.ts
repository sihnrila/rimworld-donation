import { randomUUID } from 'node:crypto';
import type { DonationEvent, DonationEventType } from '../types.js';
import { mapAmountToEventType } from '../services/eventMapping.service.js';

export function createTestDonation(
  amount = 5000,
  message = '테스트 이벤트',
  eventType?: DonationEventType
): DonationEvent {
  return {
    id: randomUUID(),
    platform: 'test',
    nickname: '테스트후원자',
    amount,
    message,
    eventType: eventType ?? mapAmountToEventType(amount),
    receivedAt: new Date().toISOString()
  };
}
