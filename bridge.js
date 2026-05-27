// ============================================================
// BRIDGE.JS — antcpu-stage
// Polls all gap endpoints, renders to stage dashboard
// v1.0.0 — 2026-04-30
// ============================================================

(function () {

  const API = 'http://localhost:3000';

  // ── UTILS ──────────────────────────────────────────────
  function card(label, value, sub, colorClass, borderClass) {
    return `<div class="gap-card ${borderClass||''}">
      <div class="gap-card-label">${label}</div>
      <div class="gap-card-value ${colorClass||''}">${value}</div>
      ${sub ? `<div class="gap-card-sub">${sub}</div>` : ''}
    </div>`;
  }

  function err(msg) {
    return `<div class="gap-card b-red"><div class="gap-card-label">error</div><div class="gap-card-value c-red">✗</div><div class="gap-card-sub">${msg}</div></div>`;
  }

  function setGrid(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function fmt(ts) {
    if (!ts) return '—';
    try { return new Date(ts).toLocaleString(); } catch(e) { return ts; }
  }

  // ── FOOTER CLICKS ──────────────────────────────────────
  async function loadFooterClicks() {
    try {
      const d = await fetch(`${API}/api/footer-clicks`).then(r => r.json());
      const clicks = d.clicks || [];
      if (!clicks.length) return setGrid('footer-clicks-grid', card('footer clicks', '0', 'no clicks recorded yet', 'c-dim', 'b-dim'));
      const html = clicks.slice(0, 9).map((c, i) => {
        const border = i === 0 ? 'b-green' : i === 1 ? 'b-blue' : i === 2 ? 'b-yellow' : '';
        const color  = i === 0 ? 'c-green' : i === 1 ? 'c-blue'  : i === 2 ? 'c-yellow' : '';
        return card(c.label, c.clicks + ' clicks', 'last: ' + fmt(c.last_click), color, border);
      }).join('');
      setGrid('footer-clicks-grid', html);
    } catch(e) { setGrid('footer-clicks-grid', err(e.message)); }
  }

  // ── FILE VIEWS ─────────────────────────────────────────
  async function loadFileViews() {
    try {
      const d = await fetch(`${API}/api/file-views`).then(r => r.json());
      const views = d.views || [];
      if (!views.length) return setGrid('file-views-grid', card('file views', '0', 'no file views recorded yet', 'c-dim', 'b-dim'));
      const html = views.slice(0, 9).map((f, i) => {
        const border = i === 0 ? 'b-green' : i === 1 ? 'b-blue' : i === 2 ? 'b-yellow' : '';
        const color  = i === 0 ? 'c-green' : i === 1 ? 'c-blue'  : i === 2 ? 'c-yellow' : '';
        return card(f.filename, f.hits + ' hits', 'last: ' + fmt(f.last_seen), color, border);
      }).join('');
      setGrid('file-views-grid', html);
    } catch(e) { setGrid('file-views-grid', err(e.message)); }
  }

  // ── HEALTH FULL ────────────────────────────────────────
  async function loadHealth() {
    try {
      const d = await fetch(`${API}/api/health/full`).then(r => r.json());
      const rows = Object.entries(d).map(([k, v]) => {
        const ok = v === true || v === 'ok' || v === 'connected' || (typeof v === 'number' && v > 0);
        return `<div class="health-row">
          <span style="color:#888;">${k}</span>
          <span class="${ok ? 'c-green' : 'c-red'}">${typeof v === 'object' ? JSON.stringify(v) : v}</span>
        </div>`;
      }).join('');
      setGrid('health-grid', `<div class="gap-card" style="grid-column:1/-1;">${rows}</div>`);
    } catch(e) { setGrid('health-grid', err(e.message)); }
  }

  // ── AGENT STATUS ───────────────────────────────────────
  async function loadAgentStatus() {
    try {
      const d = await fetch(`${API}/api/antcpu/status`).then(r => r.json());
      const entries = Object.entries(d);
      if (!entries.length) return setGrid('agent-status-grid', card('agents', '—', 'no status data', 'c-dim', 'b-dim'));
      const html = entries.map(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v);
        const ok  = val.includes('active') || val.includes('ok') || val.includes('true');
        return card(k, val, '', ok ? 'c-green' : 'c-dim', ok ? 'b-green' : 'b-dim');
      }).join('');
      setGrid('agent-status-grid', html);
    } catch(e) { setGrid('agent-status-grid', err(e.message)); }
  }

  // ── WEEKLY ─────────────────────────────────────────────
  async function loadWeekly() {
    try {
      const d = await fetch(`${API}/api/weekly`).then(r => r.json());
      const entries = Object.entries(d);
      if (!entries.length) return setGrid('weekly-grid', card('weekly', '—', 'no weekly data', 'c-dim', 'b-dim'));
      const html = entries.slice(0, 8).map(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v);
        return card(k, val, '', 'c-blue', 'b-blue');
      }).join('');
      setGrid('weekly-grid', html);
    } catch(e) { setGrid('weekly-grid', err(e.message)); }
  }

  // ── AI USAGE ───────────────────────────────────────────
  async function loadAiUsage() {
    try {
      const d = await fetch(`${API}/api/gemini/rates`).then(r => r.json());
      const entries = Object.entries(d);
      if (!entries.length) return setGrid('ai-usage-grid', card('ai usage', '—', 'no usage data', 'c-dim', 'b-dim'));
      const html = entries.slice(0, 8).map(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : String(v);
        return card(k, val, '', 'c-purple', 'b-purple');
      }).join('');
      setGrid('ai-usage-grid', html);
    } catch(e) { setGrid('ai-usage-grid', err(e.message)); }
  }

  // ── LEDGER ─────────────────────────────────────────────
  async function loadLedger() {
    try {
      const d = await fetch(`${API}/api/samplecoin/ledger`).then(r => r.json());
      const entries = Array.isArray(d) ? d : Object.entries(d);
      if (!entries.length) return setGrid('ledger-grid', card('ledger', '0', 'no transactions', 'c-dim', 'b-dim'));
      const rows = (Array.isArray(d) ? d : [d]).slice(0, 6).map(tx => {
        const label = tx.type || tx.label || 'tx';
        const val   = tx.amount !== undefined ? tx.amount + ' ANT' : JSON.stringify(tx).slice(0, 30);
        const sub   = tx.ts || tx.created_at || '';
        return card(label, val, fmt(sub), 'c-yellow', 'b-yellow');
      }).join('');
      setGrid('ledger-grid', rows);
    } catch(e) { setGrid('ledger-grid', err(e.message)); }
  }

  // ── SNAPSHOT BUILDER ───────────────────────────────────
  window.buildSnapshot = async function() {
    const el = document.getElementById('snapshot-status');
    el.textContent = '⏳ gathering data...';
    try {
      const [analytics, tower, health, agents, footerClicks, fileViews] = await Promise.all([
        fetch(`${API}/api/analytics`).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/api/tower`).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/api/health/full`).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/api/antcpu/status`).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/api/footer-clicks`).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/api/file-views`).then(r => r.json()).catch(() => ({})),
      ]);

      const snapshot = {
        generated: new Date().toISOString(),
        version: '1.0.0',
        analytics,
        tower,
        health,
        agents,
        footerClicks,
        fileViews,
      };

      // Download as JSON for manual push (SFTP push coming in phase 2)
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'tower-snapshot.json'; a.click();
      URL.revokeObjectURL(url);

      el.textContent = '✓ snapshot built — tower-snapshot.json downloaded · push via SFTP to ionos root';
      el.style.color = '#00ff88';
    } catch(e) {
      el.textContent = '✗ error: ' + e.message;
      el.style.color = '#f85149';
    }
  };

  // ── REFRESH ALL ────────────────────────────────────────
  window.refreshAll = function() {
    document.getElementById('stage-ts').textContent = new Date().toLocaleTimeString();
    loadFooterClicks();
    loadFileViews();
    loadHealth();
    loadAgentStatus();
    loadWeekly();
    loadAiUsage();
    loadLedger();
  };

  // ── HEALTH CHECK ───────────────────────────────────────
  fetch(`${API}/api/health`)
    .then(r => r.json())
    .then(d => {
      const el = document.getElementById('stage-health');
      if (el) { el.textContent = '● server online'; el.style.color = '#00ff88'; }
    })
    .catch(() => {
      const el = document.getElementById('stage-health');
      if (el) { el.textContent = '✗ server offline'; el.style.color = '#f85149'; }
    });

  // ── INIT ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('stage-ts').textContent = new Date().toLocaleTimeString();
    refreshAll();
  });

})();
