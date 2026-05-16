// ============================================================
// face.js -- agents/forge/
// FORGE talking head instance -- SVG v3
// Requires: talking-head-svg.js
// Version: 2.0.0 -- 2026-04-25
// ============================================================

function mountFORGEFace(containerId, outputId) {
  const container = document.getElementById(containerId);
  if (!container) { console.warn("[FORGE FACE] container not found:", containerId); return null; }

  const head = new TalkingHeadSVG(container, {
    name    : "FORGE",
    label   : "build agent",
    size    : 400,
    special : "hardhat",
    palette : {
      bg      : "#0a0a0a",
      face    : "#e8d5b0",
      cheek   : "#d4b896",
      shadow  : "#8a6a4a",
      iris    : "#1f6feb",
      brow    : "#58a6ff",
      lip     : "#c07050",
      accent  : "#58a6ff",
      accent2 : "#1f6feb",
    }
  });

  const stateEl = document.getElementById("forgeState");
  const origSet = head.setState.bind(head);
  head.setState = function(s) {
    origSet(s);
    if (stateEl) stateEl.textContent = s.toUpperCase();
  };

  window.FORGE_HEAD = head;
  return { head };
}
