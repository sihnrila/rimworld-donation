# RimWorld 후원 연동 — 원격 설치자 가이드

> **대상**: 스트리머 대신 설치해주는 기술 담당자용

---

## 아키텍처 개요

```
[치지직/투네이션] ──webhook──▶ [streamer-app.exe :33210]
                                         │
                              event.json 파일 쓰기
                                         │
                              [RimWorld 모드] ──폴링──▶ 게임 이벤트 실행
```

- 서버는 `POST /webhook/{platform}` 으로 후원 수신
- `event.json` 에 이벤트 기록 → 모드가 5초마다 폴링해서 읽고 삭제
- 대시보드: `http://localhost:33210/` (실시간 모니터링)
- 설정: `http://localhost:33210/settings`

---

## 서버 빌드 (개발자)

```bash
cd server
npm install
npm run build           # TypeScript → CJS 번들
npm run package:win     # → streamer-app.exe (Windows 전용)
```

> Windows 환경에서 빌드해야 합니다 (pkg node18-win-x64).

---

## 환경변수 설정 (.env)

`streamer-app.exe` 와 같은 폴더에 `.env` 파일 생성:

```env
PORT=33210
CHZZK_WEBHOOK_SECRET=여기에_치지직_시크릿_입력
EVENT_FILE_PATH=C:\Users\Streamer\AppData\Local\RimWorldDonation\event.json
LOG_FILE_PATH=C:\Users\Streamer\AppData\Local\RimWorldDonation\events.log.jsonl
```

- `CHZZK_WEBHOOK_SECRET` 미설정 시 dev 모드로 HMAC 검증 skip
- `EVENT_FILE_PATH` 미설정 시 exe 옆 `data/event.json` 사용

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 + event.json 경로 |
| GET | `/event` | 1회 consume (모드 전용) |
| POST | `/webhook/chzzk` | 치지직 후원 수신 |
| POST | `/webhook/toonation` | 투네이션 후원 수신 |
| POST | `/webhook/soop` | SOOP 후원 수신 |
| GET | `/api/logs` | 최근 이벤트 로그 |
| GET | `/api/status` | 현재 event.json 내용 |
| GET | `/api/webhook/:platform/raw-logs` | 플랫폼별 원시 수신 로그 |
| GET/PUT | `/api/config/event-mapping` | 금액→이벤트 매핑 |
| GET/PUT | `/api/config/item-drops` | 아이템 드랍 설정 |
| GET/PUT | `/api/config/settings` | 앱 설정 (경로 등) |

---

## HMAC 검증 구조 (치지직)

헤더: `X-Signature-256: sha256=<HMAC-SHA256 hex>`

```
환경변수 CHZZK_WEBHOOK_SECRET 없음 → dev mode (검증 skip, 로그 경고)
환경변수 있음 → timingSafeEqual로 HMAC 검증 → 불일치 시 401
```

---

## 2PC 구성

### 방법 A — 파일 공유 (권장)

1. 게임 PC에서 공유 폴더 생성: `\\게임PC\RimDonation\`
2. 설정 페이지에서 `event.json` 경로를 공유 폴더 경로로 변경:
   ```
   \\게임PC\RimDonation\event.json
   ```

### 방법 B — HTTP 폴링

1. 게임 PC에 파일 생성:
   ```
   %LocalAppData%\RimWorldDonation\server.url
   ```
   내용:
   ```
   http://송출컴IP:33210
   ```
2. 모드가 `/event` API를 폴링해서 이벤트를 가져옴

---

## 원시 로그 파일 위치

```
data/chzzk-raw.log.jsonl       ← 치지직 수신 전체 기록
data/toonation-raw.log.jsonl   ← 투네이션 수신 전체 기록
data/events.log.jsonl          ← 처리된 이벤트 로그
data/event.json                ← 현재 대기 중인 이벤트 (읽히면 삭제)
```

---

## 문제 진단

```bash
# 서버 헬스 체크
curl http://localhost:33210/health

# 치지직 raw 로그 확인
curl http://localhost:33210/api/webhook/chzzk/raw-logs

# 수동 테스트 이벤트
curl -X POST http://localhost:33210/api/test-event \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"message":"테스트"}'

# 치지직 flat 형식 테스트
curl -X POST http://localhost:33210/webhook/chzzk \
  -H "Content-Type: application/json" \
  -d '{"nickname":"테스터","amount":5000,"message":"테스트"}'

# 치지직 nested 형식 테스트
curl -X POST http://localhost:33210/webhook/chzzk \
  -H "Content-Type: application/json" \
  -d '{"eventType":"CHAT_DONATION","data":{"nickname":"테스터","payAmount":5000,"message":"테스트"}}'
```

---

## 지원 플랫폼 Payload 형식

### 치지직 (Chzzk)

**플랫 형식**:
```json
{ "nickname": "닉네임", "amount": 5000, "message": "메시지" }
```

**중첩 형식 (eventType + data)**:
```json
{
  "eventType": "CHAT_DONATION",
  "data": { "nickname": "닉네임", "payAmount": 5000, "message": "메시지" }
}
```

후원 아닌 이벤트 (`FOLLOW`, `SUBSCRIPTION` 등) → `result: ignored` 처리

### 투네이션 (Toonation)

```json
{ "nickname": "닉네임", "amount": 5000, "message": "메시지" }
{ "username": "닉네임", "payAmount": 3000, "message": "메시지" }
{ "data": { "nickname": "닉네임", "amount": 5000 } }
```

> **주의**: 투네이션은 공식 webhook 스펙이 없습니다.  
> alertbox URL 기반 연동이므로 실제 payload 형식은 연동 방식에 따라 다를 수 있습니다.  
> 연동 후 raw-logs API로 실제 수신 형식 확인 필요.

### SOOP (구 아프리카TV)

```json
{ "fan_nickname": "닉네임", "star_balloon_cnt": 50, "message": "메시지" }
```
별풍선 1개 = 110원 자동 환산
