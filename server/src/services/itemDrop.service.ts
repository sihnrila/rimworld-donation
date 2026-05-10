import { existsSync, mkdirSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONFIG_DIR } from '../utils/paths.js';
import type { ItemDropEntry } from '../types.js';

const CONFIG_PATH = resolve(CONFIG_DIR, 'item-drops.json');

export const DEFAULT_ITEMS: ItemDropEntry[] = [
  { defName: 'Silver',               label: '실버',           minAmount: 50,  maxAmount: 200, weight: 30 },
  { defName: 'Steel',                label: '철',             minAmount: 30,  maxAmount: 100, weight: 20 },
  { defName: 'Medicine',             label: '의약품',          minAmount: 5,   maxAmount: 20,  weight: 15 },
  { defName: 'ComponentIndustrial',  label: '부품',           minAmount: 3,   maxAmount: 10,  weight: 15 },
  { defName: 'MealFine',             label: '훌륭한 식사',     minAmount: 5,   maxAmount: 20,  weight: 10 },
  { defName: 'SurvivalMeal',         label: '생존 식량',       minAmount: 5,   maxAmount: 20,  weight: 10 },
  { defName: 'Plasteel',             label: '플라스틸',        minAmount: 5,   maxAmount: 20,  weight: 8  },
  { defName: 'Gold',                 label: '금',             minAmount: 10,  maxAmount: 50,  weight: 5  },
  { defName: 'Beer',                 label: '맥주',           minAmount: 5,   maxAmount: 25,  weight: 10 },
  { defName: 'GlitterworldMedicine', label: '글리터월드 약품', minAmount: 2,   maxAmount: 8,   weight: 3  },
];

let currentItems: ItemDropEntry[] = [...DEFAULT_ITEMS];

function loadFromFile(): void {
  try {
    if (!existsSync(CONFIG_PATH)) {
      persistItems(DEFAULT_ITEMS);
      currentItems = [...DEFAULT_ITEMS];
      return;
    }
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as { items: ItemDropEntry[] };
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new Error('items 배열 없음');
    }
    currentItems = parsed.items;
    console.log('[config] item-drops.json 로드');
  } catch (err) {
    console.warn('[config] item-drops.json 오류, 기본값 사용:', err);
    currentItems = [...DEFAULT_ITEMS];
  }
}

function persistItems(items: ItemDropEntry[]): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify({ items }, null, 2), 'utf-8');
}

export function getItemDrops(): ItemDropEntry[] {
  return [...currentItems];
}

export function updateItemDrops(items: ItemDropEntry[]): ItemDropEntry[] {
  currentItems = items;
  persistItems(items);
  console.log('[config] item-drops 업데이트:', items.map(i => i.defName).join(', '));
  return items;
}

// weight 기반 랜덤 선택 → { defName, amount }
export function pickRandomItem(): { defName: string; amount: number; label: string } {
  const pool = currentItems.filter(i => i.weight > 0);
  if (pool.length === 0) return { defName: 'Silver', amount: 100, label: '실버' };

  const totalWeight = pool.reduce((s, i) => s + i.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const item of pool) {
    rand -= item.weight;
    if (rand <= 0) {
      const amount = Math.floor(
        Math.random() * (item.maxAmount - item.minAmount + 1) + item.minAmount
      );
      return { defName: item.defName, amount, label: item.label };
    }
  }

  const last = pool[pool.length - 1];
  return {
    defName: last.defName,
    amount: last.minAmount,
    label: last.label,
  };
}

// 초기 로드
loadFromFile();

// 핫리로드
try {
  watch(CONFIG_DIR, { persistent: false }, (_event, filename) => {
    if (filename === 'item-drops.json') {
      console.log('[config] item-drops.json 변경 감지, 리로드');
      loadFromFile();
    }
  });
} catch {
  // ignore
}
