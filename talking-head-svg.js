// ============================================================
// TALKING-HEAD-SVG.JS -- antcpu-launcher
// High-res SVG face module -- drop-in replacement
// Usage: const head = new TalkingHeadSVG(container, config)
// Version: 1.0.0 -- 2026-04-25
// ============================================================

class TalkingHeadSVG {

  constructor(container, config) {
    this.container = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    this.cfg = Object.assign({
      name    : "AGENT",
      label   : "antcpu agent",
      size    : 400,
      special : null,
      palette : null,
    }, config);

    this.P = Object.assign({
      bg      : "#0a0a0a",
      face    : "#e8d5b0",
      cheek   : "#d4b896",
      shadow  : "#8a6a4a",
      dark    : "#111",
      eyebg   : "#fff",
      iris    : "#3a2a1a",
      pupil   : "#000",
      shine   : "#fff",
      mouth   : "#5a2a1a",
      teeth   : "#fff",
      lip     : "#c07050",
      brow    : "#4a3020",
      accent  : "#fff",
      accent2 : "#aaa",
    }, this.cfg.palette);

    this.state      = "idle";
    this.frame      = 0;
    this.blinkTimer = 0;
    this.blinking   = false;
    this.mouthOpen  = 0;
    this.eyeOffset  = { x: 0, y: 0 };
    this._raf       = null;
    this.hairSwing  = 0;
    this._isMale    = this.cfg.gender === 'male';

    this._buildSVG();
    this._loop();
  }

  // ── BUILD SVG STRUCTURE ──────────────────────────────────
  _buildSVG() {
    const S = this.cfg.size;
    this.container.innerHTML = '';

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", S);
    svg.setAttribute("height", S);
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.display = "block";
    svg.style.margin  = "0 auto";
    this.svg = svg;

    // ── DEFS (gradients) ──────────────────────────────────
    const defs = this._el("defs");

    // face gradient
    const faceGrad = this._el("radialGradient", { id:"faceGrad", cx:"45%", cy:"40%", r:"55%" });
    faceGrad.appendChild(this._el("stop", { offset:"0%",   "stop-color": this._lighten(this.P.face, 15) }));
    faceGrad.appendChild(this._el("stop", { offset:"100%", "stop-color": this.P.cheek }));
    defs.appendChild(faceGrad);

    // eye white gradient
    const eyeGrad = this._el("radialGradient", { id:"eyeGrad", cx:"40%", cy:"35%", r:"60%" });
    eyeGrad.appendChild(this._el("stop", { offset:"0%",   "stop-color":"#ffffff" }));
    eyeGrad.appendChild(this._el("stop", { offset:"100%", "stop-color":"#e8e8e8" }));
    defs.appendChild(eyeGrad);

    svg.appendChild(defs);

    // ── BACKGROUND ────────────────────────────────────────
    svg.appendChild(this._el("rect", { x:0, y:0, width:100, height:100, fill:this.P.bg }));

    // ── HEAD SHADOW — male broader, female slimmer ────────
    svg.appendChild(this._el("ellipse", {
      cx:51, cy:52,
      rx: this._isMale ? 30 : 24,
      ry: this._isMale ? 34 : 33,
      fill: this.P.shadow, opacity:0.5
    }));

    // ── NECK ──────────────────────────────────────────────
    svg.appendChild(this._el("rect", {
      x:42, y:78, width:16, height:12,
      fill: this.P.cheek, rx:3
    }));
    // neck shadow
    svg.appendChild(this._el("rect", {
      x:42, y:78, width:4, height:12,
      fill: this.P.shadow, opacity:0.3, rx:2
    }));

    // ── HAIR (drawn behind face) ─────────────────────────
    // gender: 'female' = long wavy | 'male' = short clean cut + sideburns
    // Female color options: #8B4513 auburn · #1a1a1a black · #C4A35A blonde · #6B3A2A dark red
    // Male color options:   #2c1a0e dark brown · #1a1a1a black · #8B7355 light brown · #555 salt/pepper
    if (this.P.hair) {
      const hc = this.P.hair;
      const hd = this._lighten(hc, -25);
      const hl = this._lighten(hc, 35);
      const isMale = this._isMale;

      if (isMale) {
        // ── MALE — short clean cut + sideburns ──────────

        // back of head — tight cap
        this.hairBack = this._el("ellipse", {
          cx:50, cy:30, rx:28, ry:18, fill:hd, opacity:0.95
        });
        svg.appendChild(this.hairBack);

        // top — short flat cap, no volume
        this.hairTop = this._el("path", {
          d:"M 24 40 Q 22 20 50 15 Q 78 20 76 40 Q 68 26 50 24 Q 32 26 24 40 Z",
          fill:hc
        });
        svg.appendChild(this.hairTop);

        // left side — tight, no curtain
        this.hairL = this._el("path", {
          d:"M 24 40 Q 20 46 21 54 Q 22 50 24 46 Z",
          fill:hc
        });
        svg.appendChild(this.hairL);

        // right side — tight
        this.hairR = this._el("path", {
          d:"M 76 40 Q 80 46 79 54 Q 78 50 76 46 Z",
          fill:hc
        });
        svg.appendChild(this.hairR);

        // left sideburn
        this.hairCurlL1 = this._el("path", {
          d:"M 22 52 Q 20 58 21 64 Q 22 60 23 56 Z",
          fill:hd
        });
        svg.appendChild(this.hairCurlL1);

        // right sideburn
        this.hairCurlR1 = this._el("path", {
          d:"M 78 52 Q 80 58 79 64 Q 78 60 77 56 Z",
          fill:hd
        });
        svg.appendChild(this.hairCurlR1);

        // subtle side part line
        this.hairShine = this._el("path", {
          d:"M 42 16 Q 44 14 48 15",
          stroke:hl, "stroke-width":1.2,
          fill:"none", "stroke-linecap":"round", opacity:0.5
        });
        svg.appendChild(this.hairShine);

        // null out unused female refs
        this.hairCurlL2 = null;
        this.hairCurlR2 = null;

      } else {
        // ── FEMALE — long wavy, falls past shoulders ────

        // back mass — wide ellipse
        this.hairBack = this._el("ellipse", {
          cx:50, cy:36, rx:30, ry:24, fill:hd, opacity:0.9
        });
        svg.appendChild(this.hairBack);

        // top cap
        this.hairTop = this._el("path", {
          d:"M 22 42 Q 20 18 50 14 Q 80 18 78 42 Q 70 28 50 26 Q 30 28 22 42 Z",
          fill:hc
        });
        svg.appendChild(this.hairTop);

        // left curtain — long wavy
        this.hairL = this._el("path", {
          d:"M 23 44 Q 12 55 14 70 Q 15 82 22 90 Q 18 78 20 65 Q 22 52 26 46 Z",
          fill:hc
        });
        svg.appendChild(this.hairL);

        // right curtain
        this.hairR = this._el("path", {
          d:"M 77 44 Q 88 55 86 70 Q 85 82 78 90 Q 82 78 80 65 Q 78 52 74 46 Z",
          fill:hc
        });
        svg.appendChild(this.hairR);

        // curly strand left 1
        this.hairCurlL1 = this._el("path", {
          d:"M 20 55 Q 10 62 14 72 Q 16 78 12 84",
          stroke:hc, "stroke-width":3, fill:"none", "stroke-linecap":"round"
        });
        svg.appendChild(this.hairCurlL1);

        // curly strand left 2
        this.hairCurlL2 = this._el("path", {
          d:"M 18 62 Q 8 70 12 80 Q 14 86 10 92",
          stroke:hd, "stroke-width":2.5, fill:"none", "stroke-linecap":"round"
        });
        svg.appendChild(this.hairCurlL2);

        // curly strand right 1
        this.hairCurlR1 = this._el("path", {
          d:"M 80 55 Q 90 62 86 72 Q 84 78 88 84",
          stroke:hc, "stroke-width":3, fill:"none", "stroke-linecap":"round"
        });
        svg.appendChild(this.hairCurlR1);

        // curly strand right 2
        this.hairCurlR2 = this._el("path", {
          d:"M 82 62 Q 92 70 88 80 Q 86 86 90 92",
          stroke:hd, "stroke-width":2.5, fill:"none", "stroke-linecap":"round"
        });
        svg.appendChild(this.hairCurlR2);

        // top highlight — centre parting shimmer
        this.hairShine = this._el("path", {
          d:"M 44 16 Q 50 13 56 16",
          stroke:hl, "stroke-width":1.5,
          fill:"none", "stroke-linecap":"round", opacity:0.6
        });
        svg.appendChild(this.hairShine);
      }
    }

    // ── FACE — male broader, female slimmer ───────────────
    svg.appendChild(this._el("ellipse", {
      cx:50, cy:50,
      rx: this._isMale ? 29 : 24,
      ry:33,
      fill: "url(#faceGrad)",
      stroke: this.P.shadow, "stroke-width": 0.5
    }));

    // ── EAR LEFT ──────────────────────────────────────────
    svg.appendChild(this._el("ellipse", {
      cx:23, cy:50, rx:4, ry:6,
      fill: this.P.cheek, stroke: this.P.shadow, "stroke-width":0.4
    }));
    svg.appendChild(this._el("ellipse", {
      cx:23, cy:50, rx:2, ry:3.5,
      fill: this.P.shadow, opacity:0.3
    }));

    // ── EAR RIGHT ─────────────────────────────────────────
    svg.appendChild(this._el("ellipse", {
      cx:77, cy:50, rx:4, ry:6,
      fill: this.P.cheek, stroke: this.P.shadow, "stroke-width":0.4
    }));
    svg.appendChild(this._el("ellipse", {
      cx:77, cy:50, rx:2, ry:3.5,
      fill: this.P.shadow, opacity:0.3
    }));

    // ── CHEEK BLUSH ───────────────────────────────────────
    svg.appendChild(this._el("ellipse", {
      cx:35, cy:60, rx:6, ry:3,
      fill:"#e08080", opacity:0.18
    }));
    svg.appendChild(this._el("ellipse", {
      cx:65, cy:60, rx:6, ry:3,
      fill:"#e08080", opacity:0.18
    }));

    // ── BROW LEFT ─────────────────────────────────────────
    this.browL = this._el("path", {
      d:"M 32 33 Q 38 30 44 32",
      stroke: this.P.brow, "stroke-width":2.2,
      fill:"none", "stroke-linecap":"round"
    });
    svg.appendChild(this.browL);

    // ── BROW RIGHT ────────────────────────────────────────
    this.browR = this._el("path", {
      d:"M 56 32 Q 62 30 68 33",
      stroke: this.P.brow, "stroke-width":2.2,
      fill:"none", "stroke-linecap":"round"
    });
    svg.appendChild(this.browR);

    // ── EYE LEFT ──────────────────────────────────────────
    this.eyeLGroup = this._el("g");

    this.eyeLWhite = this._el("ellipse", {
      cx:38, cy:42, rx:7, ry:5.5,
      fill:"url(#eyeGrad)", stroke:"#ccc", "stroke-width":0.3
    });
    this.eyeLGroup.appendChild(this.eyeLWhite);

    this.eyeLIris = this._el("circle", {
      cx:38, cy:42, r:3.5,
      fill: this.P.iris
    });
    this.eyeLGroup.appendChild(this.eyeLIris);

    this.eyeLPupil = this._el("circle", {
      cx:38, cy:42, r:1.8,
      fill: this.P.pupil
    });
    this.eyeLGroup.appendChild(this.eyeLPupil);

    this.eyeLShine = this._el("circle", {
      cx:39.2, cy:40.8, r:0.9,
      fill: this.P.shine
    });
    this.eyeLGroup.appendChild(this.eyeLShine);

    // blink lid left
    this.eyeLLid = this._el("ellipse", {
      cx:38, cy:42, rx:7, ry:0,
      fill: this.P.face
    });
    this.eyeLGroup.appendChild(this.eyeLLid);

    svg.appendChild(this.eyeLGroup);

    // ── EYE RIGHT ─────────────────────────────────────────
    this.eyeRGroup = this._el("g");

    this.eyeRWhite = this._el("ellipse", {
      cx:62, cy:42, rx:7, ry:5.5,
      fill:"url(#eyeGrad)", stroke:"#ccc", "stroke-width":0.3
    });
    this.eyeRGroup.appendChild(this.eyeRWhite);

    this.eyeRIris = this._el("circle", {
      cx:62, cy:42, r:3.5,
      fill: this.P.iris
    });
    this.eyeRGroup.appendChild(this.eyeRIris);

    this.eyeRPupil = this._el("circle", {
      cx:62, cy:42, r:1.8,
      fill: this.P.pupil
    });
    this.eyeRGroup.appendChild(this.eyeRPupil);

    this.eyeRShine = this._el("circle", {
      cx:63.2, cy:40.8, r:0.9,
      fill: this.P.shine
    });
    this.eyeRGroup.appendChild(this.eyeRShine);

    // blink lid right
    this.eyeRLid = this._el("ellipse", {
      cx:62, cy:42, rx:7, ry:0,
      fill: this.P.face
    });
    this.eyeRGroup.appendChild(this.eyeRLid);

    svg.appendChild(this.eyeRGroup);

    // ── NOSE ──────────────────────────────────────────────
    svg.appendChild(this._el("path", {
      d:"M 48 50 L 46 60 Q 50 63 54 60 L 52 50",
      fill: this.P.cheek,
      stroke: this.P.shadow, "stroke-width":0.6,
      "stroke-linejoin":"round"
    }));
    // nostrils
    svg.appendChild(this._el("ellipse", {
      cx:46.5, cy:61, rx:2, ry:1.2,
      fill: this.P.shadow, opacity:0.5
    }));
    svg.appendChild(this._el("ellipse", {
      cx:53.5, cy:61, rx:2, ry:1.2,
      fill: this.P.shadow, opacity:0.5
    }));

    // ── MOUTH ─────────────────────────────────────────────
    this.mouthGroup = this._el("g");

    // mouth cavity — opens smoothly
    this.mouthCavity = this._el("ellipse", {
      cx:50, cy:71, rx:9, ry:0,
      fill: this.P.mouth
    });
    this.mouthGroup.appendChild(this.mouthCavity);

    // teeth top
    this.mouthTeeth = this._el("rect", {
      x:43, y:69.5, width:14, height:0,
      fill: this.P.teeth, rx:1
    });
    this.mouthGroup.appendChild(this.mouthTeeth);

    // teeth bottom
    this.mouthTeethB = this._el("rect", {
      x:44, y:71, width:12, height:0,
      fill: this.P.teeth, rx:1
    });
    this.mouthGroup.appendChild(this.mouthTeethB);

    // upper lip — female wider bow, male thinner straight
    this.mouthUpper = this._el("path", {
      d: this._isMale
        ? "M 41 69 Q 46 68 50 68 Q 54 68 59 69"
        : "M 37 69 Q 43 65 50 67 Q 57 65 63 69",
      stroke: this.P.lip,
      "stroke-width": this._isMale ? 1.8 : 2.8,
      fill:"none", "stroke-linecap":"round"
    });
    this.mouthGroup.appendChild(this.mouthUpper);

    // lower lip — female full pout, male thin
    this.mouthLower = this._el("path", {
      d: this._isMale
        ? "M 41 70 Q 50 74 59 70"
        : "M 37 70 Q 50 78 63 70",
      stroke: this.P.lip,
      "stroke-width": this._isMale ? 2 : 3.8,
      fill:"none", "stroke-linecap":"round"
    });
    this.mouthGroup.appendChild(this.mouthLower);

    // lip fill — female only, adds color volume
    if (!this._isMale) {
      this.mouthLipFill = this._el("path", {
        d:"M 37 69 Q 50 78 63 69 Q 57 65 50 67 Q 43 65 37 69 Z",
        fill: this.P.lip, opacity:0.35
      });
      this.mouthGroup.appendChild(this.mouthLipFill);
    }

    // lip shine — female bigger, male subtle
    this.mouthShine = this._el("ellipse", {
      cx:50, cy:69.5,
      rx: this._isMale ? 3 : 5,
      ry: this._isMale ? 0.5 : 0.9,
      fill:"#fff", opacity: this._isMale ? 0.12 : 0.25
    });
    this.mouthGroup.appendChild(this.mouthShine);

    svg.appendChild(this.mouthGroup);

    // ── SPECIAL FEATURES ──────────────────────────────────
    this._drawSpecial(svg);

    this.container.appendChild(svg);
  }

  // ── SPECIAL FEATURES ────────────────────────────────────
  _drawSpecial(svg) {
    const sp = this.cfg.special;
    if (!sp) return;

    if (sp === "megaphone") {
      // Herald megaphone — held at cheek level right side
      const g = this._el("g");
      // handle
      g.appendChild(this._el("rect", { x:72, y:38, width:4, height:10, fill:this.P.accent, rx:1 }));
      // body
      g.appendChild(this._el("rect", { x:68, y:35, width:8, height:14, fill:this.P.accent, rx:2 }));
      // horn flare
      g.appendChild(this._el("path", {
        d:"M 76 36 L 86 30 L 86 50 L 76 46 Z",
        fill: this.P.accent, opacity:0.9
      }));
      // signal dots
      g.appendChild(this._el("circle", { cx:89, cy:34, r:1.5, fill:this.P.accent2, opacity:0.8 }));
      g.appendChild(this._el("circle", { cx:92, cy:31, r:1.2, fill:this.P.accent2, opacity:0.6 }));
      g.appendChild(this._el("circle", { cx:95, cy:28, r:1,   fill:this.P.accent2, opacity:0.4 }));
      svg.appendChild(g);
    }

    if (sp === "antenna") {
      svg.appendChild(this._el("line", { x1:50, y1:17, x2:50, y2:5, stroke:this.P.accent, "stroke-width":2 }));
      svg.appendChild(this._el("circle", { cx:50, cy:4, r:2.5, fill:this.P.accent }));
    }

    if (sp === "hardhat") {
      svg.appendChild(this._el("ellipse", { cx:50, cy:22, rx:30, ry:8, fill:this.P.accent }));
      svg.appendChild(this._el("rect", { x:22, y:22, width:56, height:5, fill:this.P.accent, rx:1 }));
    }

    if (sp === "glasses") {
      svg.appendChild(this._el("circle", { cx:38, cy:42, r:9, fill:"none", stroke:this.P.accent, "stroke-width":1.5 }));
      svg.appendChild(this._el("circle", { cx:62, cy:42, r:9, fill:"none", stroke:this.P.accent, "stroke-width":1.5 }));
      svg.appendChild(this._el("line",   { x1:47, y1:42, x2:53, y2:42, stroke:this.P.accent, "stroke-width":1.5 }));
    }

    if (sp === "lashes") {
      [[33,36],[36,34],[39,33],[42,34]].forEach(([x,y]) => {
        svg.appendChild(this._el("line", { x1:x, y1:y+2, x2:x-1, y2:y, stroke:this.P.brow, "stroke-width":1.2 }));
      });
      [[58,34],[61,33],[64,34],[67,36]].forEach(([x,y]) => {
        svg.appendChild(this._el("line", { x1:x, y1:y+2, x2:x+1, y2:y, stroke:this.P.brow, "stroke-width":1.2 }));
      });
    }

    if (sp === "circuit") { this._drawCircuit(svg); }
  }

  // ── ANIMATION LOOP ───────────────────────────────────────
  _loop() {
    this.frame++;

    // blink
    this.blinkTimer++;
    if (this.blinkTimer > 120 + Math.random() * 80) {
      this.blinking   = true;
      this.blinkTimer = 0;
    }
    if (this.blinking) {
      const t = this.blinkTimer / 16;
      const lidRy = Math.sin(t * Math.PI) * 5.5;
      this.eyeLLid.setAttribute("ry", lidRy);
      this.eyeRLid.setAttribute("ry", lidRy);
      if (this.blinkTimer >= 16) { this.blinking = false; this.eyeLLid.setAttribute("ry",0); this.eyeRLid.setAttribute("ry",0); }
    }

    // eye wander
    if (this.frame % 90 === 0) {
      this.eyeOffset.x = (Math.random() - 0.5) * 2.5;
      this.eyeOffset.y = (Math.random() - 0.5) * 1.5;
    }
    const ex = this.eyeOffset.x;
    const ey = this.eyeOffset.y;
    this.eyeLIris.setAttribute("cx",  38 + ex);
    this.eyeLIris.setAttribute("cy",  42 + ey);
    this.eyeLPupil.setAttribute("cx", 38 + ex);
    this.eyeLPupil.setAttribute("cy", 42 + ey);
    this.eyeRIris.setAttribute("cx",  62 + ex);
    this.eyeRIris.setAttribute("cy",  42 + ey);
    this.eyeRPupil.setAttribute("cx", 62 + ex);
    this.eyeRPupil.setAttribute("cy", 42 + ey);

    // ── HAIR ANIMATION ──────────────────────────────────
    if (this.P && this.P.hair && this.hairL) {
      this.hairSwing = Math.sin(this.frame * 0.025) * 2.5;
      const s = this.hairSwing;
      const fast = Math.sin(this.frame * 0.07) * 1.2;

      if (this._isMale) {
        // male — subtle side shift only, no curtain sway
        const ms = s * 0.3;
        this.hairL.setAttribute("d",
          `M ${24+ms} 40 Q ${20+ms} 46 ${21+ms} 54 Q ${22+ms} 50 ${24+ms} 46 Z`
        );
        this.hairR.setAttribute("d",
          `M ${76-ms} 40 Q ${80-ms} 46 ${79-ms} 54 Q ${78-ms} 50 ${76-ms} 46 Z`
        );
        if (this.hairCurlL1) this.hairCurlL1.setAttribute("d",
          `M ${22+ms} 52 Q ${20+ms} 58 ${21+ms} 64 Q ${22+ms} 60 ${23+ms} 56 Z`
        );
        if (this.hairCurlR1) this.hairCurlR1.setAttribute("d",
          `M ${78-ms} 52 Q ${80-ms} 58 ${79-ms} 64 Q ${78-ms} 60 ${77-ms} 56 Z`
        );
      } else {
        // female — full curtain sway
        this.hairL.setAttribute("d",
          `M ${23+s} 44 Q ${12+s} 55 ${14+s*0.6} 70 Q ${15+s*0.4} 82 ${22+s*0.2} 90 Q ${18+s*0.2} 78 ${20+s*0.3} 65 Q ${22+s*0.5} 52 ${26+s*0.8} 46 Z`
        );
        this.hairR.setAttribute("d",
          `M ${77-s} 44 Q ${88-s} 55 ${86-s*0.6} 70 Q ${85-s*0.4} 82 ${78-s*0.2} 90 Q ${82-s*0.2} 78 ${80-s*0.3} 65 Q ${78-s*0.5} 52 ${74-s*0.8} 46 Z`
        );
        if (this.hairCurlL1) this.hairCurlL1.setAttribute("d",
          `M ${20+s} 55 Q ${10+s+fast} 62 ${14+s*0.7} 72 Q ${16+s*0.5} 78 ${12+s*0.3} 84`
        );
        if (this.hairCurlL2) this.hairCurlL2.setAttribute("d",
          `M ${18+s} 62 Q ${8+s-fast} 70 ${12+s*0.6} 80 Q ${14+s*0.4} 86 ${10+s*0.2} 92`
        );
        if (this.hairCurlR1) this.hairCurlR1.setAttribute("d",
          `M ${80-s} 55 Q ${90-s-fast} 62 ${86-s*0.7} 72 Q ${84-s*0.5} 78 ${88-s*0.3} 84`
        );
        if (this.hairCurlR2) this.hairCurlR2.setAttribute("d",
          `M ${82-s} 62 Q ${92-s+fast} 70 ${88-s*0.6} 80 Q ${86-s*0.4} 86 ${90-s*0.2} 92`
        );
      }
      // top cap subtle bounce — gender-aware path
      const bounce = Math.sin(this.frame * 0.03) * 0.8;
      if (this._isMale) {
        // male short cap — minimal bounce
        this.hairTop.setAttribute("d",
          `M 24 40 Q 22 ${20+bounce*0.3} 50 ${15+bounce*0.3} Q 78 ${20+bounce*0.3} 76 40 Q 68 ${26+bounce*0.3} 50 ${24+bounce*0.3} Q 32 ${26+bounce*0.3} 24 40 Z`
        );
      } else {
        // female long hair — full bounce
        this.hairTop.setAttribute("d",
          `M 22 ${42+bounce} Q 20 ${18+bounce} 50 ${14+bounce} Q 80 ${18+bounce} 78 ${42+bounce} Q 70 ${28+bounce} 50 ${26+bounce} Q 30 ${28+bounce} 22 ${42+bounce} Z`
        );
      }
    }

    // ── MOUTH ANIMATION ─────────────────────────────────
    if (this.state === "speaking") {
      // natural talking — alternates open/close with slight randomness
      this.mouthOpen = 2.5 + Math.sin(this.frame * 0.35) * 2 + Math.sin(this.frame * 0.7) * 0.8;
    } else if (this.state === "thinking") {
      this.mouthOpen = 0.4 + Math.sin(this.frame * 0.08) * 0.3;
    } else {
      this.mouthOpen = Math.max(0, this.mouthOpen - 0.25);
    }
    const mo = Math.max(0, this.mouthOpen);
    this.mouthCavity.setAttribute("ry", mo);
    this.mouthTeeth.setAttribute("height", Math.max(0, mo * 0.55));
    this.mouthTeethB.setAttribute("height", Math.max(0, mo * 0.4));
    this.mouthTeethB.setAttribute("y", 71 + mo * 0.5);
    // lower lip drops on open
    const ly = 70 + mo * 0.6;
    this.mouthLower.setAttribute("d", `M 38 ${ly} Q 50 ${ly+6} 62 ${ly}`);
    // upper lip rises slightly
    const uy = 69 - mo * 0.3;
    this.mouthUpper.setAttribute("d", `M 38 ${uy} Q 44 ${uy-1.5} 50 ${uy-0.8} Q 56 ${uy-1.5} 62 ${uy}`);

    // brow expression
    if (this.state === "thinking") {
      this.browL.setAttribute("d", "M 32 31 Q 38 29 44 32");
      this.browR.setAttribute("d", "M 56 32 Q 62 29 68 31");
    } else if (this.state === "error") {
      this.browL.setAttribute("d", "M 32 34 Q 38 31 44 33");
      this.browR.setAttribute("d", "M 56 33 Q 62 31 68 34");
    } else {
      this.browL.setAttribute("d", "M 32 33 Q 38 30 44 32");
      this.browR.setAttribute("d", "M 56 32 Q 62 30 68 33");
    }


    // circuit pulse — ANTCPU thinking state MK enhancement
    if (this.circuitPulse) {
      if (this.state === "thinking") {
        const pulse = 0.4 + Math.abs(Math.sin(this.frame * 0.08)) * 0.6;
        const radius = 6 + Math.abs(Math.sin(this.frame * 0.05)) * 4;
        this.circuitPulse.setAttribute("opacity", pulse);
        this.circuitPulse.setAttribute("r", radius);
      } else {
        this.circuitPulse.setAttribute("opacity", 0);
        this.circuitPulse.setAttribute("r", 6);
      }
    }
    this._raf = requestAnimationFrame(() => this._loop());
  }

  // ── PUBLIC API ───────────────────────────────────────────
  setState(s) { this.state = s; }

  speak(text, ms) {
    this.setState("speaking");
    setTimeout(() => this.setState("idle"), ms || (text ? text.length * 60 : 2000));
  }

  think() { this.setState("thinking"); }
  idle()  { this.setState("idle"); }
  error() { this.setState("error"); }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.container.innerHTML = '';
  }

  // ── SVG HELPERS ──────────────────────────────────────────
  _el(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  _lighten(hex, amt) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
  }
}

// ANTCPU CIRCUIT SPECIAL — injected 2026-04-28
TalkingHeadSVG.prototype._drawCircuit = function(svg) {
  const P = this.P;
  const g = this._el("g");
  g.setAttribute("id", "circuitGroup");

  // crown plate
  g.appendChild(this._el("rect", {
    x:32, y:10, width:36, height:8,
    fill: P.accent2, rx:2, opacity:0.9
  }));

  // vertical spine
  g.appendChild(this._el("line", {
    x1:50, y1:10, x2:50, y2:2,
    stroke: P.accent, "stroke-width":1.5
  }));

  // horizontal branches
  g.appendChild(this._el("line", { x1:38, y1:14, x2:32, y2:14, stroke:P.accent, "stroke-width":1 }));
  g.appendChild(this._el("line", { x1:62, y1:14, x2:68, y2:14, stroke:P.accent, "stroke-width":1 }));
  g.appendChild(this._el("line", { x1:44, y1:10, x2:44, y2:5,  stroke:P.accent, "stroke-width":1 }));
  g.appendChild(this._el("line", { x1:56, y1:10, x2:56, y2:5,  stroke:P.accent, "stroke-width":1 }));

  // nodes
  [[50,2],[44,5],[56,5],[32,14],[68,14]].forEach(([cx,cy]) => {
    g.appendChild(this._el("circle", { cx, cy, r:1.8, fill:P.accent }));
  });

  // pulse ring — animates on thinking state
  this.circuitPulse = this._el("circle", {
    cx:50, cy:14, r:6,
    fill:"none", stroke:P.accent, "stroke-width":0.8, opacity:0
  });
  g.appendChild(this.circuitPulse);

  svg.appendChild(g);
};
