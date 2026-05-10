import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { DonationEvent } from '../types.js';
import { resolveEventFilePath, writeJsonFile, removeFileIfExists } from '../utils/file.js';
import { appendEventLog } from './log.service.js';
import { pickRandomItem } from './itemDrop.service.js';

const eventFilePath = resolveEventFilePath(process.env.EVENT_FILE_PATH);

export async function saveDonationEvent(event: DonationEvent): Promise<DonationEvent> {
  // item 이벤트인데 아이템이 아직 지정 안 됐으면 랜덤 선택
  if (event.eventType === 'item' && !event.itemDefName) {
    const picked = pickRandomItem();
    event = { ...event, itemDefName: picked.defName, itemAmount: picked.amount };
  }
  await writeJsonFile(eventFilePath, event);
  await appendEventLog(event);
  const itemInfo = event.itemDefName ? ` | ${event.itemDefName}×${event.itemAmount}` : '';
  console.log(`[event] ${event.eventType} | ${event.nickname} | ${event.amount}원${itemInfo}`);
  return event;
}

export function getEventFilePath(): string {
  return eventFilePath;
}

export async function getCurrentEvent(): Promise<DonationEvent | null> {
  try {
    if (!existsSync(eventFilePath)) return null;
    const content = await readFile(eventFilePath, 'utf-8');
    return JSON.parse(content) as DonationEvent;
  } catch {
    return null;
  }
}

// 1회성 consume — GET /event 용
export async function consumeCurrentEvent(): Promise<DonationEvent | null> {
  try {
    if (!existsSync(eventFilePath)) return null;
    const content = await readFile(eventFilePath, 'utf-8');
    const event = JSON.parse(content) as DonationEvent;
    await removeFileIfExists(eventFilePath);
    return event;
  } catch {
    return null;
  }
}
