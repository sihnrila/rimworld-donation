#!/usr/bin/env node
/**
 * 투네이션 webhook 테스트 스크립트
 * 사용법: node scripts/send-test-toonation.mjs [standard|username|follow|nested]
 */
const BASE = process.env.SERVER_URL || 'http://localhost:33210';
const TYPE = process.argv[2] || 'standard';

const PAYLOADS = {
  standard: {
    desc: '표준 형식 (7,000원)',
    payload: { nickname: '투네유저', amount: 7000, message: '화재 이벤트!' }
  },
  username: {
    desc: 'username 필드 + payAmount (3,000원)',
    payload: { username: '다른이름', payAmount: 3000, message: '동물 폭주~', type: 'donation' }
  },
  nested: {
    desc: '중첩 data 형식 (5,000원)',
    payload: { type: 'donation', data: { nickname: '중첩유저', amount: 5000, message: '습격!' } }
  },
  follow: {
    desc: '팔로우 이벤트 (후원 아님 — ignored 예상)',
    payload: { type: 'follow', username: '새팔로워' }
  },
};

const selected = PAYLOADS[TYPE];
if (!selected) {
  console.error(`알 수 없는 타입: ${TYPE}`);
  console.error(`사용 가능: ${Object.keys(PAYLOADS).join(', ')}`);
  process.exit(1);
}

console.log(`[투네이션 테스트] ${selected.desc}`);
console.log('→ 전송 중...', JSON.stringify(selected.payload, null, 2));

const r = await fetch(`${BASE}/webhook/toonation`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(selected.payload),
});
const j = await r.json();
console.log(`← HTTP ${r.status}`, JSON.stringify(j, null, 2));
