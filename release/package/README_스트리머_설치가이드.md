# RimWorld 후원 연동 — 스트리머 설치 가이드

> **대상**: 비개발자 스트리머 기준으로 작성되었습니다.

---

## 📦 패키지 구성

```
streamer-app.exe          ← 후원 수신 서버 (이것만 실행하면 됩니다)
RimWorldDonationMod/      ← RimWorld 모드 폴더
config/
  event-mapping.json      ← 후원 금액별 이벤트 설정
  item-drops.json         ← 아이템 드랍 설정
README_스트리머_설치가이드.md  ← 지금 이 파일
```

---

## ✅ 1PC (게임 + 방송 같은 컴퓨터)

### 1단계 — 서버 실행

`streamer-app.exe` 를 더블클릭해서 실행합니다.  
검은 창이 뜨면 정상입니다. **창을 닫지 마세요.**

서버 주소: **http://localhost:33210**  
대시보드: 브라우저에서 위 주소 접속

### 2단계 — 모드 설치

`RimWorldDonationMod` 폴더를 RimWorld 모드 폴더에 복사합니다.

```
C:\Users\[이름]\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Mods\
```

게임에서 모드를 활성화하고 새 게임 또는 기존 세이브 로드.

### 3단계 — 치지직 연결

1. [치지직 개발자 콘솔](https://chzzk.naver.com) → 내 채널 → 설정
2. Webhook URL 입력란에 아래 주소 입력:
   ```
   http://localhost:33210/webhook/chzzk
   ```
   > ⚠️ 치지직이 외부 URL을 요구하면 **ngrok 사용** 필요 (아래 참고)

### 4단계 — 테스트

대시보드(http://localhost:33210)에서 **테스트 이벤트** 버튼 클릭  
→ RimWorld에서 이벤트 발생하면 연결 완료!

---

## 🖥️ 2PC (게임컴 / 송출컴 분리)

### 송출컴 (스트리밍 PC)

1. `streamer-app.exe` 실행
2. 방화벽 포트 열기 (관리자 권한 PowerShell):
   ```powershell
   netsh advfirewall firewall add rule name="RimDonation" dir=in action=allow protocol=TCP localport=33210
   ```
3. 송출컴의 **내부 IP 주소 확인** (예: `192.168.1.100`):
   ```
   ipconfig
   ```

### 게임컴 (RimWorld PC)

1. 모드 설치 (1PC 2단계와 동일)
2. 아래 경로에 파일 생성:
   ```
   %LocalAppData%\RimWorldDonation\server.url
   ```
   파일 내용:
   ```
   http://192.168.1.100:33210
   ```
   > `192.168.1.100` 자리에 **송출컴의 내부 IP**를 입력하세요.

---

## 🌐 외부 접속 (ngrok) — 치지직 webhook 필요 시

치지직이 `localhost` URL을 거부하는 경우 ngrok으로 외부 주소를 만듭니다.

1. [ngrok.com](https://ngrok.com) 가입 후 다운로드
2. 실행:
   ```
   ngrok http 33210
   ```
3. 표시되는 주소 복사 (예: `https://xxxx.ngrok-free.app`)
4. 치지직 webhook 설정에 입력:
   ```
   https://xxxx.ngrok-free.app/webhook/chzzk
   ```
5. 투네이션 설정에도 입력:
   ```
   https://xxxx.ngrok-free.app/webhook/toonation
   ```

> ⚠️ ngrok 무료 플랜은 재시작 시 주소가 바뀝니다. 매번 갱신 필요.

---

## 📡 지원 플랫폼별 Webhook URL

| 플랫폼 | Webhook URL |
|--------|-------------|
| 치지직 | `http://localhost:33210/webhook/chzzk` |
| 투네이션 | `http://localhost:33210/webhook/toonation` |
| SOOP | `http://localhost:33210/webhook/soop` |

> **투네이션**: 공식 webhook 미지원. alertbox 설정 또는 별도 연동 도구 필요 — 환경별 확인 필요.

---

## 🎮 이벤트 종류

| 이벤트 | 기본 최소 금액 | 설명 |
|--------|--------------|------|
| 💰 아이템 드랍 | 1,000원 | Silver, Medicine 등 랜덤 |
| 🐾 동물 폭주 | 3,000원 | ManhunterPack 이벤트 |
| ⚔️ 적 습격 | 5,000원 | Raid 이벤트 |
| 🔥 화재 발생 | 7,000원 | 맵 랜덤 화재 |
| 🤖 메카 습격 | 10,000원 | 메카노이드 클러스터 |

금액 기준은 대시보드에서 자유롭게 조정 가능합니다.

---

## ❓ 자주 묻는 질문

**Q. 검은 창이 바로 꺼져요**  
A. 이미 33210 포트를 사용 중인 프로그램이 있습니다. 해당 프로그램 종료 후 재실행.

**Q. 브라우저로 localhost:33210 접속이 안 돼요**  
A. `streamer-app.exe`가 실행 중인지 확인. 방화벽이 차단할 수 있으니 Windows Defender 방화벽에서 허용.

**Q. 게임에서 이벤트가 발생하지 않아요**  
A. 대시보드에서 테스트 버튼 눌러서 `event.json`이 생성되는지 확인. 모드가 활성화되어 있는지 확인.

**Q. 후원이 들어왔는데 이벤트가 안 생겨요**  
A. 대시보드 → **치지직 수신 로그** 확인. 수신이 안 되면 webhook URL 설정 문제. `ignored`로 표시되면 금액이 최소값 미만.
