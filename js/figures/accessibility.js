/* Hairline figure: accessibility. Built with the hairline-create skill on the engine of
 * @lucasmarkes/hairline (MIT, see ../HAIRLINE-LICENSE.txt). Wrapped so its names stay
 * private; it registers itself through the page's hairline() function. */
(() => {
  /**
   * Accessibility: the accessibility mark as a medallion standing in a cradle on
   * a turntable, held in a Figma-style selection box. A flick across the stage
   * pushes the turntable round; friction bleeds the spin off and a spring pulls
   * it into the nearest quarter turn, where the medallion is back at the
   * isometric angle. The selection box is worked out again every frame from the
   * medallion's screen extent, so it widens as the face turns towards you and
   * narrows to a sliver edge-on. Pointer y springs the elevation, as in
   * Turntable. The slider is the coast: friction's time constant, in ms.
   */
  const {
    Cam, proj, facing, circ, rings, prism, run, hull, poly, open, seg, fillet,
    clamp, lerp, rad, r2, spring, stepS, reducedMotion, mk, solid, put, register, pointer, disposer,
  } = HL;

  const R = 46, T = 7, RIN = 40, LIFT = 1.6, ZC = R + 1.5, PR = 70, PT = 4, LIP = 7;
  const HOME = 45, DETENT = 90, WMAX = 540, HS = 2.3;
  const detent = (a) => HOME + DETENT * Math.round((a - HOME) / DETENT);

  /** The mark in the face's own (u, v), scaled to the medallion: one outline for arms, body and legs, and the head. */
  const K = R / 50;
  const BODY = fillet(
    [[-24.8, 17.9], [0, 16.2], [24.8, 17.9], [23.7, 12.7], [8.6, 11.2], [6.7, 8.6], [6.7, -2.2], [12.5, -27.6], [10.3, -30.8],
     [7.5, -29.1], [0, -7.5], [-7.5, -29.1], [-10.3, -30.8], [-12.5, -27.6], [-6.7, -2.2], [-6.7, 8.6], [-8.6, 11.2], [-23.7, 12.7]].map(([u, v]) => [u * K, v * K]),
    [2.6, 4, 2.6, 2.6, 1.5, 1.5, 1, 2, 2, 2, 1.2, 2, 2, 2, 1, 1.5, 1.5, 2.6],
  );
  const HEAD = circ(5.8 * K, 28).map((q) => [q.u, 25.9 * K + q.v]);
  const RIM = circ(R, 72), FIELD = circ(RIN, 64);

  function mount({ stage, svg, read }, value) {
    const bag = disposer();
    let coast = value;
    const spin = { a: HOME, w: 0, mode: "rest", tgt: HOME };
    const kk = spring(0.5, { eps: 0.0005 });
    let lastX = null, lastT = 0, lastMove = -1e9;

    /** Coast under friction, then spring into the detent; 240Hz substeps so a long frame cannot overshoot. */
    function stepSpin(dt, now) {
      if (spin.mode === "rest") return false;
      const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
      for (let i = 0; i < n; i++) {
        if (spin.mode === "coast") {
          spin.w *= Math.exp((-h * 1000) / coast); spin.a += spin.w * h;
          if (Math.abs(spin.w) < 45 && now - lastMove > 90) { spin.mode = "settle"; spin.tgt = detent(spin.a + spin.w * 0.2); }
        } else { spin.w += (-90 * (spin.a - spin.tgt) - 16 * spin.w) * h; spin.a += spin.w * h; }
      }
      if (spin.mode === "settle" && Math.abs(spin.a - spin.tgt) < 0.02 && Math.abs(spin.w) < 0.3) { spin.a = spin.tgt; spin.w = 0; spin.mode = "rest"; }
      return spin.mode !== "rest";
    }

    const C = Cam(HOME, 0.5, 1.9); C.ox = 200; C.oy = 195;
    const plat = circ(PR), platIn = circ(PR - 1.5);
    const lips = [rings(-10.5, -20, -4.2, 20, 2.2, 0.8), rings(4.2, -20, 10.5, 20, 2.2, 0.8)];

    // back to front: the turntable, its ticks and index, then the cradle and medallion (reordered by the camera), then the selection
    const g = mk("g", {}, svg);
    const platter = solid(g), ticks = mk("path", { class: "nf lo" }, g), major = mk("path", { class: "nf" }, g);
    const index = mk("path", { class: "nf" }, g);
    const lipS = lips.map(() => solid(g));
    const coin = mk("g", {}, g);
    const body = mk("path", { class: "sil" }, coin), crease = mk("path", { class: "nf lo" }, coin), field = mk("path", { class: "nf lo" }, coin);
    const low = mk("path", { class: "lo" }, coin), lowHead = mk("path", { class: "lo" }, coin);
    const top = mk("path", { class: "hi" }, coin), topHead = mk("path", { class: "hi" }, coin);
    const box = mk("path", { class: "nf sil" }, svg);
    const handles = [0, 1, 2, 3].map(() => mk("path", { class: "sil" }, svg));
    let near = -1;

    const B = register(stage, (dt, now) => {
      let m = stepSpin(dt, now);
      if (stepS(kk, dt)) m = true;
      C.az = rad(spin.a); C.k = kk.x;
      const P = proj(C), front = facing(C), s = Math.sin(C.az), c = Math.cos(C.az), zf = Math.sqrt(1 - C.k * C.k);
      const to = [s * zf, c * zf, C.k], sg = to[0] >= 0 ? 1 : -1;

      put(platter, prism(P, front, plat, platIn, -PT, 0));
      const tk = [], mj = [];
      for (let d = 0; d < 360; d += 15) {
        const a = rad(d), long = d % 90 === 0, r0 = long ? PR - 12 : PR - 8;
        (long ? mj : tk).push(seg(P(Math.cos(a) * r0, Math.sin(a) * r0, 0), P(Math.cos(a) * (PR - 4.5), Math.sin(a) * (PR - 4.5), 0)));
      }
      ticks.setAttribute("d", tk.join("")); major.setAttribute("d", mj.join(""));
      const bottom = C.oy + PR * C.S * C.k + PT * C.S * zf;
      index.setAttribute("d", `M${C.ox - 4} ${r2(bottom + 10)}L${C.ox} ${r2(bottom + 4)}L${C.ox + 4} ${r2(bottom + 10)}`);

      // the cradle's two lips, the nearer one painted after the medallion
      lips.forEach(([o, i], j) => put(lipS[j], prism(P, front, o, i, 0, LIP)));
      const n = sg > 0 ? 1 : 0;
      if (n !== near) { near = n; g.append(lipS[1 - n].g, coin, lipS[n].g); }

      // the medallion: two rims make the silhouette, the face towards the camera carries the mark in relief
      const at = (o, u, v) => P(o, u, ZC + v), face = sg * T / 2;
      const both = RIM.map((q) => at(T / 2, q.u, q.v)).concat(RIM.map((q) => at(-T / 2, q.u, q.v)));
      body.setAttribute("d", poly(hull(both)));
      crease.setAttribute("d", open(run(RIM, (q) => q.nu * to[1] + q.nv * to[2] > 0).map((q) => at(face, q.u, q.v))));
      field.setAttribute("d", poly(FIELD.map((q) => at(face, q.u, q.v))));
      const lift = face + sg * LIFT, up = BODY.map(([u, v]) => at(lift, u, v)), upH = HEAD.map(([u, v]) => at(lift, u, v));
      low.setAttribute("d", poly(BODY.map(([u, v]) => at(face, u, v))));
      lowHead.setAttribute("d", poly(HEAD.map(([u, v]) => at(face, u, v))));
      top.setAttribute("d", poly(up)); topHead.setAttribute("d", poly(upH));

      // the selection: the box round everything the medallion puts on screen, and a handle at each corner
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const [x, y] of both.concat(up, upH)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      box.setAttribute("d", `M${r2(x0)} ${r2(y0)}H${r2(x1)}V${r2(y1)}H${r2(x0)}Z`);
      [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y], j) =>
        handles[j].setAttribute("d", poly(fillet([[x - HS, y - HS], [x + HS, y - HS], [x + HS, y + HS], [x - HS, y + HS]], [0.6, 0.6, 0.6, 0.6], 2))));

      // the bright stroke: the mark at rest; the selection while the turntable is handled or turning
      const live = lastX !== null || spin.mode !== "rest";
      box.classList.toggle("hi", live); handles.forEach((h) => h.classList.toggle("hi", live));
      top.classList.toggle("hi", !live); topHead.classList.toggle("hi", !live);
      read.textContent = live ? `${Math.round(x1 - x0)} × ${Math.round(y1 - y0)}` : "rest";
      return m;
    });
    bag.add(B.unregister);

    bag.add(pointer(stage, {
      move: (p) => {
        const now = performance.now();
        kk.t = lerp(Math.sin(rad(40)), Math.sin(rad(20)), clamp(p[1] / 320, 0, 1));
        if (lastX !== null) {
          const dx = p[0] - lastX;
          if (reducedMotion()) spin.a -= dx * 0.9;
          else {
            // pushing the near edge: the turntable's front follows the pointer
            const vp = dx / Math.max(0.008, (now - lastT) / 1000);
            spin.w = clamp(lerp(spin.w, -vp * 0.9, 0.35), -WMAX, WMAX); spin.mode = "coast";
          }
          if (Math.abs(dx) > 0.5) lastMove = now;
        }
        lastX = p[0]; lastT = now; B.wake();
      },
      leave: () => { lastX = null; kk.t = 0.5; if (reducedMotion()) spin.a = detent(spin.a); B.wake(); },
    }));

    bag.add(() => svg.replaceChildren());
    return { set: (v) => { coast = v; B.wake(); }, destroy: bag.dispose };
  }

  hairline({
    name: "accessibility",
    means: "The accessibility mark on a turntable, held in a selection box that widens and narrows as you flick it round.",
    rules: [3, 5, 8, 9],
    range: [200, 650, 1500],
    tour: [[110, 200], [300, 200], [200, 130], null],
    mount,
  });
})();
