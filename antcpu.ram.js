// ============================================================
// ANTCPU.RAM.JS — antcpu-launcher
// Multitasking + extended memory layer for antcpu.live
// Plugs into ANTLIVE — call ANTRAM.mount() to activate
// Version: 1.0.0 — 2026-04-21
// ============================================================

window.ANTRAM = (function () {

  // ── MEMORY BANKS ───────────────────────────────────────
  // Volatile: cleared on page unload
  // Persistent: survives sessions via localStorage
  // Deep: large payloads, compressed, capped at MAX_DEEP

  const MAX_VOLATILE   = 100;  // max volatile slots
  const MAX_PERSISTENT = 200;  // max persistent slots
  const MAX_DEEP       = 20;   // max deep memory blobs

  const _volatile = new Map();

  // ── VOLATILE MEMORY ────────────────────────────────────
  // Fast in-memory store — lost on reload
  // ANTRAM.v.set('key', value)
  // ANTRAM.v.get('key')
  const v = {
    set: (k, val, ttlMs = null) => {
      if (_volatile.size >= MAX_VOLATILE) {
        // evict oldest
        const first = _volatile.keys().next().value;
        _volatile.delete(first);
      }
      _volatile.set(k, {
        val,
        set_at : Date.now(),
        expires: ttlMs ? Date.now() + ttlMs : null,
      });
    },
    get: (k) => {
      const entry = _volatile.get(k);
      if (!entry) return null;
      if (entry.expires && Date.now() > entry.expires) {
        _volatile.delete(k);
        return null;
      }
      return entry.val;
    },
    del  : (k)  => _volatile.delete(k),
    has  : (k)  => _volatile.has(k),
    keys : ()   => [..._volatile.keys()],
    size : ()   => _volatile.size,
    clear: ()   => _volatile.clear(),
    dump : ()   => Object.fromEntries([..._volatile.entries()].map(([k,v]) => [k, v.val])),
  };

  // ── PERSISTENT MEMORY ──────────────────────────────────
  // Survives page reloads — stored in localStorage
  // ANTRAM.p.set('key', value)
  const p = {
    set: (k, val) => {
      const store = ANT.store.get('antcpu_ram_p', {});
      const keys  = Object.keys(store);
      if (keys.length >= MAX_PERSISTENT) {
        // evict oldest by set_at
        const oldest = keys.sort((a,b) => (store[a].set_at||0) - (store[b].set_at||0))[0];
        delete store[oldest];
      }
      store[k] = { val, set_at: Date.now() };
      ANT.store.set('antcpu_ram_p', store);
    },
    get: (k) => {
      const store = ANT.store.get('antcpu_ram_p', {});
      return store[k]?.val ?? null;
    },
    del  : (k)  => { const s = ANT.store.get('antcpu_ram_p',{}); delete s[k]; ANT.store.set('antcpu_ram_p',s); },
    has  : (k)  => ANT.store.get('antcpu_ram_p',{})[k] !== undefined,
    keys : ()   => Object.keys(ANT.store.get('antcpu_ram_p',{})),
    size : ()   => Object.keys(ANT.store.get('antcpu_ram_p',{})).length,
    clear: ()   => ANT.store.set('antcpu_ram_p', {}),
    dump : ()   => ANT.store.get('antcpu_ram_p', {}),
  };

  // ── DEEP MEMORY ────────────────────────────────────────
  // Large payloads — AI responses, session transcripts, blobs
  // Capped at MAX_DEEP, FIFO eviction
  const deep = {
    write: (label, payload) => {
      const store = ANT.store.get('antcpu_ram_deep', []);
      store.unshift({
        id     : 'deep-' + Date.now(),
        label,
        payload,
        size   : JSON.stringify(payload).length,
        set_at : new Date().toISOString(),
      });
      ANT.store.set('antcpu_ram_deep', store.slice(0, MAX_DEEP));
    },
    read  : (label) => {
      const store = ANT.store.get('antcpu_ram_deep', []);
      return store.find(e => e.label === label) || null;
    },
    list  : ()      => ANT.store.get('antcpu_ram_deep', []).map(e => ({ id: e.id, label: e.label, size: e.size, set_at: e.set_at })),
    clear : ()      => ANT.store.set('antcpu_ram_deep', []),
    size  : ()      => ANT.store.get('antcpu_ram_deep', []).length,
  };

  // ── TASK QUEUE ─────────────────────────────────────────
  // Multitasking — queue async tasks, run concurrently up to MAX_CONCURRENT
  const MAX_CONCURRENT = 4;
  const _taskQueue  = [];
  const _running    = new Map();
  let   _taskSeq    = 0;

  const task = {
    add: (name, fn, priority = 5) => {
      const id = 'task-' + (++_taskSeq);
      _taskQueue.push({ id, name, fn, priority, queued_at: Date.now() });
      _taskQueue.sort((a,b) => b.priority - a.priority);
      _flush();
      return id;
    },
    cancel: (id) => {
      const idx = _taskQueue.findIndex(t => t.id === id);
      if (idx > -1) _taskQueue.splice(idx, 1);
    },
    status: () => ({
      queued  : _taskQueue.length,
      running : _running.size,
      slots   : MAX_CONCURRENT - _running.size,
    }),
    list: () => [..._taskQueue.map(t => ({ ...t, state: 'queued' })),
                 ...[..._running.values()].map(t => ({ ...t, state: 'running' }))],
  };

  const _flush = () => {
    while (_running.size < MAX_CONCURRENT && _taskQueue.length) {
      const t = _taskQueue.shift();
      _running.set(t.id, { ...t, started_at: Date.now() });
      Promise.resolve()
        .then(() => t.fn())
        .then(result => {
          _running.delete(t.id);
          if (typeof ANTLIVE !== 'undefined') {
            ANTLIVE.log('ram-task', t.name + ' completed', { id: t.id, result: String(result).slice(0,80) });
          }
          _flush();
        })
        .catch(err => {
          _running.delete(t.id);
          if (typeof ANTLIVE !== 'undefined') {
            ANTLIVE.log('ram-task-err', t.name + ' failed: ' + err.message, { id: t.id });
          }
          _flush();
        });
    }
  };

  // ── CONTEXT WINDOW ─────────────────────────────────────
  // Rolling context for AI agents — last N messages/events
  // Feeds into ANTAI prompts for continuity
  const MAX_CONTEXT = 50;

  const ctx = {
    push: (role, content, meta = {}) => {
      const store = ANT.store.get('antcpu_ram_ctx', []);
      store.unshift({ role, content: String(content).slice(0, 500), meta, time: new Date().toISOString() });
      ANT.store.set('antcpu_ram_ctx', store.slice(0, MAX_CONTEXT));
    },
    get  : (n = 10) => ANT.store.get('antcpu_ram_ctx', []).slice(0, n),
    clear: ()       => ANT.store.set('antcpu_ram_ctx', []),
    size : ()       => ANT.store.get('antcpu_ram_ctx', []).length,
    // format for AI prompt injection
    toPrompt: (n = 10) => {
      const entries = ANT.store.get('antcpu_ram_ctx', []).slice(0, n).reverse();
      return entries.map(e => `[${e.role}] ${e.content}`).join('\n');
    },
  };

  // ── STATS ──────────────────────────────────────────────
  const stats = () => ({
    volatile  : { size: v.size(),    max: MAX_VOLATILE },
    persistent: { size: p.size(),    max: MAX_PERSISTENT },
    deep      : { size: deep.size(), max: MAX_DEEP },
    context   : { size: ctx.size(),  max: MAX_CONTEXT },
    tasks     : task.status(),
  });

  // ── MOUNT ──────────────────────────────────────────────
  // Wire ANTRAM into ANTLIVE
  const mount = () => {
    if (typeof ANTLIVE === 'undefined') {
      console.warn('antcpu.ram: ANTLIVE not found — mount after antcpu.live.js loads');
      return;
    }
    // register RAM commands on ANTLIVE
    ANTLIVE.cmd('ram-stats',   () => { console.table(stats()); return stats(); });
    ANTLIVE.cmd('ram-ctx',     (n) => { console.table(ctx.get(n)); return ctx.get(n); });
    ANTLIVE.cmd('ram-tasks',   () => { console.table(task.list()); return task.list(); });
    ANTLIVE.cmd('ram-dump-v',  () => { console.log(v.dump()); return v.dump(); });
    ANTLIVE.cmd('ram-dump-p',  () => { console.log(p.dump()); return p.dump(); });
    ANTLIVE.cmd('ram-clear',   () => { v.clear(); ctx.clear(); console.log('✅ RAM volatile + context cleared'); });

    ANTLIVE.log('ram', 'antcpu.ram mounted', stats());
    console.log('%c🧠 antcpu.ram v1.0.0 — mounted', 'color:#d29922;font-family:monospace;font-size:12px;');
    console.log('%ctype ANTLIVE.run("ram-stats") to inspect memory', 'color:#555;font-family:monospace;font-size:11px;');
  };

  // ── PUBLIC API ─────────────────────────────────────────
  return {
    v, p, deep, ctx, task,
    stats, mount,
    version: '1.0.0'
  };

})();

// Auto-mount when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => ANTRAM.mount(), 400));
} else {
  setTimeout(() => ANTRAM.mount(), 400);
}
