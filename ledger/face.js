// ============================================================
// face.js -- agents/ledger/
// LEDGER talking head instance -- SVG v3
// Requires: talking-head-svg.js
// Version: 2.0.0 -- 2026-04-25
// ============================================================

function mountLEDGERFace(containerId, outputId) {
  const container = document.getElementById(containerId);
  if (!container) { console.warn("[LEDGER FACE] container not found:", containerId); return null; }

  const head = new TalkingHeadSVG(container, {
    name    : "LEDGER",
    label   : "finance agent",
    size    : 400,
    special : "glasses",
    gender  : "male",
    palette : {
      bg      : "#0a0a0a",
      face    : "#d4b896",      // slightly olive — weathered finance guy
      cheek   : "#c4a07a",
      shadow  : "#7a5a3a",
      iris    : "#c8a020",      // gold eyes — money
      pupil   : "#1a1000",
      brow    : "#555",         // salt/pepper brow
      lip     : "#a06040",
      mouth   : "#4a2010",
      accent  : "#d4a017",      // gold accent
      accent2 : "#2ea043",      // green secondary — cash
      hair    : "#555",         // salt/pepper hair
    }
  });

  const stateEl = document.getElementById("ledgerState");
  const origSet = head.setState.bind(head);
  head.setState = function(s) {
    origSet(s);
    if (stateEl) stateEl.textContent = s.toUpperCase();
  };

  window.LEDGER_HEAD = head;
  return { head };
}
