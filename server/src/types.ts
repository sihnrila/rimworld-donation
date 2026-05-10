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
  // item 이벤트 전용 — 서버에서 선택해 채워줌
  itemDefName?: string;
  itemAmount?: number;
}

export interface LogEntry {
  event: DonationEvent;
  loggedAt: string;
}

export interface MappingEntry {
  minAmount: number;
  eventType: DonationEventType;
  label: string;
}

export interface ItemDropEntry {
  defName: string;
  label: string;
  minAmount: number;
  maxAmount: number;
  weight: number;
}
