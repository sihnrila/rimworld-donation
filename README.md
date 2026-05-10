# RimWorld Donation MVP

후원 이벤트를 받아 RimWorld 게임 내 이벤트로 실행하는 MVP입니다.

## 구성

- `server/`: Windows에서 실행할 Node.js 연동 서버
- `rimworld-mod/`: RimWorld 모드 소스
- `docs/`: 설치/판매용 문서

## MVP 흐름

```txt
치지직/테스트 후원 이벤트
→ Node 서버 수신
→ event.json 생성
→ RimWorld 모드가 event.json 읽음
→ 게임 이벤트 실행
```

## 빠른 실행

```bash
cd server
npm install
npm run dev
```

테스트:

```bash
curl -X POST http://localhost:33210/webhook/chzzk \
  -H "Content-Type: application/json" \
  -d @sample-payloads/chzzk-donation.json
```

생성 파일:

```txt
server/data/event.json
```

## 주의

RimWorld 모드는 실제 빌드 시 RimWorld의 Assembly-CSharp.dll, UnityEngine.dll, 0Harmony.dll 참조가 필요합니다.
