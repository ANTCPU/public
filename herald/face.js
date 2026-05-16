// ============================================================
// face.js -- agents/herald/
// HERALD talking head instance -- SVG v3
// Requires: talking-head-svg.js
// Version: 2.0.0 -- 2026-04-25
// ============================================================

function mountHERALDFace(containerId, outputId) {
  const container = document.getElementById(containerId);
  if (!container) { console.warn("[HERALD FACE] container not found:", containerId); return null; }

  const head = new TalkingHeadSVG(container, {
    name    : "HERALD",
    label   : "content agent",
    size    : 400,
    special : null,
    gender  : "male",
    palette : {
      bg      : "#0a0a0a",
      face    : "#f5e6d0",
      cheek   : "#e8c9a8",
      shadow  : "#7a5a3a",
      iris    : "#2a1508",
      brow    : "#3d2010",
      lip     : "#b06040",
      accent  : "#f0883e",
      accent2 : "#d29922",
      hair    : "#3d2010",
    }
  });

  // state label
  const stateEl = document.getElementById("heraldState");
  const origSet = head.setState.bind(head);
  head.setState = function(s) {
    origSet(s);
    if (stateEl) stateEl.textContent = s.toUpperCase();
  };

  window.HERALD_HEAD = head;
  return { head };
}
