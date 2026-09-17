# Anatomy of an ATX Motherboard

Submission for **Exercise: Motherboard Diagram Creation**.

`build/Motherboard-Diagram.pdf` is the deliverable — three tabloid-landscape
plates (17 × 11 in), vector throughout, with all nine font faces embedded. It
opens correctly with no network access.

| Plate | Contents |
| --- | --- |
| 1 | Labeled component map. All 13 parts numbered on the board, each callout carrying the component name and a brief explanation of its function. |
| 2 | The seven required components, in depth, plus a power-and-data block diagram. |
| 3 | The six additional components, board-reading conventions, and sources. |

Required components (gold): CPU socket · RAM slots · PCIe slots · SATA ports ·
power connectors · chipset · CMOS battery.

Additional components (copper): VRM · M.2 slots · BIOS/UEFI chip · fan headers ·
rear I/O panel · front panel header.

The board is drawn to true ATX proportions (305 × 244 mm, 9 standoffs) as a
composite reference layout — not a copy of any manufacturer's product. Every
source cited on plate 3 was fetched and read during the build; each citation's
middle line states only what that page actually says.

## Rebuilding

```sh
node src/build.mjs     # src/data.json + artwork -> build/submission.html
node src/render.mjs     # -> build/Motherboard-Diagram.pdf + proof images
```

- `src/data.json` — component text, leader anchors, badge positions
- `src/_art.svg`, `src/_defs.svg` — board artwork
- `assets/fonts.css` — base64-embedded latin subsets, so nothing is fetched at open time
