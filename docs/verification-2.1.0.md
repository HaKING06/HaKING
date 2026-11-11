# 2.1.0 verification

- Playwright at 390 and 768 px: no horizontal overflow.
- Language search and Arabic RTL checked; menu height is bounded and scrollable, keyboard Escape closes it.
- Image dialog: native pointer is visible; previous/next and Escape work.
- Reported Counter-Strike 2 image now loads at natural width 1920 instead of 200.
- 24 original image URLs resolved. Steam returned HTTP 429 for remaining requests. Resolver stops issuing new requests on rate limiting, preserves existing originals and retries unresolved images during future scheduled runs. Remaining thumbnails are not enlarged past their natural width.
- Real public Steam archive used; no extension APIs or payment/email submission mocks.
- Buy Me a Coffee points to https://buymeacoffee.com/haking; Steam trade preserved.
- Contact draft addresses steam@haking.tr. No email was sent during testing.
- Model has front/back/underside camera controls. Chassis color follows owner's latest near-black gray correction. Geometry is custom and internal fans are illustrative, not manufacturer CAD.
- Production deployment, payment transactions and mail delivery were not performed.
