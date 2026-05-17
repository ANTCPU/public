// ============================================================
// face.js -- agents/antcpu/
// ANTCPU talking head instance -- SVG v3
// Requires: talking-head-svg.js
// Version: 1.0.0 -- 2026-04-28
// ============================================================

function mountANTCPUFace(containerId, outputId) {
  const container = document.getElementById(containerId);
  if (!container) { console.warn("[ANTCPU FACE] container not found:", containerId); return null; }

  const head = new TalkingHeadSVG(container, {
    name    : "ANTCPU",
    label   : "OS · dispatcher",
    size    : 400,
    special : "circuit",
    palette : {
      bg      : "#0a0a0a",
      face    : "#dddddd",
      cheek   : "#bbbbbb",
      shadow  : "#666666",
      iris    : "#444444",
      brow    : "#333333",
      lip     : "#888888",
      accent  : "#ffffff",
      accent2 : "#555555",
    }
  });

  // wider squarer head -- override ellipse after build
  const faceEl = head.svg.querySelector('ellipse[ry="33"]');
  if (faceEl) { faceEl.setAttribute("rx", 30); faceEl.setAttribute("ry", 30); }

  // remove cheek blush
  head.svg.querySelectorAll('ellipse[fill="#e08080"]').forEach(el => el.setAttribute("opacity", 0));

  // bigger lips
  if (head.mouthOuter) head.mouthOuter.setAttribute("stroke-width", 3.5);

  // state label
  const stateEl = document.getElementById("antcpuState");
  const origSet = head.setState.bind(head);
  head.setState = function(s) {
    origSet(s);
    if (stateEl) stateEl.textContent = s.toUpperCase();
  };

  window.ANTCPU_HEAD = head;
  return { head };
}
