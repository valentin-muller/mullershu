# Mellow calendar enquiry — 2026-10-02

Target: `/mullers2-wellness/mellow/#vege`. Narrow extension of the approved Mellow world. Operate within an Experience landing page. Owner requested an arrival calendar, then a popup with full name, address, telephone, email and guest count; the team contacts the guest personally. Integration to the Müllers app is deferred.

Direction: incumbent sand #e7dccb, ink #30291f, cream #fff8eb; locally hosted Pinyon Script expressive headings, Sora month/date summary, Work Sans body/inputs. Authored consistent SVG icons. Mobile: seven columns, >=44px day width at 360px; 48px day height and input controls, 16px input type, native scrollable dialog. Desktop: introductory text beside the calendar. Preserve all opening art, entrance motion, other chapters, consent and shared styles.

No source for actual availability or enquiry receipt was provided. This iteration deliberately uses visibly labelled sample arrival dates for twelve months, with synthetic blocked dates. Choosing a day opens the five requested fields; testing the form validates, clears data, and truthfully reports that nothing was sent or stored. No storage, mail submission or external enquiry request is implemented in demo mode. Do not release sample availability as real. Clarifying question about departure-date selection remains unanswered; arrival-only matches the original brief. No new capacity or price claims.

The generated `mockup.png` is an internal visual reference, not approved authority or a shipping image; owner instructions and incumbent fonts/palette win. Its invented header/photography were not implemented. Frontend files: `booking.css`, `booking.js`, `index.html`; all other runtime files unchanged.

## Future integration boundary

Define `window.MullersBookingAdapter` before `booking.js`:
- `loadAvailability({from, to, signal})` -> Promise<{availableArrivalDates: string[]}>. ISO YYYY-MM-DD dates in Budapest calendar terms. The backend determines eligible arrival dates, including stay length and current inventory.
- `createInquiry({arrivalDate, fullName, address, phone, email, guests, source}, {signal})` -> Promise<{inquiryId: string}>. A nonempty receipt ID is required before claiming receipt. Incomplete/malformed adapters show an error, never fake availability.

Backend must revalidate availability and every field, provide durable receipt and retry/idempotency handling, and implement permissions, anti-abuse and data retention. Guest count's 1–999 input range is a technical bound, not an asserted house capacity. Finalise stay length, departure selection, capacity and enquiry privacy notice before activation. A 20-second frontend deadline limits hung requests. Close aborts a pending enquiry submission and erases form contents; submission failure retains the current form for retry. Inputs are marked for Clarity masking via the dialog attribute; no analytics enquiry events or PII logging added. Actual third-party replay masking was not separately verified.

## Verification

Eight Node tests cover strict dates, leap years, daylight-saving-safe movement, year rollover, Monday-aligned calendars, requested field validation, ignored-abort timeout and cancellation. Shared and route JS syntax pass; npm check is absent from this clean main checkout, so equivalent checks were run directly.

Chrome supplementary responsive checks at 360×640, 402×715 and 1440×900: date selection, all field errors, invented-data demo completion, clear on close, focus restored to date, Escape and month change; no horizontal overflow. iPhone 17 Pro iOS 26.4 Simulator Safari initial calendar section rendered, but the cookie overlay and failing coordinate input blocked a complete touch/form pass. Do not claim physical iPhone testing or complete Safari interaction validation. Screenshots in `output/calendar1/` accurately name their environment. No-JS/unsupported dialog markup retains public telephone and email contacts; load error/empty availability also reveals these contacts.

## Scoped implementation record

Documenter inspection: 2026-10-02. This is an ordinary extension of accepted Mellow, not a new visual world or a global token update. Runtime sources, the scoped brief, all seven supplied screenshots, and the incumbent product/design records were read. The finish review returned `ship` at this feature's scope. No root `PRODUCT.md`, `DESIGN.md`, design sidecar or original-checkout file was created, copied, or edited for this documentation pass.

### Colors and typography

The existing Mellow `mellow.css` custom properties remain the source of inherited primitives. The following table records actual feature usage, without promoting feature-local values into global brand tokens.

| Runtime value | Feature role |
| --- | --- |
| `--sand: #e7dccb` | Closing section ground; inherited from Mellow. |
| `--ink: #30291f` | Main text, selected day, submit button and control focus outline. |
| `--cream: #fff8eb` | Calendar/dialog surfaces and selected-day/button text. |
| `#655746` | Secondary copy, sample disclosure, weekday labels, hints and availability status. |
| `#796956` | Selectable-day dot, input caret and input focus outline. |
| `#c3b49e` | Calendar legend and arrival-summary separators. |
| `#b2a592` | Input border; matches the incumbent `--line` value. |
| `#aaa08e`, `#9d927d` | Disabled days and unavailable-day slash. |
| `#b7ac9a` | Disabled month arrow. |
| `#9d3328` | Validation error text and invalid input border. |
| `#574632` | Submit hover; already used in the incumbent selection treatment. |
| `#e7dccb70`, `#e7dccb80` | Hover tint for month/close controls and selectable dates. |

Pinyon Script is already locally hosted by `salt.css`; Work Sans and Sora are hosted by `mellow.css`, with `font-display: swap`. The feature uses Pinyon headings at `400 56px/1.08` for the mobile invitation and `400 47px/1.15` for the dialog; above 760px these become 76px and 56px. The month uses Sora at `400 18px/1.4` (20px desktop), arrival summary `400 16px/1.5`, result heading `400 24px/1.4`. Inputs and submit use Work Sans at `400 16px/1.5`; day numbers are 16px (17px desktop), with tabular numerals. Field labels are 14px/500 using the existing font stack; no new font file or weight was added.

### Layout, shapes and depth

Below 761px the ending stacks invitation then calendar, with `80px 12px 72px` section padding, 40px layout gap, and seven equal day columns. At 360px the calendar's 14px side padding leaves 44px-wide day targets; days are at least 48px high and have 2px vertical margin. Month/close controls are 44×44px. Input controls are at least 48px high; the address textarea is at least 74px, vertically resizable. The submit is at least 52px high.

From 761px the section has `100px 6vw 110px` padding; the 1120px-capped layout uses `minmax(0,1fr) minmax(0,500px)` columns, 72px gap, 64px top margin and centered alignment. Calendar padding becomes 24px; days are at least 54px high. Calendar radius is 14px, dialog 16px, fields/submit 6px, month/close controls 8px, selected day 50%. These are local form-control shapes, not a change to room-photo composition.

The dialog width is `min(560px, calc(100% - 24px))`, maximum height `calc(100dvh - 32px)`, with internal scrolling and `overscroll-behavior: contain`. Mobile inner padding is `28px 24px max(28px, env(safe-area-inset-bottom))`; desktop padding is `38px 36px`. Backdrop is `#30291f9e`; shadow is `0 18px 56px #30291f38`. Its only added entrance motion is 200ms `cubic-bezier(.16,1,.3,1)` from 12px below and zero opacity. Reduced-motion mode disables that animation.

### Components and states

The calendar covers today's Budapest date through the end of the eleventh following month, with Monday-first Hungarian labels. Demo dates exclude days 9, 10, 23 and 24 in each month; these are synthetic blocked dates. Past dates are disabled, outside-month cells invisible, today underlined, and selected arrival filled ink. Available days carry a small dot. Each date exposes its full date/state through `aria-label`; sample dates explicitly include `(minta)`. The chosen date remains selected after the dialog closes.

Keyboard navigation uses a single date tab stop, arrow keys, Home/End and Page Up/Page Down, skipping unavailable dates. Native `dialog.showModal()` supplies modality; opening focuses the title to avoid deliberately summoning the mobile keyboard. Closing with the close control, result control or native Escape resets all five fields and errors, aborts submission, restores the form state and returns focus to the selected day. Native mobile focus trapping, on-screen keyboard resizing and Safari touch behavior remain unverified. Backdrop-click dismissal is not implemented.

Field errors are associated with the inputs and use `aria-invalid`; validation focuses the first invalid field. Submission feedback uses `role="alert"`. Native email validity complements the explicit validation. Demo completion clears the form and reveals the truthful non-sending result. Future adapter mode disables submit during requests, requires a nonempty `inquiryId` before receipt copy, keeps entered values after failure, and prevents late responses from reviving a closed dialog. Availability loading sets `aria-busy`, hides the day grid, and disables month controls; failed loading exposes retry and direct contacts, while an empty result exposes contacts and disabled dates. An incomplete adapter fails rather than silently using demo availability.

### Evidence and inheritance limits

Opened and inspected `output/calendar1/calendar-mobile-chrome.png`, `inquiry-mobile-chrome.png`, `calendar-small-mobile-chrome.png`, `inquiry-small-mobile-chrome.png`, `calendar-desktop-chrome.png`, `inquiry-desktop-chrome.png`, and `calendar-iphone17pro-safari.png`. Chrome screenshots are supplementary browser evidence; mobile dialog screenshots show its upper scrollable portion. The Safari screenshot includes actual Simulator status and browser bars and the existing consent overlay. It proves initial rendering only. Safari expanded/collapsed bar transitions, first/reverse scroll, keyboard/form completion and smaller-iPhone/iPad Safari were not fully verified. Node tests and syntax passes were reported by the build handoff; the documenter inspected their source, rather than rerunning an unchanged suite. The reported `booking.css` detector result is `[]`.

Compared against clean baseline `7a942625` (the stated origin/main baseline): the Mellow body from `<body` through immediately before the ending section is byte-identical (13,601 bytes; SHA-256 `588e0ce76a4924f18677584671bc7532f8a200b0e57bb9521eeb74f56bd7cce9`). `mellow.css`, `mellow.js`, `entrance.css`, `entrance.js`, `salt.css`, `salt.js`, `location.css` and `desktop.css` are also byte-identical to that baseline. The calendar assets are linked after the incumbent styles; existing opening artwork, entrance code, room chapters and coming-soon header booking link are preserved.

Pre-existing documentation differences remain: root `DESIGN.md` and its sidecar describe the separate original `/mullers2-wellness/` Cormorant/Manrope dark tour, not the Mellow variant; the Mellow surface record still describes its early three-scene scope/Sora headings, whereas later `PRODUCT.md` entries record the accepted Pinyon and extended-room implementation. Those historical records and the original dirty checkout are read-only context. Current Mellow code and later accepted product refinements support this extension's palette/type inheritance. This feature brief records only the calendar addition and does not repair unrelated documentation drift. No deployment status or production release is asserted here.
