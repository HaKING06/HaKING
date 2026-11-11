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
