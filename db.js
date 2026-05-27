// ============================================================
// DB.JS — antcpu-launcher
// ============================================================
// PURPOSE: Central data routing layer for antcpu-launcher
// CURRENT: localStorage bridge — survives sessions
// NEXT:    swap localStorage calls for real DB queries (SQLite)
// PATTERN: all tables follow same get/add/update/remove shape
// DB PATH:  ~/antcpu-launcher/antcpu.db (SQLite via better-sqlite3 in hangar-route.js)
// DB.JS:    localStorage bridge — frontend/session layer only
// ============================================================

const db = {

  // ============================================================
  // UTILS
  // ============================================================
  _get: (key, fallback = []) => {
    try { return JSON.parse(localStorage.getItem('antcpu_' + key)) ?? fallback; }
    catch { return fallback; }
  },
  _set: (key, val) => localStorage.setItem('antcpu_' + key, JSON.stringify(val)),

  // ============================================================
  // FILE REGISTRY
  // TODO: swap with POST /api/files
  // ============================================================
  fileRegistry: {
    getAll: () => db._get('files'),
    add: (file) => {
      const files = db.fileRegistry.getAll();
      files.unshift({
        id: Date.now().toString(),
        name: file.name,
        type: file.type || 'unknown',
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
      });
      db._set('files', files);
    },
    remove: (id) => db._set('files', db.fileRegistry.getAll().filter(f => f.id !== id)),
    clear: () => db._set('files', [])
  },

  // ============================================================
  // WEBHOOK REGISTRY
  // TODO: swap with POST /api/webhooks
  // ============================================================
  webhooks: {
    getAll: () => db._get('discord_webhooks'),
    add: (hook) => {
      const hooks = db.webhooks.getAll();
      hooks.push({ id: Date.now().toString(), ...hook });
      db._set('discord_webhooks', hooks);
    },
    remove: (id) => db._set('discord_webhooks', db.webhooks.getAll().filter(h => h.id !== id)),
    update: (id, updates) => db._set('discord_webhooks',
      db.webhooks.getAll().map(h => h.id === id ? { ...h, ...updates } : h))
  },

  // ============================================================
  // MESSAGE HISTORY
  // TODO: swap with POST /api/history
  // ============================================================
  history: {
    getAll: () => db._get('discord_history'),
    add: (entry) => {
      const hist = db.history.getAll();
      hist.unshift({ id: Date.now().toString(), ...entry });
      db._set('discord_history', hist.slice(0, 20));
    },
    clear: () => db._set('discord_history', [])
  },

  // ============================================================
  // SESSION CHECKPOINTS
  // TODO: wire to HEALTH.md write via backend
  // ============================================================
  checkpoints: {
    getAll: () => db._get('checkpoints'),
    save: (label) => {
      const points = db.checkpoints.getAll();
      points.unshift({
        id: Date.now().toString(),
        label,
        time: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
        entry: 'ENTRY-005'
      });
      db._set('checkpoints', points.slice(0, 50));
    },
    clear: () => db._set('checkpoints', [])
  },

  // ============================================================
  // PROJECT REGISTRY
  // Source of truth: APPS.md → db.projects
  // TODO: parse APPS.md via GET /api/projects
  // ============================================================
  projects: {
    getAll: () => db._get('projects'),
    seed: (projects) => db._set('projects', projects),
    update: (id, updates) => db._set('projects',
      db.projects.getAll().map(p => p.id === id ? { ...p, ...updates } : p)),
    remove: (id) => db._set('projects', db.projects.getAll().filter(p => p.id !== id))
  },

  // ============================================================
  // ARENA — TOOLS (active stack)
  // TODO: swap with GET/POST /api/arena/tools
  // ============================================================
  tools: {
    getAll: () => db._get('arena_tools', [
      { id: '1', icon: '🤖', name: 'Claude',           role: 'Architecture, debugging, code review',         url: 'claude.ai',              status: 'active',   note: 'Primary driver. Split large files into modules when context limit hits.' },
      { id: '2', icon: '⚙️', name: 'OpenAI Platform',  role: 'API management, playground, agent building',   url: 'platform.openai.com',    status: 'active',   note: 'Image gen hits daily limit — route to AI Studio when capped. Never stop, reroute.' },
      { id: '3', icon: '🔍', name: 'Perplexity',        role: 'Deep research, specialized search',            url: 'perplexity.ai',          status: 'active',   note: 'Use before Claude on research-heavy tasks to save context window.' },
      { id: '4', icon: '🧠', name: 'Google AI Studio',  role: 'Gemini templates, image gen fallback',         url: 'aistudio.google.com',    status: 'active',   note: 'Primary fallback when OpenAI image cap hit. Gemini Flash is fast and free.' },
      { id: '5', icon: '⚡', name: 'Zapier Agents',     role: '@antcpu, Antcoin, Content 2026 agents',        url: 'zapier.com/agents',      status: 'active',   note: 'Core automation layer. Expand per project at v0.5 milestone.' },
      { id: '6', icon: '🔧', name: 'antcpu-ai',         role: 'Self-built custom AI interface',               url: 'localhost:3000',         status: 'building', note: 'This dashboard. Grows into central hub as tools get wired in.' },
      { id: '7', icon: '📡', name: 'Beacons AI',        role: 'Link-in-bio, store, creator analytics',        url: 'beacons.ai/antcpu',      status: 'monitor',  note: 'Own SEO outperforms. Keep live — revisit traffic strategy Q3 2026.' },
      { id: '8', icon: '🔮', name: 'Lovable',           role: 'AI UI prototyping — evaluate',                 url: 'lovable.dev',            status: 'radar',    note: 'Test on one internal tool page before committing to workflow.' }
    ]),
    add: (tool) => {
      const tools = db.tools.getAll();
      tools.push({ id: Date.now().toString(), ...tool });
      db._set('arena_tools', tools);
    },
    update: (id, updates) => db._set('arena_tools',
      db.tools.getAll().map(t => t.id === id ? { ...t, ...updates } : t)),
    remove: (id) => db._set('arena_tools', db.tools.getAll().filter(t => t.id !== id))
  },

  // ============================================================
  // ARENA — INFRASTRUCTURE
  // TODO: swap with GET/POST /api/arena/infra
  // ============================================================
  infra: {
    getAll: () => db._get('arena_infra', [
      { id: '1', icon: '🌐', name: 'Ionos',   role: 'Primary host — antcpu.com, all HTML',          url: 'ionos.com',            status: 'active', note: 'No limits hit. API deploy pipeline stubbed. Target: wire before v0.5.' },
      { id: '2', icon: '▲',  name: 'Vercel',  role: 'React/Next deploys — auth, antchain, manda',   url: 'vercel.com/dashboard', status: 'active', note: 'Free tier, no limits hit. Auto-deploys from GitHub.' },
      { id: '3', icon: '🐙', name: 'GitHub',  role: 'Source control — ANTCPU org',                  url: 'github.com/ANTCPU',    status: 'active', note: 'Source of truth. Vercel pulls from here. Ionos pipeline will push from here.' }
    ]),
    add: (node) => {
      const infra = db.infra.getAll();
      infra.push({ id: Date.now().toString(), ...node });
      db._set('arena_infra', infra);
    },
    update: (id, updates) => db._set('arena_infra',
      db.infra.getAll().map(n => n.id === id ? { ...n, ...updates } : n)),
    remove: (id) => db._set('arena_infra', db.infra.getAll().filter(n => n.id !== id))
  },

  // ============================================================
  // ARENA — COST TRACKER
  // TODO: swap with GET/POST /api/arena/costs
  // ============================================================
  costs: {
    getAll: () => db._get('arena_costs', [
      { id: '1', service: 'Ionos',       plan: '—', monthly: null, status: 'active',  note: 'Update when confirmed' },
      { id: '2', service: 'Vercel',      plan: 'Free', monthly: 0, status: 'free',    note: 'Confirm tier' },
      { id: '3', service: 'GitHub',      plan: 'Free', monthly: 0, status: 'free',    note: '—' },
      { id: '4', service: 'OpenAI',      plan: '—', monthly: null, status: 'paid',    note: 'Track API spend separately' },
      { id: '5', service: 'Zapier',      plan: '—', monthly: null, status: 'paid',    note: 'Update when confirmed' },
      { id: '6', service: 'Beacons AI',  plan: '—', monthly: null, status: 'monitor', note: 'Evaluate ROI at v0.5' },
      { id: '7', service: 'Perplexity',  plan: '—', monthly: null, status: 'paid',    note: '—' }
    ]),
    update: (id, updates) => db._set('arena_costs',
      db.costs.getAll().map(c => c.id === id ? { ...c, ...updates } : c)),
    total: () => db.costs.getAll()
      .filter(c => c.monthly !== null)
      .reduce((sum, c) => sum + c.monthly, 0)
  },

  // ============================================================
  // ARENA — API LIMITS
  // TODO: swap with GET/POST /api/arena/limits
  // ============================================================
  limits: {
    getAll: () => db._get('arena_limits', [
      { id: '1', icon: '⚙️', name: 'OpenAI Images',  role: 'DALL·E / GPT-4o image gen',    status: 'ok',  note: 'Daily cap varies by tier. When hit → route to Google AI Studio. Never stop — reroute.' },
      { id: '2', icon: '⚡', name: 'Zapier Tasks',   role: 'Monthly task allowance',        status: 'ok',  note: 'Monitor monthly burn. Upgrade before hitting wall.' },
      { id: '3', icon: '🧠', name: 'Gemini API',     role: 'AI Studio free tier RPM',       status: 'ok',  note: 'RPM limits on free tier. Use as image fallback.' },
      { id: '4', icon: '🤖', name: 'Claude Context', role: 'Token window per session',      status: 'ok',  note: 'Split large files into modules when context limit approaches.' }
    ]),
    update: (id, updates) => db._set('arena_limits',
      db.limits.getAll().map(l => l.id === id ? { ...l, ...updates } : l)),
    flag: (id) => db.limits.update(id, { status: 'limit' }),
    clear: (id) => db.limits.update(id, { status: 'ok' })
  },

  // ============================================================
  // ARENA — CONTENT PIPELINE
  // TODO: swap with GET/POST /api/arena/pipeline
  // ============================================================
  pipeline: {
    getAll: () => db._get('arena_pipeline', [
      { id: '1', task: 'antcpu.com hero image refresh',    tool: 'OpenAI → AI Studio fallback', status: 'queued' },
      { id: '2', task: 'ANTCOIN Phase 1 banner',           tool: 'OpenAI',                       status: 'queued' },
      { id: '3', task: 'antcpu EDU course thumbnails',     tool: 'OpenAI → AI Studio fallback', status: 'queued' },
      { id: '4', task: 'Social content batch — Apr 2026',  tool: 'OpenAI + Zapier',              status: 'building' }
    ]),
    add: (item) => {
      const pipeline = db.pipeline.getAll();
      pipeline.push({ id: Date.now().toString(), ...item });
      db._set('arena_pipeline', pipeline);
    },
    update: (id, updates) => db._set('arena_pipeline',
      db.pipeline.getAll().map(p => p.id === id ? { ...p, ...updates } : p)),
    remove: (id) => db._set('arena_pipeline', db.pipeline.getAll().filter(p => p.id !== id))
  },

  // ============================================================
  // ARENA — PARKED & RADAR
  // TODO: swap with GET/POST /api/arena/parked
  // ============================================================
  parked: {
    getAll: () => db._get('arena_parked', [
      { id: '1', icon: '📎', name: 'Beacons Profile Links', role: 'Placed across social profiles', url: 'beacons.ai/antcpu',  status: 'parked', note: 'Own SEO outperforms. Keep links live. Revisit Q3 2026.',        revisit: 'Q3 2026' },
      { id: '2', icon: '🔮', name: 'Lovable.dev',           role: 'AI UI prototyping',             url: 'lovable.dev',        status: 'radar',  note: 'Test on one internal page before committing.',                   revisit: 'when bandwidth allows' }
    ]),
    add: (item) => {
      const parked = db.parked.getAll();
      parked.push({ id: Date.now().toString(), ...item });
      db._set('arena_parked', parked);
    },
    update: (id, updates) => db._set('arena_parked',
      db.parked.getAll().map(p => p.id === id ? { ...p, ...updates } : p)),
    remove: (id) => db._set('arena_parked', db.parked.getAll().filter(p => p.id !== id))
  },

  // ============================================================
  // CHAIN NODES
  // Powers chain.html daisy chain
  // TODO: swap with GET/POST /api/chain
  // ============================================================
  chain: {
    getAll: () => db._get('chain_nodes', [
      { id: '0', order: 0,  name: 'antcpu.com',        url: 'https://antcpu.com/live.html',           type: 'root' },
      { id: '1', order: 1,  name: 'antcoin',            url: 'https://antcpu.com/antcoin/live1.html',  type: 'chain' },
      { id: '2', order: 2,  name: 'antcpu cloud',       url: 'https://antcpu.com/cloud/live2.html',    type: 'chain' },
      { id: '3', order: 3,  name: 'Turtle Enterprises', url: 'https://antcpu.com/turtle/live3.html',   type: 'chain' },
      { id: '4', order: 4,  name: 'antcpu EDU',         url: 'https://antcpu.com/edu/live4.html',      type: 'chain' },
      { id: '5', order: 5,  name: 'antcpu AI',          url: 'https://antcpu.com/AI/live5.html',       type: 'chain' },
      { id: '6', order: 6,  name: 'antcpu TV',          url: 'https://antcpu.com/TV/live6.html',       type: 'loop'  },
      { id: '7', order: 99, name: 'Amanda Photography', url: 'https://antcpu.com/manda/live.html',     type: 'standalone' }
    ]),
    add: (node) => {
      const nodes = db.chain.getAll();
      nodes.push({ id: Date.now().toString(), ...node });
      db._set('chain_nodes', nodes);
    },
    update: (id, updates) => db._set('chain_nodes',
      db.chain.getAll().map(n => n.id === id ? { ...n, ...updates } : n)),
    remove: (id) => db._set('chain_nodes', db.chain.getAll().filter(n => n.id !== id))
  }

};

// ============================================================
// EXPORT — Node: require('./db.js')  Browser: <script src='db.js'>
// ============================================================
if (typeof module !== 'undefined') module.exports = db;

// ============================================================
// API BRIDGE — browser only, Node ignores
// window.api mirrors db.* shape but fetches from localhost:3000
// ============================================================
if (typeof window !== 'undefined') {
  window.api = {
    _get:    (t)      => fetch('http://localhost:3000/api/' + t).then(r => r.json()),
    _post:   (t, d)   => fetch('http://localhost:3000/api/' + t, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d) }).then(r => r.json()),
    _delete: (t, id)  => fetch('http://localhost:3000/api/' + t + '/' + id, { method: 'DELETE' }).then(r => r.json()),
    tools:    { getAll: () => window.api._get('arena_tools'),    add: (d) => window.api._post('arena_tools', d),    remove: (id) => window.api._delete('arena_tools', id) },
    infra:    { getAll: () => window.api._get('arena_infra'),    add: (d) => window.api._post('arena_infra', d),    remove: (id) => window.api._delete('arena_infra', id) },
    costs:    { getAll: () => window.api._get('arena_costs'),    update: (id,d) => window.api._post('arena_costs', {id,...d}) },
    limits:   { getAll: () => window.api._get('arena_limits'),   update: (id,d) => window.api._post('arena_limits', {id,...d}) },
    pipeline: { getAll: () => window.api._get('arena_pipeline'), add: (d) => window.api._post('arena_pipeline', d), remove: (id) => window.api._delete('arena_pipeline', id) },
    parked:   { getAll: () => window.api._get('arena_parked'),   add: (d) => window.api._post('arena_parked', d),   remove: (id) => window.api._delete('arena_parked', id) },
    chain:    { getAll: () => window.api._get('chain_nodes'),    add: (d) => window.api._post('chain_nodes', d),    remove: (id) => window.api._delete('chain_nodes', id) }
  };
}
