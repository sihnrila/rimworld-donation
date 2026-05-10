export const dashboardHtml = /* html */`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RimWorld 후원 연동</title>
  <style>
    :root {
      --bg: #12121f; --surface: #1a1a2e; --surface2: #16213e;
      --accent: #e94560; --text: #e8e8f0; --text2: #888899;
      --green: #4ecca3; --yellow: #f5a623; --orange: #ff6b35; --blue: #4fc3f7;
      --purple: #bb86fc; --chzzk: #36cb8f; --toon: #ff9500;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; font-size: 14px; }

    /* ── 헤더 ── */
    header { background: var(--surface2); padding: 14px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 2px solid var(--accent); position: sticky; top: 0; z-index: 10; }
    header h1 { font-size: 1rem; font-weight: 700; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: .72rem; font-weight: 700; transition: background .3s; }
    .badge.ok { background: var(--green); color: #000; }
    .badge.offline { background: var(--accent); color: #fff; }
    .timer { color: var(--text2); font-size: .75rem; }
    nav { margin-left: auto; display: flex; gap: 4px; }
    .nav-link { padding: 5px 14px; border-radius: 7px; font-size: .82rem; font-weight: 700; text-decoration: none; color: var(--text2); transition: background .15s, color .15s; }
    .nav-link:hover { background: rgba(255,255,255,.07); color: var(--text); }
    .nav-link.active { background: var(--accent); color: #fff; }

    /* ── 레이아웃 ── */
    .container { max-width: 1080px; margin: 0 auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; }
    .row { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
    .row3 { display: grid; gap: 16px; grid-template-columns: 1fr 1fr 1fr; }
    @media (max-width: 800px) { .row3 { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px) { .row, .row3 { grid-template-columns: 1fr; } }

    /* ── 카드 ── */
    .card { background: var(--surface); border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,.06); }
    .card-title { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text2); margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }

    /* ── 버튼 ── */
    button { cursor: pointer; border: none; border-radius: 7px; padding: 8px 16px; font-size: .88rem; font-weight: 700; transition: filter .15s, transform .1s; }
    button:hover { filter: brightness(1.1); } button:active { transform: scale(.96); filter: brightness(.9); }
    .btn-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .btn-item    { background: var(--green);  color: #000; }
    .btn-animal  { background: #7bc67e;       color: #000; }
    .btn-raid    { background: var(--yellow); color: #000; }
    .btn-fire    { background: var(--orange); color: #fff; }
    .btn-mech    { background: var(--accent); color: #fff; }
    .btn-save    { background: var(--blue);   color: #000; margin-top: 10px; }
    .btn-copy {
      cursor: pointer; border: 1px solid rgba(255,255,255,.15); border-radius: 6px;
      background: transparent; color: var(--text2); padding: 5px 11px;
      font-size: .78rem; font-weight: 700; transition: background .15s, color .15s;
      white-space: nowrap;
    }
    .btn-copy:hover { background: rgba(255,255,255,.08); color: var(--text); }
    .btn-copy.copied { border-color: var(--green); color: var(--green); }

    /* ── 폼 ── */
    .amount-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .amount-row label { color: var(--text2); font-size: .82rem; white-space: nowrap; }
    input[type=number], input[type=text] {
      background: var(--bg); border: 1px solid rgba(255,255,255,.12); border-radius: 6px;
      color: var(--text); padding: 5px 8px; font-size: .88rem;
    }
    input[type=number]:focus, input[type=text]:focus { outline: 1px solid var(--blue); }

    /* ── 알림 ── */
    .notice { margin-top: 8px; padding: 7px 12px; border-radius: 6px; font-size: .82rem; min-height: 28px; }
    .notice-ok  { background: rgba(78,204,163,.12); color: var(--green); }
    .notice-err { background: rgba(233,69,96,.12);  color: var(--accent); }

    /* ── 상태박스 ── */
    .status-box { background: var(--bg); border-radius: 7px; padding: 12px; font-family: monospace; font-size: .78rem; color: var(--text2); min-height: 80px; white-space: pre-wrap; word-break: break-all; max-height: 180px; overflow-y: auto; }

    /* ── 설정 테이블 ── */
    .cfg-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    .cfg-table th { text-align: left; color: var(--text2); font-weight: 600; padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,.08); }
    .cfg-table td { padding: 5px 8px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
    .cfg-table input[type=number] { width: 72px; }
    .item-name { font-weight: 600; }
    .def-name  { color: var(--text2); font-size: .75rem; font-family: monospace; }

    /* ── 이벤트 로그 ── */
    .log-wrap { overflow-x: auto; }
    table.log-tbl { width: 100%; border-collapse: collapse; font-size: .82rem; min-width: 580px; }
    table.log-tbl th { text-align: left; color: var(--text2); font-weight: 600; padding: 7px 10px; border-bottom: 1px solid rgba(255,255,255,.08); }
    table.log-tbl td { padding: 7px 10px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
    table.log-tbl tr:hover td { background: rgba(255,255,255,.02); }
    .tag { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: .72rem; font-weight: 700; white-space: nowrap; }
    .tag-item     { background: rgba(78,204,163,.15);  color: var(--green);  }
    .tag-animal   { background: rgba(123,198,126,.15); color: #7bc67e;       }
    .tag-raid     { background: rgba(245,166,35,.15);  color: var(--yellow); }
    .tag-fire     { background: rgba(255,107,53,.15);  color: var(--orange); }
    .tag-mech_raid{ background: rgba(233,69,96,.15);   color: var(--accent); }
    .empty-row td { color: var(--text2); text-align: center; padding: 24px; }
    .msg-cell { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text2); }

    /* ── 수신 로그 ── */
    .raw-log-item { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,.04); display: flex; align-items: flex-start; gap: 8px; font-size: .78rem; }
    .raw-log-item:last-child { border-bottom: none; }
    .raw-result { flex-shrink: 0; padding: 1px 7px; border-radius: 10px; font-size: .68rem; font-weight: 700; }
    .res-ok       { background: rgba(78,204,163,.15); color: var(--green); }
    .res-ignored  { background: rgba(245,166,35,.15); color: var(--yellow); }
    .res-error    { background: rgba(233,69,96,.15);  color: var(--accent); }
    .raw-time { color: var(--text2); flex-shrink: 0; font-family: monospace; }
    .raw-detail { flex: 1; color: var(--text2); word-break: break-all; }
    .raw-detail b { color: var(--text); }

    /* ── Webhook URL 섹션 ── */
    .webhook-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .webhook-row:last-child { margin-bottom: 0; }
    .platform-tag { flex-shrink: 0; font-size: .72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; width: 80px; text-align: center; }
    .pt-chzzk    { background: rgba(54,203,143,.15); color: var(--chzzk); }
    .pt-toonation { background: rgba(255,149,0,.15);  color: var(--toon); }
    .pt-soop     { background: rgba(75,163,255,.15);  color: #4ba3ff; }
    .webhook-url-box {
      flex: 1; background: var(--bg); border: 1px solid rgba(255,255,255,.1);
      border-radius: 6px; padding: 6px 10px; font-size: .78rem;
      font-family: monospace; color: var(--green); overflow-x: auto;
      white-space: nowrap;
    }

    /* ── ngrok 안내 ── */
    .ngrok-box { background: var(--bg); border-radius: 7px; padding: 12px 14px; border-left: 3px solid var(--blue); font-size: .82rem; line-height: 1.8; }
    .ngrok-box code { background: rgba(79,195,247,.1); color: var(--blue); padding: 1px 6px; border-radius: 4px; font-family: monospace; }
    .step { color: var(--text2); font-size: .76rem; margin-bottom: 2px; }

    /* ── misc ── */
    code { background: var(--bg); padding: 1px 6px; border-radius: 4px; font-size: .8rem; }
    hr.card-hr { border: none; border-top: 1px solid rgba(255,255,255,.07); margin: 12px 0; }

    /* ── 모바일 ── */
    @media (max-width: 540px) {
      header { padding: 10px 12px; gap: 8px; flex-wrap: wrap; }
      header h1 { font-size: .88rem; flex-shrink: 1; min-width: 0; }
      .timer { display: none; }
      nav { margin-left: auto; flex-shrink: 0; }
      .nav-link { padding: 4px 10px; font-size: .76rem; }
      .container { padding: 12px 10px; gap: 12px; }
      .card { padding: 14px 12px; }
      input[type=number], input[type=text] { font-size: 1rem; padding: 8px 10px; }
      .cfg-table input[type=number] { width: 58px; font-size: 1rem; }
      button { min-height: 44px; padding: 10px 14px; font-size: .9rem; }
      .btn-save { width: 100%; }
      .amount-row input[type=number] { flex: 1; min-width: 80px; width: auto !important; }
      .webhook-row { flex-wrap: wrap; }
      .webhook-url-box { min-width: 0; }
      code { font-size: .72rem; word-break: break-all; }
    }
    @media (max-width: 360px) {
      .badge { font-size: .65rem; padding: 2px 7px; }
      .nav-link { padding: 3px 8px; }
    }
  </style>
</head>
<body>
<header>
  <span style="font-size:1.3rem">🎮</span>
  <h1>RimWorld 후원 연동</h1>
  <span class="badge offline" id="conn-badge">연결 중...</span>
  <span class="timer" id="timer"></span>
  <nav>
    <a href="/"        class="nav-link active">대시보드</a>
    <a href="/settings" class="nav-link">설정</a>
  </nav>
</header>

<div class="container">

  <!-- ── Row 1: 테스트 이벤트 + 이벤트 가격 설정 ── -->
  <div class="row">
    <!-- 테스트 이벤트 -->
    <div class="card">
      <div class="card-title">🧪 테스트 이벤트</div>
      <div class="amount-row">
        <label>직접 금액</label>
        <input type="number" id="custom-amount" value="5000" min="0" step="500" style="width:100px">
        <button style="background:var(--blue);color:#000" onclick="sendByAmount()">발송</button>
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

    <!-- 이벤트 가격 설정 -->
    <div class="card">
      <div class="card-title">💸 이벤트 가격 설정</div>
      <table class="cfg-table">
        <thead><tr><th>이벤트</th><th>최소 금액 (원)</th></tr></thead>
        <tbody id="mapping-tbody"><tr><td colspan="2" style="color:var(--text2);padding:12px">로딩 중...</td></tr></tbody>
      </table>
      <button class="btn-save" onclick="saveEventMapping()">💾 저장</button>
      <div class="notice" id="mapping-notice"></div>
    </div>
  </div>

  <!-- ── Row 2: event.json + 아이템 드랍 ── -->
  <div class="row">
    <!-- event.json 상태 -->
    <div class="card">
      <div class="card-title">📄 현재 event.json <span style="color:var(--text2);font-weight:400;text-transform:none;letter-spacing:0;font-size:.7rem">(모드가 읽으면 삭제됨)</span></div>
      <div class="status-box" id="current-event">로딩 중...</div>
    </div>

    <!-- 아이템 드랍 설정 -->
    <div class="card">
      <div class="card-title">🎁 아이템 드랍 설정</div>
      <div style="overflow-x:auto;max-height:220px;overflow-y:auto">
        <table class="cfg-table">
          <thead><tr><th>아이템</th><th style="text-align:center">최소</th><th style="text-align:center">최대</th><th style="text-align:center">가중치</th></tr></thead>
          <tbody id="drops-tbody"><tr><td colspan="4" style="color:var(--text2);padding:12px">로딩 중...</td></tr></tbody>
        </table>
      </div>
      <button class="btn-save" onclick="saveItemDrops()">💾 저장</button>
      <div class="notice" id="drops-notice"></div>
    </div>
  </div>

  <!-- ── Webhook URL + ngrok 안내 ── -->
  <div class="row">
    <!-- Webhook URL -->
    <div class="card">
      <div class="card-title">🔗 Webhook URL</div>
      <div class="webhook-row">
        <span class="platform-tag pt-chzzk">치지직</span>
        <div class="webhook-url-box" id="url-chzzk"></div>
        <button class="btn-copy" onclick="copyUrl('url-chzzk',this)">복사</button>
      </div>
      <div class="webhook-row">
        <span class="platform-tag pt-toonation">투네이션</span>
        <div class="webhook-url-box" id="url-toonation"></div>
        <button class="btn-copy" onclick="copyUrl('url-toonation',this)">복사</button>
      </div>
      <div class="webhook-row">
        <span class="platform-tag pt-soop">SOOP</span>
        <div class="webhook-url-box" id="url-soop"></div>
        <button class="btn-copy" onclick="copyUrl('url-soop',this)">복사</button>
      </div>
      <div style="margin-top:10px;font-size:.76rem;color:var(--text2);line-height:1.7">
        <b style="color:var(--text)">1PC</b>: 위 URL 그대로 사용<br>
        <b style="color:var(--text)">외부 접속</b>: ngrok 주소로 교체 (아래 참고)<br>
        <b style="color:var(--toon)">투네이션</b>: 공식 webhook 미지원 — 환경별 확인 필요
      </div>
    </div>

    <!-- ngrok 안내 -->
    <div class="card">
      <div class="card-title">🌐 외부 연결 (ngrok)</div>
      <div class="ngrok-box">
        <div class="step">① ngrok 설치 후 실행</div>
        <code>ngrok http 33210</code>
        <br><br>
        <div class="step">② 표시되는 URL 복사</div>
        <code style="color:var(--green)">https://xxxx.ngrok-free.app</code>
        <br><br>
        <div class="step">③ 치지직 Webhook 설정에 입력</div>
        <code>https://xxxx.ngrok-free.app/webhook/chzzk</code>
        <br><br>
        <div class="step">④ 투네이션 alertbox 설정에 입력</div>
        <code>https://xxxx.ngrok-free.app/webhook/toonation</code>
      </div>
      <div style="margin-top:10px;font-size:.76rem;color:var(--text2)">
        <a href="https://ngrok.com/download" target="_blank" style="color:var(--blue)">ngrok 다운로드 →</a>
        &nbsp;|&nbsp; 무료 플랜 사용 가능
      </div>
    </div>
  </div>

  <!-- ── 최근 수신 로그 (치지직 / 투네이션) ── -->
  <div class="row">
    <!-- 치지직 수신 로그 -->
    <div class="card">
      <div class="card-title" style="justify-content:space-between">
        <span>📡 치지직 수신 로그</span>
        <button onclick="loadRawLogs('chzzk')" style="background:rgba(255,255,255,.06);color:var(--text2);padding:3px 10px;font-size:.72rem;margin:0">새로고침</button>
      </div>
      <div id="raw-chzzk" style="max-height:220px;overflow-y:auto"><div style="color:var(--text2);padding:16px;text-align:center;font-size:.82rem">로딩 중...</div></div>
    </div>

    <!-- 투네이션 수신 로그 -->
    <div class="card">
      <div class="card-title" style="justify-content:space-between">
        <span>📡 투네이션 수신 로그</span>
        <button onclick="loadRawLogs('toonation')" style="background:rgba(255,255,255,.06);color:var(--text2);padding:3px 10px;font-size:.72rem;margin:0">새로고침</button>
      </div>
      <div id="raw-toonation" style="max-height:220px;overflow-y:auto"><div style="color:var(--text2);padding:16px;text-align:center;font-size:.82rem">로딩 중...</div></div>
    </div>
  </div>

  <!-- ── 이벤트 로그 ── -->
  <div class="card">
    <div class="card-title">📋 후원 이벤트 로그 (최근 50건)</div>
    <div class="log-wrap">
      <table class="log-tbl">
        <thead><tr><th>시간</th><th>플랫폼</th><th>닉네임</th><th>금액</th><th>이벤트</th><th>아이템</th><th>메시지</th></tr></thead>
        <tbody id="log-tbody"><tr class="empty-row"><td colspan="7">로딩 중...</td></tr></tbody>
      </table>
    </div>
  </div>

</div><!-- /container -->

<script>
const LABELS  = { item:'💰 아이템', animal:'🐾 동물', raid:'⚔️ 습격', fire:'🔥 화재', mech_raid:'🤖 메카습격' };
const TAG_CLS = { item:'tag-item', animal:'tag-animal', raid:'tag-raid', fire:'tag-fire', mech_raid:'tag-mech_raid' };
const EVENT_EMOJI = { mech_raid:'🤖', fire:'🔥', raid:'⚔️', animal:'🐾', item:'💰' };

function fmtTime(iso){ return new Date(iso).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
function fmtAmt(n){ return Number(n).toLocaleString('ko-KR')+'원'; }
function notice(id, cls, msg){ const el=document.getElementById(id); el.className='notice '+cls; el.textContent=msg; }

// ── Webhook URL 초기화 ───────────────────────────────────────────────────────
(function initUrls(){
  const base = window.location.origin;
  document.getElementById('url-chzzk').textContent    = base + '/webhook/chzzk';
  document.getElementById('url-toonation').textContent = base + '/webhook/toonation';
  document.getElementById('url-soop').textContent      = base + '/webhook/soop';
})();

function copyUrl(id, btn){
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(()=>{
    btn.textContent='복사됨!'; btn.classList.add('copied');
    setTimeout(()=>{ btn.textContent='복사'; btn.classList.remove('copied'); }, 2000);
  });
}

// ── 테스트 이벤트 ────────────────────────────────────────────────────────────
async function sendEvent(eventType){
  try{
    const r=await fetch('/api/test-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventType,message:'대시보드 테스트'})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||'오류');
    const item = j.event.itemDefName ? ' ('+j.event.itemDefName+'×'+j.event.itemAmount+')' : '';
    notice('test-notice','notice-ok','✅ '+(LABELS[eventType]||eventType)+' 전송'+item);
    await refresh();
  }catch(e){ notice('test-notice','notice-err','❌ '+e.message); }
}

async function sendByAmount(){
  const amount=Number(document.getElementById('custom-amount').value)||5000;
  try{
    const r=await fetch('/api/test-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,message:'금액 테스트'})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||'오류');
    const item = j.event.itemDefName ? ' ('+j.event.itemDefName+'×'+j.event.itemAmount+')' : '';
    notice('test-notice','notice-ok','✅ '+fmtAmt(amount)+' → '+(LABELS[j.event.eventType]||j.event.eventType)+item);
    await refresh();
  }catch(e){ notice('test-notice','notice-err','❌ '+e.message); }
}

// ── 이벤트 가격 설정 ─────────────────────────────────────────────────────────
let _mappings=[];
async function loadEventMapping(){
  try{
    const r=await fetch('/api/config/event-mapping');
    const j=await r.json();
    _mappings=j.mappings||[];
    const tbody=document.getElementById('mapping-tbody');
    tbody.innerHTML=_mappings.sort((a,b)=>b.minAmount-a.minAmount).map(m=>{
      const emoji=EVENT_EMOJI[m.eventType]||'';
      return '<tr><td><span style="font-weight:600">'+emoji+' '+m.label+'</span></td>'+
        '<td><input type="number" data-event="'+m.eventType+'" value="'+m.minAmount+'" min="0" step="100" style="width:90px"> 원 이상</td></tr>';
    }).join('');
  }catch(e){ document.getElementById('mapping-tbody').innerHTML='<tr><td colspan="2" style="color:var(--accent)">로드 실패</td></tr>'; }
}
async function saveEventMapping(){
  try{
    const mappings=_mappings.map(m=>{
      const input=document.querySelector('#mapping-tbody input[data-event="'+m.eventType+'"]');
      return {...m, minAmount: input ? Number(input.value) : m.minAmount};
    });
    const r=await fetch('/api/config/event-mapping',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({mappings})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||'오류');
    _mappings=j.mappings;
    notice('mapping-notice','notice-ok','✅ 저장됨');
  }catch(e){ notice('mapping-notice','notice-err','❌ '+e.message); }
}

// ── 아이템 드랍 설정 ─────────────────────────────────────────────────────────
let _items=[];
async function loadItemDrops(){
  try{
    const r=await fetch('/api/config/item-drops');
    const j=await r.json();
    _items=j.items||[];
    document.getElementById('drops-tbody').innerHTML=_items.map((item,i)=>
      '<tr>'+
        '<td><div class="item-name">'+item.label+'</div><div class="def-name">'+item.defName+'</div></td>'+
        '<td style="text-align:center"><input type="number" data-idx="'+i+'" data-field="minAmount" value="'+item.minAmount+'" min="1" style="width:55px"></td>'+
        '<td style="text-align:center"><input type="number" data-idx="'+i+'" data-field="maxAmount" value="'+item.maxAmount+'" min="1" style="width:55px"></td>'+
        '<td style="text-align:center"><input type="number" data-idx="'+i+'" data-field="weight" value="'+item.weight+'" min="0" max="999" style="width:50px"></td>'+
      '</tr>'
    ).join('');
  }catch(e){ document.getElementById('drops-tbody').innerHTML='<tr><td colspan="4" style="color:var(--accent)">로드 실패</td></tr>'; }
}
async function saveItemDrops(){
  try{
    const items=_items.map((item,i)=>{
      const get=(f)=>{ const el=document.querySelector('#drops-tbody input[data-idx="'+i+'"][data-field="'+f+'"]'); return el?Number(el.value):item[f]; };
      return {...item, minAmount:get('minAmount'), maxAmount:get('maxAmount'), weight:get('weight')};
    });
    const r=await fetch('/api/config/item-drops',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||'오류');
    _items=j.items;
    notice('drops-notice','notice-ok','✅ 저장됨');
  }catch(e){ notice('drops-notice','notice-err','❌ '+e.message); }
}

// ── 수신 원시 로그 ───────────────────────────────────────────────────────────
async function loadRawLogs(platform){
  const el=document.getElementById('raw-'+platform);
  try{
    const r=await fetch('/api/webhook/'+platform+'/raw-logs?limit=10');
    const j=await r.json();
    if(!j.logs||!j.logs.length){
      el.innerHTML='<div style="color:var(--text2);padding:16px;text-align:center;font-size:.82rem">수신 없음</div>';
      return;
    }
    el.innerHTML=j.logs.map(entry=>{
      const cls='raw-result res-'+entry.result;
      const timeStr=new Date(entry.receivedAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      let detail='';
      const p=entry.payload||{};
      if(entry.result==='ok'){
        const nick=p.nickname||p.userName||p.username||(p.data&&p.data.nickname)||'?';
        const amt=p.amount||p.payAmount||(p.data&&(p.data.payAmount||p.data.amount))||'?';
        detail='<b>'+nick+'</b> / '+amt+'원';
      } else if(entry.result==='ignored'){
        detail=entry.reason||'무시됨';
      } else {
        detail=entry.reason||'오류';
      }
      return '<div class="raw-log-item">'+
        '<span class="'+cls+'">'+entry.result+'</span>'+
        '<span class="raw-time">'+timeStr+'</span>'+
        '<span class="raw-detail">'+detail+'</span>'+
        '</div>';
    }).join('');
  }catch(e){ el.innerHTML='<div style="color:var(--accent);padding:12px;font-size:.82rem">로드 실패</div>'; }
}

// ── 상태 + 이벤트 로그 ──────────────────────────────────────────────────────
async function loadStatus(){
  try{
    const r=await fetch('/api/status');
    const j=await r.json();
    const badge=document.getElementById('conn-badge');
    badge.className='badge ok'; badge.textContent='연결됨';
    document.getElementById('current-event').textContent=j.currentEvent ? JSON.stringify(j.currentEvent,null,2) : '(없음)';
  }catch{
    const b=document.getElementById('conn-badge');
    b.className='badge offline'; b.textContent='서버 오프라인';
  }
}

async function loadLogs(){
  try{
    const r=await fetch('/api/logs');
    const j=await r.json();
    const tbody=document.getElementById('log-tbody');
    if(!j.logs||!j.logs.length){ tbody.innerHTML='<tr class="empty-row"><td colspan="7">아직 이벤트 없음</td></tr>'; return; }
    tbody.innerHTML=j.logs.map(entry=>{
      const e=entry.event;
      const tagCls='tag '+(TAG_CLS[e.eventType]||'');
      const itemCell=e.itemDefName ? e.itemDefName+'×'+e.itemAmount : '-';
      return '<tr>'+
        '<td>'+fmtTime(entry.loggedAt)+'</td>'+
        '<td>'+e.platform+'</td>'+
        '<td>'+e.nickname+'</td>'+
        '<td style="font-family:monospace">'+fmtAmt(e.amount)+'</td>'+
        '<td><span class="'+tagCls+'">'+(LABELS[e.eventType]||e.eventType)+'</span></td>'+
        '<td style="font-family:monospace;font-size:.78rem;color:var(--text2)">'+itemCell+'</td>'+
        '<td class="msg-cell" title="'+(e.message||'')+'">'+( e.message||'')+'</td>'+
        '</tr>';
    }).join('');
  }catch{}
}

async function refresh(){ await Promise.all([loadStatus(), loadLogs(), loadRawLogs('chzzk'), loadRawLogs('toonation')]); }

// ── 타이머 ──────────────────────────────────────────────────────────────────
let countdown=5;
function tick(){
  countdown--;
  document.getElementById('timer').textContent=countdown+'초 후 갱신';
  if(countdown<=0){ countdown=5; refresh(); }
}

// 초기 로드
loadEventMapping();
loadItemDrops();
refresh();
setInterval(tick,1000);
</script>
</body>
</html>`;
