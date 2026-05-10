import type { DonationEventType } from '../types.js';

export function mapAmountToEventType(amount: number): DonationEventType {
  if (amount >= 10000) return 'mech_raid';
  if (amount >= 7000) return 'fire';
  if (amount >= 5000) return 'raid';
  if (amount >= 3000) return 'animal';
  return 'item';
}
