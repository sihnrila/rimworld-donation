export const dashboardHtml = /* html */`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RimWorld 후원 연동 대시보드</title>
  <style>
    :root {
      --bg: #12121f;
      --surface: #1a1a2e;
      --surface2: #16213e;
      --accent: #e94560;
      --text: #e8e8f0;
      --text2: #888899;
      --green: #4ecca3;
      --yellow: #f5a623;
      --orange: #ff6b35;
      --blue: #4fc3f7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; font-size: 14px; }
    header {
      background: var(--surface2);
      padding: 14px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 2px solid var(--accent);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    header h1 { font-size: 1rem; font-weight: 700; letter-spacing: 0.5px; }
    .badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--accent);
      color: #fff;
      transition: background 0.3s, color 0.3s;
    }
    .badge.ok { background: var(--green); color: #000; }
    .badge.offline { background: var(--accent); color: #fff; }
    .timer { margin-left: auto; color: var(--text2); font-size: 0.75rem; }
    .container { max-width: 960px; margin: 0 auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; }
    .row { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
    @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
    .card {
      background: var(--surface);
      border-radius: 10px;
      padding: 18px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .card-title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--text2);
      margin-bottom: 14px;
    }
    .btn-row { display: flex; flex-wrap: wrap; gap: 8px; }
    button {
      cursor: pointer;
      border: none;
      border-radius: 7px;
      padding: 9px 18px;
      font-size: 0.88rem;
      font-weight: 700;
      transition: filter 0.15s, transform 0.1s;
    }
    button:hover { filter: brightness(1.1); }
    button:active { transform: scale(0.96); filter: brightness(0.9); }
    .btn-item    { background: var(--green);  color: #000; }
    .btn-animal  { background: #7bc67e;       color: #000; }
    .btn-raid    { background: var(--yellow); color: #000; }
    .btn-fire    { background: var(--orange); color: #fff; }
    .btn-mech    { background: var(--accent); color: #fff; }
    .amount-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .amount-row label { color: var(--text2); font-size: 0.82rem; white-space: nowrap; }
    .amount-row input {
      background: var(--bg);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      color: var(--text);
      padding: 6px 10px;
      width: 110px;
      font-size: 0.9rem;
    }
    .notice {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.82rem;
      min-height: 32px;
    }
    .notice-ok  { background: rgba(78,204,163,0.12); color: var(--green); }
    .notice-err { background: rgba(233,69,96,0.12);  color: var(--accent); }
    .status-box {
      background: var(--bg);
      border-radius: 7px;
      padding: 12px;
      font-family: 'Cascadia Code', 'Consolas', monospace;
      font-size: 0.78rem;
      color: var(--text2);
      min-height: 80px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
    }
    .mapping-grid { display: grid; grid-template-columns: auto 1fr auto; gap: 6px 12px; align-items: center; font-size: 0.82rem; }
    .mapping-grid .amt { color: var(--yellow); font-weight: 700; font-family: monospace; }
    .mapping-grid .arrow { color: var(--text2); }
    .log-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th { text-align: left; color: var(--text2); font-weight: 600; padding: 7px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    td { padding: 7px 10px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .tag {
      display: inline-block;
      padding: 2px 9px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .tag-item     { background: rgba(78,204,163,0.15);  color: var(--green);  }
    .tag-animal   { background: rgba(123,198,126,0.15); color: #7bc67e;       }
    .tag-raid     { background: rgba(245,166,35,0.15);  color: var(--yellow); }
    .tag-fire     { background: rgba(255,107,53,0.15);  color: var(--orange); }
    .tag-mech_raid{ background: rgba(233,69,96,0.15);   color: var(--accent); }
    .msg-cell { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text2); }
    .empty-row td { color: var(--text2); text-align: center; padding: 24px; }
  </style>
</head>
<body>
<header>
  <span style="font-size:1.3rem">🎮</span>
  <h1>RimWorld 후원 연동</h1>
  <span class="badge offline" id="conn-badge">연결 중...</span>
  <span class="timer" id="timer"></span>
</header>
<div class="container">
  <div class="row">
    <!-- 테스트 이벤트 -->
    <div class="card">
      <div class="card-title">테스트 이벤트 발송</div>
      <div class="amount-row">
        <label>직접 금액</label>
        <input type="number" id="custom-amount" value="5000" min="0" step="500">
        <button style="background:var(--blue);color:#000" onclick="sendByAmount()">금액으로 발송</button>
      </div>
      <div class="btn-row">
        <button class="btn-item"   onclick="sendEvent('item')">💰 아이템</button>
        <button class="btn-animal" onclick="sendEvent('animal')">🐾 동물</button>
        <button class="btn-raid"   onclick="sendEvent('raid')">⚔️ 습격</button>
        <button class="btn-fire"   onclick="sendEvent('fire')">🔥 화재</button>
        <button class="btn-mech"   onclick="sendEvent('mech_raid')">🤖 메카</button>
      </div>
      <div class="notice" id="test-notice"></div>
    </div>

    <!-- 이벤트 매핑 + 현재 상태 -->
    <div class="card">
      <div class="card-title">금액별 이벤트 매핑</div>
      <div class="mapping-grid">
        <span class="amt">10,000원+</span><span class="arrow">→</span><span><span class="tag tag-mech_raid">🤖 메카노이드 습격</span></span>
        <span class="amt">7,000원+</span><span class="arrow">→</span><span><span class="tag tag-fire">🔥 화재</span></span>
        <span class="amt">5,000원+</span><span class="arrow">→</span><span><span class="tag tag-raid">⚔️ 적 습격</span></span>
        <span class="amt">3,000원+</span><span class="arrow">→</span><span><span class="tag tag-animal">🐾 동물 폭주</span></span>
        <span class="amt">1,000원+</span><span class="arrow">→</span><span><span class="tag tag-item">💰 아이템 드랍</span></span>
      </div>
    </div>
  </div>

  <!-- event.json 상태 -->
  <div class="card">
    <div class="card-title">현재 event.json 상태 <span style="color:var(--text2);font-weight:400;text-transform:none;letter-spacing:0">(게임이 읽으면 자동 삭제됨)</span></div>
    <div class="status-box" id="current-event">로딩 중...</div>
  </div>

  <!-- 연결 안내 -->
  <div class="card" style="font-size:0.82rem;color:var(--text2);line-height:1.8">
    <div class="card-title">RimWorld 모드 연결 안내</div>
    <b style="color:var(--text)">같은 PC (1PC 구성)</b><br>
    모드 기본 설정 그대로 사용 — 별도 설정 불필요<br><br>
    <b style="color:var(--text)">게임컴/송출컴 분리 (2PC 구성)</b><br>
    게임컴의 <code style="background:var(--bg);padding:1px 6px;border-radius:4px">%LocalAppData%\RimWorldDonation\server.url</code> 파일에 송출컴 IP 입력<br>
    예: <code style="background:var(--bg);padding:1px 6px;border-radius:4px">http://192.168.1.100:33210</code><br><br>
    <b style="color:var(--text)">치지직 Webhook URL</b><br>
    <code style="background:var(--bg);padding:1px 6px;border-radius:4px">POST http://&lt;송출컴IP&gt;:33210/webhook/chzzk</code>
  </div>

  <!-- 이벤트 로그 -->
  <div class="card">
    <div class="card-title">후원 이벤트 로그 (최근 50건)</div>
    <div class="log-wrap">
      <table>
        <thead>
          <tr>
            <th>시간</th>
            <th>플랫폼</th>
            <th>닉네임</th>
            <th>금액</th>
            <th>이벤트</th>
            <th>메시지</th>
          </tr>
        </thead>
        <tbody id="log-tbody">
          <tr class="empty-row"><td colspan="6">로딩 중...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
  const LABELS = {
    item: '💰 아이템',
    animal: '🐾 동물',
    raid: '⚔️ 습격',
    fire: '🔥 화재',
    mech_raid: '🤖 메카습격'
  };

  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  function fmtAmt(n) { return Number(n).toLocaleString('ko-KR') + '원'; }

  async function sendEvent(eventType) {
    const notice = document.getElementById('test-notice');
    try {
      const r = await fetch('/api/test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, message: '대시보드 테스트' })
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || '서버 오류');
      notice.className = 'notice notice-ok';
      notice.textContent = '✅ ' + (LABELS[eventType] || eventType) + ' 이벤트 전송 완료';
      await refresh();
    } catch (e) {
      notice.className = 'notice notice-err';
      notice.textContent = '❌ ' + e.message;
    }
  }

  async function sendByAmount() {
    const amount = Number(document.getElementById('custom-amount').value) || 5000;
    const notice = document.getElementById('test-notice');
    try {
      const r = await fetch('/api/test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, message: '금액 테스트 ' + amount + '원' })
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || '서버 오류');
      notice.className = 'notice notice-ok';
      notice.textContent = '✅ ' + fmtAmt(amount) + ' → ' + (LABELS[j.event?.eventType] || j.event?.eventType) + ' 전송 완료';
      await refresh();
    } catch (e) {
      notice.className = 'notice notice-err';
      notice.textContent = '❌ ' + e.message;
    }
  }

  async function loadStatus() {
    try {
      const r = await fetch('/api/status');
      const j = await r.json();
      const el = document.getElementById('current-event');
      const badge = document.getElementById('conn-badge');
      badge.className = 'badge ok';
      badge.textContent = '연결됨';
      el.textContent = j.currentEvent
        ? JSON.stringify(j.currentEvent, null, 2)
        : '(없음 — 게임이 이미 읽어갔거나 아직 이벤트 없음)';
    } catch {
      document.getElementById('conn-badge').className = 'badge offline';
      document.getElementById('conn-badge').textContent = '서버 오프라인';
    }
  }

  async function loadLogs() {
    try {
      const r = await fetch('/api/logs');
      const j = await r.json();
      const tbody = document.getElementById('log-tbody');
      if (!j.logs || j.logs.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">아직 이벤트 없음</td></tr>';
        return;
      }
      tbody.innerHTML = j.logs.map(entry => {
        const e = entry.event;
        const tagCls = 'tag tag-' + e.eventType;
        return '<tr>' +
          '<td>' + fmtTime(entry.loggedAt) + '</td>' +
          '<td>' + e.platform + '</td>' +
          '<td>' + e.nickname + '</td>' +
          '<td style="font-family:monospace">' + fmtAmt(e.amount) + '</td>' +
          '<td><span class="' + tagCls + '">' + (LABELS[e.eventType] || e.eventType) + '</span></td>' +
          '<td class="msg-cell" title="' + (e.message || '') + '">' + (e.message || '') + '</td>' +
          '</tr>';
      }).join('');
    } catch {}
  }

  async function refresh() {
    await Promise.all([loadStatus(), loadLogs()]);
  }

  let countdown = 5;
  function tick() {
    countdown--;
    document.getElementById('timer').textContent = countdown + '초 후 갱신';
    if (countdown <= 0) {
      countdown = 5;
      refresh();
    }
  }

  refresh();
  setInterval(tick, 1000);
</script>
</body>
</html>`;
