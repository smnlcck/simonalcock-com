/*
 * Stack-scroll reveal for the case study cards.
 *
 * The cards sit on top of each other in a deck pinned to the viewport. Each card behind the
 * front one is a little smaller and peeks out underneath it. As you scroll, the front card
 * slides up and away, tilting back, while every card behind it moves forward one place. One
 * card leaves per step of scrolling; the last card stays, and the page scrolls on past it.
 *
 * It only runs where it works: on screens wide enough for the two-column card, when the
 * tallest card fits in the window, and when the reader has not asked for reduced motion.
 * Anywhere else the deck is the plain stacked list, unchanged.
 */
(() => {
  const deck = document.querySelector("[data-stack-reveal]");
  if (!deck) return;
  const cards = [...deck.querySelectorAll(".case")];
  const N = cards.length;
  if (N < 2) return;

  // Scroll per card, as a share of the window's height, and the rests around the run.
  const STEP = 0.9;      // scroll between one card leaving and the next
  const HOLD_IN = 0.3;   // steps the first card rests in front before it leaves
  const HOLD_OUT = 0.35; // steps the last card rests before the page scrolls on
  const FLIGHT = 0.82;   // share of each step the move takes; the rest is a rest

  // The look, matching the Framer reference.
  const SHRINK = 0.1;    // each place back is 10% smaller
  const PEEK = 30;       // px: how far the cards behind show below the front one, in total
  const TILT = 15;       // degrees the leaving card tips back

  const fitsQuery = matchMedia("(min-width: 881px) and (prefers-reduced-motion: no-preference)");
  let active = false, vh = 0, step = 0, cardH = 0, frame = 0, stickTop = 0;

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function fits() {
    if (!fitsQuery.matches) return false;
    const tallest = Math.max(...cards.map((c) => c.offsetHeight));
    return tallest + PEEK + 48 <= window.innerHeight;
  }

  function layout() {
    vh = window.innerHeight;
    step = vh * STEP;
    cardH = Math.max(...cards.map((c) => c.offsetHeight));
    // The pinned box is only as tall as the tallest card, centred in the window (the cards
    // behind peek out below it), so the deck keeps the section's spacing above and below.
    const boxH = cardH;
    stickTop = Math.max(0, Math.round((vh - boxH - PEEK) / 2));
    deck.style.setProperty("--stick-top", `${stickTop}px`);
    deck.style.setProperty("--stick-h", `${boxH}px`);
    deck.style.height = `${Math.round(boxH + (HOLD_IN + (N - 1) + HOLD_OUT) * step)}px`;
  }

  function setActive(on) {
    if (on === active) return;
    active = on;
    deck.classList.toggle("is-active", on);
    if (on) { layout(); render(); return; }
    deck.style.height = "";
    deck.style.removeProperty("--stick-top");
    deck.style.removeProperty("--stick-h");
    cards.forEach((c) => { c.style.transform = ""; c.style.zIndex = ""; });
  }

  /** Where the deck is, in cards: 0 with the first in front, N - 1 with the last. */
  function position() {
    const scrolled = stickTop - deck.getBoundingClientRect().top;
    const t = clamp(scrolled / step - HOLD_IN, 0, N - 1);
    const i = Math.min(Math.floor(t), N - 2), f = t - i;
    return i + ease(clamp(f / FLIGHT, 0, 1));
  }

  function render() {
    frame = 0;
    if (!active) return;
    const pos = position();
    const away = vh / 2 + cardH + 80; // far enough up to clear the window, tilt included
    cards.forEach((card, k) => {
      const s = k - pos; // places behind the front; negative while leaving
      let y, rx = 0, sc;
      if (s >= 0) {
        sc = 1 - SHRINK * s;
        y = PEEK * (1 - Math.pow(0.55, s));
      } else {
        const u = Math.min(1, -s);
        sc = 1 + 0.04 * u;
        y = -away * u;
        rx = TILT * u;
      }
      card.style.transform = `perspective(1600px) translate3d(0, ${y.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      card.style.zIndex = String(N - k);
    });
  }

  const request = () => { if (!frame) frame = requestAnimationFrame(render); };

  function refresh() {
    // measure as a plain list first, so a card's natural height decides whether the deck fits
    const was = active;
    if (was) setActive(false);
    setActive(fits());
  }

  // Keyboard: focusing a link in a card that is behind or gone scrolls the deck to that card.
  deck.addEventListener("focusin", (e) => {
    if (!active) return;
    const k = cards.findIndex((c) => c.contains(e.target));
    if (k < 0) return;
    const top = deck.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.round(top - stickTop + (HOLD_IN + k) * step), behavior: "auto" });
  });

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => { refresh(); request(); });
  fitsQuery.addEventListener("change", refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  refresh();
})();
