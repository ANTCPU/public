// ============================================================
// ANTCPU-AI.JS — antcpu-launcher
// AI layer foundation — model router + prompt templates
// Powers the antcpu virtual office / employee system
// Version: 1.0.0 — 2026-04-21
// ============================================================

window.ANTAI = (function () {

  // ── PROVIDERS ──────────────────────────────────────────
  // Model registry — plug in API keys per provider
  const PROVIDERS = {
    google: {
      name    : 'Google AI Studio',
      model   : 'gemini-2.5-flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
      key     : null, // set via ANTAI.config('google', { key: '...' })
    },
    claude: {
      name    : 'Anthropic Claude',
      model   : 'claude-3-haiku-20240307',
      endpoint: 'https://api.anthropic.com/v1/messages',
      key     : null,
    },
    local: {
      name    : 'Local (Ollama)',
      model   : 'llama3',
      endpoint: 'http://localhost:11434/api/generate',
      key     : null,
    }
  };

  // ── EMPLOYEES ──────────────────────────────────────────
  // AI agent roster — antcpu virtual office
  // ANT pay is human-in-the-loop via antchain node confirmation
  const EMPLOYEES = [
    {
      id       : 'aria',
      url      : 'https://antcpu.com/aria/',
      name     : 'ARIA',
      role     : 'Communications Agent',
      dept     : 'comms',
      model    : 'google',
      status   : 'active',
      avatar   : '📡',
      tasks    : ['draft emails', 'discord posts', 'daily review digest'],
      ant_rate : 1,   // ANT per task completed
      ant_earned: 0,
      last_active: null,
      prompt_style: 'concise, professional, antcpu brand voice'
    },
    {
      id       : 'forge',
      url      : 'https://antcpu.com/forge/',
      name     : 'FORGE',
      role     : 'Build Agent',
      dept     : 'dev',
      model    : 'google',
      status   : 'standby',
      avatar   : '🔧',
      tasks    : ['code review', 'route scaffolding', 'db schema design'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'technical, precise, Node.js + SQLite expert'
    },
    {
      id       : 'scout',
      url      : 'https://antcpu.com/scout/',
      name     : 'SCOUT',
      role     : 'Radar Agent',
      dept     : 'intel',
      model    : 'google',
      status   : 'standby',
      avatar   : '🔭',
      tasks    : ['monitor radar entries', 'flag blockers', 'surface opportunities'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'analytical, brief, bullet-point summaries'
    },
    {
      id       : 'ledger',
      url      : 'https://antcpu.com/ledger/',
      name     : 'LEDGER',
      role     : 'Logging + Audit Agent',
      dept     : 'finance',
      model    : 'google',
      status   : 'standby',
      avatar   : '📊',
      tasks    : ['ANT price tracking', 'tokenomics review', 'wallet summaries'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'data-driven, conservative, no speculation'
    },
    {
      id       : 'herald',
      url      : 'https://antcpu.com/herald/',
      name     : 'HERALD',
      role     : 'Comms + Calendar Agent',
      dept     : 'marketing',
      model    : 'google',
      status   : 'standby',
      avatar   : '📣',
      tasks    : ['blog drafts', 'feed entries', 'social copy', 'campaigns', 'growth strategy', 'brand', 'analytics', 'outreach coordination'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'engaging, accessible, antcpu brand voice, no hype, growth-focused, data-driven'
    },
    {
      id       : 'vault',
      url      : 'https://antcpu.com/vault/',
      name     : 'VAULT',
      role     : 'Finance + Storage Agent',
      dept     : 'security',
      model    : 'google',
      status   : 'standby',
      avatar   : '🔐',
      tasks    : ['auth review', 'route audit', 'key rotation reminders'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'security-first, paranoid by design, no shortcuts'
    }

    ,{
      id       : 'antcpu',
      name     : 'ANTCPU',
      role     : 'Owner — Dispatcher',
      dept     : 'command',
      model    : 'google',
      status   : 'active',
      avatar   : '🧠',
      tasks    : ['dispatch tasks', 'approve outputs', 'set priorities', 'review overnight runs'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'owner voice — direct, decisive, antcpu mission first'
    }
    ,{
      id       : 'amanda',
      name     : 'AMANDA',
      role     : 'Photography Client Agent',
      dept     : 'client',
      model    : 'google',
      status   : 'standby',
      avatar   : '📷',
      tasks    : ['amanda site updates', 'antcoin wire prep', 'client profile'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'client-focused, warm, photography brand voice'
    }

    ,{
      id       : 'mac',
      name     : 'MAC',
      role     : 'Map of Pi Agent',
      dept     : 'pi',
      model    : 'google',
      status   : 'standby',
      avatar   : '🗺',
      tasks    : ['pi ecosystem monitoring', 'pioneer intelligence', 'introtopi.com status'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'analytical, pi-native, pioneer community voice'
    }

    ,{
      id       : 'antcoin',
      name     : 'ANTCOIN',
      role     : 'Hybrid Business Agent',
      dept     : 'hybrid',
      model    : 'google',
      status   : 'standby',
      avatar   : '⚡',
      tasks    : ['antcoin operations', 'tokenomics', 'wallet monitoring', 'zapier bridge'],
      ant_rate : 1,
      ant_earned: 0,
      last_active: null,
      prompt_style: 'business-first, token-native, hybrid ops voice'
    }
  ];

  // ── CONFIG ─────────────────────────────────────────────
  // Set provider API key at runtime
  // ANTAI.config('google', { key: 'AIza...' })
  const config = (provider, opts) => {
    if (PROVIDERS[provider]) {
      Object.assign(PROVIDERS[provider], opts);
    }
  };

  // ── PROMPT TEMPLATES ───────────────────────────────────
  const TEMPLATES = {
    daily_review: (data) => `
You are ARIA, antcpu Communications Agent.
Write a concise daily review summary for ${data.date}.
Built today: ${data.built || 'see session log'}.
Blockers: ${data.blockers || 'none'}.
Tomorrow: ${data.tomorrow || 'continue sprint'}.
Keep it under 150 words. antcpu brand voice. No fluff.
    `.trim(),

    radar_brief: (entries) => `
You are SCOUT, antcpu Radar Agent.
Review these radar entries and surface the top 3 that need attention today:
${JSON.stringify(entries.slice(0, 10), null, 2)}
Return: entry name, why it matters now, recommended action.
Be brief. Bullet points only.
    `.trim(),

    build_review: (code) => `
You are FORGE, antcpu Build Agent.
Review this code and flag any issues, improvements, or security concerns:
${code}
Be specific. Line numbers if possible. No praise — just signal.
    `.trim(),

    ant_pay_request: (employee, task, amount) => `
ANT PAY REQUEST — HUMAN APPROVAL REQUIRED
Employee : ${employee.name} (${employee.role})
Task     : ${task}
Amount   : ${amount} ANT
Rate     : ${employee.ant_rate} ANT/task
Status   : PENDING NODE CONFIRMATION
Chain    : antchain node — human-in-the-loop
    `.trim(),
  };

  // ── SEND TO MODEL ──────────────────────────────────────
  // ANTAI.ask('google', prompt) → response text
  const ask = async (providerKey, prompt, agentId = null) => {
    const p = PROVIDERS[providerKey];
    if (!p) throw new Error('Unknown provider: ' + providerKey);
    if (!p.key && providerKey !== 'local') throw new Error(p.name + ' — API key not set');

    if (providerKey === 'google') {
      // Route through server-side /api/gemini — key stays safe, rate limited, tower logged
      const r = await fetch('/api/gemini', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ prompt, agent: agentId })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'gemini error');
      if (typeof window !== 'undefined' && window.ANTAI_trackUsage) {
        window.ANTAI_trackUsage(providerKey, agentId, prompt.length, (d.text||'').length);
      }
      return d.text || '// no response';
    }


    if (providerKey === 'claude') {
      const r = await fetch(p.endpoint, {
        method : 'POST',
        headers: {
          'Content-Type'      : 'application/json',
          'x-api-key'         : p.key,
          'anthropic-version' : '2023-06-01'
        },
        body: JSON.stringify({
          model     : p.model,
          max_tokens: 1024,
          messages  : [{ role: 'user', content: prompt }]
        })
      });
      const d = await r.json();
      return d?.content?.[0]?.text || '// no response';
    }

    if (providerKey === 'local') {
      const r = await fetch(p.endpoint, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ model: p.model, prompt, stream: false })
      });
      const d = await r.json();
      return d?.response || '// no response';
    }
  };

  // ── EMPLOYEE ASK ───────────────────────────────────────
  // Route prompt through a specific employee
  // ANTAI.employeeAsk('aria', 'draft a daily review for today')
  const employeeAsk = async (employeeId, prompt) => {
    const emp = EMPLOYEES.find(e => e.id === employeeId);
    if (!emp) throw new Error('Employee not found: ' + employeeId);
    const fullPrompt = `You are ${emp.name}, ${emp.role} at antcpu.\nStyle: ${emp.prompt_style}\n\n${prompt}`;
    emp.last_active = new Date().toISOString();
    const response = await ask(emp.model, fullPrompt);
    return { employee: emp, prompt, response };
  };

  // ── ANT PAY ────────────────────────────────────────────
  // Queue an ANT pay event — human must confirm via antchain node
  // Returns a pending pay object — does NOT post until confirmed
  const queuePay = (employeeId, task) => {
    const emp = EMPLOYEES.find(e => e.id === employeeId);
    if (!emp) throw new Error('Employee not found: ' + employeeId);
    const pay = {
      id        : 'pay-' + Date.now(),
      employee  : emp.name,
      role      : emp.role,
      task,
      amount    : emp.ant_rate,
      status    : 'pending',
      created_at: new Date().toISOString(),
      confirmed_at: null,
      confirmed_by: null,
    };
    // store in localStorage pending queue
    const queue = ANT.store.get('antcpu_ant_pay_queue', []);
    queue.push(pay);
    ANT.store.set('antcpu_ant_pay_queue', queue);
    console.log(TEMPLATES.ant_pay_request(emp, task, emp.ant_rate));
    return pay;
  };

  // Confirm a pay event (human approval)
  const confirmPay = (payId, confirmedBy = 'human') => {
    const queue = ANT.store.get('antcpu_ant_pay_queue', []);
    const pay = queue.find(p => p.id === payId);
    if (!pay) throw new Error('Pay event not found: ' + payId);
    pay.status       = 'confirmed';
    pay.confirmed_at = new Date().toISOString();
    pay.confirmed_by = confirmedBy;
    // credit employee
    const emp = EMPLOYEES.find(e => e.name === pay.employee);
    if (emp) emp.ant_earned += pay.amount;
    ANT.store.set('antcpu_ant_pay_queue', queue);
    return pay;
  };

  // ── PUBLIC API ─────────────────────────────────────────

  // ── SHARED ABILITIES ──────────────────────────────────
  // Available to all agents — sendEmail, logTask, dispatch

  const sendEmail = async (to, subject, body, cc) => {
    const payload = { to, subject, body };
    if (cc) payload.cc = cc;
    const r = await fetch('/api/resend-send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await r.json();
    return d;
  };

  const logTask = async (agentId, action, message, spotlight) => {
    const r = await fetch('/api/tower', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node_id: agentId, action, message,
        spotlight: spotlight || '',
        status: 'active', priority: 2,
        date: new Date().toISOString().split('T')[0]
      })
    });
    return r.json();
  };

  const dispatch = async (agentId, task, prompt) => {
    await logTask(agentId, 'agent_task', task, task);
    const result = await employeeAsk(agentId, prompt);
    queuePay(agentId, task);
    return result;
  };

  return {
    PROVIDERS,
    EMPLOYEES,
    TEMPLATES,
    config,
    ask,
    employeeAsk,
    queuePay,
    confirmPay,
    sendEmail,
    logTask,
    dispatch,
    version: '1.0.0'
  };

})();

// ── AI USAGE → SERVER LOG ─────────────────────────────────
// Overrides window.ANTAI_trackUsage to POST to /api/ai-usage
// Feeds tower_log — same system as page_views analytics
window.ANTAI_trackUsage = function(provider, agentId, promptLen, responseLen) {
  fetch('/api/ai-usage', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      provider,
      agent_id    : agentId || 'unknown',
      prompt_len  : promptLen || 0,
      response_len: responseLen || 0
    })
  }).catch(() => {}); // silent fail — never block the UI
};
