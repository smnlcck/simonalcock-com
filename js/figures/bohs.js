/* Hairline figure: bohs. Built with the hairline-create skill on the engine of
 * @lucasmarkes/hairline (MIT, see ../HAIRLINE-LICENSE.txt). Wrapped so its names stay
 * private; it registers itself through the page's hairline() function. */
(() => {
  /**
   * Bohs: the Bohemian Football Club mark, crest and wordmark, built as low
   * reliefs on one plate. At rest it lies in the isometric view, an outline
   * object; when the pointer arrives the camera eases round on the 700ms curve
   * until the mark faces you flat, and eases back when it leaves. While it is
   * faced, the letters nearest the pointer hop, each on its own spring, less
   * the further away. The lettering on the crest's band is part of the mark,
   * set flat on its face. Picking reads the pointer on the plate as the target
   * camera sees it. The slider is the hop, in world units.
   */
  const {
    Cam, proj, unproj, facing, circ, prism, poly, seg, fillet, clamp, lerp, rad,
    spring, stepS, tween, tset, tval, tdone, mk, solid, put, flatDot, place, register, pointer, disposer,
  } = HL;

  /** Letter outlines at a cap height of 23, from the baseline's left end, y down; "|" separates contours. */
  const G = {
    A: "18.5,0.0 16.5,-5.9 7.7,-5.9 5.6,0.0 0.8,0.0 9.2,-23.0 14.9,-23.0 23.3,0.0|12.1,-19.5 8.8,-9.5 15.4,-9.5",
    B: "22.6,-6.6 22.5,-5.1 22.0,-3.8 21.3,-2.7 20.3,-1.7 19.0,-1.0 17.5,-0.4 13.7,-0.0 2.2,0.0 2.2,-23.0 14.7,-22.9 16.5,-22.6 17.9,-22.2 19.1,-21.5 20.1,-20.7 20.8,-19.7 21.2,-18.6 21.3,-17.2 21.0,-15.4 20.2,-13.9 19.6,-13.3 18.8,-12.8 16.9,-12.1 19.4,-11.5 21.2,-10.3 22.3,-8.7|16.5,-16.6 16.2,-17.9 15.9,-18.4 14.9,-19.1 13.4,-19.4 7.1,-19.4 7.1,-13.7 12.6,-13.7 14.3,-13.9 15.0,-14.1 15.9,-14.8 16.2,-15.3|17.8,-6.9 17.5,-8.4 16.6,-9.4 15.2,-10.0 13.2,-10.2 7.1,-10.2 7.1,-3.6 13.3,-3.6 15.3,-3.8 16.1,-4.0 17.2,-4.9 17.5,-5.5",
    C: "13.0,-3.5 15.0,-3.7 16.7,-4.6 18.0,-5.9 19.0,-7.8 23.2,-6.3 22.5,-4.7 21.6,-3.3 20.5,-2.2 19.3,-1.3 17.9,-0.6 14.7,0.2 13.0,0.3 10.4,0.1 8.1,-0.5 6.1,-1.4 4.4,-2.8 3.1,-4.5 2.1,-6.6 1.6,-8.9 1.4,-11.6 1.6,-14.3 2.1,-16.6 3.0,-18.6 4.3,-20.3 5.9,-21.6 7.9,-22.6 10.2,-23.2 12.8,-23.3 14.7,-23.2 16.4,-22.9 18.0,-22.4 19.4,-21.7 20.5,-20.8 21.5,-19.7 22.3,-18.4 22.9,-16.9 18.7,-15.8 17.9,-17.3 16.6,-18.5 14.9,-19.3 12.9,-19.6 11.3,-19.4 10.0,-19.0 8.9,-18.4 7.9,-17.5 7.2,-16.4 6.6,-15.0 6.3,-13.4 6.3,-9.7 6.7,-8.1 7.2,-6.7 8.0,-5.6 8.9,-4.6 10.1,-4.0 11.4,-3.6",
    D: "22.7,-11.7 22.4,-8.3 21.3,-5.5 19.7,-3.1 17.4,-1.4 16.1,-0.8 13.1,-0.1 2.2,0.0 2.2,-23.0 10.6,-23.0 13.3,-22.8 15.7,-22.3 17.8,-21.4 19.6,-20.1 20.9,-18.4 21.9,-16.5 22.5,-14.2|17.9,-11.7 17.8,-13.4 17.4,-14.9 16.8,-16.2 16.0,-17.3 14.9,-18.2 13.6,-18.8 12.1,-19.2 7.1,-19.3 7.1,-3.7 12.6,-3.9 13.9,-4.3 15.1,-4.9 16.1,-5.9 16.9,-7.0 17.4,-8.4 17.8,-9.9",
    E: "2.2,0.0 2.2,-23.0 20.3,-23.0 20.3,-19.3 7.1,-19.3 7.1,-13.5 19.3,-13.5 19.3,-9.8 7.1,-9.8 7.1,-3.7 21.0,-3.7 21.0,0.0",
    F: "7.1,-19.3 7.1,-12.2 18.8,-12.2 18.8,-8.4 7.1,-8.4 7.1,0.0 2.2,0.0 2.2,-23.0 19.2,-23.0 19.2,-19.3",
    H: "17.1,0.0 17.1,-9.9 7.1,-9.9 7.1,0.0 2.2,0.0 2.2,-23.0 7.1,-23.0 7.1,-13.8 17.1,-13.8 17.1,-23.0 21.9,-23.0 21.9,0.0",
    I: "2.2,0.0 2.2,-23.0 7.1,-23.0 7.1,0.0",
    L: "2.2,0.0 2.2,-23.0 7.1,-23.0 7.1,-3.7 19.4,-3.7 19.4,0.0",
    M: "21.3,0.0 21.3,-14.4 21.5,-19.0 19.8,-12.8 15.6,0.0 12.2,0.0 8.1,-12.8 6.3,-19.0 6.5,-13.9 6.5,0.0 2.2,0.0 2.2,-23.0 8.7,-23.0 12.8,-10.1 13.9,-5.8 19.2,-23.0 25.6,-23.0 25.6,0.0",
    N: "16.2,0.0 6.2,-17.7 6.5,-13.6 6.5,0.0 2.2,0.0 2.2,-23.0 7.7,-23.0 17.9,-5.1 17.6,-9.6 17.6,-23.0 21.9,-23.0 21.9,0.0",
    O: "24.6,-11.6 24.5,-9.9 23.8,-6.7 22.4,-4.0 21.5,-2.9 20.4,-1.9 17.7,-0.5 14.7,0.2 12.9,0.3 10.4,0.1 8.1,-0.5 6.1,-1.5 4.4,-2.9 3.1,-4.6 2.1,-6.6 1.6,-9.0 1.4,-11.6 1.6,-14.2 2.1,-16.5 3.1,-18.5 4.4,-20.2 6.1,-21.6 8.1,-22.6 10.4,-23.1 13.0,-23.3 15.6,-23.1 17.8,-22.6 19.8,-21.6 21.5,-20.2 22.9,-18.5 23.8,-16.5 24.4,-14.2|19.7,-11.6 19.6,-13.4 19.2,-14.9 18.7,-16.3 17.9,-17.4 17.0,-18.4 15.8,-19.0 14.5,-19.4 13.0,-19.6 11.5,-19.4 10.1,-19.0 9.0,-18.4 8.0,-17.5 7.2,-16.3 6.7,-14.9 6.3,-13.4 6.3,-9.8 6.7,-8.2 7.2,-6.8 8.0,-5.6 9.0,-4.7 10.2,-4.0 11.5,-3.6 12.9,-3.5 14.5,-3.6 15.8,-4.0 17.0,-4.7 17.9,-5.6 18.7,-6.8 19.2,-8.1 19.6,-9.8",
    T: "12.6,-19.3 12.6,0.0 7.8,0.0 7.8,-19.3 0.4,-19.3 0.4,-23.0 20.1,-23.0 20.1,-19.3",
    U: "11.8,0.3 9.6,0.2 7.6,-0.3 5.9,-1.0 4.5,-2.0 3.4,-3.3 2.6,-4.8 2.2,-6.6 2.0,-8.6 2.0,-23.0 6.8,-23.0 6.8,-9.0 7.1,-6.6 7.6,-5.6 8.8,-4.2 9.7,-3.8 11.9,-3.4 13.1,-3.5 15.1,-4.3 16.5,-5.7 16.9,-6.7 17.3,-9.2 17.3,-23.0 22.1,-23.0 22.1,-8.9 21.9,-6.8 21.4,-5.0 20.6,-3.4 19.4,-2.1 17.9,-1.0 16.2,-0.3 14.1,0.2",
  };
  const ADV = {A: 24.14, B: 24.14, C: 24.14, D: 24.14, E: 22.3, F: 20.42, H: 24.14, I: 9.29, L: 20.42, M: 27.85, N: 24.14, O: 26.0, T: 20.42, U: 24.14};
  const SHAPE = Object.fromEntries(Object.entries(G).map(([c, s]) => [c, s.split("|").map((r) => r.split(" ").map((p) => p.split(",").map(Number)))]));
  const WORDS = [["THE", -32.7, [-0.38, 21.11, 46.33]], ["BOHEMIAN", -4.2, [-2.24, 22.97, 50.05, 75.26, 98.63, 127.54, 137.9, 163.11]], ["FOOTBALL", 23.9, [-2.24, 19.25, 46.33, 73.4, 94.89, 120.1, 145.31, 166.8]], ["CLUB", 52.4, [-1.37, 23.84, 45.33, 70.54]]];
  const WX = 74.7, LT = 6, R = 60, RF = 46, ZD = 4, CX = 97, S = 1.1, RAD = 34; // S is the faced scale; the isometric view is a little closer

  const LET = [];
  WORDS.forEach(([w, yb, offs]) => [...w].forEach((ch, j) => {
    const polys = SHAPE[ch].map((c) => c.map(([x, y]) => [WX + offs[j] + x, yb + y]));
    const xs = polys.flat().map((p) => p[0]);
    LET.push({ ch, w, polys, x0: Math.min(...xs), x1: Math.max(...xs), y0: yb - 23, y1: yb, cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: yb - 11.5 });
  }));

  /** The band's lettering, set along two arcs: over the top reading outwards, DUBLIN under the bottom reading upright. */
  function arc(text, r, mid, top) {
    const sc = 7 / 23, tr = 0.5, wid = [...text].reduce((a, ch) => a + (ch === " " ? 3.5 : ADV[ch] * sc + tr), 0);
    let a = mid - (top ? 1 : -1) * wid / 2 / r;
    const out = [];
    for (const ch of text) {
      const step = (ch === " " ? 3.5 : ADV[ch] * sc + tr) / r;
      if (ch !== " ") {
        const o = [Math.cos(a), Math.sin(a)], t = top ? [-o[1], o[0]] : [o[1], -o[0]], up = top ? o : [-o[0], -o[1]];
        for (const c of SHAPE[ch]) out.push(c.map(([x, y]) => [r * o[0] + x * sc * t[0] - y * sc * up[0], r * o[1] + x * sc * t[1] - y * sc * up[1]]));
      }
      a += (top ? 1 : -1) * step;
    }
    return out;
  }
  const BAND = arc("BOHEMIAN FOOTBALL CLUB", 49.5, -Math.PI / 2, true).concat(arc("DUBLIN", 56.5, Math.PI / 2, false));

  /** The shield, the towers on it, the ribbon's two tails, the ball's panels. */
  const SHIELD = fillet([[-33, -20], [-21, -16.5], [-8, -19], [0, -21.5], [8, -19], [21, -16.5], [33, -20], [31, 8], [24, 24], [12, 34], [0, 40], [-12, 34], [-24, 24], [-31, 8]],
    [2.5, 3, 3, 2, 3, 3, 2.5, 6, 6, 5, 1.5, 5, 6, 6]);
  const TOWER = [[-3.2, 0], [-3.2, -11], [-1.8, -11], [-1.8, -9.6], [-0.7, -9.6], [-0.7, -11], [0.7, -11], [0.7, -9.6], [1.8, -9.6], [1.8, -11], [3.2, -11], [3.2, 0]];
  const TOWERS = [[-19, -1], [-8, -1], [8, -1], [19, -1], [-5.5, 25], [5.5, 25]];
  const tail = (s) => fillet([[s * 50, 32], [s * 64, 27], [s * 61, 34], [s * 69, 39], [s * 55, 44]], [1, 1.5, 0.6, 1.5, 2]);
  const BALL = [0, -31.5], BR = 10;

  function mount({ stage, svg, read }, value) {
    const bag = disposer();
    let LIFT = value, act = -1;
    const tw = tween(0), hop = LET.map(() => spring(0));
    const C = Cam(45, 0.5, S);
    const at = (t) => { C.az = rad(lerp(45, 0, t)); C.k = lerp(0.5, 1, t); C.S = lerp(1.3, S, t); C.ox = 0; C.oy = 0; const [a, b] = proj(C)(CX, 0, ZD / 2); C.ox = 200 - a; C.oy = 166 - b; return proj(C); };
    const g = mk("g", {}, svg);

    // back to front: the ribbon's tails, the plate, its band and field, the ball, the shield and towers, then the letters
    const tails = [-1, 1].map(() => [mk("path", { class: "lo" }, g), mk("path", {}, g)]);
    const disc = solid(g), field = mk("path", { class: "nf" }, g), band = mk("path", { class: "nf" }, g);
    const seps = [0, 1].map(() => flatDot(g, C, 1.2, "dot m"));
    const ball = solid(g), panels = mk("path", { class: "nf" }, g);
    const shLo = mk("path", { class: "lo" }, g), shTop = mk("path", {}, g), shIn = mk("path", { class: "nf lo" }, g);
    const tw6 = TOWERS.map(() => [mk("path", { class: "lo" }, g), mk("path", {}, g)]);
    const flames = TOWERS.map(() => flatDot(g, C, 1, "dot m"));
    const lg = mk("g", {}, g);
    const lets = LET.map(() => { const e = mk("g", {}, lg); return { g: e, lo: mk("path", { class: "lo" }, e), top: mk("path", {}, e) }; });
    ball.sil.classList.add("hi");
    const ring = (rr, cx, cy) => circ(rr, 96).map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
    const dR = ring(R, 0, 0), dI = ring(R - 1.4, 0, 0), bR = ring(BR, ...BALL), bI = ring(BR - 1, ...BALL);
    let order = "";

    const B = register(stage, (dt, now) => {
      let m = !tdone(tw, now);
      hop.forEach((h) => { if (stepS(h, dt)) m = true; });
      const P = at(tval(tw, now)), front = facing(C), s = Math.sin(C.az), c = Math.cos(C.az);
      const pl = (pts, z) => poly(pts.map(([x, y]) => P(x, y, z)));
      tails.forEach(([lo, top], j) => { const t = tail(j ? 1 : -1); lo.setAttribute("d", pl(t, 0)); top.setAttribute("d", pl(t, ZD)); });
      put(disc, prism(P, front, dR, dI, 0, ZD));
      field.setAttribute("d", pl(circ(RF, 96).map((q) => [q.u, q.v]), ZD));
      band.setAttribute("d", BAND.map((c2) => pl(c2, ZD)).join(""));
      [-1, 1].forEach((sg, j) => place(seps[j], P(sg * 53 * Math.cos(rad(38)), 53 * Math.sin(rad(38)), ZD)));
      for (const [d, r0] of seps.map((e) => [e, 1.2]).concat(flames.map((e) => [e, 1]))) { d.setAttribute("rx", String(r0 * C.S)); d.setAttribute("ry", String(r0 * C.S * C.k)); }
      put(ball, prism(P, front, bR, bI, ZD, ZD + 7));
      const pent = [0, 1, 2, 3, 4].map((i) => [BALL[0] + 3.6 * Math.cos(rad(-90 + i * 72)), BALL[1] + 3.6 * Math.sin(rad(-90 + i * 72))]);
      panels.setAttribute("d", pl(pent, ZD + 7) + pent.map(([x, y]) => seg(P(x, y, ZD + 7), P(BALL[0] + (x - BALL[0]) * 2.6, BALL[1] + (y - BALL[1]) * 2.6, ZD + 7))).join(""));
      shLo.setAttribute("d", pl(SHIELD, ZD)); shTop.setAttribute("d", pl(SHIELD, ZD + 3));
      shIn.setAttribute("d", pl(SHIELD.map(([x, y]) => [x * 0.9, y * 0.9 + 1.5]), ZD + 3));
      TOWERS.forEach(([tx, ty], j) => {
        const pts = TOWER.map(([x, y]) => [tx + x, ty + y]);
        tw6[j][0].setAttribute("d", pl(pts, ZD + 3)); tw6[j][1].setAttribute("d", pl(pts, ZD + 5));
        place(flames[j], P(tx, ty - 13, ZD + 5));
      });
      // letters, painted far to near for this camera; each hops up off the plate, and up the page once it is faced
      const ord = LET.map((L, i) => [L.cx * s + L.cy * c, i]).sort((a, b) => a[0] - b[0]).map((q) => q[1]);
      if (ord.join() !== order) { order = ord.join(); ord.forEach((i) => lg.append(lets[i].g)); }
      LET.forEach((L, i) => {
        const h = hop[i].x, q = (z) => L.polys.map((pts) => poly(pts.map(([x, y]) => P(x, y - h * 0.6, z + h)))).join("");
        lets[i].lo.setAttribute("d", q(0)); lets[i].top.setAttribute("d", q(LT));
      });
      return m;
    });
    bag.add(B.unregister);

    /** The pointer on the plate, as the faced camera will see it: the target pose, not the one on screen. */
    function onPlate(p) {
      const T = { az: 0, k: 1, S, ox: 200 - S * CX, oy: 166 };
      return unproj(T, p[0], p[1], 0);
    }
    function move(p) {
      const now = performance.now(), [wx, wy] = onPlate(p);
      tset(tw, 1, now, 0);
      let a = -1;
      LET.forEach((L, i) => {
        const d = Math.hypot(wx - L.cx, wy - L.cy), f = d < RAD ? (1 - d / RAD) ** 2 : 0;
        hop[i].t = LIFT * clamp(f, 0, 1);
        if (wx > L.x0 - 1.5 && wx < L.x1 + 1.5 && wy > L.y0 - 2 && wy < L.y1 + 2) a = i;
      });
      if (a !== act) {
        act = a;
        lets.forEach((E, i) => E.top.classList.toggle("hi", i === a));
        ball.sil.classList.toggle("hi", a < 0);
      }
      read.textContent = a >= 0 ? `${LET[a].w.toLowerCase()} · ${LET[a].ch}` : Math.hypot(wx, wy) < R ? "crest" : "mark";
      B.wake();
    }
    function leave() {
      tset(tw, 0, performance.now(), 0);
      hop.forEach((h) => { h.t = 0; });
      act = -1; lets.forEach((E) => E.top.classList.remove("hi")); ball.sil.classList.add("hi");
      read.textContent = "rest"; B.wake();
    }
    read.textContent = "rest";
    bag.add(pointer(stage, { move, down: move, leave }));
    bag.add(() => svg.replaceChildren());
    return { set: (v) => { LIFT = v; B.wake(); }, destroy: bag.dispose };
  }

  hairline({
    name: "bohs",
    means: "The Bohemian FC crest and wordmark: an isometric outline that turns to face you, its letters hopping as the pointer passes.",
    rules: [2, 3, 8, 10],
    range: [3, 6, 9],
    tour: [[93, 166], [244, 149], [293, 180], [238, 211], null],
    mount,
  });
})();
