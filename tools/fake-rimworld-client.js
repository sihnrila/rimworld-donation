#!/usr/bin/env node
/**
 * fake-rimworld-client.js
 * RimWorld 없이 /event 폴링 구조를 테스트하는 스크립트.
 * 실제 RimWorld 모드와 동일한 흐름으로 동작:
 *   2초마다 GET /event → 이벤트 있으면 출력 → 없으면 조용히 대기
 *
 * 실행: node tools/fake-rimworld-client.js
 *       SERVER_URL=http://192.168.1.100:33210 node tools/fake-rimworld-client.js
 */

const SERVER_URL = (process.env.SERVER_URL || 'http://localhost:33210').replace(/\/$/, '');
const POLL_MS    = 2000;

const ICONS = {
  item:     '💰',
  animal:   '🐾',
  raid:     '⚔️ ',
  fire:     '🔥',
  mech_raid:'🤖',
};

let received = 0;
let dots     = 0;

function clearDots() {
  if (dots > 0) { process.stdout.write('\n'); dots = 0; }
}

async function poll() {
  try {
    const res = await fetch(`${SERVER_URL}/event`, {
      signal: AbortSignal.timeout(1500),
    });

    if (res.status === 204) {
      // 이벤트 없음 — 점 하나로 대기 표시
      process.stdout.write('.');
      dots++;
      if (dots >= 30) { process.stdout.write('\n'); dots = 0; }
      return;
    }

    if (res.status === 200) {
      clearDots();
      received++;
      const e = await res.json();

      const icon   = ICONS[e.eventType] || '❓';
      const amt    = Number(e.amount).toLocaleString('ko-KR');
      const border = '─'.repeat(44);

      console.log(`┌${border}`);
      console.log(`│ #${String(received).padEnd(3)} ${icon} ${e.eventType.padEnd(12)} ${e.nickname}`);
      console.log(`│ 금액     : ${amt}원`);
      console.log(`│ 플랫폼   : ${e.platform}`);
      if (e.itemDefName) {
        console.log(`│ 아이템   : ${e.itemDefName} × ${e.itemAmount}`);
      }
      if (e.message) {
        console.log(`│ 메시지   : ${e.message}`);
      }
      console.log(`│ 수신     : ${new Date(e.receivedAt).toLocaleTimeString('ko-KR')}`);
      console.log(`└${border}`);
      return;
    }

    clearDots();
    console.warn(`[FakeClient] 예상치 못한 응답: HTTP ${res.status}`);

  } catch (err) {
    if (err.name === 'TimeoutError' || err.code === 'ECONNREFUSED' || err.cause?.code === 'ECONNREFUSED') {
      process.stdout.write('x'); // 서버 미연결
      dots++;
    } else {
      clearDots();
      console.error(`[FakeClient] 오류: ${err.message}`);
    }
  }
}

console.log(`[FakeClient] 시작 → ${SERVER_URL}/event  (${POLL_MS / 1000}초 간격)`);
console.log('[FakeClient] 범례: . = 대기중  x = 서버 없음  이벤트 박스 = 수신 성공');
console.log('[FakeClient] Ctrl+C 로 종료\n');

poll();
setInterval(poll, POLL_MS);
