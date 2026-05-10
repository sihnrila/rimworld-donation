#!/usr/bin/env node
/**
 * 치지직 webhook 테스트 스크립트
 * 사용법: node scripts/send-test-chzzk.mjs [flat|nested|follow]
 */
const BASE = process.env.SERVER_URL || 'http://localhost:33210';
const TYPE = process.argv[2] || 'flat';

const PAYLOADS = {
  flat: {
    desc: '플랫 형식 후원 (5,000원)',
    payload: { nickname: '치즈왕', amount: 5000, message: '레이드 가자!' }
  },
  nested: {
    desc: '중첩 형식 후원 (10,000원 — CHAT_DONATION)',
    payload: {
      eventType: 'CHAT_DONATION',
      channelId: 'test-channel',
      data: { payType: 'CHAT', payAmount: 10000, nickname: '슈퍼치즈', message: '메카 습격!' }
    }
  },
  follow: {
    desc: '팔로우 이벤트 (후원 아님 — ignored 처리 예상)',
    payload: { eventType: 'FOLLOW', channelId: 'test-channel', data: { nickname: '새팔로워' } }
  },
  large: {
    desc: '대형 후원 (50,000원)',
    payload: { nickname: 'VIP후원자', amount: 50000, message: '최대 이벤트!' }
  },
};

const selected = PAYLOADS[TYPE];
if (!selected) {
  console.error(`알 수 없는 타입: ${TYPE}`);
  console.error(`사용 가능: ${Object.keys(PAYLOADS).join(', ')}`);
  process.exit(1);
}

console.log(`[치지직 테스트] ${selected.desc}`);
console.log('→ 전송 중...', JSON.stringify(selected.payload, null, 2));

const r = await fetch(`${BASE}/webhook/chzzk`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(selected.payload),
});
const j = await r.json();
console.log(`← HTTP ${r.status}`, JSON.stringify(j, null, 2));
