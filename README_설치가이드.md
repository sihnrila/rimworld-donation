# RimWorld 후원 연동 — 스트리머 설치 가이드

## 제공 파일

```
rimworld-donation-mvp/
├── streamer-app.exe          ← 서버 실행파일 (더블클릭)
├── rimworld-mod/             ← RimWorld 모드 폴더
├── config/event-mapping.json ← 금액별 이벤트 참조
└── README_설치가이드.md
```

---

## 금액별 이벤트 매핑

| 후원 금액 | 이벤트 |
|---:|---|
| 10,000원 이상 | 🤖 메카노이드 습격 |
| 7,000원 이상 | 🔥 화재 발생 |
| 5,000원 이상 | ⚔️ 적 습격 |
| 3,000원 이상 | 🐾 동물 폭주 |
| 1,000원 이상 | 💰 아이템 드랍 |

---

## 연동 구조

```
치지직/테스트 후원
    │
    ▼
streamer-app.exe (포트 33210)
    │  └─ POST /webhook/chzzk  ← 치지직 후원 수신
    │  └─ GET  /event          ← 모드가 2초마다 폴링 (1회성 소비)
    │  └─ GET  /               ← 대시보드
    │
    ▼
RimWorld 모드
    └─ HTTP GET /event 요청 → 이벤트 실행
    └─ (서버 불가 시) 로컬 파일 fallback
```

---

## 1PC 구성 (게임컴 = 송출컴, 가장 단순)

### 1단계 — RimWorld 모드 설치

`rimworld-mod` 폴더 전체를 아래 경로에 복사:
```
C:\Program Files (x86)\Steam\steamapps\common\RimWorld\Mods\
```

RimWorld 실행 → 모드 관리 → **RimWorld Donation Events MVP** 활성화 → 재시작

### 2단계 — 서버 실행

`streamer-app.exe` 더블클릭

정상 실행 시:
```
[RimDonation] 서버 시작 → http://localhost:33210
[RimDonation] 대시보드 → http://localhost:33210/
```

### 3단계 — 대시보드 테스트

브라우저에서 접속: `http://localhost:33210`

- 테스트 버튼 클릭 → 약 2초 후 게임에서 이벤트 발생 확인

### 4단계 — 치지직 연동

치지직 후원 알림 → Webhook URL:
```
POST http://localhost:33210/webhook/chzzk
```

---

## 2PC 구성 (게임컴 / 송출컴 분리)

```
[게임컴]                    [송출컴]
RimWorld + 모드  ←HTTP→   streamer-app.exe
                            치지직 후원 수신
```

### 송출컴 설정

1. `streamer-app.exe` 실행 (포트 33210)
2. 방화벽에서 33210 포트 열기 (아래 명령어 참고)

### 게임컴 설정

`%LocalAppData%\RimWorldDonation\` 폴더 생성 후 `server.url` 파일 작성:
```
http://192.168.1.100:33210
```
> `192.168.1.100` 자리에 송출컴의 LAN IP 입력

폴더/파일 경로 예시:
```
C:\Users\[사용자명]\AppData\Local\RimWorldDonation\server.url
```

### 방화벽 포트 열기 (송출컴에서 관리자 PowerShell 실행)

```powershell
New-NetFirewallRule -DisplayName "RimDonation-33210" `
  -Direction Inbound -Protocol TCP -LocalPort 33210 -Action Allow
```

제거할 때:
```powershell
Remove-NetFirewallRule -DisplayName "RimDonation-33210"
```

### 송출컴 LAN IP 확인

```powershell
ipconfig | findstr "IPv4"
```

---

## 테스트 방법

### 대시보드 테스트 버튼 (가장 쉬움)

브라우저 `http://송출컴IP:33210` → 버튼 클릭 → 게임 이벤트 확인

### curl 테스트

```powershell
# item 드랍
Invoke-WebRequest -Uri http://localhost:33210/api/test-event `
  -Method POST -ContentType "application/json" `
  -Body '{"eventType":"item"}'

# 금액으로 자동 매핑 (7000원 → fire)
Invoke-WebRequest -Uri http://localhost:33210/api/test-event `
  -Method POST -ContentType "application/json" `
  -Body '{"amount":7000}'

# 치지직 webhook 시뮬레이션
Invoke-WebRequest -Uri http://localhost:33210/webhook/chzzk `
  -Method POST -ContentType "application/json" `
  -Body '{"nickname":"테스트","amount":5000,"message":"습격 테스트"}'
```

### 상태 확인

```powershell
# 현재 pending 이벤트 확인
Invoke-WebRequest -Uri http://localhost:33210/api/status | Select -Expand Content

# 로그 확인
Invoke-WebRequest -Uri http://localhost:33210/api/logs | Select -Expand Content
```

---

## 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| exe 실행 즉시 종료 | 포트 충돌 | `netstat -ano \| findstr :33210` 으로 충돌 프로세스 확인 |
| 게임 이벤트 미발생 | 모드 미활성화 | RimWorld 모드 목록에서 활성화 확인 |
| 2PC — 이벤트 미수신 | 방화벽 차단 | 송출컴 방화벽 33210 포트 인바운드 허용 |
| 2PC — 이벤트 미수신 | server.url 오타 | `%LocalAppData%\RimWorldDonation\server.url` 내용 확인 |
| event.json.error 생성 | JSON 파싱 오류 | 서버 재시작 |

---

## 개발자용

### 소스에서 직접 실행

```bash
cd server
npm install
npm run dev
# → http://localhost:33210
```

### exe 빌드

```bash
cd server
npm run package:win
# → rimworld-donation-mvp/streamer-app.exe
```

### RimWorld 모드 DLL 빌드

```bash
cd rimworld-mod
dotnet build
# RimWorld 경로가 다를 경우:
dotnet build /p:RimWorldPath="D:\SteamLibrary\steamapps\common\RimWorld"
# → Assemblies/RimDonation.dll
```
