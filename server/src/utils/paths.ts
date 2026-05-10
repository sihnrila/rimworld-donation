import { dirname, resolve } from 'node:path';

// pkg로 패키징된 exe 실행 시 process.pkg가 정의됨
const isPkg: boolean = typeof (process as NodeJS.Process & { pkg?: unknown }).pkg !== 'undefined';

// dev: server/../ = project root / exe: exe가 있는 폴더
export const PROJECT_ROOT: string = isPkg
  ? dirname(process.execPath)
  : resolve(process.cwd(), '..');

export const CONFIG_DIR: string = process.env.CONFIG_DIR
  ? resolve(process.env.CONFIG_DIR)
  : resolve(PROJECT_ROOT, 'config');
