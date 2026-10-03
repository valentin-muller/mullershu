# Gmail inquiry integration — 2026-10-03

Owner requested email delivery of complete Mellow calendar inquiries, followed by manual guest contact; the Müllers app is out of scope. Gmail connector profile was checked and confirms `mullers106@gmail.com`. The mailbox is fixed as SMTP sender and recipient; Reply-To is the validated guest address. No guest auto-reply or confirmed reservation is generated.

## Runtime and configuration

The existing static frontend is retained. `api/mellow-inquiry.js` adds one Vercel Node function; `booking-adapter.js` connects the existing form. Nodemailer is pinned and locked. No mailbox browsing or connector credentials are copied into the website. The Gmail connector used by Codex and the runtime website authorization are separate.

Create an application password on the **mullers106@gmail.com** Google account (requires two-step verification), then enter it as a sensitive **GMAIL_APP_PASSWORD** environment variable in this Vercel project's Production environment. Use an application-specific password, never the normal account password. Do not paste it into chat/source. Redeploy after setting/changing it. Revoke this app password to disable sending. OAuth is an alternative if application passwords are unavailable for this account.

Verified project: `mullershu`, `prj_utRPeCBA6mewo8fi8qxqai5USYcy`, team `team_V6PA2ftkD2q2mm0UoMbDbglT`. No environment variables were present when this iteration began. Configuration is currently missing. A syntactically valid secret enables the UI, but only real Gmail acceptance completes submission; a wrong/revoked secret causes an error and preserves the form. Do not claim real delivery until a clearly labeled test inquiry has been sent and read back through the approved Gmail connector.

The endpoint uses TLS SMTP on smtp.gmail.com:465, short connection/socket timeouts and a30-second function ceiling. Failures expose no provider diagnostic, credential or guest data. GET returns readiness plus a signed, one-hour form token; no secret is returned. All POST fields and arrival/departure dates are independently validated. Name, address, phone, email, guests, both dates and the fixed source are mandatory. Text is bounded; email header injection is rejected. Mail is plain text, without attachments or remote file access. No PII is saved in localStorage, a website database or server logs. Personal details remain in the owner's Gmail once delivered. The existing privacy link and Clarity masking on the dialog remain.

## Date meaning

There is no live inventory source yet. Every date within the existing twelve-month inquiry horizon can be requested. Previously invented demo blocked dates are removed. The calendar explicitly says dates are for consultation and availability is confirmed personally. Arrival must not be in the past; departure must be later and within the same calendar horizon. No new minimum stay or maximum property capacity policy is invented; existing1–999 form bounds remain.

## Request protection and limits

Approved production origins are explicitly listed, preview accepts only its own deployment origin, development accepts localhost:8003 only. No cross-origin CORS access. JSON only,8KiB application limit, honeypot and a signed token with a minimum two-second age. Missing configuration blocks sending with usable phone/email alternatives; no demo success is displayed.

Warm-instance throttling allows three distinct attempts per IP per15minutes. Hashes are kept in bounded memory; successful/concurrent duplicate request IDs share the same result for10minutes, and different contents under the same ID are rejected. This is **best-effort**, not durable across function instances/restarts. For broader public traffic, add a Vercel Firewall POST rate rule on `/api/mellow-inquiry`; do not treat the in-memory map as a global limit. Network uncertainty can still produce duplicate mail across instances; a stable Message-ID/request ID helps staff recognize it. Strict exactly-once delivery would require durable storage and is not claimed.

## Verification and release

- `npm run check` checks shared and affected JavaScript. `npm run test:inquiry`:21 tests cover missing fields, date boundaries, unsafe values, origins, methods, content/size limits, config failure, tokens, deduplication, throttling, SMTP acceptance and failure.
- Local Chrome flow with a fake SMTP transport: empty form shows all five errors; valid dates and all fields produce success only after fake acceptance; fake SMTP failure preserves inputs and offers contact links. **No real message was sent.**
- iPhone17Pro iOS26.4 Simulator Safari: actual local calendar rendering with browser bars inspected; saved `output/gmail-inquiry/calendar-safari-local.png`. Consent was omitted in the local screenshot fixture only; shipped consent is unchanged. Native touch/input remains unverified because simulator input control is unavailable; no physical iPhone test is claimed.
- `npm run dev` serves static files only. To run actual Vercel functions locally use `vercel dev`; do not expect Python's static server to handle `/api/mellow-inquiry`. The local test harness under untracked output uses fake credentials/SMTP and is never uploaded.
- Pending: Gmail app-password setup, real Gmail delivery/readback, GitHub login restoration, verified main merge and Ready Vercel production verification. The prior mobile full-frame chapter commit `a3f24b4` is preserved on this branch and is also unshipped. No live release is asserted.

References: [Nodemailer Gmail](https://nodemailer.com/usage/using-gmail/), [Google application passwords](https://support.google.com/accounts/answer/185833), [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js).
