======================================
 RimWorld 후원 연동 모드 설치 가이드
======================================

■ 설치 순서

1. 이 폴더(RimWorldDonationMod)를 아래 경로로 복사
   C:\Program Files (x86)\Steam\steamapps\common\RimWorld\Mods\

2. RimWorld 실행

3. 메인 메뉴 → 모드 → "RimWorld Donation Events" 활성화

4. 게임 재시작

5. streamer-app.exe 실행 (서버 시작)

6. 브라우저에서 http://localhost:33210 접속

7. 대시보드 테스트 버튼 클릭 → 약 2초 후 게임 내 이벤트 발생 확인

--------------------------------------

■ 2PC 구성 (게임컴 / 송출컴 분리)

1. server.url.example 파일을 server.url 로 복사
   복사 위치: C:\Users\[사용자명]\AppData\Local\RimWorldDonation\server.url

2. server.url 파일 내용을 송출컴 IP로 수정
   예) http://192.168.1.100:33210

3. 송출컴에서 streamer-app.exe 실행 후
   방화벽에서 33210 포트 허용 (관리자 PowerShell):
   New-NetFirewallRule -DisplayName "RimDonation" -Direction Inbound -Protocol TCP -LocalPort 33210 -Action Allow

--------------------------------------

■ 지원 이벤트

  후원 금액  |  이벤트
  ----------|------------------
  1,000원+  |  💰 아이템 드랍
  3,000원+  |  🐾 동물 폭주
  5,000원+  |  ⚔️  적 습격
  7,000원+  |  🔥 화재 발생
  10,000원+ |  🤖 메카노이드 습격

  ※ 금액 구간은 대시보드(http://localhost:33210)에서 변경 가능

--------------------------------------

■ 문제 해결

  증상                       해결
  --------------------------------------------------
  이벤트가 안 터짐           streamer-app.exe 실행 확인
                             모드 활성화 확인
                             맵 진행 중인지 확인 (메뉴화면 X)
  2PC 연결 안 됨             server.url 경로/내용 확인
                             방화벽 33210 포트 허용 확인
  event.json.error 생성됨    서버 재시작 후 재시도

======================================
