# HaKING 2.4.1 — 2026-11-15

- Automatic Steam account valuation: `update_stats.py` now queries the official Steam Store bulk `appdetails` endpoint (`cc=tr`, `filters=price_overview`) to compute live current (`account_value_usd`) and base list (`account_value_list_usd`) library values with batch-failure fallback preservation; `#sanctum` dynamically formats `#account-value` across all 20 languages instead of relying on a static `$2395` number.
- Clean public GitHub repository: added `AGENTS.md` and `docs/verification-*.md` to `.gitignore`, untracked `AGENTS.md` from the Git index while preserving local rules, removed internal AI verification logs, and updated `CONTRIBUTING.md`.
- Added regression tests (`tests/test_update_stats.py`), bumped entrypoints to `2.4.1`, and refreshed localized posters, WebPs, `README.md`, and docs screenshots.

# HaKING 2.4.0 — 2026-11-15

- Side-by-side `#support` panel: Steam Trade Uplink and Buy Me a Coffee now sit evenly beside each other (`>=640px`) with balanced card geometry so both support channels fit on screen without vertical scrolling, while stacking cleanly on narrow mobile viewports.
- Custom 3D laptop display texture: HP Victus 16-r1015nt renders `assets/images/walpaper.png` inside the lid bezel with cover scaling, fallback protection, and `webglcontextlost` handling.
- Redesigned CaseHug partner popup (`#first-time-modal`): responsive glassmorphic obsidian-and-gold modal with banner (`add/SOL.png`) and WebM trailer tabs, one-click `HAK06` promo code copy button, accessible keyboard/focus management, 24-hour dismiss cooldown, and manual partner pill triggers on `#sanctum` and `#support`.
- New Armory telemetry & Random Game Roulette (`#armory`): displays played/total ratio and top-10 playtime share from `data/steam_stats.json`, plus a random game picker with an unplayed-backlog filter; added Play/Pause slideshow control inside the `#museum` gallery dialog.
- Security & bug fixes: extracted inline pre-paint language bootstrap (`assets/js/lang-init.js`), enforced strict `Content-Security-Policy` + `Referrer-Policy`, vendored Lucide 0.468.0 locally (`assets/vendor/lucide.min.js`), sanitized Steam image URLs before CSS interpolation, enforced `rel="noopener noreferrer"` on external links, replaced the dead placeholder social link with verified GitHub (`HaKING06`), removed dead custom cursor / legacy menu / unused CSS selectors, fixed `cdn.steamstatic.com` host typo and RTL form icon padding, and cleaned empty folders.
- Refreshed modern visual `README.md`, versioned entrypoints (`2.4.0`), 20-language posters, WebPs, and site integrity tests.

# HaKING 2.3.0 — 2026-11-15

- Rebuild the Victus exterior: tapered chassis, inset hinges, full keyboard, numeric pad, side ports and closed underside grille. Correct linear color handling and excessive lighting for the owner's matte charcoal finish.
- Retain only remote Steam original-image URL metadata. Remove the abandoned local gallery cache and Pillow runtime dependency.
- Serve responsive remote 640/1280 thumbnails and large dialog images from canonical originals; retain resumable metadata-only synchronization and rate-limit handling.
- Version local entrypoints and module imports to refresh stale browser assets.
- Refresh product screenshots, localized posters and documentation for this delivery.

# HaKING 2.2.0 — 2026-11-11

- Remove click/startup sounds and the visible toolbar version label.
- Compact language trigger and scrollable searchable language menu.
- Synchronous section state fixes rapid-navigation races; add shareable section URLs and browser back/forward support.
- Remove unsolicited timed sponsor popup.
- Improve original-image resolution and responsive gallery media handling.
- Refine the HP Victus 16-r1015nt visualization against manufacturer references and the owner's charcoal finish reference.

# HaKING 2.1.0 — 2026-11-11

- Resolve original-resolution Steam media from detail pages; keep thumbnails separate from viewer sources.
- Restore native pointer behavior, including modal dialogs.
- Replace the native language list with a searchable, height-limited, keyboard-accessible popover; preserve 20 languages and Arabic RTL.
- Remove light mode and poster shortcut from the application toolbar.
- Refine the Victus visualization with rounded chassis, individual key legends, numpad, ventilation, underside grille, dual fan illustration and camera presets. Owner confirmed 16-r1015nt with near-black dark gray chassis; this is not manufacturer CAD.
- Add scroll progress and reduced-motion-aware hardware story transitions.
- Route contact email drafts to steam@haking.tr. Sending still requires the visitor's mail application.
- Add Buy Me a Coffee alongside Steam trade support.
- Add contributor, security and issue-reporting documentation; renew the project README.

# HaKING 2.0.0 — 2026-11-11

- Replaced the old CSS laptop with a locally rendered, interactive HP Victus-inspired 3D model: keyboard, display, hinge, ventilation, side ports, touchpad and back-lid emblem. Mouse/touch rotation, keyboard arrows, zoom and reset. WebGL fallback keeps hardware details available.
- Kept the supplied configuration: Intel Core i7-14700HX, RTX 4070 Laptop GPU, 16 GB RAM, 1 TB SSD, 144 Hz Full HD. This is a custom visualization, not verified manufacturer CAD.
- Indexed 222 public Steam screenshots, with the existing six favorites first. Added game filtering, search, 24-item incremental loading, image dialog and keyboard navigation.
- Preserved all 20 languages, added native language names, shareable language query parameters, Arabic RTL and light/dark theme preferences.
- Added 40 WebP posters across 20 localized, indexable galleries. Posters use real local site screenshots. Corrected canonical domain and added image sitemap, Open Graph and ProfilePage structured data.
- Added public screenshot sync workflow, MIT license, third-party notices, contributor instructions, release version and setup documentation.
- Replaced inaccessible external sound effects with small locally generated effects. Removed one-time migration files and temporary captures; retained user assets.

Validation: Playwright at 390 and 768 px, real Steam public data, filters, pagination, dialog keyboard controls, Arabic RTL, 3D canvas, keyboard rotation/reset, light and dark styles. No real browser-extension APIs are involved. Search indexing and production deployment are not verified; the user will push.
