/* Hairline figure: phone. Built with the hairline-create skill on the engine of
 * @lucasmarkes/hairline (MIT, see ../HAIRLINE-LICENSE.txt). Wrapped so its names stay
 * private; it registers itself through the page's hairline() function. */
(() => {
  /**
   * Phone: an iPhone with its screen taken apart into three levels stacked over
   * it, the three steps of a fare choice: the results list on top, the fare
   * options under it, the opened Plus fare at the bottom, each labelled as a test
   * over the phone as the control. At rest the levels stand open and the results
   * level is lit. Moving across closes them through one spring until the screen
   * is one again and the phone lies flat; the labels fade as the levels close.
   * The pointer's y picks a level, which takes the bright edge and lights its
   * touch point. Picking tests where the levels are going, not where they are.
   * The slider is the gap between levels, in world units. The labels are words
   * in the drawing, against rule 10, because they were asked for.
   */
  const {
    Cam, fit, proj, facing, rings, prism, rrect, ringAt, extremes, poly, seg, clamp,
    spring, stepS, mk, solid, put, flatDot, place, register, pointer, disposer,
  } = HL;

  const W = 48, H = 100, BT = 5.5, TK = 1.2, SI = 2.2, SR = 6;
  const SCR = [SI, SI, W - SI, H - SI];

  /** Screen content, in screen units: [y, x0, x1, strong] for a line of text, [x0, y0, x1, y1, r, cls] for a box, [x, y] for an icon. */
  const top = () => ({ t: [[4.6, 6, 10, 1], [4.6, 37, 42, 0]], r: [[17, 3.2, 31, 6.2, 1.5, "nf"]], d: [] });
  function card(L, y, tab) {
    L.r.push([4, y, 44, y + 21, 2.5, "nf"], [4.6, y + 12, 43.4, y + 20.4, 2, "nf"]);
    L.t.push([y + 3.5, 7, 13, 1], [y + 3.5, 35, 41, 1], [y + 3.5, 15, 33, 0], [y + 6, 7, 10, 0], [y + 6, 38, 41, 0], [y + 9, 7, 14, 0], [y + 14.5, 7, 15, 0], [y + 17, 7, 17, 1]);
    L.d.push([40, y + 16.2]);
    if (tab) L.tap = [24, y + 16.2];
  }
  function fare(L, y, n, tap) {
    L.r.push([4, y, 44, y + 17.5, 2, "nf"], [32.5, y + 2, 42, y + 7.5, 2.7, "nf"]);
    L.t.push([y + 3, 7, 12, 0], [y + 6.5, 7, 15, 1], [y + 10, 4, 44, 0], [y + 14, 34, 40, 0]);
    for (let k = 0; k < n; k++) L.d.push([8 + k * 3.2, y + 14]);
    if (tap === "view") L.tap = [37, y + 14];
    if (tap === "select") L.tap = [37.2, y + 4.75];
  }
  function results() {
    const L = top();
    L.t.push([10.5, 5, 17, 1], [15.5, 5, 17, 1], [18, 5, 20, 0], [20.5, 5, 22, 0], [16, 37, 43, 1], [19, 38, 43, 1], [23, SI, W - SI, 0], [29, 5, 36, 1],
      [35.8, 8, 15.5, 0], [35.8, 21, 27, 1], [35.8, 33.5, 39.5, 0], [92, 7, 13, 1], [92, 35, 41, 1], [89.5, 4, 44, 0]);
    L.r.push([35, 9, 43.5, 12, 1.5, "nf"], [6, 32.8, 17.5, 39, 1.2, "nf"], [18.5, 32.3, 29.5, 39, 1.2, "nf"], [30.5, 32.8, 42, 39, 1.2, "nf dash"]);
    card(L, 43, true); card(L, 66.5, false);
    return L;
  }
  function fares() {
    const L = top();
    L.t.push([10, 5, 16, 0], [13, 5, 14, 1], [16, 5, 17, 0]);
    L.r.push([39, 9, 42.5, 12.5, 1.7, "nf"]);
    [1, 3, 4, 5].forEach((n, k) => fare(L, 20 + k * 19.4, n, k === 1 ? "view" : null));
    return L;
  }
  function plus() {
    const L = top();
    fare(L, 9, 1, null);
    L.r.push([4, 28.5, 44, 75, 2, "nf"], [32.5, 30.5, 42, 36, 2.7, "nf"]);
    L.t.push([31.5, 7, 12, 0], [35, 7, 15, 1], [38.5, 4, 44, 0], [42.5, 34, 41, 0]);
    for (let k = 0; k < 3; k++) L.d.push([8 + k * 3.2, 42.5]);
    [14, 17, 12, 16, 15, 12, 11].forEach((n, k) => { L.d.push([7.5, 47.5 + k * 3.8]); L.t.push([47.5 + k * 3.8, 9.5, 9.5 + n, 0]); });
    L.tap = [37.2, 33.25];
    fare(L, 78, 4, null);
    return L;
  }
  // bottom to top: the deepest level is the last step
  const LAY = [{ name: "03 plus", ...plus() }, { name: "02 fares", ...fares() }, { name: "01 results", ...results() }];

  /** Even-odd point-in-polygon. */
  function inside(pt, pg) {
    let c = false;
    for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) {
      const [xi, yi] = pg[i], [xj, yj] = pg[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  function mount({ stage, svg, read }, value) {
    const bag = disposer();
    let GAP = value, act = -1, lastP = null;
    const e = spring(1, { eps: 0.002 });
    // the camera is fitted to the flat phone; as the levels rise it slides down by half their height, so the stack stays centred
    const C = Cam(45, 0.5, 2.0), ZF = Math.sqrt(1 - 0.25);
    fit(C, [[0, 0, 0], [W, H, 0], [W, 0, 0], [0, H, 0], [0, 0, BT]], 200, 170);
    const OY = C.oy, oyAt = (f) => OY + 1.5 * GAP * f * ZF * C.S;
    const front = facing(C);
    let P = proj(C);
    const zTop = (k, f) => BT + (k + 1) * GAP * f;
    const g = mk("g", {}, svg);

    // the phone: body, the glass's edge and the island, buttons on the near side, the port on the near end
    const [bo, bi] = rings(0, 0, W, H, 7.5, 1.2), body = solid(g);
    const glass = mk("path", { class: "nf lo" }, g), island = mk("path", { class: "nf" }, g);
    const BTN = [[24, 36], [60, 67]].map(([y0, y1]) => [rings(W - 0.2, y0, W + 0.9, y1, 0.5, 0.2), solid(g)]);
    const port = mk("path", { class: "nf lo" }, g);
    function phone() {
      put(body, prism(P, front, bo, bi, 0, BT));
      glass.setAttribute("d", poly(ringAt(P, rrect(...SCR, SR, 5), BT)));
      island.setAttribute("d", poly(ringAt(P, rrect(17, 3.2, 31, 6.2, 1.5, 4), BT)));
      for (const [[o, i], el] of BTN) put(el, prism(P, front, o, i, 1.6, 3.9));
      port.setAttribute("d", poly(rrect(19.5, 2, 28.5, 3.6, 0.8, 4).map((q) => P(q.u, H, q.v))));
    }

    const [sr, sri] = rings(...SCR, SR, 0.8), ext = extremes(P, sr);
    const els = LAY.map((L) => {
      const guide = mk("path", { class: "nf dash" }, g), el = solid(g);
      const strong = mk("path", { class: "nf" }, el.g), dim = mk("path", { class: "nf lo" }, el.g), dash = mk("path", { class: "nf dash" }, el.g);
      const icons = L.d.map(() => flatDot(el.g, C, 0.7, "dot off"));
      const tap = flatDot(el.g, C, 1.5, "dot m"), halo = mk("path", { class: "nf" }, el.g);
      return { el, guide, strong, dim, dash, icons, tap, halo };
    });
    const REST = LAY.length - 1;
    els[REST].tap.setAttribute("class", "dot"); els[REST].el.sil.classList.add("hi"); els[REST].halo.classList.add("hi");

    // the annotations, at the user's request: a label and a leader beside each level and the phone, fading as the levels close
    const NOTE = [["TEST 3", 0, 1], ["TEST 2", 1, -1], ["TEST 1", 2, 1], ["CONTROL", -1, -1]];
    const notes = NOTE.map(([txt, , side]) => {
      const n = mk("g", {}, svg), lead = mk("path", { class: "nf" }, n);
      const t = mk("text", { "text-anchor": side > 0 ? "start" : "end", style: "fill:var(--hl-hi);fill-opacity:.72;stroke:none;font:500 6.6px ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:1px" }, n);
      t.textContent = txt;
      return { n, lead, t };
    });

    const corners = (Q, z) => [Q(SI, SI, z), Q(W - SI, SI, z), Q(W - SI, H - SI, z), Q(SI, H - SI, z)];
    /** The topmost level under the pointer, tested where the levels are going, not where they are. */
    function pick(p) {
      if (!p) return -1;
      const Q = proj({ ...C, oy: oyAt(e.t) });
      for (let k = LAY.length - 1; k >= 0; k--) if (inside(p, corners(Q, zTop(k, e.t)))) return k;
      return -1;
    }
    function setAct(a) {
      if (a === act) return;
      act = a;
      const lit = a < 0 ? REST : a;
      els.forEach((E, k) => { E.el.sil.classList.toggle("hi", k === lit); E.halo.classList.toggle("hi", k === lit); E.tap.setAttribute("class", k === lit ? "dot" : "dot m"); });
      B.wake();
    }

    const B = register(stage, (dt) => {
      const m = stepS(e, dt);
      C.oy = oyAt(e.x); P = proj(C); phone();
      LAY.forEach((L, k) => {
        const E = els[k], zt = zTop(k, e.x), zb = zt - TK, at = (x, y) => P(x, y, zt);
        put(E.el, prism(P, front, sr, sri, zb, zt));
        E.strong.setAttribute("d", L.t.filter((t) => t[3]).map(([y, x0, x1]) => seg(at(x0, y), at(x1, y))).join("") + L.r.filter((r) => r[5] === "nf").map((r) => poly(ringAt(P, rrect(...r.slice(0, 5), 3), zt))).join(""));
        E.dim.setAttribute("d", L.t.filter((t) => !t[3]).map(([y, x0, x1]) => seg(at(x0, y), at(x1, y))).join(""));
        E.dash.setAttribute("d", L.r.filter((r) => r[5] === "nf dash").map((r) => poly(ringAt(P, rrect(...r.slice(0, 5), 3), zt))).join(""));
        L.d.forEach(([x, y], j) => place(E.icons[j], at(x, y)));
        place(E.tap, at(...L.tap));
        E.halo.setAttribute("d", poly(ringAt(P, rrect(L.tap[0] - 3.4, L.tap[1] - 3.4, L.tap[0] + 3.4, L.tap[1] + 3.4, 3.4, 4), zt)));
        E.guide.setAttribute("d", e.x * GAP > TK ? ext.map((q) => seg(P(q.u, q.v, zb), P(q.u, q.v, zTop(k - 1, e.x)))).join("") : "");
      });
      const fadeIn = clamp((e.x - 0.3) / 0.7, 0, 1);
      NOTE.forEach(([, k, side], j) => {
        const N = notes[j], [ax, ay] = k < 0 ? P(SI, H - SI, BT / 2) : side > 0 ? P(W - SI, SI, zTop(k, e.x)) : P(SI, H - SI, zTop(k, e.x));
        N.n.setAttribute("opacity", String(Math.round(fadeIn * 100) / 100));
        N.lead.setAttribute("d", seg([ax + side * 7, ay], [ax + side * 21, ay]));
        N.t.setAttribute("x", String(Math.round((ax + side * 25) * 10) / 10)); N.t.setAttribute("y", String(Math.round((ay + 2.3) * 10) / 10));
      });
      read.textContent = act >= 0 ? LAY[act].name : lastP ? `gap ${(GAP * e.x).toFixed(0)}` : "rest";
      return m;
    });
    bag.add(B.unregister);

    bag.add(pointer(stage, {
      move: (p) => { lastP = p; e.t = clamp((300 - p[0]) / 160, 0, 1); setAct(pick(p)); B.wake(); },
      leave: () => { lastP = null; e.t = 1; setAct(-1); B.wake(); },
    }));
    bag.add(() => svg.replaceChildren());
    return { set: (v) => { GAP = v; if (lastP) setAct(pick(lastP)); B.wake(); }, destroy: bag.dispose };
  }

  hairline({
    name: "phone",
    means: "Three test screens stacked over a control phone; moving across closes them into one phone, and the labels fade.",
    rules: [1, 5, 6, 8],
    range: [16, 22, 28],
    tour: [[150, 120], [230, 175], [300, 175], null],
    mount,
  });
})();
