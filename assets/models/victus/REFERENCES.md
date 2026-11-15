# Victus exterior study — reference record

Device supplied by owner: HP Victus 16-r1015nt (9J217EA), i7-14700HX, RTX 4070 Laptop GPU, 16 GB RAM, 1 TB SSD, 144 Hz FHD. Owner's latest physical-color correction: matte dark charcoal / near black. The name Mica Silver must not be interpreted as a bright silver aluminium finish.

Official HP visual references inspected:

- Intel Victus 16 product page: https://www.hp.com/us-en/gaming-pc/laptops/2023-victus-16-intel.html
- HP side-port diagram: https://www.hp.com/content/dam/sites/omen/worldwide/laptops/2023-victus-16-intel/Hero%20Image%204%402x.png
- HP charcoal product-family rear photograph: https://www.hp.com/content/dam/sites/omen/worldwide/laptops/2022-victus-15-amd/24C1_Victus_BigRed_16_80w_MicaSilver_nonFPR_HyperX_CoreSet_RearLeft_v2.png
- Exact product support identity: https://support.hp.com/tr-tr/drivers/victus-by-hp-16.1-inch-gaming-laptop-pc-16-r1000/model/2101982951?sku=9J217EA

The rear photograph is a shared product-family reference, not proof that every hidden internal component matches the owner's SKU. No internal fans are fabricated or exposed. The exterior is hand-built, dimensionally informed geometry, not manufacturer CAD or a calibrated scan. The 36.9 × 25.94 cm footprint is used; small ports, key placement, perforation spacing and underside labeling remain visual approximations.

## Rendering correction

Three.js r128 expects material color inputs in linear space when outputEncoding is sRGBEncoding. Previous hex charcoal colors were not converted and rendered far lighter. Chassis materials now explicitly convert sRGB design colors into linear values. Canvas textures explicitly use sRGBEncoding; white key legends are transparent, not opaque bright rectangles. The shell is a single tapered shape rather than stacked boxes; keycaps, inset hinges, numeric pad, rounded screen lid, port recesses and closed intake grille were rebuilt.

The model uses demand-driven rendering and stops when the machine panel is inactive or the document is hidden. Reduced motion snaps camera presets directly. No downloaded product images are shipped as original project artwork.
