import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { DonationEvent, LogEntry } from '../types.js';

const logFilePath = resolve(process.cwd(), process.env.LOG_FILE_PATH || './data/events.log.jsonl');

export async function appendEventLog(event: DonationEvent): Promise<void> {
  await mkdir(dirname(logFilePath), { recursive: true });
  const entry: LogEntry = { event, loggedAt: new Date().toISOString() };
  await appendFile(logFilePath, JSON.stringify(entry) + '\n', 'utf-8');
}

export async function getRecentLogs(limit = 50): Promise<LogEntry[]> {
  try {
    const content = await readFile(logFilePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines
      .slice(-limit)
      .map(line => JSON.parse(line) as LogEntry)
      .reverse();
  } catch {
    return [];
  }
}
