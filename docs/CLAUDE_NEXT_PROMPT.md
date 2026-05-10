# Claude 후속 구현 프롬프트

이 프로젝트를 이어서 완성해줘.

목표:
- Node 서버를 Windows exe로 패키징
- RimWorld 모드 csproj 추가
- 모드 DLL 빌드 스크립트 작성
- event.json 경로를 UI에서 설정 가능하게 개선
- Toonation/SOOP adapter 확장
- 간단한 Electron 설정 화면 추가

현재 구조:
- server: Express + TypeScript
- rimworld-mod: C# 소스
- docs: 설치 가이드

우선순위:
1. server를 pkg 또는 electron-builder로 Windows 실행파일화
2. RimWorld 모드 빌드 가능한 csproj 작성
3. 경로 설정 UI 추가
4. 투네이션 adapter 추가
5. SOOP adapter 추가
