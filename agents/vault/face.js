// ============================================================
// face.js -- agents/vault/
// VAULT talking head instance -- SVG v3
// Requires: talking-head-svg.js
// Version: 2.0.0 -- 2026-04-25
// ============================================================

function mountVAULTFace(containerId, outputId) {
  const container = document.getElementById(containerId);
  if (!container) { console.warn("[VAULT FACE] container not found:", containerId); return null; }

  const head = new TalkingHeadSVG(container, {
    name    : "VAULT",
    label   : "security agent",
    size    : 400,
    special : "lock",
    palette : {
      bg      : "#0a0a0a",
      face    : "#e8d5b0",
      cheek   : "#d4b896",
      shadow  : "#8a6a4a",
      iris    : "#da3633",
      brow    : "#ff7b72",
      lip     : "#c07050",
      accent  : "#ff7b72",
      accent2 : "#da3633",
    }
  });

  const stateEl = document.getElementById("vaultState");
  const origSet = head.setState.bind(head);
  head.setState = function(s) {
    origSet(s);
    if (stateEl) stateEl.textContent = s.toUpperCase();
  };

  window.VAULT_HEAD = head;
  return { head };
}
