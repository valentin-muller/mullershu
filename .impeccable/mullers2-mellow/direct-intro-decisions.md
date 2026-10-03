# Direct house-to-introduction arrival — 2026-10-03

User correction: the cloud background and copy must appear together after the house approach; no empty cloud screen or extra scroll to bring the copy in.

Removed the separate cloud veil. The actual existing introduction overlaps the final entry-stage height and shares one opacity with its background and all text. A translation holds it at the viewport top during arrival, then reaches zero exactly at its normal-flow position; continued scrolling moves the introduction naturally. No duplicated text or cloned section. Existing house/card geometry, approved copy and cloud asset are unchanged. Intro children do not run independent delayed room-title reveals. Hidden introduction is inert; disabling motion restores normal flow and all copy.

Supplemental Chrome checks at 390×664 and 1366×650: by one viewport of scrolling, intro top is 0 and opacity approximately .992; title opacity 1. Further scrolling moves the real section upward; reverse scrolling restores zoom 1 and hidden intro. Motion disabled restores margin 0 and opacity 1. Viewport-override screenshots had compositor scaling artifacts, so these are not delivery images. iOS Simulator Safari rendering will be checked on the released route. Physical iPhone touch testing remains the owner's check.
