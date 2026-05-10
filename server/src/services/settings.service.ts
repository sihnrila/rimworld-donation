import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONFIG_DIR, PROJECT_ROOT } from '../utils/paths.js';

const SETTINGS_PATH = resolve(CONFIG_DIR, 'settings.json');

export interface AppSettings {
  eventFilePath: string;
  port: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  eventFilePath: resolve(PROJECT_ROOT, 'data', 'event.json'),
  port: 33210,
};

let current: AppSettings = { ...DEFAULT_SETTINGS };

function load(): void {
  try {
    if (!existsSync(SETTINGS_PATH)) {
      persist(DEFAULT_SETTINGS);
      return;
    }
    const raw = readFileSync(SETTINGS_PATH, 'utf-8');
    current = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    console.log('[settings] 로드:', SETTINGS_PATH);
  } catch {
    current = { ...DEFAULT_SETTINGS };
  }
}

function persist(s: AppSettings): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(SETTINGS_PATH, JSON.stringify(s, null, 2), 'utf-8');
}

export function getAppSettings(): AppSettings {
  return { ...current };
}

export function updateAppSettings(partial: Partial<AppSettings>): AppSettings {
  current = { ...current, ...partial };
  persist(current);
  console.log('[settings] 업데이트:', JSON.stringify(partial));
  return { ...current };
}

export function getEventFilePath(): string {
  return current.eventFilePath;
}

export function getDefaultEventFilePath(): string {
  return DEFAULT_SETTINGS.eventFilePath;
}

load();
