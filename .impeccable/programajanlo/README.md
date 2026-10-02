# Programajánló update — 2026-10-02

The updated article follows the existing blog palette and type, using route-local CSS. Only the Programajánló card's text changes in the already-modified blog index. The other pre-existing working changes are preserved. Release branch: `codex/programajanlo-publikacio`, prepared from current origin/main.

## Research and editorial decisions

Each program has a direct primary-source link in the article and PDF. Verified sources are stored in `content.json` and consist of BAHART, DRV, the operator of the Víztorony and Kálmán Imre Emlékház, Siófok's official tourism pages, the Balaton-felvidéki National Park, Bella Állatpark, Zamárdi Kalandpark and Balatonföldvári Hajózástörténeti Látogatóközpont.

Key corrections: the Víztorony offers specific sculpture/local-history exhibitions and requires steps between some visitor levels; DRV's current posted 2026 season ends September 30; Zamárdi accepts groups only on pre-booked weekends from September 1; Bella's autumn-to-spring schedule has Monday closure; the Emlékház's autumn-to-spring schedule has Monday/Sunday closure. BAHART's current autumn page advertises Siófok departures through October 25. Opening times are presented as dated planning information, with provider confirmation for the actual trip date.

New recommendations: Kálmán Imre Emlékház, Rózsakert and Balatonföldvári Hajózástörténeti Látogatóközpont. Retained and expanded: Víztorony, BAHART, Vizek Háza, Töreki, Bella, Zamárdi and Ásványmúzeum. The last has no newly verified seasonal schedule, so the article asks visitors to confirm it.

Omitted from the selected school-trip list: PLÁZS nightlife/beach claims, HyperJet, wakeboarding, private/self-driven boats, generic escape-room/gokart/rental links, an unsupported ferris-wheel measurement, the völgyhíd as a standalone trip, a generic viewpoint link and the broad restaurant list with unverified group-discount claims. These omissions reflect fit and verification quality; they do not assert business closure. The Fordított Ház tourism page has inconsistent current/open and dated schedule information, so it is omitted. Own game ideas and the two-day itinerary are identified as editorial suggestions. No prices, accommodation deals or bundled program availability are invented.

## Assets and rebuild

The original article's mcusercontent image URLs returned HTTP 403. Faithful photos were extracted from the existing, repository-tracked `assets/blog/programajanlo_2026.pdf` before replacing it. The source images remain in `original-images/`; the previous PDF is recoverable from Git history.

Mapping: original PDF image `0-2.jpg` → `hajo.webp`; `0-11.jpg` → `viztorony.webp`; `0-15.jpg` → `toreki.webp`; `0-6.jpg` → `kalandpark.webp`. Resized and WebP-encoded without generative changes. Together the four browser images are about 598 KB. Image captions/alt text describe the existing subject, without implying current vehicles or a particular bookable departure. The first photo loads eagerly, the remaining photos are lazy, all with intrinsic dimensions.

`content.json` is the common offline research source for `build_page.py` and `build_pdf.py`; the served site stays static HTML/CSS. The HTML builder reuses the established neighboring footer. The PDF builder uses the local Sora and Work Sans font files from `mullers2-wellness/mellow/assets/`, supplied under SIL OFL, and the original faithful photos. The resulting six-page PDF replaces the old download at its established URL. PDF text removes decorative emoji to avoid unsupported print glyphs. Run the builders from the repository with Python (PDF requires bundled reportlab/Pillow/pypdf), then render the PDF for visual inspection.

## Verification and limits

- `npm run check` passed; local HTML asset links and anchor IDs resolve; exactly one H1 and no duplicate IDs. Text-source diff has no whitespace errors.
- Actual iPhone 17 Pro, iOS 26.4 Simulator Safari: initial page, title wrapping, image and font loading, safe areas and expanded Safari bars inspected. `iphone17pro-safari.png` is an actual simulator capture and includes the unchanged consent panel. Native coordinate click and scroll calls repeatedly failed with `noWindowsAvailable`; touch, collapsed bars, reverse scroll and Safari consent interaction remain unverified. No full Safari interaction pass is claimed.
- Supplementary Chrome: 375×667, 820×1180 and desktop. No horizontal document overflow. All four photos load when brought into view. Category/itinerary navigation places the heading below the sticky header. Coming-soon booking destination and mailto enquiry fields checked; no warning/error console entries in the new article's final view. Reduced-motion/no-JS behavior reviewed in source.
- PDF: all six pages rendered and inspected, including Hungarian characters, complete headings/body text, links and page numbering. The small photos preserve their natural aspect ratio. Source and displayed recommendations are synchronized.
- One manual Impeccable scan completed. Palette/type findings are against the unrelated, explicitly wellness-only root DESIGN.md. The new article's actual computed Sora/Work Sans, white hero text and scoped padding were verified in-browser. Existing shared stylesheet findings on other routes were left outside scope. The article's inherited orange CTA glow was removed locally.

Local preview: `http://127.0.0.1:8000/blog/programajanlo/` using `npm run dev`. Production release authorized on 2026-10-02; status will be recorded after verification.

## Publication request — 2026-10-02

At the owner’s explicit request, removed DetActive from both web and PDF recommendations; the remaining list has ten programs. Production release is now authorized. A clean managed worktree based on current origin/main preserves concurrent published work and unrelated local changes.

Release QA: removed all DetActive text and hyperlinks from the ten-program HTML/PDF; six PDF pages rendered and inspected. Clean-worktree JavaScript syntax and whitespace checks passed. Supplementary Chrome checks at 375×667, 820×1180 and desktop found no horizontal overflow or warning/error logs. Blog card reflects ten programs. Actual iPhone 17 Pro Simulator Safari initial rendering checked; native interaction still unavailable.
