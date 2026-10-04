# Müller's Siófok website

Existing Hungarian static HTML/CSS/JavaScript website, with one Vercel Node function for complete Mellow calendar inquiries. No frontend framework or bundling step.

## Development and checks

- `npm run dev`: static preview at http://127.0.0.1:8000. This does not run the inquiry endpoint.
- `npm run check`: shared and affected Mellow JavaScript syntax checks.
- `npm run test:inquiry`: calendar, guest-field and server/mail validation tests.
- Use `vercel dev` for local Vercel function execution. Install dependencies with `npm ci` when running the function/tests.

Shared site code lives in `style.css`, `script.js` and `assets/consent.*`; the homepage, building pages, blog and legal pages are static. `mullers2-wellness/mellow/` has page-local styles/scripts, original property photos, separate illustrated hero elements and optimized Blender-rendered illustrations. Its design/source records live in `.impeccable/mullers2-mellow/`. Keep public content in Hungarian, preserve consent and the existing coming-soon booking links outside the inquiry form.

## Verified connections

- GitHub: https://github.com/valentin-muller/mullershu
- Vercel project: `mullershu`, ID `prj_utRPeCBA6mewo8fi8qxqai5USYcy`, team `team_V6PA2ftkD2q2mm0UoMbDbglT`.
- Production branch: `main`; primary domain https://www.mullerssiofok.hu/.
- Additional domains include the `müllers.hu` aliases, `mullerssiofok.hu` and `mullershotelsiofok.hu`.
- Production requires verified commits. Use a dedicated `codex/` branch and a GitHub PR; verify both the merged commit and the Ready deployment rather than assuming a push deployed.
- Production publishing requires owner release intent. The owner has authorized release for the current Mellow changes.
- `.vercel/`, `.env*` and local output remain ignored. `.vercelignore` excludes offline design/Blender sources and local tooling from uploads.

## Inquiry configuration

`api/mellow-inquiry.js` is the only backend function. It delivers a validated plain-text inquiry to `mullers106@gmail.com` using TLS Gmail SMTP, with the guest as Reply-To. It does not create a reservation, confirm availability or connect to the Müllers app. Required fields: name, postal address, phone, email, number of guests, arrival and departure. Dates are requests; availability is personally confirmed.

The owner must configure `GMAIL_APP_PASSWORD` in Vercel Production and redeploy. Use a separate Google application password for that mailbox, not an account password, and never put credentials in source, docs or chat. Without configuration, sending is disabled and phone/email alternatives remain available. A real delivery is only verified after a labeled test inquiry is accepted and read back through the approved Gmail connector.

Warm-instance throttling and request deduplication are best-effort, not global or durable. Add Vercel Firewall rate limiting for broader public traffic. Runtime/configuration and validation details: `.impeccable/mullers2-mellow/calendar-inquiry-v1/gmail-integration.md`.

## Primary visual target

Design and verify iPhone Safari first, then smaller phones, iPad and desktop. Simulator or physical iPhone screenshots are required to claim Safari validation; desktop viewport emulation is supplementary. Check actual usable height and browser bars, loading, first/reverse scroll and readable titles. Latest v3 courtyard illustration was inspected in iPhone17Pro iOS26.4 Simulator Safari on2026-10-04; physical-device and full native touch/scroll checks remain unverified. Consent omission in local screenshot fixtures does not alter shipped consent.

## Mellow release check — 2026-10-04

All21 calendar/inquiry tests and affected JavaScript syntax checks pass. The v3 courtyard sack is inspected in actual iPhone17Pro Simulator Safari with browser controls. GitHub authentication is restored. Production Gmail credentials remain unconfigured, so the inquiry sender must stay disabled and contact alternatives remain available. GitHub's signed commit flow is used for the release record because Vercel correctly rejects unsigned preview commits.
