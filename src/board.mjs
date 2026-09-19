import fs from 'node:fs';

/* The board artwork lives in one coordinate space: a 1160 x 940 PCB at (250,110).
   Both the print plates and the interactive page draw from these exports, so the
   two can never drift apart. */
export const DEFS = fs.readFileSync(new URL('./_defs.svg', import.meta.url), 'utf8')
  .replace(/^<defs>|<\/defs>$/gm, '');
export const ART  = fs.readFileSync(new URL('./_art.svg', import.meta.url), 'utf8');

/* ---------- photoreal pass ----------------------------------------------
   The artwork is lit from the upper left. Every part gets the same specular
   ramp over it so the highlights agree, the solder mask gets FR-4 weave and a
   wet sheen, and the empty copper gets the surface-mount passives a real board
   is covered in. All of it is drawn in artwork coordinates, over the art and
   under the callout numbering. ------------------------------------------- */

// [x, y, w, h, rx, hard?]  hard = machined metal, a tighter and brighter specular
const SURFACES = [
  [552, 240, 298, 268, 4, 1],   // socket retention frame
  [470, 126, 440,  76, 6, 1],   // VRM heatsink, top
  [470, 252,  76, 272, 6, 1],   // VRM heatsink, left
  [990, 750, 200, 190, 9, 1],   // chipset heatsink
  [464, 566, 302,  52, 4, 1],   // M.2_1 heatspreader
  [464, 792, 302,  52, 4, 1],   // M.2_2 heatspreader
  [464, 944, 302,  52, 4, 1],   // M.2_3 heatspreader
  [434, 710, 362,  54, 5, 1],   // reinforced x16 shroud
  [900, 150,  30, 506, 3, 0], [946, 150, 30, 506, 3, 0],
  [992, 150,  30, 506, 3, 0], [1038, 150, 30, 506, 3, 0],   // DIMM bodies
  [1306, 206, 70, 212, 5, 0],   // 24-pin ATX
  [262, 180,  80,  46, 4, 0], [352, 180, 80, 46, 4, 0],     // EPS12V
  [258, 262, 150, 452, 5, 0],   // rear I/O
  [1298, 636, 88,  96, 4, 0], [1298, 744, 88, 96, 4, 0],    // SATA stacks
  [440, 654, 104,  40, 3, 0],   // PCIe x1
  [440, 872, 350,  42, 3, 0],   // PCIe x16 (x4 wired)
  [1284, 954, 112, 46, 3, 0],   // front panel header
  [1150, 596,  98,  92, 7, 0],  // CMOS holder
  [1306, 452,  70,  62, 4, 0],  // USB 3.2 header
  [1234, 734,  58,  50, 3, 0],  // BIOS flash
];

// passives, placed in the gaps between the big parts
const SMD = [
  ['r',1160,320],['r',1182,320],['r',1204,320],['r',1160,344],['r',1182,344],
  ['c',1232,398],['c',1254,398],['r',1232,424],['u',1196,466],
  ['r',1220,826],['c',1246,826],
  ['r',280,798],['r',302,798],['r',324,798],['c',280,824],['c',302,824],
  ['u',336,856],['r',280,886],['r',302,886],
  ['r',860,268],['r',860,290],['c',878,268],
  ['r',600,530],['r',622,530],['r',644,530],['c',666,530],
  ['r',792,658],['r',792,680],['c',814,658],['u',872,700],
  ['r',952,1004],['r',974,1004],['c',996,1004],
  ['r',1120,300],['c',1120,324],
];
const SILK = [
  [1158,308,'R41'],[1230,386,'C22'],[1188,498,'U9'],
  [278,786,'R12'],[334,896,'U14'],[598,518,'R7'],[790,646,'C31'],[950,992,'R58'],
];

const surfaces = SURFACES.map(([x, y, w, h, rx, hard]) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${hard ? 'glossHard' : 'gloss'})" pointer-events="none"/>`
).join('');

const smd = SMD.map(([k, x, y]) => k === 'r'
  ? `<use href="#r0603" x="${x}" y="${y}" width="16" height="8"/>`
  : k === 'c'
  ? `<use href="#c0805" x="${x}" y="${y}" width="16" height="9"/>`
  : `<use href="#soic8" x="${x}" y="${y}" width="28" height="20"/>`
).join('');

const silk = SILK.map(([x, y, t]) =>
  `<text class="silk" x="${x}" y="${y}" font-size="10">${t}</text>`).join('');

const realism = `
  <g id="smd" filter="url(#lift2)">${smd}</g>
  <g>${silk}</g>
  <g clip-path="url(#boardClip)" pointer-events="none">
    <rect x="250" y="110" width="1160" height="940" fill="url(#weave)"/>
    ${surfaces}
    <rect x="592" y="282" width="218" height="184" fill="url(#goldSweep)"/>
    <rect x="250" y="110" width="1160" height="940" fill="url(#sheen)"/>
    <path d="M250 124a14 14 0 0 1 14-14h1132" fill="none" stroke="#9FD8BA" stroke-opacity=".30" stroke-width="2.5"/>
    <path d="M250 124v912a14 14 0 0 0 14 14h1132" fill="none" stroke="#01120C" stroke-opacity=".55" stroke-width="3"/>
  </g>`;


export { realism };
