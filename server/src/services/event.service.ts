import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { DonationEvent } from '../types.js';
import { writeJsonFile, removeFileIfExists } from '../utils/file.js';
import { appendEventLog } from './log.service.js';
import { pickRandomItem } from './itemDrop.service.js';
import { getEventFilePath as getPath } from './settings.service.js';

export function getEventFilePath(): string {
  return getPath();
}

export async function saveDonationEvent(event: DonationEvent): Promise<DonationEvent> {
  if (event.eventType === 'item' && !event.itemDefName) {
    const picked = pickRandomItem();
    event = { ...event, itemDefName: picked.defName, itemAmount: picked.amount };
  }
  const filePath = getPath();
  await writeJsonFile(filePath, event);
  await appendEventLog(event);
  const itemInfo = event.itemDefName ? ` | ${event.itemDefName}×${event.itemAmount}` : '';
  console.log(`[event] ${event.eventType} | ${event.nickname} | ${event.amount}원${itemInfo}`);
  return event;
}

export async function getCurrentEvent(): Promise<DonationEvent | null> {
  try {
    const filePath = getPath();
    if (!existsSync(filePath)) return null;
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as DonationEvent;
  } catch {
    return null;
  }
}

export async function consumeCurrentEvent(): Promise<DonationEvent | null> {
  try {
    const filePath = getPath();
    if (!existsSync(filePath)) return null;
    const content = await readFile(filePath, 'utf-8');
    const event = JSON.parse(content) as DonationEvent;
    await removeFileIfExists(filePath);
    return event;
  } catch {
    return null;
  }
}
