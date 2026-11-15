# HaKING 2.4.0 Verification

Date: 2026-11-15  
Primary checkout: `C:\Users\halit\OneDrive\Belgeler\GitHub\HaKING`  
Synced local mirror: `c:\Users\halit\Desktop\WEB\HaKING`  
Version: `2.4.0`

## Delivered Scope

- **Side-by-side `#support` layout**: Replaced full-row coffee span so Steam Trade Uplink and Buy Me a Coffee render evenly side-by-side on viewports `>=640px` without vertical scrolling, and stack cleanly on `<640px`.
- **3D HP Victus display texture (`assets/js/victus.js`)**: Loads owner-supplied `assets/images/walpaper.png` onto the 1920x1080 sRGB screen canvas with aspect-cover scaling, subtle radial edge vignette, procedural fallback frame, and `webglcontextlost` handling.
- **Redesigned CaseHug Partner Popup (`#first-time-modal`)**: Accessible obsidian/gold dialog with banner (`add/SOL.png`) and WebM trailer tabs, one-click `HAK06` copy feedback, 24-hour dismiss cooldown + session guard, Escape/focus restoration, and `[data-open-partner]` manual triggers on `#sanctum` and `#support`.
- **Armory Telemetry & Random Game Roulette + Museum Slideshow**: Added played/total ratio, top-10 playtime concentration, unplayed-capable game roulette (with async cover request-ID guard), and `#gallery-play` slideshow control.
- **Security, Bug Fixes & Cleanup**: Extracted `assets/js/lang-init.js`, enforced strict CSP (`img-src 'self' https://*.steamstatic.com ...`) and `Referrer-Policy`, vendored Lucide `0.468.0` locally, validated dynamic image hosts, enforced `rel="noopener noreferrer"`, replaced dead placeholder social link with `https://github.com/HaKING06`, fixed broken `cdn.steamstatic.com` CSS host & RTL form spacing, removed dead cursor/menu/CSS rules and empty directories, refreshed visual `README.md`, rebuilt 20 poster galleries and 40 WebPs, and added `tests/test_site_integrity.py`.

## Verification Evidence

Verified identically across both checkouts after final edits and sync:
1. Node `vm.SourceTextModule` ESM syntax check across all JS/ESM files.
2. `python -m unittest discover -s tests -v` (6/6 tests passing).
3. Playwright headless Chromium verification at `390x844`, `768x1024`, and `1280x800`: zero console/page/CSP errors, zero horizontal overflow across all 7 sections, side-by-side single-screen `#support` cards at `768px` & `1280px`, interactive partner popup + code copy + 24h cooldown, `#armory` telemetry & roulette spin, `#machine` 3D Victus canvas, `#museum` 6/6 favorites + `>=1280px` lightbox + slideshow play/pause, 20 languages + Arabic RTL, and localized `posters/tr/` & `posters/ar/`.
4. Updated captures in `docs/home-768.png`, `docs/setup-390.png`, `docs/setup-768.png`, `docs/cooling-768.png`, `docs/museum-390.png`, `docs/museum-768.png`, and `docs/support-768.png`.
