# HaKING 2.5.2 — 2026-11-15

- Fixed critical CSS brace mismatch in `assets/css/main.css` that broke layout, button styling, hero columns, `#armory` filter controls, and `#support` side-by-side layout across desktop and mobile sections.
- Fixed laptop/desktop sidebar height fitting (`@media (min-width: 769px)`): dynamically scales sidebar spacing and button height (`clamp()`) with subtle overflow scroll fallback so the bottom **HEDİYE** (`#support`) navigation button never clips off screen on `720px`/`768px`-tall laptop displays.
- Fixed blurry / washed-out frames in 3D Virtual Museum Salons 10–15 (`data/screenshots.json`, `assets/js/museum3d.js`): resolved canonical full-resolution Steam `original` image URLs across the archive, switched PC desktop salon frames to uniform `1280×720` HD textures with `8x` anisotropic filtering, and eliminated white emissive gray haze + heavy additive light-cone wash on focused frames.

# HaKING 2.5.1 — 2026-11-15

- Hands-free FPS & keyboard shortcuts in the 3D Virtual Museum (`assets/js/museum3d.js`): pressing `E` now both inspects an exhibit and closes `#gallery-dialog` back into active Pointer Lock (`canvas.requestPointerLock()`) without requiring a mouse click; added `Q` / `R` (and `[` / `]`) for Previous/Next Wing, `F` for FPS toggle on PC, and `T` for Guided Tour.
- Tailored PC vs Mobile 3D HUD and graphics profiles (`assets/css/upgrade.css`, `assets/js/museum3d.js`): desktop PC hides the touch D-Pad and renders crisp up to `2x` DPR with `1024px` floor reflections; touch/mobile viewports dynamically widen portrait FOV (`72°`), tune swipe look speed and walk pace, use SVG arrow icons inside the D-Pad, and block long-press copy/callout menus via `-webkit-touch-callout: none`, `user-select: none`, `touch-action: none`, pointer capture, and `contextmenu` suppression.
- Simplified CaseHug Partner Popup (`#first-time-modal`): removed the external trailer tab/video player (`#modal-tab-trailer`, `<video id="modal-video">`), tightened CSP `media-src 'self'`, and focused the card on the `add/SOL.png` banner + `HAK06` creator code across all 20 languages.
- Added 3D Virtual Museum visual preview (`docs/museum-3d.png`) to `README.md` and refreshed localized posters, WebPs, and Playwright test coverage.

# HaKING 2.5.0 — 2026-11-15

- Optional WebGL 3D Virtual Museum Tour (`assets/js/museum3d.js`): added an opt-in **"Sanal Turu Başlat"** banner inside `#museum` while preserving the classic 2D archive, search, filters, and lightbox. Entering launches an interactive obsidian, walnut, brushed-brass, and reflective marble exhibition hall built with Three.js `r128`.
- Vendored open-source MIT Three.js r128 helpers (`GLTFLoader.js`, `Reflector.js`, `RoomEnvironment.js`) and CC0 1.0 Poly Haven museum models (`marble_bust_01` centerpiece sculpture behind velvet cordons, glowing `Chandelier_02`) + 1K PBR marble, plaster, and wood textures (`assets/museum/`), documented in `THIRD_PARTY_NOTICES.md`.
- Interactive 3D controls & streaming: walks through curated wings of 15 framed Steam screenshots at a time across all 224 captures with engraved brass plaques, `WASD`/Arrow + drag look + optional FPS Pointer Lock + touch D-pad for `390px`/`768px` mobile viewports, Guided Auto-Tour glide, wing switching, and direct click/`E` high-res inspection inside `#gallery-dialog`.
- Added 20-language translations (`museum3dCopy`) including Arabic RTL (`translations.js`), refreshed localized posters/WebPs, docs screenshots, and automated integrity + Playwright 3D museum tests.

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
