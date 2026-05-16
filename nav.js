// ============================================================
// NAV.JS — antcpu-launcher
// Shared navigation — injected into every page via <script src="nav.js">
// Loads antcpu OS files in order: js → css → ai → live → ram
// Renders: sticky nav bar + hamburger drawer + live ticker
// Nav config: single source of truth — edit links[] only
// Version: 2.1.0 — 2026-04-23
// ============================================================

(function () {

  // ── PAGE CONFIG ────────────────────────────────────────
  // Each page sets window.ANT_PAGE before loading nav.js
  // <script>window.ANT_PAGE = { title: 'Discord', root: './' }</script>
  const cfg  = window.ANT_PAGE || { title: 'antcpu', root: './' };
  const root = cfg.root || './';

  // ── NAV CONFIG — edit here only ───────────────────────
  // v2.1.0 — 6 visible routes
  const links = [
    { label: '📅 Calendar',   href: root + 'calendar.html',      group: 'core'   },
    { label: '⚡ Dashboard',   href: root + 'index.html',         group: 'core'   },
    { label: '🤖 Employees',  href: root + 'employees.html',     group: 'core'   },
    { label: '📊 Progress',   href: root + 'progress.html',      group: 'core'   },
    { label: '🧠 antcpu',     href: root + 'antcpu-agent.html',  group: 'core'   },
    { label: '🗂 Pipeline',   href: root + 'pipeline.html',      group: 'core'   },
    { label: '📡 Tower',      href: root + 'tower.html',         group: 'core'   },
    { label: '📡 Radar',      href: root + 'radar.html',         group: 'core'   },
  ];

  // ── LOAD ANTCPU OS FILES (in order) ───────────────────
  // ant.js → antcpu.js → antcpu.css → antcpu-ai.js → antcpu.live.js → antcpu.ram.js
  [
    { tag: 'script', attr: 'src',  val: root + 'drive/js/ant.js' },
    { tag: 'script', attr: 'src',  val: root + 'antcpu.js'      },
    { tag: 'link',   attr: 'href', val: root + 'antcpu.css', rel: 'stylesheet' },
    { tag: 'script', attr: 'src',  val: root + 'antcpu-ai.js'   },
    { tag: 'script', attr: 'src',  val: root + 'antcpu.live.js' },
    { tag: 'script', attr: 'src',  val: root + 'antcpu.ram.js'  },
  ].forEach(f => {
    const el = document.createElement(f.tag);
    el[f.attr] = f.val;
    if (f.rel) el.rel = f.rel;
    document.head.appendChild(el);
  });

  // ── STYLES ─────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* NAV BAR */
    .ant-nav {
      background: #111;
      border-bottom: 1px solid #1f1f1f;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 52px;
      position: fixed;
      width: 100%;
      top: 0;
      z-index: 100;
      box-sizing: border-box;
      overflow: hidden;
    }
    .ant-nav-brand {
      font-family: monospace;
      font-size: .95rem;
      color: #00ff88;
      letter-spacing: 2px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .ant-nav-clock {
      font-family: monospace;
      font-size: .75rem;
      color: #e6edf3;
      white-space: nowrap;
      flex-shrink: 0;
      margin-right: 12px;
    }

    /* HAMBURGER */
    .ant-hamburger {
      display: flex;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 6px;
      border: 1px solid #1f1f1f;
      border-radius: 6px;
      background: none;
      flex-shrink: 0;
      transition: border-color .2s;
    }
    .ant-hamburger:hover { border-color: #00ff8844; }
    .ant-hamburger span {
      display: block;
      width: 18px;
      height: 2px;
      background: #555;
      border-radius: 2px;
      transition: all .25s;
    }
    .ant-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg);  background: #00ff88; }
    .ant-hamburger.open span:nth-child(2) { opacity: 0; }
    .ant-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: #00ff88; }

    /* DRAWER — slides in from right */
    .ant-drawer {
      position: fixed;
      top: 52px;
      right: -280px;
      width: 260px;
      height: calc(100vh - 52px);
      background: #111;
      border-left: 1px solid #1f1f1f;
      z-index: 99;
      overflow-y: auto;
      transition: right .25s ease;
      padding: 12px 0 24px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .ant-drawer.open { right: 0; }

    /* DRAWER OVERLAY */
    .ant-drawer-overlay {
      display: none;
      position: fixed;
      inset: 52px 0 0 0;
      background: rgba(0,0,0,.55);
      z-index: 98;
    }
    .ant-drawer-overlay.show { display: block; }

    /* DRAWER GROUPS */
    .ant-drawer-group { margin-bottom: 4px; }
    .ant-drawer-group-label {
      font-size: .6rem;
      font-family: monospace;
      color: #2a2a2a;
      text-transform: uppercase;
      letter-spacing: 2px;
      padding: 10px 18px 4px;
    }
    .ant-drawer a {
      display: block;
      padding: 9px 18px;
      font-family: monospace;
      font-size: .82rem;
      color: #555;
      text-decoration: none;
      border-left: 2px solid transparent;
      transition: all .15s;
    }
    .ant-drawer a:hover { color: #c9d1d9; background: #161616; border-left-color: #e6edf3; }
    .ant-drawer a.active { color: #00ff88; background: #00ff8808; border-left-color: #00ff88; }

    /* DRAWER FOOTER */

    /* ── TIMECLOCK WIDGET ── */
    .ant-drawer-timeclock {
      margin: 12px 18px;
      background: #0d0d0d;
      border: 1px solid #1f1f1f;
      border-radius: 8px;
      padding: 12px 14px;
      font-family: monospace;
    }
    .ant-tc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .ant-tc-status {
      font-size: .62rem;
      color: #444;
      letter-spacing: .05em;
    }
    .ant-tc-status.active { color: #00ff88; }
    .ant-tc-timer {
      font-size: .75rem;
      color: #00ff88;
      letter-spacing: .1em;
    }
    .ant-tc-identity {
      font-size: .6rem;
      color: #333;
      margin-bottom: 8px;
    }
    .ant-tc-btn {
      width: 100%;
      background: #141414;
      border: 1px solid #2a2a2a;
      border-radius: 5px;
      color: #555;
      font-family: monospace;
      font-size: .68rem;
      padding: 6px 0;
      cursor: pointer;
      letter-spacing: .1em;
      transition: all .2s;
    }
    .ant-tc-btn:hover { border-color: #00ff88; color: #00ff88; }
    .ant-tc-btn.active { border-color: #ff4444; color: #ff4444; }
    .ant-drawer-footer {
      margin-top: auto;
      padding: 12px 18px 0;
      border-top: 1px solid #1a1a1a;
      font-family: monospace;
      font-size: .65rem;
      color: #2a2a2a;
    }
  `;
  document.head.appendChild(style);

  // ── BUILD NAV BAR ──────────────────────────────────────
  const currentPath = window.location.pathname;

  const nav = document.createElement('nav');
  nav.className = 'ant-nav';

  const brand = document.createElement('div');
  brand.className = 'ant-nav-brand';
  brand.textContent = '⚡ ' + cfg.title;

  const clock = document.createElement('div');
  clock.className = 'ant-nav-clock';
  clock.id = 'ant-clock';

  const burger = document.createElement('button');
  burger.className = 'ant-hamburger';
  burger.setAttribute('aria-label', 'toggle navigation');
  burger.innerHTML = '<span></span><span></span><span></span>';

  nav.appendChild(brand);
  nav.appendChild(clock);
  nav.appendChild(burger);

  // ── BUILD DRAWER ───────────────────────────────────────
  const drawer = document.createElement('div');
  drawer.className = 'ant-drawer';

  // ── TIMECLOCK — top of drawer ─────────────────────────
  const tcWidget = document.createElement('div');
  tcWidget.className = 'ant-drawer-timeclock';
  tcWidget.style.flexShrink = '0';
  tcWidget.innerHTML = `
    <div class="ant-tc-header">
      <span class="ant-tc-status" id="ant-tc-status">⬤ CLOCKED OUT</span>
      <span class="ant-tc-timer" id="ant-tc-timer">00:00:00</span>
    </div>
    <div class="ant-tc-identity" id="ant-tc-identity">antcpu</div>
    <button class="ant-tc-btn" id="ant-tc-btn">PUNCH IN</button>
  `;
  drawer.appendChild(tcWidget);


  // group links
  const groups = {};
  links.forEach(l => { if (!groups[l.group]) groups[l.group] = []; groups[l.group].push(l); });

  Object.entries(groups).forEach(([group, items]) => {
    const grp = document.createElement('div');
    grp.className = 'ant-drawer-group';

    const lbl = document.createElement('div');
    lbl.className = 'ant-drawer-group-label';
    lbl.textContent = '// ' + group;
    grp.appendChild(lbl);

    items.forEach(l => {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      const isActive = currentPath.endsWith(l.href.replace(/^\.\//,'').replace(/^\.\.\//, ''));
      if (isActive) a.classList.add('active');
      a.addEventListener('click', e => {
        e.preventDefault();
        closeDrawer();
        window.location.replace(l.href);
      });
      grp.appendChild(a);
    });
    drawer.appendChild(grp);
  });

  // drawer footer — version + route count
  const footer = document.createElement('div');

  footer.className = 'ant-drawer-footer';
  footer.textContent = 'antcpu nav · ' + links.length + ' routes · v' + (window.ANT_VERSION ? window.ANT_VERSION.os : '2.1.0');
  drawer.appendChild(footer);

  // ── OVERLAY ────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'ant-drawer-overlay';
  overlay.addEventListener('click', closeDrawer);

  // ── DRAWER TOGGLE ──────────────────────────────────────
  function openDrawer()  {
    drawer.classList.add('open');
    overlay.classList.add('show');
    burger.classList.add('open');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    burger.classList.remove('open');
  }
  burger.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  );

  // ── INJECT ─────────────────────────────────────────────
  document.body.insertBefore(nav, document.body.firstChild);
  document.body.insertBefore(drawer, nav.nextSibling);
  document.body.appendChild(overlay);

  // ── CLOCK ──────────────────────────────────────────────
  let clockTimer = null;
  function tick() {
    const t = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' ET';
    const el = document.getElementById('ant-clock');
    if (el) el.textContent = t;
  }
  function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    tick();
    clockTimer = setInterval(tick, 1000);
  }
  window.addEventListener('pagehide', () => { clearInterval(clockTimer); clockTimer = null; });
  window.addEventListener('pageshow', e => { if (e.persisted) startClock(); });
  startClock();


  // ── TIMECLOCK LOGIC ────────────────────────────────────
  // Calls Supabase directly — works on live + local, no server needed
  const SB_URL = 'https://yeadfwqjoyemcjshydgj.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllYWRmd3Fqb3llbWNqc2h5ZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTY3ODIsImV4cCI6MjA5MTE3Mjc4Mn0.dSWj_VAPBcBrjQctKvYoKWK4DIXB4T3LxkmtODT7kdI';
  const SB_HEADERS = { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY };

  async function sbQuery(method, path, body) {
    const headers = Object.assign({}, SB_HEADERS);
    if (method === 'POST') headers['Prefer'] = 'return=representation';
    if (method === 'PATCH') headers['Prefer'] = 'return=representation';
    const r = await fetch(SB_URL + '/rest/v1/' + path, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (r.status === 204) return [];
    return r.json();
  }

  async function tcCheckStatus() {
    try {
      const data = await sbQuery('GET', 'time_clock?identity=eq.antcpu&punch_out=is.null&order=punch_in.desc&limit=1&select=*');
      if (Array.isArray(data) && data.length) {
        tcActive = true;
        tcStart = new Date(data[0].punch_in).getTime();
        tcSetUI(true);
        tcStartTimer();
      }
    } catch(e) {}
  }

  async function tcPunchIn() {
    try {
      // close any open sessions
      await sbQuery('PATCH', 'time_clock?identity=eq.antcpu&punch_out=is.null',
        { punch_out: new Date().toISOString(), auto_logout: true, note: 'auto-closed on new punch-in' });
      // insert new session
      const data = await sbQuery('POST', 'time_clock?select=*',
        { identity: 'antcpu', source: 'nav-widget', punch_in: new Date().toISOString() });
      if (Array.isArray(data) && data[0]) {
        tcActive = true;
        tcStart = new Date(data[0].punch_in).getTime();
        tcLastActivity = Date.now();
        tcSetUI(true);
        tcStartTimer();
      }
    } catch(e) { console.warn('[TC] punch-in failed:', e.message); }
  }

  async function tcPunchOut() {
    try {
      const open = await sbQuery('GET', 'time_clock?identity=eq.antcpu&punch_out=is.null&order=punch_in.desc&limit=1&select=*');
      if (!Array.isArray(open) || !open.length) return;
      const duration_mins = Math.round((Date.now() - new Date(open[0].punch_in).getTime()) / 60000);
      await sbQuery('PATCH', 'time_clock?id=eq.' + open[0].id,
        { punch_out: new Date().toISOString(), duration_mins, note: 'manual punch-out' });
      tcActive = false;
      tcStart = null;
      clearInterval(tcInterval);
      tcSetUI(false);
    } catch(e) { console.warn('[TC] punch-out failed:', e.message); }
  }
  let tcInterval = null;
  let tcStart    = null;
  let tcActive   = false;
  let tcIdle     = 0;
  let tcLastActivity = Date.now();
  const TC_IDLE_LIMIT = 5 * 60 * 1000; // 5 min

  function tcPad(n) { return String(n).padStart(2,'0'); }

  function tcFormatElapsed(ms) {
    const s = Math.floor(ms/1000);
    return tcPad(Math.floor(s/3600)) + ':' + tcPad(Math.floor((s%3600)/60)) + ':' + tcPad(s%60);
  }

  function tcSetUI(active) {
    const btn    = document.getElementById('ant-tc-btn');
    const status = document.getElementById('ant-tc-status');
    const timer  = document.getElementById('ant-tc-timer');
    if (!btn) return;
    if (active) {
      btn.textContent = 'PUNCH OUT';
      btn.classList.add('active');
      status.textContent = '⬤ CLOCKED IN';
      status.classList.add('active');
    } else {
      btn.textContent = 'PUNCH IN';
      btn.classList.remove('active');
      status.textContent = '⬤ CLOCKED OUT';
      status.classList.remove('active');
      if (timer) timer.textContent = '00:00:00';
    }
  }

  function tcStartTimer() {
    if (tcInterval) clearInterval(tcInterval);
    tcInterval = setInterval(() => {
      const timer = document.getElementById('ant-tc-timer');
      if (timer && tcStart) timer.textContent = tcFormatElapsed(Date.now() - tcStart);
      // idle check
      if (Date.now() - tcLastActivity > TC_IDLE_LIMIT) {
        tcAutoLogout();
      }
    }, 1000);
  }

  function tcAutoLogout() {
    if (!tcActive) return;
    const idleMins = Math.round((Date.now() - tcLastActivity) / 60000);
    sbQuery('PATCH', 'time_clock?identity=eq.antcpu&punch_out=is.null',
      { punch_out: new Date().toISOString(), auto_logout: true, note: 'Auto-logout: idle ' + idleMins + 'm' }
    ).catch(()=>{});
    tcActive = false;
    tcStart  = null;
    clearInterval(tcInterval);
    tcSetUI(false);
  }

  // activity heartbeat — direct Supabase
  ['mousemove','keydown','click','scroll','touchstart'].forEach(ev => {
    document.addEventListener(ev, () => {
      tcLastActivity = Date.now();
      if (tcActive) {
        sbQuery('PATCH', 'time_clock?identity=eq.antcpu&punch_out=is.null',
          { note: 'heartbeat: ' + new Date().toISOString() }
        ).catch(()=>{});
      }
    }, { passive: true });
  });

  // check status on load — direct Supabase
  tcCheckStatus();

  // punch in/out button
  document.addEventListener('click', function(e) {
    if (!e.target || e.target.id !== 'ant-tc-btn') return;
    if (!tcActive) {
      tcPunchIn();
    } else {
      tcPunchOut();
    }
  });

})();

// ── TICKER ─────────────────────────────────────────────
// Slim activity bar injected below nav — appears on every page
// Rotates: last discord send / last email / progress % / genesis countdown

(function() {
  const tickerStyle = document.createElement('style');
  tickerStyle.textContent = `
    .ant-ticker {
      background: #0d0d0d;
      border-bottom: 1px solid #1a1a1a;
      padding: 0 20px;
      height: 28px;
      display: flex;
      align-items: center;
      overflow: hidden;
      position: fixed;
      width: 100%;
      top: 52px;
      z-index: 49;
    }
    .ant-ticker-inner {
      display: flex;
      align-items: center;
      gap: 0;
      width: 100%;
      overflow: hidden;
    }
    .ant-ticker-label {
      font-family: monospace;
      font-size: .65rem;
      color: #e6edf3;
      letter-spacing: 2px;
      text-transform: uppercase;
      white-space: nowrap;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .ant-ticker-item {
      font-family: monospace;
      font-size: .72rem;
      color: #555;
      white-space: nowrap;
      transition: opacity .5s;
      flex-shrink: 0;
    }
    .ant-ticker-item .tick-val {
      color: #00ff88;
      margin-left: 4px;
    }
    .ant-ticker-item .tick-warn {
      color: #d29922;
      margin-left: 4px;
    }
    .ant-ticker-sep {
      color: #222;
      margin: 0 14px;
      font-family: monospace;
      font-size: .72rem;
      flex-shrink: 0;
    }
    .ant-ticker-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #00ff88;
      margin-right: 10px;
      flex-shrink: 0;
      animation: ticker-pulse 2s ease-in-out infinite;
    }
    @keyframes ticker-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .3; }
    }
  `;
  document.head.appendChild(tickerStyle);

  const ticker = document.createElement('div');
  ticker.className = 'ant-ticker';
  ticker.innerHTML = `
    <div class="ant-ticker-inner">
      <div class="ant-ticker-dot"></div>
      <div class="ant-ticker-label">live //</div>
      <div class="ant-ticker-item" id="tick-discord">discord<span class="tick-val" id="tick-discord-val">—</span></div>
      <div class="ant-ticker-sep">·</div>
      <div class="ant-ticker-item" id="tick-email">email<span class="tick-val" id="tick-email-val">—</span></div>
      <div class="ant-ticker-sep">·</div>
      <div class="ant-ticker-item" id="tick-progress">progress<span class="tick-val" id="tick-progress-val">—</span></div>
      <div class="ant-ticker-sep">·</div>
      <div class="ant-ticker-item" id="tick-genesis">genesis<span class="tick-warn" id="tick-genesis-val">—</span></div>
    </div>
  `;

  // inject after nav and drawer
  const nav = document.querySelector('.ant-nav');
  if (nav && nav.nextSibling) {
    nav.parentNode.insertBefore(ticker, nav.nextSibling.nextSibling || nav.nextSibling);
  } else {
    document.body.appendChild(ticker);
  }

  // genesis countdown
  function genesisCountdown() {
    const seal = new Date('2026-08-10T00:00:00');
    const now = new Date();
    const diff = Math.ceil((seal - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff + 'd to seal' : 'SEALED';
  }

  // last discord send
  function lastDiscord() {
    try {
      const hist = JSON.parse(localStorage.getItem('antcpu_discord_history') || '[]');
      if (!hist.length) return '—';
      const last = hist[0];
      return last.time + ' → ' + (last.name || '').slice(0, 20);
    } catch { return '—'; }
  }

  // last send — local only, graceful fallback
  async function lastSend() {
    try {
      const r = await fetch('http://localhost:3000/api/last-send', { signal: AbortSignal.timeout(1500) });
      const d = await r.json();
      if (!d.to_address) return '—';
      const t = d.created_at ? d.created_at.slice(11,16) : '';
      return t + ' → ' + d.to_address.split('@')[0];
    } catch { return '—'; }
  }

  // progress from public snapshot
  async function fetchProgress() {
    try {
      const d = await fetch('https://antcpu.com/data/progress.json').then(r => r.json());
      if (d.monthly && d.monthly.length) {
        const current = d.monthly.find(b => b.pct > 0 && b.pct < 100) || d.monthly[0];
        return current.label.replace(' 2026','') + ' ' + current.pct + '%';
      }
      return '—';
    } catch { return '—'; }
  }

  async function updateTicker() {
    const gEl = document.getElementById('tick-genesis-val');
    const dEl = document.getElementById('tick-discord-val');
    const eEl = document.getElementById('tick-email-val');
    const pEl = document.getElementById('tick-progress-val');
    if (gEl) gEl.textContent = genesisCountdown();
    if (dEl) dEl.textContent = lastDiscord();
    if (eEl) eEl.textContent = await lastSend();
    if (pEl) {
      const p = await fetchProgress();
      pEl.textContent = p;
    }
  }

  updateTicker();
  setInterval(updateTicker, 15000);

})();
