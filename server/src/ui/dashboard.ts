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
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; font-size: 14px; }
    header { background: var(--surface2); padding: 14px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 2px solid var(--accent); position: sticky; top: 0; z-index: 10; }
    header h1 { font-size: 1rem; font-weight: 700; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: .72rem; font-weight: 700; transition: background .3s; }
    .badge.ok { background: var(--green); color: #000; }
    .badge.offline { background: var(--accent); color: #fff; }
    .timer { margin-left: auto; color: var(--text2); font-size: .75rem; }
    .container { max-width: 1000px; margin: 0 auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; }
    .row { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
    @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
    .card { background: var(--surface); border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,.06); }
    .card-title { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text2); margin-bottom: 14px; }
    .btn-row { display: flex; flex-wrap: wrap; gap: 8px; }
    button { cursor: pointer; border: none; border-radius: 7px; padding: 8px 16px; font-size: .88rem; font-weight: 700; transition: filter .15s, transform .1s; }
    button:hover { filter: brightness(1.1); } button:active { transform: scale(.96); filter: brightness(.9); }
    .btn-item    { background: var(--green);  color: #000; }
    .btn-animal  { background: #7bc67e;       color: #000; }
    .btn-raid    { background: var(--yellow); color: #000; }
    .btn-fire    { background: var(--orange); color: #fff; }
    .btn-mech    { background: var(--accent); color: #fff; }
    .btn-save    { background: var(--blue);   color: #000; margin-top: 10px; }
    .amount-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .amount-row label { color: var(--text2); font-size: .82rem; white-space: nowrap; }
    input[type=number], input[type=text] {
      background: var(--bg); border: 1px solid rgba(255,255,255,.12); border-radius: 6px;
      color: var(--text); padding: 5px 8px; font-size: .88rem;
    }
    input[type=number]:focus, input[type=text]:focus { outline: 1px solid var(--blue); }
    .notice { margin-top: 8px; padding: 7px 12px; border-radius: 6px; font-size: .82rem; min-height: 28px; }
    .notice-ok  { background: rgba(78,204,163,.12); color: var(--green); }
    .notice-err { background: rgba(233,69,96,.12);  color: var(--accent); }
    .status-box { background: var(--bg); border-radius: 7px; padding: 12px; font-family: monospace; font-size: .78rem; color: var(--text2); min-height: 80px; white-space: pre-wrap; word-break: break-all; max-height: 180px; overflow-y: auto; }
    /* 설정 테이블 */
    .cfg-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    .cfg-table th { text-align: left; color: var(--text2); font-weight: 600; padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,.08); }
    .cfg-table td { padding: 5px 8px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
    .cfg-table input[type=number] { width: 72px; }
    .cfg-table .item-name { font-weight: 600; }
    .cfg-table .def-name { color: var(--text2); font-size: .75rem; font-family: monospace; }
    /* 로그 테이블 */
    .log-wrap { overflow-x: auto; }
    table.log-tbl { width: 100%; border-collapse: collapse; font-size: .82rem; }
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
    .msg-cell { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text2); }
    code { background: var(--bg); padding: 1px 6px; border-radius: 4px; font-size: .8rem; }
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

  <!-- Row 1: 테스트 이벤트 + 이벤트 가격 설정 -->
  <div class="row">
    <!-- 테스트 이벤트 -->
    <div class="card">
      <div class="card-title">테스트 이벤트</div>
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
      <div class="card-title">이벤트 가격 설정</div>
      <table class="cfg-table" id="mapping-table">
        <thead><tr><th>이벤트</th><th>최소 금액 (원)</th></tr></thead>
        <tbody id="mapping-tbody"><tr><td colspan="2" style="color:var(--text2);padding:12px">로딩 중...</td></tr></tbody>
      </table>
      <button class="btn-save" onclick="saveEventMapping()">💾 저장</button>
      <div class="notice" id="mapping-notice"></div>
    </div>
  </div>

  <!-- Row 2: event.json + 아이템 드랍 설정 -->
  <div class="row">
    <!-- event.json 상태 -->
    <div class="card">
      <div class="card-title">현재 event.json <span style="color:var(--text2);font-weight:400;text-transform:none;letter-spacing:0">(모드가 읽으면 삭제됨)</span></div>
      <div class="status-box" id="current-event">로딩 중...</div>
    </div>

    <!-- 아이템 드랍 설정 -->
    <div class="card">
      <div class="card-title">아이템 드랍 설정</div>
      <div style="overflow-x:auto;max-height:240px;overflow-y:auto">
        <table class="cfg-table" id="drops-table">
          <thead><tr><th>아이템</th><th style="text-align:center">최소</th><th style="text-align:center">최대</th><th style="text-align:center">가중치</th></tr></thead>
          <tbody id="drops-tbody"><tr><td colspan="4" style="color:var(--text2);padding:12px">로딩 중...</td></tr></tbody>
        </table>
      </div>
      <button class="btn-save" onclick="saveItemDrops()">💾 저장</button>
      <div class="notice" id="drops-notice"></div>
    </div>
  </div>

  <!-- 이벤트 로그 -->
  <div class="card">
    <div class="card-title">후원 이벤트 로그 (최근 50건)</div>
    <div class="log-wrap">
      <table class="log-tbl">
        <thead><tr><th>시간</th><th>플랫폼</th><th>닉네임</th><th>금액</th><th>이벤트</th><th>아이템</th><th>메시지</th></tr></thead>
        <tbody id="log-tbody"><tr class="empty-row"><td colspan="7">로딩 중...</td></tr></tbody>
      </table>
    </div>
  </div>

  <!-- 연결 안내 -->
  <div class="card" style="font-size:.82rem;color:var(--text2);line-height:1.9">
    <div class="card-title">연결 안내</div>
    <b style="color:var(--text)">1PC (같은 컴퓨터)</b> — 별도 설정 불필요<br>
    <b style="color:var(--text)">2PC (게임컴 / 송출컴 분리)</b> — 게임컴에 파일 생성:<br>
    &nbsp;&nbsp;<code>%LocalAppData%\RimWorldDonation\server.url</code> → 내용: <code>http://송출컴IP:33210</code><br>
    <b style="color:var(--text)">치지직 Webhook</b> — <code>POST http://&lt;IP&gt;:33210/webhook/chzzk</code>
  </div>

</div><!-- /container -->

<script>
const LABELS = { item:'💰 아이템', animal:'🐾 동물', raid:'⚔️ 습격', fire:'🔥 화재', mech_raid:'🤖 메카습격' };
const TAG_CLS = { item:'tag-item', animal:'tag-animal', raid:'tag-raid', fire:'tag-fire', mech_raid:'tag-mech_raid' };
const EVENT_ORDER = ['mech_raid','fire','raid','animal','item'];
const EVENT_EMOJI = { mech_raid:'🤖', fire:'🔥', raid:'⚔️', animal:'🐾', item:'💰' };

function fmtTime(iso){ return new Date(iso).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
function fmtAmt(n){ return Number(n).toLocaleString('ko-KR')+'원'; }
function notice(id, cls, msg){ const el=document.getElementById(id); el.className='notice '+cls; el.textContent=msg; }

// ── 테스트 이벤트 ──────────────────────────────────────────────────────────
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

// ── 이벤트 가격 설정 ────────────────────────────────────────────────────────
let _mappings = [];

async function loadEventMapping(){
  try{
    const r=await fetch('/api/config/event-mapping');
    const j=await r.json();
    _mappings=j.mappings||[];
    const tbody=document.getElementById('mapping-tbody');
    tbody.innerHTML=_mappings
      .sort((a,b)=>b.minAmount-a.minAmount)
      .map(m=>{
        const emoji=EVENT_EMOJI[m.eventType]||'';
        return '<tr>'+
          '<td><span style="font-weight:600">'+emoji+' '+m.label+'</span></td>'+
          '<td><input type="number" data-event="'+m.eventType+'" value="'+m.minAmount+'" min="0" step="100" style="width:90px"> 원 이상</td>'+
          '</tr>';
      }).join('');
  }catch(e){ document.getElementById('mapping-tbody').innerHTML='<tr><td colspan="2" style="color:var(--accent)">로드 실패</td></tr>'; }
}

async function saveEventMapping(){
  try{
    const inputs=document.querySelectorAll('#mapping-tbody input[data-event]');
    const mappings=_mappings.map(m=>{
      const input=document.querySelector('#mapping-tbody input[data-event="'+m.eventType+'"]');
      return {...m, minAmount: input ? Number(input.value) : m.minAmount};
    });
    const r=await fetch('/api/config/event-mapping',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({mappings})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||'오류');
    _mappings=j.mappings;
    notice('mapping-notice','notice-ok','✅ 저장됨 — 즉시 적용');
  }catch(e){ notice('mapping-notice','notice-err','❌ '+e.message); }
}

// ── 아이템 드랍 설정 ─────────────────────────────────────────────────────────
let _items = [];

async function loadItemDrops(){
  try{
    const r=await fetch('/api/config/item-drops');
    const j=await r.json();
    _items=j.items||[];
    const tbody=document.getElementById('drops-tbody');
    tbody.innerHTML=_items.map((item,i)=>
      '<tr>'+
        '<td><div class="item-name">'+item.label+'</div><div class="def-name">'+item.defName+'</div></td>'+
        '<td style="text-align:center"><input type="number" data-idx="'+i+'" data-field="minAmount" value="'+item.minAmount+'" min="1" style="width:60px"></td>'+
        '<td style="text-align:center"><input type="number" data-idx="'+i+'" data-field="maxAmount" value="'+item.maxAmount+'" min="1" style="width:60px"></td>'+
        '<td style="text-align:center"><input type="number" data-idx="'+i+'" data-field="weight" value="'+item.weight+'" min="0" max="999" style="width:55px"></td>'+
      '</tr>'
    ).join('');
  }catch(e){ document.getElementById('drops-tbody').innerHTML='<tr><td colspan="4" style="color:var(--accent)">로드 실패</td></tr>'; }
}

async function saveItemDrops(){
  try{
    const items=_items.map((item,i)=>{
      const get=(field)=>{
        const el=document.querySelector('#drops-tbody input[data-idx="'+i+'"][data-field="'+field+'"]');
        return el ? Number(el.value) : item[field];
      };
      return {...item, minAmount:get('minAmount'), maxAmount:get('maxAmount'), weight:get('weight')};
    });
    const r=await fetch('/api/config/item-drops',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
    const j=await r.json();
    if(!j.ok) throw new Error(j.error||'오류');
    _items=j.items;
    notice('drops-notice','notice-ok','✅ 저장됨 — 즉시 적용');
  }catch(e){ notice('drops-notice','notice-err','❌ '+e.message); }
}

// ── 상태 / 로그 ───────────────────────────────────────────────────────────────
async function loadStatus(){
  try{
    const r=await fetch('/api/status');
    const j=await r.json();
    const badge=document.getElementById('conn-badge');
    badge.className='badge ok'; badge.textContent='연결됨';
    const el=document.getElementById('current-event');
    el.textContent=j.currentEvent ? JSON.stringify(j.currentEvent,null,2) : '(없음)';
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
    if(!j.logs||!j.logs.length){
      tbody.innerHTML='<tr class="empty-row"><td colspan="7">아직 이벤트 없음</td></tr>';
      return;
    }
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

async function refresh(){ await Promise.all([loadStatus(),loadLogs()]); }

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
