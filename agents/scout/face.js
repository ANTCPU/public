// ============================================================
// face.js -- agents/scout/
// SCOUT talking head instance -- SVG v3
// Requires: talking-head-svg.js
// Version: 2.0.0 -- 2026-04-25
// ============================================================

function mountSCOUTFace(containerId, outputId) {
  const container = document.getElementById(containerId);
  if (!container) { console.warn("[SCOUT FACE] container not found:", containerId); return null; }

  const head = new TalkingHeadSVG(container, {
    name    : "SCOUT",
    label   : "radar agent",
    size    : 400,
    special : "telescope",
    palette : {
      bg      : "#0a0a0a",
      face    : "#e8d5b0",
      cheek   : "#d4b896",
      shadow  : "#8a6a4a",
      iris    : "#b07d10",
      brow    : "#d29922",
      lip     : "#c07050",
      accent  : "#d29922",
      accent2 : "#b07d10",
    }
  });

  const stateEl = document.getElementById("scoutState");
  const origSet = head.setState.bind(head);
  head.setState = function(s) {
    origSet(s);
    if (stateEl) stateEl.textContent = s.toUpperCase();
  };

  window.SCOUT_HEAD = head;
  return { head };
}
