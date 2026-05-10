import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../utils/paths.js';

const DATA_DIR = resolve(PROJECT_ROOT, 'data');

export interface RawLogEntry {
  receivedAt: string;
  ip: string;
  payload: unknown;
  result: 'ok' | 'ignored' | 'error';
  reason?: string;
}

export async function appendRawLog(platform: string, entry: RawLogEntry): Promise<void> {
  const filePath = resolve(DATA_DIR, `${platform}-raw.log.jsonl`);
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(filePath, JSON.stringify(entry) + '\n', 'utf-8');
}

export async function getRawLogs(platform: string, limit = 20): Promise<RawLogEntry[]> {
  try {
    const filePath = resolve(DATA_DIR, `${platform}-raw.log.jsonl`);
    const content = await readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines
      .slice(-limit)
      .map(line => JSON.parse(line) as RawLogEntry)
      .reverse();
  } catch {
    return [];
  }
}
