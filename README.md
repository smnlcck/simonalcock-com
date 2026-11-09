# simonalcock-com

Homepage for simonalcock.com, combining the approved section components into one page:

1. Header: [header-component-1](https://github.com/smnlcck/header-component-1). The logo flies from a full-screen intro and docks into an 80px bar.
2. Hero: [hero-hero-existing](https://github.com/smnlcck/hero-hero-existing), with the five role tabs.
3. Case studies: [case-studies](https://github.com/smnlcck/case-studies), a scroll-stack deck with Hairline figures.
4. Work: [works-existing](https://github.com/smnlcck/works-existing), the 3/2/1-column grid.
5. Learning: [learning-learning-existing](https://github.com/smnlcck/learning-learning-existing), converted from React to plain HTML/JS.

## Changes from the individual components

- Case studies, Work and Learning each have an H2 at 50px/60px in EudoxusSans-Medium (32px/40px on phones).
- The header links and Contact button use EudoxusSans.
- All sections share one column width, so headings line up with the hero text.
- The hero's fixed 25px frame became a 25px inset around the hero card, including the top, so it sits 25px below the docked header.
- The header is fixed only while the logo travels to its docked position; after that it scrolls off with the page.
- Sections are 80px apart. The case-studies deck pins a card-sized box centred in the window, so it keeps that spacing.
- Work tile titles are H3s.
- The Bohemian FC card uses the Settle figure from `@lucasmarkes/hairline` (v0.5.1), bundled on its own as `js/figures/settle.js` and mounted without React.

## Intro wordmark (TechText)

The intro screen shows `.simon` at 50px as a TechText canvas, ported from the Framer "Tech Text" code component (React Bits) to plain JavaScript. Source: `src/techtext.ts`; built to `js/techtext.js` with `npx esbuild src/techtext.ts --bundle --format=iife --minify --outfile=js/techtext.js`. Letters turn to dashed outlines under the pointer with a selection frame, specks and size labels; an idle sweep runs when the pointer is away; letters can be dragged or clicked and spring back. When scrolling starts, the canvas hands over to the DOM logo, which flies up and docks in the header.

## Custom cursor

Recreated from the Framer "Cursor-dark" component: a 40px circle, rgba(0,0,0,.7) at 40% opacity, that shrinks to 32px at full opacity while pressed (spring, bounce .2, .4s). It only appears on devices with a mouse or trackpad; touch screens are unchanged.

## Fonts

The licensed fonts (EudoxusSans-Medium, AeonikFono-Regular) load from simonalcock.ie and are not stored in this repo. simonalcock.ie must send an `Access-Control-Allow-Origin` header for the font files, or browsers on other domains (github.io, simonalcock.com) will block them and fall back to Helvetica.

## Licences

Hairline engine: MIT, see `js/HAIRLINE-LICENSE.txt`.
