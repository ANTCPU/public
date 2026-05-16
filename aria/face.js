// ============================================================
// face.js -- agents/aria/
// ARIA talking head instance -- SVG v3
// Requires: talking-head-svg.js
// Version: 2.0.0 -- 2026-04-25
// ============================================================

function mountARIAFace(containerId, outputId) {
  const container = document.getElementById(containerId);
  if (!container) { console.warn("[ARIA FACE] container not found:", containerId); return null; }

  const head = new TalkingHeadSVG(container, {
    name    : "ARIA",
    label   : "comms agent",
    size    : 400,
    special : "antenna",
    palette : {
      bg      : "#0a0a0a",
      face    : "#e8d5b0",
      cheek   : "#d4b896",
      shadow  : "#8a6a4a",
      iris    : "#00aa55",
      brow    : "#00ff88",
      hair    : "#00ff88",
      lip     : "#c07050",
      accent  : "#00ff88",
      accent2 : "#00cc66",
    }
  });

  const stateEl = document.getElementById("ariaState");
  const origSet = head.setState.bind(head);
  head.setState = function(s) {
    origSet(s);
    if (stateEl) stateEl.textContent = s.toUpperCase();
  };

  window.ARIA_HEAD = head;
  return { head };
}
