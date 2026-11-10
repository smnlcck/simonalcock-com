# simonalcock-com

Homepage for simonalcock.com, combining the approved section components into one page:

1. Header: [header-component-1](https://github.com/smnlcck/header-component-1). The logo flies from a full-screen intro and docks into an 80px bar.
2. Hero: [hero-hero-existing](https://github.com/smnlcck/hero-hero-existing), with the five role tabs.
3. Case studies: [case-studies](https://github.com/smnlcck/case-studies), a scroll-stack deck with Hairline figures.
4. Work: [works-existing](https://github.com/smnlcck/works-existing), the 3/2/1-column grid.
5. Skills and Values: recreated from the simonalcock.ie homepage as plain HTML/CSS (three groups of three, in one card).
6. Learning: [learning-learning-existing](https://github.com/smnlcck/learning-learning-existing), converted from React to plain HTML/JS.
7. Get in touch: a button linking to simonalcock.ie/contact/.

## Changes from the individual components

- Case studies, Work and Learning each have an H2 at 50px/60px in EudoxusSans-Medium (32px/40px on phones).
- The header has no nav links, only the `.simon` logo and the Contact button (EudoxusSans), so the hero tabs are the first choice visitors see.
- All sections share one column width, so headings line up with the hero text.
- The hero's fixed 25px frame became a 25px inset around the hero card, including the top, so it sits 25px below the docked header.
- The header is fixed only while the logo travels to its docked position; after that it scrolls off with the page.
- Hero pause: scrolling down, the page stops when the white hero card's top edge reaches the top of the screen. It holds for at least 0.6s and absorbs wheel/trackpad momentum (1.6s at most), so visitors scroll again to move on. A downward scroll that comes to rest just above the point glides into place (0.8s ease-in-out). In-page links and the scroll buttons pass straight through; the pause re-arms once you scroll back above it.
- Sections are 80px apart. The case-studies deck pins a card-sized box centred in the window, so it keeps that spacing.
- Work tile titles are H3s.
- The Bohemian FC card uses the Settle figure from `@lucasmarkes/hairline` (v0.5.1), bundled on its own as `js/figures/settle.js` and mounted without React. It is patched so that, after the camera is fitted to the original layout (same scale as the package), any tile whose starting position would fall outside the card image (outside svg x 52–348 at `--z: 1.15`, about 35px clear at desktop size even while the tour plays) is pulled toward the hub until it fits; every other tile, and the settled tree, is unchanged.

## Intro wordmark (TechText)

The intro screen shows `.simon` at 80px as a TechText canvas, ported from the Framer "Tech Text" code component (React Bits) to plain JavaScript. Source: `src/techtext.ts`; built to `js/techtext.js` with `npx esbuild src/techtext.ts --bundle --format=iife --minify --outfile=js/techtext.js`. Letters turn to dashed outlines under the pointer with a selection frame, specks and size labels; an idle sweep runs when the pointer is away; letters can be dragged or clicked and spring back. When scrolling starts, the effects switch off and the canvas (pinned in place) fades into the DOM logo, which flies up and docks in the header with no effects.

## Custom cursor

Recreated from the Framer "Cursor-dark" component: a 40px circle, rgba(0,0,0,.7) at 40% opacity, that shrinks to 32px at full opacity while pressed (spring, bounce .2, .4s). It only appears on devices with a mouse or trackpad; touch screens are unchanged.

## Caching

Script links carry a `?v=` content hash (added at build time), so browsers fetch a changed script straight away instead of using a cached copy.

## Fonts

All fonts are served from this repo as WOFF2 files in `fonts/` and the two used at first paint are preloaded, so every browser loads them (simonalcock.ie blocks its own copies on other domains: no `Access-Control-Allow-Origin` header).

- **Eudoxus Sans** (SIL Open Font License 1.1; by stijndevries, based on Plus Jakarta Sans by Tokotype): ExtraLight 200, Light 300, Regular 400, Medium 500, ExtraBold 800 as the `"Eudoxus Sans"` family. Titles, labels and buttons use the Medium cut under the name `"EudoxusSans-Medium"` at weight 400; body copy uses `"Eudoxus Sans"` Regular (400), and the bold phrases in the case studies use Medium (500). There is no 700 (Bold) file.
- **Aeonik Fono** (commercial, CoType Foundry), used for the `.simon` logo. This repo is public, so check its licence allows web embedding from here.

## Licences

Hairline engine: MIT, see `js/HAIRLINE-LICENSE.txt`.
