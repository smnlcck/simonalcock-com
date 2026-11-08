/*
 * Case studies: mounts one Hairline figure into each card's illustration panel.
 *
 * The figure scripts call hairline({ name, means, rules, range, tour, mount }) when they load.
 * This file defines that function first, so each figure registers itself here, and then
 * mounts every [data-figure] stage on the page with the figure of that name.
 *
 * Each figure plays its own tour (an unseen pointer) until a real pointer arrives, and hands
 * back to the tour when it leaves. The engine pauses figures that are offscreen and, when the
 * reader asks for reduced motion, lands every movement at once and does not play the tour.
 */
(() => {
  const figures = {};
  window.hairline = (figure) => { figures[figure.name] = figure; };

  function mountAll() {
    HL.inject(document);
    document.querySelectorAll("[data-figure]").forEach((stage) => {
      const figure = figures[stage.dataset.figure];
      if (!figure) return;
      stage.setAttribute("data-hairline", figure.name);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
      // the figures name what is under the pointer; this section has no read-out, so the names are dropped
      const read = { textContent: "" };
      figure.mount({ stage, svg, read }, figure.range[1]);
      if (stage.dataset.autoplay !== "false") HL.tour(stage, figure.tour || HL.LAP, () => {});
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();
})();
