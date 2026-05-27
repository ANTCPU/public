// ============================================================
// ANTCPU.JS — antcpu-launcher
// Shared utility library — loaded on every page
// Version: 1.0.0 — 2026-04-21
// ============================================================

window.ANT = (function() {

  // ── STORAGE ────────────────────────────────────────────
  // Namespaced localStorage helpers
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    del: (k)    => localStorage.removeItem(k),
    // namespaced: ANT.store.ns('discord').get('webhooks')
    ns: (prefix) => ({
      get: (k, d) => store.get('antcpu_' + prefix + '_' + k, d),
      set: (k, v) => store.set('antcpu_' + prefix + '_' + k, v),
      del: (k)    => store.del('antcpu_' + prefix + '_' + k),
    })
  };

  // ── KEYS ───────────────────────────────────────────────
  // Centralised localStorage key registry
  const KEYS = {
    DISCORD_WEBHOOKS : 'antcpu_discord_webhooks',
    DISCORD_HISTORY  : 'antcpu_discord_history',
    SEND_HISTORY     : 'antcpu_send_history',
    FILES            : 'antcpu_files',
    BAR_VAL          : 'ant_bar',
    BAR_LOG          : 'ant_bar_log',
  };

  // ── ESCAPE ─────────────────────────────────────────────
  const esc = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // ── TIME ───────────────────────────────────────────────
  // EDT short time: "07:20 PM"
  const timeNow = () => new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit', minute: '2-digit'
  });

  // EDT full time with seconds: "07:20:45 PM EDT"
  const timeNowFull = () => new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }) + ' EDT';

  // ISO date: "2026-04-21"
  const dateToday = () => new Date().toISOString().slice(0, 10);

  // Genesis countdown
  const genesisCountdown = () => {
    const seal = new Date('2026-08-10T00:00:00');
    const diff = Math.ceil((seal - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff + 'd to seal' : 'SEALED';
  };

  // ── STATUS BAR ─────────────────────────────────────────
  // ANT.status('uploadStatus', 'ok', '✓ done')
  // ANT.status('uploadStatus', 'loading', 'uploading...')
  // ANT.status('uploadStatus', 'err', '✗ failed')
  const status = (elId, type, msg, autohide = 4000) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = 'status-bar show ' + type;
    el.innerHTML = type === 'loading'
      ? '<div class="ant-spinner"></div> ' + msg
      : msg;
    if (type !== 'loading' && autohide) {
      setTimeout(() => el.classList.remove('show'), autohide);
    }
  };

  // ── SPINNER ────────────────────────────────────────────
  // Inject shared spinner style once
  const _spinnerStyle = document.createElement('style');
  _spinnerStyle.textContent = `.ant-spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(0,255,136,.2);border-top-color:#00ff88;border-radius:50%;animation:ant-spin .7s linear infinite;vertical-align:middle;}@keyframes ant-spin{to{transform:rotate(360deg);}}`;
  document.head.appendChild(_spinnerStyle);

  // ── SEND HISTORY ───────────────────────────────────────
  // Log a unified send event (discord or resend)
  const logSend = (channel, msg, ok, badge) => {
    const hist = store.get(KEYS.SEND_HISTORY, []);
    hist.unshift({
      id    : Date.now().toString(),
      time  : timeNow(),
      channel,
      msg   : String(msg).slice(0, 80),
      ok,
      badge  // 'd' = discord, 'r' = resend
    });
    store.set(KEYS.SEND_HISTORY, hist.slice(0, 30));
  };

  const clearSendHistory = () => store.set(KEYS.SEND_HISTORY, []);

  // ── DISCORD WEBHOOKS ───────────────────────────────────
  const getWebhooks = () => store.get(KEYS.DISCORD_WEBHOOKS, []);
  const getActiveWebhooks = () => getWebhooks().filter(h => h.active && h.url);

  // ── FORMAT ─────────────────────────────────────────────
  // File size: bytes → "12.4 kb"
  const fmtSize = bytes => (bytes / 1024).toFixed(1) + ' kb';

  // Truncate string
  const trunc = (s, n = 60) => String(s).length > n ? String(s).slice(0, n) + '…' : String(s);

  // ── FETCH HELPERS ──────────────────────────────────────
  const getJSON = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  };

  const postJSON = async (url, body) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return r.json();
  };

  // ── PUBLIC API ─────────────────────────────────────────
  return {
    store,
    KEYS,
    esc,
    timeNow,
    timeNowFull,
    dateToday,
    genesisCountdown,
    status,
    logSend,
    clearSendHistory,
    getWebhooks,
    getActiveWebhooks,
    fmtSize,
    trunc,
    getJSON,
    postJSON,
    version: '1.0.0'
  };

  // ── PAGE TRACKING ─────────────────────────────────────
  // Fires on every page load — increments page_views in DB
  (function trackPageView() {
    try {
      const page = window.location.pathname.replace(/^\//, '') || 'index.html';
      fetch('http://localhost:3000/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, event: 'pageview' })
      }).catch(() => {}); // silent fail — tracking is non-blocking
    } catch(e) {}
  })();

})();