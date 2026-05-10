import { existsSync, mkdirSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONFIG_DIR } from '../utils/paths.js';
import type { DonationEventType, MappingEntry } from '../types.js';

const CONFIG_PATH = resolve(CONFIG_DIR, 'event-mapping.json');

export const DEFAULT_MAPPINGS: MappingEntry[] = [
  { minAmount: 10000, eventType: 'mech_raid', label: '메카노이드 습격' },
  { minAmount: 7000,  eventType: 'fire',      label: '화재 발생' },
  { minAmount: 5000,  eventType: 'raid',      label: '적 습격' },
  { minAmount: 3000,  eventType: 'animal',    label: '동물 폭주' },
  { minAmount: 1000,  eventType: 'item',      label: '아이템 드랍' },
];

let currentMappings: MappingEntry[] = [...DEFAULT_MAPPINGS];

function loadFromFile(): void {
  try {
    if (!existsSync(CONFIG_PATH)) {
      persistMappings(DEFAULT_MAPPINGS);
      currentMappings = [...DEFAULT_MAPPINGS];
      return;
    }
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as { mappings: MappingEntry[] };
    if (!Array.isArray(parsed.mappings) || parsed.mappings.length === 0) {
      throw new Error('mappings 배열 없음');
    }
    currentMappings = [...parsed.mappings].sort((a, b) => b.minAmount - a.minAmount);
    console.log('[config] event-mapping.json 로드');
  } catch (err) {
    console.warn('[config] event-mapping.json 오류, 기본값 사용:', err);
    currentMappings = [...DEFAULT_MAPPINGS];
  }
}

function persistMappings(mappings: MappingEntry[]): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify({ mappings }, null, 2), 'utf-8');
}

export function getMappings(): MappingEntry[] {
  return [...currentMappings];
}

export function updateMappings(mappings: MappingEntry[]): MappingEntry[] {
  const sorted = [...mappings].sort((a, b) => b.minAmount - a.minAmount);
  currentMappings = sorted;
  persistMappings(sorted);
  console.log('[config] event-mapping 업데이트:', sorted.map(m => `${m.minAmount}→${m.eventType}`).join(', '));
  return sorted;
}

export function mapAmountToEventType(amount: number): DonationEventType {
  for (const entry of currentMappings) { // 이미 내림차순 정렬됨
    if (amount >= entry.minAmount) return entry.eventType;
  }
  return 'item';
}

// 초기 로드
loadFromFile();

// 파일 직접 편집 시 핫리로드
try {
  watch(CONFIG_DIR, { persistent: false }, (_event, filename) => {
    if (filename === 'event-mapping.json') {
      console.log('[config] event-mapping.json 변경 감지, 리로드');
      loadFromFile();
    }
  });
} catch {
  // config 디렉토리 없으면 무시
}
