export const settingsHtml = /* html */`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>설정 — RimWorld 후원 연동</title>
  <style>
    :root {
      --bg: #12121f; --surface: #1a1a2e; --surface2: #16213e;
      --accent: #e94560; --text: #e8e8f0; --text2: #888899;
      --green: #4ecca3; --yellow: #f5a623; --orange: #ff6b35; --blue: #4fc3f7;
      --purple: #bb86fc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; font-size: 14px; }

    /* ── 헤더 ── */
    header {
      background: var(--surface2); padding: 14px 24px;
      display: flex; align-items: center; gap: 12px;
      border-bottom: 2px solid var(--accent); position: sticky; top: 0; z-index: 10;
    }
    header h1 { font-size: 1rem; font-weight: 700; }
    nav { margin-left: auto; display: flex; gap: 4px; }
    .nav-link {
      padding: 5px 14px; border-radius: 7px; font-size: .82rem; font-weight: 700;
      text-decoration: none; color: var(--text2); transition: background .15s, color .15s;
    }
    .nav-link:hover { background: rgba(255,255,255,.07); color: var(--text); }
    .nav-link.active { background: var(--accent); color: #fff; }

    /* ── 레이아웃 ── */
    .container { max-width: 760px; margin: 0 auto; padding: 28px 16px; display: flex; flex-direction: column; gap: 20px; }

    /* ── 카드 ── */
    .card { background: var(--surface); border-radius: 10px; padding: 22px; border: 1px solid rgba(255,255,255,.06); }
    .card-title {
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: var(--text2); margin-bottom: 18px;
      display: flex; align-items: center; gap: 8px;
    }
    .card-title .icon { font-size: 1rem; text-transform: none; letter-spacing: 0; }

    /* ── 폼 ── */
    .field { margin-bottom: 16px; }
    .field:last-child { margin-bottom: 0; }
    .field label { display: block; font-size: .82rem; font-weight: 600; color: var(--text2); margin-bottom: 6px; }
    .field input[type=text], .field input[type=number] {
      width: 100%; background: var(--bg); border: 1px solid rgba(255,255,255,.12);
      border-radius: 7px; color: var(--text); padding: 9px 12px;
      font-size: .9rem; font-family: monospace;
      transition: border-color .15s;
    }
    .field input:focus { outline: none; border-color: var(--blue); }
    .field .hint { margin-top: 5px; font-size: .76rem; color: var(--text2); }

    /* ── 버튼 ── */
    .btn {
      cursor: pointer; border: none; border-radius: 7px; padding: 9px 20px;
      font-size: .88rem; font-weight: 700; transition: filter .15s, transform .1s;
    }
    .btn:hover { filter: brightness(1.1); }
    .btn:active { transform: scale(.96); filter: brightness(.9); }
    .btn-primary { background: var(--blue); color: #000; }
    .btn-danger  { background: var(--accent); color: #fff; }
    .btn-row { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }

    /* ── 알림 ── */
    .notice { margin-top: 10px; padding: 8px 12px; border-radius: 6px; font-size: .82rem; min-height: 28px; }
    .notice-ok  { background: rgba(78,204,163,.12); color: var(--green); }
    .notice-err { background: rgba(233,69,96,.12);  color: var(--accent); }

    /* ── Webhook URL 카드 ── */
    .webhook-list { display: flex; flex-direction: column; gap: 12px; }
    .webhook-item { display: flex; flex-direction: column; gap: 4px; }
    .webhook-item .platform {
      font-size: .76rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: var(--text2);
    }
    .webhook-url-row { display: flex; gap: 8px; align-items: center; }
    .webhook-url {
      flex: 1; background: var(--bg); border: 1px solid rgba(255,255,255,.1);
      border-radius: 6px; padding: 7px 10px; font-size: .82rem;
      font-family: monospace; color: var(--green); overflow-x: auto;
      white-space: nowrap;
    }
    .btn-copy {
      cursor: pointer; border: 1px solid rgba(255,255,255,.15); border-radius: 6px;
      background: transparent; color: var(--text2); padding: 6px 12px;
      font-size: .78rem; font-weight: 700; transition: background .15s, color .15s;
      white-space: nowrap;
    }
    .btn-copy:hover { background: rgba(255,255,255,.08); color: var(--text); }
    .btn-copy.copied { border-color: var(--green); color: var(--green); }

    /* ── 플랫폼 배지 ── */
    .platform-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      font-size: .72rem; font-weight: 700;
    }
    .badge-chzzk     { background: rgba(54,203,143,.15); color: #36cb8f; }
    .badge-toonation  { background: rgba(255,149,0,.15);  color: #ff9500; }
    .badge-soop       { background: rgba(75,163,255,.15); color: #4ba3ff; }

    /* ── 서버 정보 ── */
    .info-grid { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; align-items: center; }
    .info-key  { font-size: .82rem; color: var(--text2); font-weight: 600; }
    .info-val  { font-family: monospace; font-size: .88rem; }
    .info-val code {
      background: var(--bg); padding: 3px 8px; border-radius: 5px;
      border: 1px solid rgba(255,255,255,.1);
    }

    /* ── 구분선 ── */
    hr { border: none; border-top: 1px solid rgba(255,255,255,.07); margin: 4px 0; }
  </style>
</head>
<body>
<header>
  <span style="font-size:1.3rem">🎮</span>
  <h1>RimWorld 후원 연동</h1>
  <nav>
    <a href="/"        class="nav-link">대시보드</a>
    <a href="/settings" class="nav-link active">설정</a>
  </nav>
</header>

<div class="container">

  <!-- ── 서버 정보 ───────────────────────────────────────── -->
  <div class="card">
    <div class="card-title"><span class="icon">🖥️</span> 서버 정보</div>
    <div class="info-grid" id="server-info">
      <span class="info-key">포트</span>
      <span class="info-val"><code id="info-port">로딩 중...</code></span>
      <span class="info-key">event.json</span>
      <span class="info-val"><code id="info-event-path" style="word-break:break-all">로딩 중...</code></span>
    </div>
  </div>

  <!-- ── event.json 경로 설정 ──────────────────────────────── -->
  <div class="card">
    <div class="card-title"><span class="icon">📁</span> event.json 경로 설정</div>
    <p style="font-size:.82rem;color:var(--text2);margin-bottom:16px;line-height:1.7">
      RimWorld 모드가 읽을 <code style="background:var(--bg);padding:1px 6px;border-radius:4px">event.json</code> 파일 위치를 지정합니다.<br>
      <b style="color:var(--text)">1PC</b>: 기본값 그대로 사용 가능합니다.<br>
      <b style="color:var(--text)">2PC</b>: 게임 PC의 공유 폴더 경로로 변경하세요 (예: <code style="background:var(--bg);padding:1px 6px;border-radius:4px">\\\\게임PC\\RimDonation\\event.json</code>).
    </p>
    <div class="field">
      <label>경로</label>
      <input type="text" id="event-file-path" placeholder="C:\\Users\\...\\event.json">
      <div class="hint">절대 경로 권장. 서버 재시작 없이 즉시 적용됩니다.</div>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" onclick="saveEventPath()">💾 저장</button>
      <button class="btn" style="background:var(--surface2);color:var(--text2)" onclick="resetEventPath()">↩ 기본값으로</button>
    </div>
    <div class="notice" id="path-notice"></div>
  </div>

  <!-- ── Webhook URL 안내 ──────────────────────────────────── -->
  <div class="card">
    <div class="card-title"><span class="icon">🔗</span> Webhook URL</div>
    <p style="font-size:.82rem;color:var(--text2);margin-bottom:18px;line-height:1.7">
      각 플랫폼의 알림 설정에서 아래 URL을 Webhook 주소로 입력하세요.<br>
      <b style="color:var(--text)">외부 접속</b> 시엔 공인 IP 또는 ngrok 터널 주소로 교체하세요.
    </p>
    <div class="webhook-list">

      <div class="webhook-item">
        <div class="platform"><span class="platform-badge badge-chzzk">치지직 Chzzk</span></div>
        <div class="webhook-url-row">
          <div class="webhook-url" id="url-chzzk"></div>
          <button class="btn-copy" onclick="copyUrl('url-chzzk', this)">복사</button>
        </div>
      </div>

      <hr>

      <div class="webhook-item">
        <div class="platform"><span class="platform-badge badge-toonation">투네이션 Toonation</span></div>
        <div class="webhook-url-row">
          <div class="webhook-url" id="url-toonation"></div>
          <button class="btn-copy" onclick="copyUrl('url-toonation', this)">복사</button>
        </div>
        <div class="hint" style="margin-top:2px">투네이션 위젯 설정 → 고급 → 커스텀 Webhook URL에 입력</div>
      </div>

      <hr>

      <div class="webhook-item">
        <div class="platform"><span class="platform-badge badge-soop">SOOP (아프리카TV)</span></div>
        <div class="webhook-url-row">
          <div class="webhook-url" id="url-soop"></div>
          <button class="btn-copy" onclick="copyUrl('url-soop', this)">복사</button>
        </div>
        <div class="hint" style="margin-top:2px">별풍선 개수를 자동으로 원화(×110)로 환산합니다</div>
      </div>

    </div>
  </div>

  <!-- ── 2PC 연결 안내 ─────────────────────────────────────── -->
  <div class="card">
    <div class="card-title"><span class="icon">🖧</span> 2PC 연결 (게임컴 / 송출컴 분리)</div>
    <ol style="font-size:.82rem;color:var(--text2);line-height:2;padding-left:18px">
      <li>게임 PC에 아래 파일 생성:</li>
    </ol>
    <div style="background:var(--bg);border-radius:6px;padding:10px 14px;margin:10px 0;font-family:monospace;font-size:.82rem">
      <span style="color:var(--text2)">경로:</span> <span style="color:var(--yellow)">%LocalAppData%\\RimWorldDonation\\server.url</span><br>
      <span style="color:var(--text2)">내용:</span> <span style="color:var(--green)" id="example-url">http://송출컴IP:33210</span>
    </div>
    <ol start="2" style="font-size:.82rem;color:var(--text2);line-height:2;padding-left:18px">
      <li>송출 PC에서 이 서버를 실행한 상태에서 게임을 시작하세요.</li>
      <li>event.json 경로를 게임 PC에서 접근 가능한 공유 폴더로 설정하거나, 모드가 서버 URL을 읽어 HTTP로 이벤트를 가져옵니다.</li>
    </ol>
  </div>

</div><!-- /container -->

<script>
let _settings = {};

async function loadSettings() {
  try {
    const r = await fetch('/api/config/settings');
    const j = await r.json();
    _settings = j.settings || {};
    document.getElementById('event-file-path').value = _settings.eventFilePath || '';
    document.getElementById('info-port').textContent = _settings.port || 33210;
    document.getElementById('info-event-path').textContent = _settings.eventFilePath || '-';

    const origin = window.location.origin;
    document.getElementById('url-chzzk').textContent    = origin + '/webhook/chzzk';
    document.getElementById('url-toonation').textContent = origin + '/webhook/toonation';
    document.getElementById('url-soop').textContent      = origin + '/webhook/soop';
    document.getElementById('example-url').textContent   = 'http://송출컴IP:' + (_settings.port || 33210);
  } catch (e) {
    console.error(e);
  }
}

function notice(id, cls, msg) {
  const el = document.getElementById(id);
  el.className = 'notice ' + cls;
  el.textContent = msg;
}

async function saveEventPath() {
  const path = document.getElementById('event-file-path').value.trim();
  if (!path) { notice('path-notice', 'notice-err', '경로를 입력해주세요'); return; }
  try {
    const r = await fetch('/api/config/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventFilePath: path }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || '오류');
    _settings = j.settings;
    document.getElementById('info-event-path').textContent = j.settings.eventFilePath;
    notice('path-notice', 'notice-ok', '✅ 저장됨 — 즉시 적용');
  } catch (e) {
    notice('path-notice', 'notice-err', '❌ ' + e.message);
  }
}

async function resetEventPath() {
  try {
    const r = await fetch('/api/config/settings/reset-event-path', { method: 'POST' });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || '오류');
    _settings = j.settings;
    document.getElementById('event-file-path').value = j.settings.eventFilePath;
    document.getElementById('info-event-path').textContent = j.settings.eventFilePath;
    notice('path-notice', 'notice-ok', '✅ 기본값으로 초기화됨');
  } catch (e) {
    notice('path-notice', 'notice-err', '❌ ' + e.message);
  }
}

function copyUrl(elementId, btn) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '복사됨!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '복사'; btn.classList.remove('copied'); }, 2000);
  });
}

loadSettings();
</script>
</body>
</html>`;
