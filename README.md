# Anatomy of an ATX Motherboard

Interactive component map of a modern LGA 1851 / Z890 ATX motherboard, drawn to
true form-factor proportions. Hover or tap any part to isolate it; click to pin;
run the quiz. Prepared by Travis Hoggatt for BPC170 12820 — *Exercise: Motherboard
Diagram Creation*.

- **Live page:** https://thorhale.github.io/motherboard-diagram/
- **Claude artifact:** https://claude.ai/artifact/1sG7xLzM4oVZZZ1KdYGhFG
- **PDF (print plates):** [`Motherboard-Diagram.pdf`](Motherboard-Diagram.pdf)

Required components (gold): CPU socket · RAM slots · PCIe slots · SATA ports ·
power connectors · chipset · CMOS battery. Additional components (copper): VRM ·
M.2 slots · BIOS/UEFI chip · fan headers · rear I/O panel · front panel header.

Every figure was checked against the ten sources listed on the page; each
citation's middle line states only what that page actually says.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The live page, served by GitHub Pages |
| `src/data.json` | Component text, specs, sources, hotspot and callout geometry |
| `src/_art.svg`, `src/_defs.svg`, `src/board.mjs` | Board artwork and the photoreal pass (lighting, weave, routing, passives) |
| `src/interactive.mjs` | Builds `build/interactive.html` (artifact) and `index.html` (Pages) |
| `src/build.mjs`, `src/render.mjs` | Print plates → `build/Motherboard-Diagram.pdf` |
| `assets/fonts.css` | Base64-embedded fonts; nothing is fetched at open time |

```sh
node src/interactive.mjs   # interactive page + Pages document
node src/build.mjs && node src/render.mjs   # print plates + PDF
```

The board is a composite reference layout, not a copy of any manufacturer's product.
