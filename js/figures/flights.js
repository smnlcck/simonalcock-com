/* Hairline figure: flights. Built with the hairline-create skill on the engine of
 * @lucasmarkes/hairline (MIT, see ../HAIRLINE-LICENSE.txt). Wrapped so its names stay
 * private; it registers itself through the page's hairline() function. */
(() => {
  /**
   * Flights: a desktop flight-results page lying on the desk. A header, a row
   * of date tabs (the chosen day raised, sold-out days only dashed), a sort
   * pill, and three result cards. Each card carries its route on the left and
   * two fare panels on the right, standing as tall as their price, so the page
   * at rest is already a little bar chart. A cursor floats over the page and
   * follows the pointer; the fare it points at lifts out of its card, its
   * neighbours following, staggered by distance. The sold-out fare is a dashed
   * outline that cannot be taken. The slider is the lift.
   */
  const {
    Cam, fit, proj, unproj, facing, rings, prism, rrect, ringAt, poly, seg, fillet,
    clamp, spring, stepS, tween, tset, tval, tdone, mk, solid, put, flatDot, place,
    register, pointer, disposer,
  } = HL;

  const W = 160, H = 124, Z0 = 3, CZ = 5;
  const TABS = [0, 2, 0, 1, 2, 0, 0]; // 0 a day, 1 the chosen day, 2 sold out
  const CARDS = [55, 77, 99], CH = 18;
  const FLIGHT = ["105", "107", "174"];
  const PRICE = [[374.72, 1564.72], [0, 1879.62], [758.47, 2134.97]]; // 0: sold out
  const PX = [[96, 124.5], [125.5, 153.5]];
  const tall = (p) => 2.2 + 8 * (p / 2135);

  /** Fare panel k: card c, cabin j (0 economy, 1 business), footprint and resting height. */
  const FARES = [];
  CARDS.forEach((y, c) => PX.forEach(([x0, x1], j) => FARES.push({ c, j, x0, x1, y0: y + 0.6, y1: y + CH - 0.6, h: PRICE[c][j] ? tall(PRICE[c][j]) : 0 })));

  /** The cursor's outline, in its own units: tip at the origin, the tail running down-right on screen. */
  const ARROW = fillet([[0, 0], [0, 17], [4, 13.2], [7, 19.6], [10.2, 18.3], [7.2, 12], [12.6, 12]], [0.6, 1, 0.8, 1, 1, 0.8, 1]);

  function mount({ stage, svg, read }, value) {
    const bag = disposer();
    let lift = value;

    const C = Cam(45, 0.5, 1.68);
    fit(C, [[0, 0, 0], [W, 0, 0], [0, H, 0], [W, H, 0], [96, 55, CZ + 10 + 26], [153, 117, CZ + 10 + 26], [110, 56, CZ + 4 + 26 + 19 - 16], [30, 40, 40]], 200, 170);
    const P = proj(C), front = facing(C);
    const at = (x, y, z) => P(x, y, z);
    const flat = (x0, y0, x1, y1, r, z) => poly(ringAt(P, rrect(x0, y0, x1, y1, r, 4), z));
    const block = (g, x0, y0, x1, y1, r, b, z0, z1) => { const [o, i] = rings(x0, y0, x1, y1, r, b); const s = solid(g); put(s, prism(P, front, o, i, z0, z1)); return s; };
    const dot = (g, x, y, z, r, cls) => place(flatDot(g, C, r, cls), at(x, y, z));

    const g = mk("g", {}, svg);

    // the page: a slab, its header, the trip line and the heading
    block(g, 0, 0, W, H, 6, 1.6, 0, Z0);
    mk("path", { class: "nf lo", d: seg(at(4, 13, Z0), at(W - 4, 13, Z0)) + seg(at(4, 23, Z0), at(W - 4, 23, Z0)) }, g);
    mk("path", { class: "nf", d: flat(134, 3.5, 152, 9.5, 3, Z0) + flat(66, 15.5, 77, 20.5, 2.5, Z0) }, g);
    mk("path", { class: "nf lo", d: seg(at(8, 6.5, Z0), at(30, 6.5, Z0)) + seg(at(8, 18, Z0), at(58, 18, Z0)) + seg(at(138, 18, Z0), at(150, 18, Z0)) }, g);
    mk("path", { class: "nf", d: seg(at(8, 28.5, Z0), at(64, 28.5, Z0)) }, g);

    // the date tabs: days as low plates, sold-out days dashed, the chosen day raised; the cheapest day carries its badge
    let mark = null;
    block(g, 41, 30.5, 53, 33.4, 1.2, 0.5, Z0, Z0 + 0.8);
    TABS.forEach((t, i) => {
      const x0 = 9 + i * 20.6, x1 = x0 + 19.4;
      if (t === 2) { mk("path", { class: "nf dash", d: flat(x0, 34, x1, 43, 2.5, Z0) }, g); return; }
      const s = block(g, x0, 34, x1, 43, 2.5, 0.9, Z0, Z0 + (t ? 4 : 1.2));
      mk("path", { class: "nf lo", d: seg(at(x0 + 5, 38.5, Z0 + (t ? 4 : 1.2)), at(x1 - 5, 38.5, Z0 + (t ? 4 : 1.2))) }, g);
      if (t) { mark = s.sil; mark.classList.add("hi"); }
    });
    block(g, 120, 46, 153, 51.5, 2.6, 0.8, Z0, Z0 + 1.2);
    mk("path", { class: "nf lo", d: seg(at(146, 47.6, Z0 + 1.2), at(149, 49.9, Z0 + 1.2)) }, g);

    // the cards: a plate, the route on the left, two fare panels on the right
    const fares = [];
    CARDS.forEach((y, c) => {
      block(g, 6, y, 154, y + CH, 2.8, 1, Z0, CZ);
      const m = y + 6;
      mk("path", { class: "nf lo", d: seg(at(16, m, CZ), at(70, m, CZ)) + seg(at(10, y + 13.5, CZ), at(26, y + 13.5, CZ)) + seg(at(64, y + 13.5, CZ), at(76, y + 13.5, CZ)) }, g);
      dot(g, 12, m, CZ, 1.5, "dot");
      dot(g, 74, m, CZ, 1.5, "dot");
      dot(g, 43, m, CZ, 0.9, c === 2 ? "dot m" : "dot off");
      FARES.forEach((f, k) => {
        if (f.c !== c) return;
        if (!f.h) { mk("path", { class: "nf dash", d: flat(f.x0, f.y0, f.x1, f.y1, 2.2, CZ) }, g); fares[k] = null; return; }
        const s = solid(g), top = mk("path", { class: "nf lo" }, g), knob = mk("path", { class: "nf" }, g);
        fares[k] = { f, s, top, knob, z: tween(0), last: -1 };
      });
    });

    // the cursor: a thin plate with its tip lowest, and a dashed drop to what is under it
    const drop = mk("path", { class: "dash nf" }, svg);
    const cg = mk("g", {}, svg), cBack = mk("path", { class: "lo" }, cg), cFace = mk("path", { class: "sil" }, cg);
    const PARK = [64, 58, 26];
    const cur = PARK.map((v) => spring(v));

    function drawFare(fa, z) {
      if (Math.abs(z - fa.last) < 0.01) return;
      fa.last = z;
      const { x0, x1, y0, y1, h } = fa.f, zt = CZ + h + z;
      const [o, i] = rings(x0, y0, x1, y1, 2.2, 0.9);
      put(fa.s, prism(P, front, o, i, CZ, zt));
      fa.top.setAttribute("d", seg(at(x0 + 3, y0 + 5, zt), at(x0 + 13, y0 + 5, zt)) + seg(at(x0 + 3, y1 - 4, zt), at(x0 + 17, y1 - 4, zt)));
      fa.knob.setAttribute("d", flat(x1 - 8, y0 + 6, x1 - 3.5, y0 + 10.5, 2.25, zt));
    }

    function drawCursor() {
      // upright, facing the viewer, leaning back 30°: right is (1, -1), down leans toward the viewer
      const [x, y, z] = cur.map((s) => s.x), k = 0.95, sn = 0.5 * 0.707, cs = 0.866;
      const pt = (q, d) => at(x + (q[0] * 0.707 + q[1] * sn) * k - d, y + (-q[0] * 0.707 + q[1] * sn) * k - d, z - q[1] * cs * k);
      cBack.setAttribute("d", poly(ARROW.map((q) => pt(q, 1.2))));
      cFace.setAttribute("d", poly(ARROW.map((q) => pt(q, 0))));
      const under = act >= 0 ? CZ + fares[act].f.h + tval(fares[act].z, performance.now()) : Z0;
      drop.setAttribute("d", z - under > 2 ? seg(at(x, y, z - 1), at(x, y, under)) : "");
    }

    let act = -1;
    const B = register(stage, (dt, now) => {
      let moving = false;
      fares.forEach((fa) => { if (fa) { drawFare(fa, tval(fa.z, now)); if (!tdone(fa.z, now)) moving = true; } });
      cur.forEach((s) => { if (stepS(s, dt)) moving = true; });
      drawCursor();
      return moving;
    });
    bag.add(B.unregister);

    /** The fare under a screen point, tested against each panel's resting top; -1 for none. Sold-out panels answer with -2 - k. */
    let spot = null;
    function hit([sx, sy]) {
      let best = -1, bd = Infinity;
      FARES.forEach((f, k) => {
        const [wx, wy] = unproj(C, sx, sy, CZ + f.h);
        if (wx < f.x0 - 0.8 || wx > f.x1 + 0.8 || wy < f.y0 - 0.8 || wy > f.y1 + 0.8) return;
        const d = Math.hypot(wx - (f.x0 + f.x1) / 2, wy - (f.y0 + f.y1) / 2);
        if (d < bd) { bd = d; best = f.h ? k : -2 - k; spot = [wx, wy]; }
      });
      return best;
    }

    function setActive(a) {
      if (a === act) return;
      const now = performance.now(), from = a >= 0 ? a : act;
      act = a;
      fares.forEach((fa, k) => {
        if (!fa) return;
        const same = a >= 0 && fa.f.c === FARES[a].c;
        tset(fa.z, k === a ? lift : same ? lift * 0.3 : 0, now, from >= 0 ? Math.abs(k - from) * 45 : 0);
        fa.s.sil.classList.toggle("hi", k === a);
      });
      mark.classList.toggle("hi", a < 0);
      B.wake();
    }

    function move(p) {
      const a = hit(p), f = a >= 0 ? FARES[a] : a <= -2 ? FARES[-2 - a] : null;
      setActive(a >= 0 ? a : -1);
      read.textContent = f ? FLIGHT[f.c] + (a <= -2 ? " sold" : f.j ? " biz" : " eco") : "page";
      // over a fare the cursor hovers just above its top and rides it up; elsewhere it hovers over the page
      const z = f ? CZ + f.h + (a >= 0 ? lift : 0) + 19 : Z0 + 22;
      const [wx, wy] = f ? spot : unproj(C, p[0], p[1], z);
      cur[0].t = clamp(wx, -6, W + 6); cur[1].t = clamp(wy, -6, H + 6); cur[2].t = z;
      B.wake();
    }

    function leave() {
      setActive(-1);
      read.textContent = "rest";
      PARK.forEach((v, i) => { cur[i].t = v; });
      B.wake();
    }

    read.textContent = "rest";
    bag.add(pointer(stage, { move, down: move, leave }));
    bag.add(() => { svg.replaceChildren(); });

    return {
      set: (v) => { lift = v; if (act >= 0) { const a = act; act = -1; setActive(a); } },
      destroy: bag.dispose,
    };
  }

  hairline({
    name: "flights",
    means: "A flight results page: a cursor drifts over the fares, and the one it points at lifts out of its card.",
    rules: [1, 2, 5, 8],
    range: [12, 18, 26],
    tour: [[150, 172], [233, 185], [242, 207], [181, 209], null],
    mount,
  });
})();
