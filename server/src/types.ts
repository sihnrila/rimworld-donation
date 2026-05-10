export type Platform = 'chzzk' | 'toonation' | 'soop' | 'test';

export type DonationEventType =
  | 'item'
  | 'animal'
  | 'raid'
  | 'mech_raid'
  | 'fire'
  | 'buff'
  | 'debuff';

export interface DonationEvent {
  id: string;
  platform: Platform;
  nickname: string;
  amount: number;
  message: string;
  eventType: DonationEventType;
  receivedAt: string;
}

export interface LogEntry {
  event: DonationEvent;
  loggedAt: string;
}
