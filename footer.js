// ============================================================
// FOOTER.JS — antcpu-launcher
// Shared footer — injected into every page via <script src="footer.js">
// Groups: public | core | comms | system | circles
// Version: 2.0.0 — 2026-05-02
// ============================================================

(function () {

  const cfg  = window.ANT_PAGE || { root: './' };
  const root = cfg.root || './';

  const groups = [
    {
      label: 'PUBLIC',
      links: [
        { label: 'Launcher',   href: root + 'launcher.html'      },
        { label: 'antcoin',    href: root + 'antcoin/'           },
        { label: 'EDU',        href: root + 'edu/'               },
        { label: 'Feed',       href: root + 'feed.html'          },
        { label: 'Ads',        href: 'https://antcpu-ads.vercel.app/', external: true },
        { label: 'Live',       href: root + 'live.html'          },
      ]
    },
    {
      label: 'CORE',
      links: [
        { label: 'Dashboard',  href: root + 'index.html'         },
        { label: 'Tower',      href: root + 'tower.html'         },
        { label: 'Progress',   href: root + 'progress.html'      },
        { label: 'Calendar',   href: root + 'calendar.html'      },
        { label: 'antcpu',     href: root + 'antcpu-agent.html'  },
        { label: 'Employees',  href: root + 'employees.html'     },
        { label: 'Send',       href: root + 'send.html'          },
      ]
    },
    {
      label: 'SYSTEM',
      links: [
        { label: 'AntChain',   href: root + 'antchain.html'      },
        { label: 'Chain',      href: root + 'chain.html'         },
        { label: 'Wiki',       href: root + 'wiki.html'          },
        { label: 'Radar',      href: root + 'radar.html'         },
        { label: 'Pipeline',   href: root + 'pipeline.html'      },
      ]
    },
  ];

  // ── STYLES ─────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .ant-footer {
      margin-top: 60px;
      border-top: 1px solid #1f1f1f;
      background: #0d0d0d;
      padding: 32px 24px 20px;
      font-family: monospace;
    }
    .ant-footer-main {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      max-width: 1200px;
      margin: 0 auto 24px;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      align-items: flex-start;
    }
    .ant-footer-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 110px;
      flex: 1;
      background: #0d0d0d;
      border: 1px solid #1f1f1f;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .ant-footer-group-label {
      font-size: .58rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #444;
      margin-bottom: 6px;
    }
    .ant-footer-link {
      font-size: .72rem;
      color: #555;
      text-decoration: none;
      transition: color .2s, border-color .2s;
      background: #141414;
      border: 1px solid #222;
      border-radius: 5px;
      padding: 3px 8px;
      display: block;
    }
    .ant-footer-link:hover { color: #00ff88; border-color: #00ff88; }
    .ant-footer-link.ant-factive { color: #00ff88 !important; border-color: #00ff8866 !important; }
    .ant-footer-link.ant-ftop { color: #d29922; border-color: #d2992244; }
    .ant-footer-link.top-page { color: #00ff88; border-color: #00ff8844; }
    .ant-fcount { font-size: .58rem; color: #444; margin-left: 3px; vertical-align: middle; }
    .ant-fdot { transition: background .3s; }
    .ant-footer-genesis { font-size: .63rem; color: #333; font-family: monospace; text-align: center; padding: 8px 0 0; letter-spacing: .08em; border-top: 1px solid #1a1a1a; margin-top: 8px; }

    /* ── CIRCLES BOX ── */
    .ant-footer-circles {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: #0d0d0d;
      border: 1px solid #1f1f1f;
      border-radius: 8px;
      padding: 16px 20px;
      min-width: 110px;
    }
    .ant-footer-circles-row {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: center;
    }
    .ant-fcircle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .ant-fcircle svg { display: block; }
    .ant-fcircle-label {
      font-size: .58rem;
      color: #444;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .ant-fcircle-val {
      font-size: .75rem;
      color: #00ff88;
      font-family: monospace;
      font-weight: bold;
    }
    .ant-footer-circles-title {
      font-size: .55rem;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 2px;
    }

    .ant-footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      font-size: .62rem;
      color: #333;
      border-top: 1px solid #1a1a1a;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .ant-footer-bottom span { color: #444; }
    #ant-footer-version { color: #c8f564 !important; font-weight: 700 !important; text-shadow: 0 0 8px rgba(200,245,100,0.4) !important; }
    #ant-footer-sc { color: #f0c040 !important; font-weight: 700 !important; text-shadow: 0 0 6px rgba(240,192,64,0.4) !important; }
    #ant-footer-ant .sc-label { color: #555570 !important; }
  `;
  document.head.appendChild(style);

  // ── SNAPSHOT DATA (features 1,2,3,6) ──────────────────────
  let _pageViews = {};
  let _topPages  = [];
  (async () => {
    try {
      const snap = await fetch('https://antcpu.com/data/progress.json').then(r=>r.json());
      if (snap.pageViews) {
        snap.pageViews.forEach(p => { _pageViews[p.page] = p; });
        _topPages = snap.pageViews.slice(0,3).map(p => p.page);
      }
      // re-render dots + counts after data loads
      document.querySelectorAll('.ant-footer-link[data-page]').forEach(el => {
        const page = el.getAttribute('data-page');
        const pv   = _pageViews[page];
        const dot  = el.querySelector('.ant-fdot');
        const cnt  = el.querySelector('.ant-fcount');
        if (dot && pv) {
          const age = pv.last_seen ? (Date.now() - new Date(pv.last_seen)) / 60000 : 9999;
          dot.style.background = age < 60 ? '#00ff88' : age < 1440 ? '#d29922' : '#333';
          dot.title = age < 60 ? 'active < 1hr' : age < 1440 ? 'active today' : 'stale';
        }
        if (cnt && pv && pv.hits > 0) cnt.textContent = pv.hits;
        if (_topPages.includes(page)) el.classList.add('ant-ftop');
      });
    } catch(e) {}
  })();

  // ── FEATURE 4: GENESIS COUNTDOWN ────────────────────────
  function _genesisLine() {
    const diff = new Date('2026-08-10T12:00:00-05:00') - new Date();
    if (diff <= 0) return '⚡ genesis sealed';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return '⚡ ' + d + 'd ' + h + 'h to genesis seal';
  }

  // ── FEATURE 5: ACTIVE PAGE ───────────────────────────────
  function _isActive(href) {
    try {
      const current = window.location.pathname.replace(/\/+$/, '') || '/';
      const target  = new URL(href, window.location.href).pathname.replace(/\/+$/, '');
      return current === target;
    } catch(e) { return false; }
  }

  // ── LINK BUILDER (features 1,2,3,5) ─────────────────────
  function _buildLink(item) {
    const page    = item.href.replace(/^.*\//, '').replace(/[?#].*$/, '') || item.href;
    const active  = _isActive(item.href);
    const ext     = item.external ? ' target="_blank" rel="noopener"' : '';
    return '<a class="ant-footer-link' + (active ? ' ant-factive' : '') + '"' +
      ' href="' + item.href + '"' + ext +
      ' data-page="' + page + '">' +
      '<span class="ant-fdot" style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#333;margin-right:5px;vertical-align:middle;transition:background .3s;"></span>' +
      item.label +
      '<span class="ant-fcount" style="margin-left:5px;font-size:.58rem;color:#444;"></span>' +
      '</a>';
  }

  // ── RENDER ─────────────────────────────────────────────
  const footer = document.createElement('footer');
  footer.className = 'ant-footer';

  const mainEl = document.createElement('div');
  mainEl.className = 'ant-footer-main';

  // nav groups
  groups.forEach(g => {
    const col = document.createElement('div');
    col.className = 'ant-footer-group';
    col.innerHTML = '<div class="ant-footer-group-label">' + g.label + '</div>' +
      g.links.map(l => _buildLink(l)).join('');
    mainEl.appendChild(col);
  });

  // circles box
  function makeCircle(id, label) {
    const wrap = document.createElement('div');
    wrap.className = 'ant-fcircle';
    wrap.innerHTML = `
      <svg width="72" height="72" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#1a1a1a" stroke-width="3"/>
        <circle id="${id}-ring" cx="18" cy="18" r="15" fill="none" stroke="#00ff88" stroke-width="3"
          stroke-dasharray="94.2" stroke-dashoffset="94.2"
          stroke-linecap="round" transform="rotate(-90 18 18)"
          style="transition:stroke-dashoffset .6s ease"/>
      </svg>
      <div class="ant-fcircle-val" id="${id}-val">—</div>
      <div class="ant-fcircle-label">${label}</div>
    `;
    return wrap;
  }

  const circlesBox = document.createElement('div');
  circlesBox.className = 'ant-footer-circles';

  const circlesTitle = document.createElement('div');
  circlesTitle.className = 'ant-footer-circles-title';
  circlesTitle.textContent = 'PROGRESS';

  const circlesRow = document.createElement('div');
  circlesRow.className = 'ant-footer-circles-row';

  const cToday   = makeCircle('afc-today',   'today');
  const cWeek    = makeCircle('afc-week',    'week');
  const cGenesis = makeCircle('afc-genesis', 'genesis');
  circlesRow.appendChild(cToday);
  circlesRow.appendChild(cWeek);
  circlesRow.appendChild(cGenesis);

  circlesBox.appendChild(circlesTitle);
  circlesBox.appendChild(circlesRow);
  mainEl.appendChild(circlesBox);

  const bottom = document.createElement('div');
  bottom.className = 'ant-footer-bottom';
  bottom.innerHTML =
    '<span>antcpu.com · <span id="ant-footer-version" style="color:#00ff88;text-shadow:0 0 8px #00ff8866;font-weight:700;">v2.1.0</span> · 2026' +
    ' <span style="display:inline-block;background:#d2992220;border:1px solid #d2992244;color:#d29922;font-size:.55rem;padding:1px 5px;border-radius:3px;margin-left:4px;vertical-align:middle;" title="Dashboard not yet live — pages pending">(1)</span></span>' +
    '<span id="ant-footer-ant" style="font-family:monospace;font-size:.65rem;letter-spacing:.05em;">' +
    '<span style="color:#c8f564;text-shadow:0 0 6px #c8f56444;">⬡</span> ' +
    '<span id="ant-footer-sc" style="color:#f0c040;font-weight:700;text-shadow:0 0 6px #f0c04044;">— SC</span>' +
    '<span style="color:#555570;margin-left:4px;">samplecoin</span>' +
    '</span>';

  // ── GENESIS LINE (feature 4) ────────────────────────────
  const genesisBar = document.createElement('div');
  genesisBar.className = 'ant-footer-genesis';
  genesisBar.textContent = _genesisLine();
  setInterval(() => { genesisBar.textContent = _genesisLine(); }, 60000);

  footer.appendChild(mainEl);
  footer.appendChild(genesisBar);
  footer.appendChild(bottom);
  document.body.appendChild(footer);

  // ── SAMPLECOIN BALANCE — reads from ledger API ─────────
  (async () => {
    try {
      const d = await fetch('http://localhost:3000/api/samplecoin/ledger').then(r=>r.json());
      const bal = d.total ?? d.count ?? 18;
      const el = document.getElementById('ant-footer-sc');
      if (el) el.textContent = bal + ' SC';
    } catch(e) {
      const el = document.getElementById('ant-footer-sc');
      if (el) el.textContent = '18 SC';
    }
  })();

  // clock lives in nav.js — not duplicated here

  // ── FOOTER CLICK TRACKING ──────────────────────────────
  document.addEventListener('click', function(e) {
    const link = e.target.closest('[data-footer-link]');
    if (!link) return;
    const label = link.getAttribute('data-footer-link');
    const href  = link.getAttribute('href') || '';
    fetch('/api/footer-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, href, page: window.location.pathname })
    }).catch(() => {});
  });

  // ── TOP PAGES HIGHLIGHT ─────────────────────────────────
  fetch('/api/analytics')
    .then(r => r.json())
    .then(data => {
      const top3 = (data.views || []).slice(0, 3).map(v => v.page.replace(/\/index\.html$/, '/').replace(/\.html$/, ''));
      document.querySelectorAll('[data-footer-link]').forEach(link => {
        const href = (link.getAttribute('href') || '').replace(/\/index\.html$/, '/').replace(/\.html$/, '');
        if (top3.some(p => href.endsWith(p))) link.classList.add('top-page');
      });
    }).catch(() => {});

  // ── PROGRESS CIRCLES ───────────────────────────────────
  function setCircle(id, pct) {
    const ring = document.getElementById(id + '-ring');
    const val  = document.getElementById(id + '-val');
    if (!ring || !val) return;
    ring.style.strokeDashoffset = 94.2 - (94.2 * Math.min(pct, 100) / 100);
    val.textContent = pct + '%';
  }

  function setGenesisCircle(days) {
    const pct = Math.round((Math.max(0, 100 - days) / 100) * 100);
    const ring = document.getElementById('afc-genesis-ring');
    const val  = document.getElementById('afc-genesis-val');
    if (!ring || !val) return;
    ring.style.strokeDashoffset = 94.2 - (94.2 * pct / 100);
    val.textContent = days + 'd';
  }

  // progress circles + ANT balance — public snapshot, works on live + local
  fetch('https://antcpu.com/data/progress.json')
    .then(r => r.json())
    .then(d => {
      setCircle('afc-today', d.daily?.pct ?? 0);
      setCircle('afc-week',  d.weekly?.pct ?? 0);
      const genesis = Math.ceil((new Date('2026-08-10') - new Date()) / (1000*60*60*24));
      setGenesisCircle(genesis);
      // ANT balance from satellite intel
      const sat = d.satellite || [];
      const antEntry = sat.find(s => s.name && s.name.toLowerCase().includes('antcoin'));
      const match = antEntry?.intel ? antEntry.intel.match(/balance[:\s]+([\d,\.]+)/i) : null;
      const balEl = document.getElementById('ant-footer-ant');
      if (balEl) balEl.textContent = match ? match[1] + ' ANT' : '1,000,000 ANT';
    })
    .catch(() => {});

})();
