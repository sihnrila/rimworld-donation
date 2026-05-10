import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { DonationEvent } from '../types.js';
import { resolveEventFilePath, writeJsonFile, removeFileIfExists } from '../utils/file.js';
import { appendEventLog } from './log.service.js';

const eventFilePath = resolveEventFilePath(process.env.EVENT_FILE_PATH);

export async function saveDonationEvent(event: DonationEvent): Promise<DonationEvent> {
  await writeJsonFile(eventFilePath, event);
  await appendEventLog(event);
  console.log(`[event] ${event.eventType} | ${event.nickname} | ${event.amount}원`);
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

// 이벤트를 읽고 즉시 삭제 (1회성 consume). GET /event 용.
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
