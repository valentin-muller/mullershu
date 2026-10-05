# Cloud introduction photo mosaic — 2026-10-05

Approved direction: central short text with small real photo frames around it, following the supplied Network School desktop/mobile references. User authorized building with existing property pictures while searching for real Siófok landmark photographs. Mode: Persuade. The first illustrated hero is preserved byte-for-byte, as are later room/wellness/calendar chapters; this iteration replaces only the description composition. No new Blender or AI render is needed.

## Composition

Mobile: three upper photographs, central Pinyon Script title and short Sora copy, six lower photographs in three staggered columns. All nine photos and central copy occupy one stable small viewport-height composition. Extra desktop photographs are hidden on mobile; they are alternative property details, not hidden essential content. Tablet portrait follows the same structure; desktop uses twelve frames surrounding the center. Short displays reduce gaps and lettering rather than applying a common scene scale. Minimum content height is 560px mobile, with natural overflow as the accessibility fallback. No scroll locking or gesture interception was added. Existing natural hero-to-description scrolling and later room sequence remain.

The cloud backdrop is the existing sunset-clouds-v1.webp. Cream text #fff8eb over a brown/cloud surface, 50% dark overlay, 8px photo corners, quiet offset shadows. Responsive images: 400/720px WebP, lazy loading, explicit intrinsic sizes, individual subject focus, original photos preserved. Nine visible mobile images are below 300KB at their 400px sizes. The old long copy is preserved in previous-copy.html for redistribution in a future chapter iteration; the user requested a shorter centered description.

Copy: “„Az egész ház. / Csak Nektek.””; the existing question about the whole experience being theirs; the supplied 10–16 / up-to-30 guest sentence. Existing “Nézzetek körül” action goes to the existing room chapter.

## Initial edition photo sources

Property photos: original assets/mullers2 and existing mullers2-wellness/assets photographs. New WebP copies live in mellow/assets/intro. This describes the initial edition; the supplied-image follow-up below supersedes selected property frames.

- tower: Szilas, Water tower of Siófok, 2013. Public-domain dedication. https://commons.wikimedia.org/wiki/File:Water_tower_of_Si%C3%B3fok.jpg ; original 2649×4592. Resized WebP, CSS crop.
- harbour: Pierre Bona, Siofok-passe du port, 2009. Selected license CC BY-SA 3.0. https://commons.wikimedia.org/wiki/File:Siofok-passe_du_port.jpg ; original 4032×3024. Resized WebP, CSS crop. Attribution, original, license, modification and derivative-download links on public foto-forrasok.html, linked from page footer. Modified image copies share the same license.

All other frames have filenames matching their subject (house, room, lounge, courtyard, salt, sauna, terrace, garden, breakfast, jacuzzi). Each has Hungarian alt text.

## Verification

Bounded inspection and correction: iPhone 17 Pro, iOS26.4 Simulator Safari with actual bars; supplemental Chrome at360×640,390×664,820×1180,1366×650. Native Safari shows top3 + center + bottom6 simultaneously. Tablet was corrected from narrow side strips to the mobile top/bottom structure. Water tower crop corrected to preserve the tower top. Desktop room-link activation arrives at#szobak with top0. Syntax/diff checks passed; HTML comparison confirms the hero and following chapters are unchanged. Original assets are untouched.

Primary screenshot is native Simulator Safari, not desktop emulation. Physical iPhone gesture/bar collapse testing has not been performed; native Simulator scrolling is unavailable to this automation. Supplemental Chrome provides navigation checks. No claim of physical iPhone validation. Local screenshots are in output/intro-mosaic (not deployed).


## Supplied image library follow-up — 2026-10-05

User requested optimizing all 17 supplied PNG attachments and using them around the existing short building introduction. Sixteen are unique: terrace-tables-alternate is an exact duplicate, mapped through aliasOf in the public photo-library/manifest.json. Original files are preserved outside the repository. No assertion is made that supplied pictures are unedited photography.

All sixteen unique images have 400px, 800px and up-to-1600px WebP width variants, preserving aspect ratio and avoiding upscaling. Pillow EXIF transpose, LANCZOS resize, quality79/method6 WebP; metadata stripped. Source basename, SHA256, dimensions, byte sizes, Hungarian alt text, variant paths and the duplicate mapping are in the manifest. Unique source bytes:39,343,338; all48 optimized variants:4,466,276 bytes. Only selected responsive variants load on the page, not the entire library. Future chapters should select the actual width descriptors listed in the manifest and use sizes appropriate to their layouts.

Mosaic subjects now include the M gable, green bedroom, fireplace, courtyard plunge, swing and terrace, plus desktop fountain, dining room and grill. Tower/harbour Commons license attribution and the existing salt-room frame remain. Small cards use400/800px srcset, explicit intrinsic dimensions and lazy decoding/loading. Individual object-position values keep their subjects in frame. Intro copy, approved first hero, later chapters, booking behavior and consent are unchanged.

Verified native iPhone17Pro iOS26.4 Simulator Safari with real browser chrome: all9 photos and center copy fit together. Native Chrome desktop1840×901 checked visually. Geometry is unchanged from the previous smaller-phone/tablet verification; no new smaller-device or physical-iPhone gesture/bar-collapse claim. Screenshots:output/intro-photo-library/iphone-safari.png and desktop.png (local QA, not deployed). Source hashes,48 variant sizes/bytes, byte-identical hero/following chapters, npm run check and git diff --check pass.


## Owner-only mosaic follow-up — 2026-10-05

Owner supplied six attachments and requested removing independently sourced images. Three attachments match existing photo-library images (relax-chairs, lounge-tv, relax-swing-close); three new originals (breakfast-buffet, terrace-blue, house-aerial) each receive400/800/up-to1600px WebP variants with the same recipe. All six supplied attachments appear in the nine mobile frames, and all twelve desktop frames use owner-supplied library images. The tower, harbour and previously reused salt-room frame are removed from the mosaic. Four Commons WebP copies are removed from the deployed assets; obsolete attribution paragraphs and the footer source link are removed. Historical license/source records above describe superseded editions.

The library now contains19 unique images/57 variants; originals untouched. Responsive sizes now correctly reflect three-column tablet layout through1100px. All source hashes, variant dimensions/byte sizes, six mobile subject inclusion, twelve owner-only image sources, unchanged hero/later chapters, syntax and diff checks pass. Native iPhone17Pro iOS26.4 Simulator Safari and native Chrome desktop visually inspected. All nine mobile images and central copy fit together. No physical iPhone gesture/bar-collapse claim. Local QA:output/owner-only-intro/iphone-safari.png and desktop.png.


## Current composition: all19 full images — 2026-10-05

Owner corrected the12-image limit: every supplied unique image must appear and almost the entire image should remain visible, mixing portrait and landscape frames. This supersedes the earlier9/12-frame composition. All19 unique library photos appear exactly once at every breakpoint; the exact duplicate attachment remains represented once. No additional photography or 3D assets created.

Full original image proportions are preserved with natural image height; desktop uses contain and size limits rather than cover or cropped frames. Mobile: four landscape images above the unchanged short intro, followed by four staggered masonry columns containing the other15 pictures. Desktop: two central pictures above and two below the copy, with two photo columns on each side. All images remain in the DOM and visible; no carousel, hidden-photo breakpoint or scroll lock. Natural vertical overflow on shorter screens preserves all pictures and accessible text. The existing cloud surface, cream/brown palette, PinyonScript/Sora type and room action remain. Desktop max1800px; tablet max720px composition; mobile6px photo gaps/8px row gaps; desktop12px gaps; image radius8px and existing offset shadow. Source paths remain photo-library, with400/800px responsive variants and lazy loading; no bitmap edits or originals changed.

Primary native iPhone17Pro iOS26.4 Simulator Safari screenshot shows all19 images and central text together. Native Chrome desktop1840×901 and supplemental in-app Chromium360×640,820×1180,1366×650 checked. Supplemental DOM confirms19 loaded images, no horizontal overflow, natural aspect ratios and no hidden photos. Small/tablet displays have natural vertical overflow rather than clipping. Physical-device gesture/bar-collapse testing remains unverified. Source validation: exact manifest coverage with19 unique images each once, byte-identical hero and later chapters, npm run check, git diff --check, scoped layout detector (no findings). QA assets:output/all-intro-photos (local only).


## Current composition: aligned equal-size tiles — 2026-10-05

The owner rejected the staggered natural-height alignment and explicitly requested equal-size pictures that connect neatly. This correction supersedes the natural-ratio masonry edition. All19 unique supplied photographs remain visible once at every breakpoint. Each tile is now square, with4px corners, no individual shadows, and one shared grid. Subject-aware cover crops prioritize the house, bed, fireplace, plunge and hanging chair; source images and all optimized variants remain unchanged. Equal-size frames require cropping, communicated to the owner before implementation.

Phone: four top tiles, unchanged central copy/CTA, then twelve tiles in three full rows and three centered tiles in the last row; all tiles share one width/height and4px gaps. The whole composition is limited by usable small viewport height so the last row clears iPhone Safari controls; shorter screens have natural overflow. Tablet uses the same topology with8px gaps and680px maximum composition width. Desktop: seven columns/four rows of equal squares, with the unchanged copy occupying a three-column/three-row central opening and nineteen pictures in the top and side positions. Desktop composition width derives from viewport height and is capped at1520px, with8px gaps. Cream/brown cloud surface and PinyonScript/Sora typography retained. No new illustration or generated image; the approved hero and later chapters are byte-identical apart from the local CSS cache version.

Bounded QA: initial native iPhone17Pro iOS26.4 Simulator Safari and supplemental desktop1366×650 inspection, followed by one batched correction to phone composition width and one confirmation round. Safari screenshot shows all19 tiles, copy and CTA clear of real browser controls. Supplemental360×640 and820×1180 geometry confirms all nineteen tiles exactly equal and no horizontal overflow. Layout detector has no findings; JS syntax/diff checks pass; source coverage confirms all19 unique images and unchanged hero/later chapters. Physical-device gestures and browser-bar transitions remain unverified. Local QA:output/aligned-intro-mosaic/iphone-safari.png and desktop.png. Consent omission is restricted to a local preview fixture.
