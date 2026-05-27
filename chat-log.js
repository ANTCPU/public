// ============================================================
// CHAT-LOG.JS -- antcpu-launcher
// Human-in-the-loop chat capture -- Amanda agent pilot
// Stores conversations locally via localStorage
// Review UI: chat-review.html
// Version: 1.0.0 -- 2026-04-23
// ============================================================

const ChatLog = (function(){

  const STORE_KEY = "antcpu_amanda_chatlog";
  const MAX_SESSIONS = 50;

  // ── SESSION ───────────────────────────────────────────
  // Each page load = new session
  const SESSION_ID = "amanda_" + Date.now();
  let   _session   = null;

  function startSession(agentName){
    _session = {
      id        : SESSION_ID,
      agent     : agentName || "amanda",
      started   : new Date().toISOString(),
      ended     : null,
      messages  : [],
      flag      : "raw",       // raw | reviewed | approved | trained
      notes     : "",
      msgCount  : 0,
    };
    console.log("[ChatLog] session started --", SESSION_ID);
    return _session;
  }

  // ── CAPTURE MESSAGE ───────────────────────────────────
  // role: "user" | "agent"
  // faceState: "idle" | "thinking" | "speaking" | "done" | "error"
  function capture(role, text, faceState){
    if(!_session) startSession("amanda");
    const msg = {
      id        : _session.id + "_" + _session.messages.length,
      ts        : new Date().toISOString(),
      role      : role,
      text      : text,
      faceState : faceState || "idle",
      flag      : "raw",      // raw | good | remove | train
      note      : "",
    };
    _session.messages.push(msg);
    _session.msgCount++;
    _save();
    return msg;
  }

  // ── END SESSION ───────────────────────────────────────
  function endSession(){
    if(!_session) return;
    _session.ended = new Date().toISOString();
    _save();
    console.log("[ChatLog] session ended --", SESSION_ID, "--", _session.msgCount, "messages");
  }

  // ── SAVE ──────────────────────────────────────────────
  function _save(){
    if(!_session) return;
    const all = _load();
    const idx = all.findIndex(s => s.id === _session.id);
    if(idx > -1){ all[idx] = _session; }
    else { all.unshift(_session); }
    // cap at MAX_SESSIONS
    localStorage.setItem(STORE_KEY, JSON.stringify(all.slice(0, MAX_SESSIONS)));
  }

  // ── LOAD ALL SESSIONS ─────────────────────────────────
  function _load(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch{ return []; }
  }

  // ── PUBLIC GETTERS ────────────────────────────────────
  function getSessions(){ return _load(); }

  function getSession(id){
    return _load().find(s => s.id === id) || null;
  }

  function getCurrentSession(){ return _session; }

  // ── FLAG SESSION ──────────────────────────────────────
  // flag: "raw" | "reviewed" | "approved" | "trained"
  function flagSession(id, flag, notes){
    const all = _load();
    const s   = all.find(s => s.id === id);
    if(!s) return;
    s.flag  = flag;
    if(notes !== undefined) s.notes = notes;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  }

  // ── FLAG MESSAGE ──────────────────────────────────────
  // flag: "raw" | "good" | "remove" | "train"
  function flagMessage(sessionId, msgId, flag, note){
    const all = _load();
    const s   = all.find(s => s.id === sessionId);
    if(!s) return;
    const m = s.messages.find(m => m.id === msgId);
    if(!m) return;
    m.flag = flag;
    if(note !== undefined) m.note = note;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  }

  // ── EXPORT APPROVED ───────────────────────────────────
  // Returns training-ready JSON -- approved sessions only
  function exportApproved(){
    const approved = _load().filter(s => s.flag === "approved" || s.flag === "trained");
    const pairs = [];
    approved.forEach(s => {
      const msgs = s.messages.filter(m => m.flag !== "remove");
      for(let i=0; i<msgs.length-1; i++){
        if(msgs[i].role === "user" && msgs[i+1].role === "agent"){
          pairs.push({
            session   : s.id,
            agent     : s.agent,
            ts        : msgs[i].ts,
            input     : msgs[i].text,
            output    : msgs[i+1].text,
            flagged   : msgs[i+1].flag === "train",
            note      : msgs[i+1].note || "",
          });
        }
      }
    });
    return pairs;
  }

  // ── CLEAR ALL ─────────────────────────────────────────
  function clearAll(){
    localStorage.removeItem(STORE_KEY);
    console.log("[ChatLog] cleared all sessions");
  }

  // ── STATS ─────────────────────────────────────────────
  function stats(){
    const all = _load();
    return {
      total    : all.length,
      raw      : all.filter(s=>s.flag==="raw").length,
      reviewed : all.filter(s=>s.flag==="reviewed").length,
      approved : all.filter(s=>s.flag==="approved").length,
      trained  : all.filter(s=>s.flag==="trained").length,
      messages : all.reduce((n,s)=>n+s.msgCount,0),
    };
  }

  // ── AUTO END on page unload ───────────────────────────
  window.addEventListener("beforeunload", endSession);

  // ── PUBLIC API ────────────────────────────────────────
  return {
    startSession,
    capture,
    endSession,
    getSessions,
    getSession,
    getCurrentSession,
    flagSession,
    flagMessage,
    exportApproved,
    clearAll,
    stats,
    SESSION_ID,
  };

})();
