import { dirname, resolve } from 'node:path';
import { mkdir, writeFile, unlink } from 'node:fs/promises';

export function resolveEventFilePath(pathFromEnv?: string): string {
  return resolve(process.cwd(), pathFromEnv || './data/event.json');
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function removeFileIfExists(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // noop
  }
}
