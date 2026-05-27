// ============================================================
// ANTCPU.LIVE.JS — antcpu-launcher
// Internal CPU brain — session-aware, self-reporting, evolving
// This file becomes antcpu.live — the operating system layer
// Version: 1.0.0 — 2026-04-21
// ============================================================

window.ANTLIVE = (function () {

  const IDENTITY = {
    name      : 'antcpu.live',
    version   : '1.0.0',
    build     : '2026-04-21',
    operator  : 'Antony Ciccone',
    mission   : 'Coordinate the antcpu build system. Track sessions. Report state. Evolve.',
    genesis   : '2026-08-10',
  };

  const SESSION = {
    id       : 'session-' + new Date().toISOString().slice(0, 10),
    started  : new Date().toISOString(),
    page     : window.location.pathname.split('/').pop() || 'index.html',
    events   : [],
    commands : [],
  };

  const log = (type, msg, meta = {}) => {
    const event = {
      id   : Date.now().toString(),
      type,
      msg,
      meta,
      time : new Date().toISOString(),
      page : SESSION.page,
    };
    SESSION.events.push(event);
    const stored = ANT.store.get('antcpu_live_log', []);
    stored.unshift(event);
    ANT.store.set('antcpu_live_log', stored.slice(0, 200));
    return event;
  };

  const getState = async () => {
    let health = null, progress = null, tower = null;
    try { health   = await ANT.getJSON('/api/health'); }   catch { health   = { status: 'unreachable' }; }
    try { progress = await ANT.getJSON('/api/progress'); } catch { progress = null; }
    try { tower    = await ANT.getJSON('/api/tower'); }    catch { tower    = null; }
    const payQueue = ANT.store.get('antcpu_ant_pay_queue', []);
    const sendHist = ANT.store.get('antcpu_send_history', []);
    const webhooks = ANT.store.get('antcpu_discord_webhooks', []);
    return {
      identity : IDENTITY,
      session  : SESSION,
      health, progress, tower,
      comms: {
        webhooks_active : webhooks.filter(h => h.active).length,
        emails_sent     : sendHist.filter(h => h.badge === 'r').length,
        discord_sent    : sendHist.filter(h => h.badge === 'd').length,
      },
      ant_pay: {
        pending   : payQueue.filter(p => p.status === 'pending').length,
        confirmed : payQueue.filter(p => p.status === 'confirmed').length,
        queue     : payQueue,
      },
      genesis: {
        seal_date   : IDENTITY.genesis,
        days_remain : Math.ceil((new Date(IDENTITY.genesis) - new Date()) / (1000 * 60 * 60 * 24)),
      },
      timestamp: new Date().toISOString(),
    };
  };

  let _pulseTimer = null;
  const startPulse = (intervalMs = 60000) => {
    if (_pulseTimer) clearInterval(_pulseTimer);
    _pulseTimer = setInterval(async () => {
      const state = await getState();
      log('pulse', 'system heartbeat', {
        health      : state.health?.status,
        genesis     : state.genesis.days_remain + 'd',
        pending_pay : state.ant_pay.pending,
      });
    }, intervalMs);
  };
  const stopPulse = () => { if (_pulseTimer) clearInterval(_pulseTimer); _pulseTimer = null; };

  const _commands = {};
  const cmd = (name, fn) => { _commands[name] = fn; };
  const run = async (name, ...args) => {
    if (!_commands[name]) throw new Error('Unknown command: ' + name);
    SESSION.commands.push({ name, args, time: new Date().toISOString() });
    return _commands[name](...args);
  };

  cmd('status', async () => {
    const state = await getState();
    console.group('⚡ antcpu.live — system status');
    console.log('Version   :', IDENTITY.version);
    console.log('Session   :', SESSION.id);
    console.log('Health    :', state.health?.status);
    console.log('Genesis   :', state.genesis.days_remain + ' days to seal');
    console.log('Comms     :', state.comms);
    console.log('ANT Pay   :', state.ant_pay.pending + ' pending, ' + state.ant_pay.confirmed + ' confirmed');
    console.groupEnd();
    return state;
  });

  cmd('employees', () => {
    if (typeof ANTAI === 'undefined') { console.warn('antcpu-ai.js not loaded'); return; }
    console.table(ANTAI.EMPLOYEES.map(e => ({
      name  : e.name,
      role  : e.role,
      status: e.status,
      model : e.model,
      earned: e.ant_earned + ' ANT',
    })));
    return ANTAI.EMPLOYEES;
  });

  cmd('pay-queue', () => {
    const queue = ANT.store.get('antcpu_ant_pay_queue', []);
    console.table(queue);
    return queue;
  });

  cmd('log', (n = 10) => {
    const stored = ANT.store.get('antcpu_live_log', []);
    console.table(stored.slice(0, n));
    return stored.slice(0, n);
  });

  cmd('reset-session', () => {
    SESSION.events   = [];
    SESSION.commands = [];
    SESSION.started  = new Date().toISOString();
    log('system', 'session reset');
    console.log('✅ session reset');
  });

  const boot = () => {
    log('boot', 'antcpu.live booted', { page: SESSION.page, version: IDENTITY.version });
    startPulse();
    console.log('%c⚡ antcpu.live v' + IDENTITY.version + ' — online', 'color:#00ff88;font-family:monospace;font-size:12px;');
    console.log('%ctype ANTLIVE.run("status") to check system state', 'color:#555;font-family:monospace;font-size:11px;');
  };

  const evolve = {
    suggestions : [],
    queue: (suggestion) => {
      evolve.suggestions.push({ suggestion, time: new Date().toISOString(), applied: false });
      ANT.store.set('antcpu_live_evolve', evolve.suggestions);
      log('evolve', 'suggestion queued: ' + suggestion);
    },
    list: () => ANT.store.get('antcpu_live_evolve', []),
  };

  return {
    IDENTITY, SESSION,
    log, getState,
    startPulse, stopPulse,
    cmd, run,
    evolve, boot,
    version: '1.0.0'
  };

})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ANTLIVE.boot());
} else {
  ANTLIVE.boot();
}
