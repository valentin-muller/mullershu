# Környék-legyező — látványterv, 2026-09-27

Státusz: első, felhasználói mintaképre épülő terv; még nem elfogadott webes megvalósítás. A futó oldal ebben a körben nem változott. Built-in ImageGen; nem Blender-modell és nem hiteles helyszínfotó. A webes változatban külön képrétegek és HTML-feliratok szükségesek, a tervképet nem használjuk teljes képernyős felületként.

## Irány

Mellow bézs háttér, kalligrafikus Müllers 2 cím. „Az egész ház. Csak nektek.” és „Privát wellnessház a belváros szívében. ❤️”. Hat legyezős helyszínkép, felül olvasható menetidőkkel. A fotókból pontosított ház enyhe elfordulással és látható M-oromdísszel az előtérben, rövid sétálóutcai térkőszakasszal. A zöld vázas két féltető és a cégtábla megmarad. Foglalási működés változatlan, Időpontok hamarosan.

Mobil: a ház és fő állítás önállóan jól látható; helyszínek natívan vízszintesen lapozható képsorban, teljes feliratokkal. Nem zsugorítjuk a hatlapos kompozíciót telefonméretre. A díszlet nem földrajzi térkép.

## Ellenőrzött gyalogos útvonalak

Kiindulás mindenhol: Kálmán Imre sétány 9., Siófok. Google Maps gyalogos útvonal, ellenőrizve böngészőben 2026-09-27. Tájékoztató menetidők, nem garantált időtartamok.

| Felirat | Célpont | Menetidő | Úthossz |
|---|---|---|---|
| Víztorony | Siófoki Víztorony | 4 perc | 290 m (alternatíva 280 m) |
| Rózsakert | Rózsakert Siófok térképes helypont | 12 perc | 950 m |
| Balaton | Siófoki hajóállomás, parti végpont | 10 perc | 750 m |
| Petőfi sétány | Google Maps Petőfi sétány helypont (nem a sétány legközelebbi széle) | 13 perc | 950 m |
| PLÁZS | PLÁZS Siófok, Petőfi sétány 3. | 11 perc | 750 m |
| Móló | A Béke Jóságos Angyala, keleti móló vége | 15 perc | 1,1 km |

Útvonallink minta: https://www.google.com/maps/dir/?api=1&origin=K%C3%A1lm%C3%A1n+Imre+s%C3%A9t%C3%A1ny+9,+Si%C3%B3fok&destination=PL%C3%81ZS+Si%C3%B3fok&travelmode=walking

## Vizuális források

- Petőfi sétány, városi fotó: https://siofok.hu/helyi-hirek/a-kuria-dontotte-el-a-varos-kormanyhivatal-vitat — térköves korzó, fák, alacsony vendéglátóhelyek, napernyős teraszok, esti fények.
- PLÁZS, városi fotó: https://siofok.hu/helyi-hirek/punkosdi-felvonulas-fo-ter-rozsakert-nagystrand — homokos koncerthelyszín, színpad, oldalsó kijelzők és Balaton-háttér. https://siofok.hu/szolgaltatok/elmeny/plazs-siofok
- Rózsakert: https://siofok.hu/latnivalok/siofok-latnivalok/rozsakert-2 — valós új pergolák és parti kert.
- Keleti móló: https://www.lightphotos.net/photos/displayimage.php?album=234&pid=37669 — piros-fehér jelzőoszlop, arany angyalszobor; a felhasználói terv zöld tornyát pontosítottuk.
- Víztorony: https://siofok.hu/latnivalok/szobrok-2/viztorony

A kutatási fotók vizuális referenciák; publikálási joguk nincs tisztázva, ezért nem lettek az élő oldal képei. A generált kompozíció helyszín-illusztráció, nem dokumentáció. A Balaton túlparti domborzata és a cégtábla perspektívája még illusztratív; végleges asseteknél tovább pontosítandók.

## Megvalósítás — 2026-09-27

A felhasználó jóváhagyta a tervet, a mobil lapozó helyett minden kártyát megtartó réteges elrendezést kért. Elkészült a `codex/mellow-neighborhood-fan` ágon, a korábbi szöveg- és házpontosításokat megőrizve.

- Desktop (>1100px): hat külön döntött kártya egy legyezőben.
- Tablet (601–1100px): két felső, négy alsó kártya.
- Telefon (≤600px): három felső, három alsó kártya. Minimális hero-magasság 930px; a rövidebb telefonon természetes görgetéssel fér el, nem zsugorítjuk a feliratokat.
- A cím és idő külön HTML, Pinyon Script / Work Sans. Mindegyik kártya az ellenőrzött célpont Google Maps gyalogos útvonalára mutat.
- Az új HTML az alapértelmezett, régi `?kornyek=3` linkkel is; a korábbi location.js kísérleti képrétegeket már nem tölti az oldal.
- A ház valódi alpha-csatornás WebP, az új előtéri sétálóutcai burkolattal. A régi házképek megmaradnak.
- Az asztali belépési animáció megmarad 1100px felett és legalább 760px magas ablaknál. Kisebb nézetben természetes görgetés követi a teljes kártyakompozíciót; nincs magas, képernyőn túllógó rögzített jelenet. Csökkentett mozgás és JS nélkül a HTML-kártyák elérhetők.
- Ellenőrizve: desktop 1440×900 és 1280×720; tablet 820×1180; mobil 390×844 és 360×740. Képek betöltődnek, hat cím látható, nincs vízszintes oldaltúlcsordulás; 360px-en a feliratdobozok x=6.7…353.3px között maradnak. Belépési link a bemutatkozáshoz vezet; természetes görgetésnél a fejléc fehérre vált a sötét bemutatkozás fölött. Böngészőkonzol hiba nélkül. Érintett és közös JS syntax-check sikeres; `git diff --check` sikeres.
- A kiadott main package.json nem tartalmaz npm check scriptet; ezért az ellenőrzés `node --check` paranccsal történt.
- Nincs éles publikálás. Az örökölt ajánlati árszöveg továbbra is ellenőrzésre vár.

### Asset-proveniencia

Built-in ImageGen, Blender használata nélkül. A kártyaképek kutatási fotókon alapuló illusztrációk, nem helyszínfotók. A 3×2 generált képatlaszból Sharp exportálta a hat külön WebP képet (szegélyek eltávolítása, kreatív módosítás nélkül). A ház PNG alpha-csatornája WebP-ben megmaradt. Összes új hero-kép kb. 813 KiB.

Generált források a helyi Codex archívumban:
- `exec-2045e19e-bc51-43a4-8d64-c2eae0ce4927.png`: hat helyszín 3×2 képatlasz; utasítás: a jóváhagyott terv hat helyszínének szöveg nélküli exportja, Petőfi/PLÁZS/Rózsakert valódi referenciafotóival, torony, Balaton és piros-fehér mólóoszlop jeleneteivel.
- `exec-55074e2f-d5de-4406-b32f-4c5d220f0134.png`: a house-v2 pontos épületének átlátszó kivágása, a zöld tetők, M-dísz, tábla, kémények és perspektíva megőrzésével; rövid szürke térkősáv, vörös-szürke burkolat a féltető alatt, áttetszőre lágyított szélek.

Webes végfájlok: `assets/house-fan.webp`, `assets/neighborhood/{tower,garden,lake,promenade,plazs,pier}.webp`.


## Fixed compositions revision — 2026-09-27
Supersedes the fluid fan layout after user feedback. Desktop (1400px+) uses a centered 1240px artboard and six fixed tickets. Tablet (761–1399px) uses a 740px artboard with two upper and four lower tickets. Phone uses a 340px artboard with 1 + 2 + 3 rows; below 360px a single discrete 0.9 scale applies. Hero heights are fixed per composition and naturally scroll rather than pinning/zooming the entire scene.

Tickets use a shared SVG curved clip and subtle directional shading, without borders. Explicit row stacking protects lower-row labels. The house overlaps ticket feet only. Header scrolls away in the opening scene, then resumes its existing fixed behavior.

Verified visually at 360px, 390px, 820px and 3440px widths. A 1280px boundary check exposed cropping at the desktop boundary; desktop now starts at 1400px. Checked mobile label bounds and horizontal overflow, image loading, and syntax with node --check (this checkout has no npm check script). Existing copy, booking targets, and other sections preserved. Not published in this revision.


## Mobile bouquet correction — 2026-09-27
User rejected separated rows and undersized house. Latest supplied reference is Screenshot 2026-09-27 at 09.02.19.png. Mobile now uses one tightly nested bouquet: Balaton above PLÁZS / Petőfi, above Víztorony / Rózsakert / Móló. The fixed 340px artwork is 835px tall; row tops 0, 192 and 397–413px. House is 415px wide and overlaps the card bases at 591px. Captions put place name above walking time. Current approved copy remains. Desktop/tablet unaffected. Mobile hero 1220px, with CTA below the house. Checked 390 and 360px, image loading and horizontal overflow; no production release.

## First-screen mobile correction — 2026-09-27
The prior 1220px phone hero made the house invisible in the initial viewport. The phone hero now tracks `100svh + 54px` so the entire artwork is visible before scrolling while the tour link remains below. The cards are vertically condensed while preserving the 1–2–3 bouquet and the 400px house width. Separate fixed coordinates for phone heights at 801–830px, up to 800px, and up to 680px avoid clipping on shorter screens. Checked CSS viewports 390×844, 390×700, and 360×667: house bottom at 827, 683, and 647px respectively; no horizontal overflow and all artwork images loaded. Tablet and desktop layouts are unchanged.


## Proportional portrait correction — 2026-09-27
User rejected the squashed first-screen cards and supplied Photo 2 as proportional authority. The phone version now has a fixed 340×980 title/art composition and a 370px full house silhouette. A single uniform transform fits the complete composition within the small viewport height; no height breakpoints change individual card geometry. Source art geometry: Balaton 214×235, middle tickets 170×270 at y192, lower tickets 120×250 at y410–430, house 370px wide at y580. Middle order is Petőfi left and PLÁZS right as in the latest reference. Shorter devices therefore have wider side margins, preserving proportions and a visible building base together. Verified CSS viewports 390×844 and 360×667, with house bottoms 813 and 637px. Desktop/tablet use display:contents for the new wrapper.

## Larger house and side framing — 2026-09-27
Owner requested a substantially larger building, side-positioned copy and optional plants. Mobile house source width increases from 370 to 500px (about 35%); its roof begins at y540, while the unchanged portrait tickets move up with the art container from y150 to y100. The promise is now a left-aligned Pinyon Script note and the location copy a small uppercase right-aligned note beside the top card. Desktop and tablet keep their centered copy. Two decorative alpha foliage sprites frame the tickets on mobile only.

Foliage was generated with built-in imagegen, not Blender. Source: ~/.codex/generated_images/01a0befc-3884-7f50-913d-9385165af6dc/exec-3ddcedd0-3f3d-4e9b-a12b-b3dbfcee1d1c.png. Prompt: photoreal miniature upright silver-green small-leaf shrub, cream blossoms, warm afternoon light, transparent alpha, no scene/pot/text. Web asset assets/foliage-v1.webp is 129KB and preserves alpha. Decorative images have empty alt and aria-hidden.

Checked CSS viewports 390×844 and 360×667, and desktop 1440px: house fully visible, imagery loaded, no horizontal overflow. At 390px the house image spans x6–384px. Syntax and diff checks passed.

## Entrance and first-paint repair — 2026-09-27
Restores the owner-approved camera approach after the fixed-composition implementation incorrectly bypassed it. Entry scroll space is now reserved by a head-time motion preference class; door and taupe veil are visible layers only in animated mode. Camera zoom targets the house image's brown front door (58.5%,76.5%) and crossfades to the existing doorway render before the introduction. Scroll reverses the same path.

Mobile fit is CSS-only, using a stable small-viewport width expression and container-relative coordinates. Removed late JS fitting, `mobile-fitted`, and the inline scale transform. Initial geometry therefore does not depend on image decoding or `.motion` activation. Resize measurements affect only camera targeting and ignore toolbar events when the stage dimensions stay constant. Static/reduced-motion retain normal flow and the fitted illustration.

Verified mobile 390×844 start, approach, doorway, veil, and reverse scroll. At 360×667 a fresh #haz load has building width 287.29px and bottom635.23px; the first 28.57px scroll retains width287.29px and zoom1. The animation-off control removes the sticky entrance and hides door/veil. Syntax checks and diff check pass.
