# Pizza workshop — final verification, 2026-10-13

Scope: `blog/pizza-workshop/index.html` and `pizza-workshop.css`, compared with the owner-supplied final campaign email. The article is implemented on `codex/pizza-workshop-kampany` in the attached worktree and awaits owner inspection. Local preview: `http://127.0.0.1:8000`. No production release; the original main checkout's status remains unchanged.

## Finish review

Fresh full review: **`ship`**, no material findings across the settled native Safari capture and the desktop, tablet and smaller-phone captures listed below. This disposition applies to the reviewed evidence; it does not approve release or certify untested native interactions.

| Evidence in `review/` | Environment and scope |
| --- | --- |
| `iphone17-safari.png` | Actual iPhone 17 Pro, iOS 26.4 Simulator Safari; settled initial viewport with real status and browser bars. |
| `desktop.png`, `desktop-hero.png` | Supplementary Chromium, 1440 × 1000; full article and initial viewport. |
| `ipad-supplement.png`, `ipad-supplement-hero.png` | Supplementary Chromium, 768 × 1024; full article and initial viewport. |
| `small-phone-supplement.png`, `small-phone-supplement-hero.png` | Supplementary Chromium, 360 × 780; full article and initial viewport. |

`iphone17-safari-initial.png` is retained as an earlier native capture; the finish review used the settled `iphone17-safari.png`. A local declined-consent fixture was used for the native capture and removed afterward; shipped consent remains unchanged.

Native touch, first/reverse scroll and collapsed Safari bars remain **unverified**: the automation tool returned `noWindowsAvailable`. Tablet and smaller-phone captures are Chromium supplements, not iOS Safari evidence.

## Functional and source checks

- Chromium captures loaded successfully without horizontal overflow or page errors. At 320 px, content remains available with JavaScript disabled; reduced-motion scrolling computes to `auto`.
- Article anchors and inquiry links were checked. The mailto recipient is `mullers106@gmail.com`; its template includes school, requested date, student count, children under 14 and companion count. Clicking a link requests correspondence, not a booking.
- `npm run check` and `git diff --check` passed. No page-local JavaScript or new webfont is present.
- Raster provenance scan: **14/14 clear**, run against `blog/pizza-workshop/assets/`. Four retained original JPEGs and their eight responsive WebPs remain photographic evidence; two illustration WebPs are generated art.

## Documentation and asset continuity

The route's existing `DESIGN.md` matches the actual CSS palette, Georgia/Arial stacks, 1100 px container, 900/680/374 px breakpoints, safe-area gutters, fluid/phone headline sizes, 54 px primary link height and reduced-motion behavior. The source HTML reserves intrinsic image dimensions, loads the illustrative hero at high priority and lazy-loads the four real photos. No design drift was found in the scoped record; shared/global design records were not changed.

Illustration provenance pair: `source/email-pizza-reference.jpg` is the exact original image extracted from the final email; `source/pizza-illustration.png` is its generated text-free companion. Exact generation prompt: `source/prompt.txt`; responsive optimizer: `source/optimize.cjs`. Shipping variants and their provenance sidecars live in `blog/pizza-workshop/assets/`. Photograph variant sidecars name the retained source JPEG and `origin/main` commit `37b65d4`; illustration sidecars preserve the exact generation prompt.

`source/prompt.txt` was preserved byte for byte: SHA-256 `3623b16e492d9a61bcce50039b639f8a31d715535aca129801ab51709a655d03`. Source art, optimizer, all variants, review captures and shared product/design files were preserved during this documentation pass.
