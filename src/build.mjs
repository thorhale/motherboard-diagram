import fs from 'node:fs';

const D     = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));
const FONTS = fs.readFileSync('assets/fonts.css', 'utf8');
const DEFS  = fs.readFileSync('src/_defs.svg', 'utf8');
const ART   = fs.readFileSync('src/_art.svg', 'utf8');

/* Board artwork was authored on a 1700x1180 canvas with the PCB at (250,110).
   The plate canvas is 2560x1500 with the PCB centred at (700,280).        */
const VW = 2560, VH = 1500, TX = 450, TY = 170;
const t  = ([x, y]) => [x + TX, y + TY];

const GOLD = '#E5B55C', COPPER = '#DE8A62';
const hue  = c => (c.cat === 'core' ? GOLD : COPPER);

const byCol = s => D.components
  .filter(c => c.col === s)
  .sort((a, b) => a.ord - b.ord);

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

/* ---------- numbered discs sitting on the board ---------- */
const badges = D.components.flatMap(c => {
  return c.badges.map(t).map(([x, y]) => `
    <g class="badge-g">
      <circle cx="${x}" cy="${y}" r="24" fill="#05100C" opacity=".55"/>
      <circle cx="${x}" cy="${y}" r="21" fill="${hue(c)}" stroke="#08110D" stroke-width="1.6"/>
      <text x="${x}" y="${y + 8}" text-anchor="middle" class="badge-t">${c.n}</text>
    </g>`).join('');
}).join('');

/* ---------- callout cards ---------- */
const card = c => `
  <article class="callout ${c.cat}" data-id="${c.id}" data-side="${c.col}">
    <div class="c-head">
      <span class="c-num">${c.n}</span>
      <div class="c-id">
        <h3>${c.name}</h3>
        <p class="c-spec">${c.spec}</p>
      </div>
    </div>
    <p class="c-brief">${c.brief}</p>
  </article>`;

const colL = byCol('L').map(card).join('');
const colR = byCol('R').map(card).join('');

/* anchor targets, in plate coordinates, for the leader lines */
const targets = Object.fromEntries(D.components.map(c => [c.id, t(c.anchor)]));

/* ---------- reference cards ---------- */
const refCard = c => `
  <article class="ref ${c.cat}">
    <div class="r-head">
      <span class="c-num">${c.n}</span>
      <div class="c-id">
        <h3>${c.name}</h3>
        <p class="c-spec">${c.spec}</p>
      </div>
    </div>
    <p class="r-fn">${c.fn}</p>
    <p class="r-note"><b>Why it matters — </b>${c.note}</p>
    <ul class="r-chips">${c.chips.map(x => `<li>${x}</li>`).join('')}</ul>
  </article>`;

const core  = D.components.filter(c => c.cat === 'core').map(refCard).join('');
const bonus = D.components.filter(c => c.cat === 'bonus').map(refCard).join('');

const sources = D.sources.map(([n, what, url]) => `
  <li><span class="s-n">${n}</span><span class="s-w">${what}</span><span class="s-u">${url}</span></li>`).join('');

/* ---------- signal-flow inset ---------- */
const flow = `
<svg class="flow" viewBox="0 0 620 560" role="img" aria-label="Block diagram of how power and data move between the components on the board">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#44524A"/>
    </marker>
    <marker id="arp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#9A4A26"/>
    </marker>
  </defs>

  <!-- power path -->
  <g stroke="#9A4A26">
    <path class="fa" d="M148 46 H172 V27 H196" marker-end="url(#arp)"/>
    <path class="fa" d="M148 46 H172 V71 H196" marker-end="url(#arp)"/>
    <path class="fa" d="M372 71 H420" marker-end="url(#arp)"/>
    <path class="fa" d="M495 88 V118 H302 V150" marker-end="url(#arp)"/>
  </g>
  <rect class="fb pwr" x="8"   y="20" width="140" height="52" rx="5"/>
  <text class="ft" x="78"  y="42">POWER</text><text class="ft" x="78" y="61">SUPPLY</text>
  <rect class="fb pwr" x="196" y="10" width="176" height="34" rx="5"/>
  <text class="ft" x="284" y="33">24-pin ATX</text>
  <rect class="fb pwr" x="196" y="54" width="176" height="34" rx="5"/>
  <text class="ft" x="284" y="77">8-pin EPS12V</text>
  <rect class="fb pwr" x="420" y="54" width="150" height="34" rx="5"/>
  <text class="ft" x="495" y="77">VRM</text>
  <text class="fl" x="312" y="112">12 V &#8594; &#8776;1.1 V</text>

  <!-- CPU and its direct links -->
  <g stroke="#44524A">
    <path class="fa two" d="M390 167 H430"/>
    <path class="fa two" d="M390 199 H410 V199 H430"/>
    <path class="fa two" d="M390 215 H410 V241 H430"/>
    <path class="fa two" d="M148 176 H214"/>
    <path class="fa two" d="M302 232 V320"/>
    <path class="fa two" d="M390 350 H410 V317 H430"/>
    <path class="fa two" d="M390 350 H430"/>
    <path class="fa two" d="M390 350 H410 V401 H430"/>
    <path class="fa" d="M158 325 H196 V342 H214" marker-end="url(#ar)"/>
    <path class="fa" d="M158 435 H196 V372 H214" marker-end="url(#ar)"/>
  </g>
  <rect class="fb cpu" x="214" y="150" width="176" height="82" rx="5"/>
  <text class="ft big" x="302" y="186">CPU</text><text class="ft" x="302" y="210">LGA 1851</text>
  <rect class="fb" x="430" y="150" width="182" height="34" rx="5"/>
  <text class="ft" x="521" y="173">RAM &#183; DDR5</text>
  <rect class="fb" x="430" y="182" width="182" height="34" rx="5"/>
  <text class="ft" x="521" y="205">PCIe x16 &#183; GPU</text>
  <rect class="fb" x="430" y="224" width="182" height="34" rx="5"/>
  <text class="ft" x="521" y="247">M.2_1 &#183; NVMe</text>
  <rect class="fb aux" x="8" y="150" width="140" height="52" rx="5"/>
  <text class="ft" x="78" y="172">FAN HEADERS</text><text class="ft" x="78" y="191">4-pin PWM</text>
  <text class="fl" x="312" y="266">DMI 4.0 x8</text>
  <text class="fl" x="312" y="284">&#8776; 16 GB/s &#183; shared</text>

  <!-- chipset fan-out -->
  <rect class="fb pch" x="214" y="320" width="176" height="60" rx="5"/>
  <text class="ft big" x="302" y="348">CHIPSET</text><text class="ft" x="302" y="370">PCH</text>
  <rect class="fb" x="430" y="300" width="182" height="34" rx="5"/>
  <text class="ft" x="521" y="323">SATA &#183; 6 Gb/s</text>
  <rect class="fb" x="430" y="342" width="182" height="34" rx="5"/>
  <text class="ft" x="521" y="365">USB &#183; LAN &#183; audio</text>
  <rect class="fb" x="430" y="384" width="182" height="34" rx="5"/>
  <text class="ft" x="521" y="407">PCIe x4 &#183; M.2_2/3</text>

  <rect class="fb aux" x="8" y="300" width="150" height="50" rx="5"/>
  <text class="ft" x="83" y="321">BIOS / UEFI</text><text class="ft" x="83" y="340">SPI flash</text>
  <text class="fl" x="8" y="366">firmware, runs at power-on</text>
  <rect class="fb aux" x="8" y="410" width="150" height="50" rx="5"/>
  <text class="ft" x="83" y="431">CMOS CELL</text><text class="ft" x="83" y="450">CR2032 &#183; 3 V</text>
  <text class="fl" x="8" y="476">real-time clock, standby only</text>

  <g class="fl-key">
    <rect x="8" y="516" width="16" height="9" rx="2" fill="#9A4A26"/>
    <text class="fl" x="32" y="525">power path</text>
    <rect x="150" y="516" width="16" height="9" rx="2" fill="#44524A"/>
    <text class="fl" x="174" y="525">data path</text>
    <text class="fl" x="286" y="525">double-headed arrows are bidirectional</text>
  </g>
</svg>`;

/* ---------------------------------------------------------------- */
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${D.meta.title}</title>
<meta name="description" content="${D.meta.subtitle}">
<style>
${FONTS}

@page { size: 17in 11in; margin: 0; }

:root{
  --bg:#E7EAE5; --surface:#F6F7F4; --surface-2:#DCE0D8; --paper:#FBFCFA;
  --ink:#141C18; --ink-2:#44524A; --ink-3:#73817A; --rule:#C2C9BE; --rule-2:#DDE2D9;
  --gold:#8F6519; --gold-soft:#F0E4C4; --copper:#9A4A26; --copper-soft:#F3DFD4;
  --mat-1:#12181A; --mat-2:#070A0B;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:#9AA49C;
  font-family:"IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;
  color:var(--ink); -webkit-font-smoothing:antialiased; font-size:11pt;
}
h1,h2,h3,.cond{font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:600;margin:0}
.mono{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace}

.page{
  width:17in; height:11in; background:var(--bg); position:relative;
  padding:.34in .4in .3in; display:flex; flex-direction:column;
  overflow:hidden; page-break-after:always; break-after:page;
}
.page:last-child{page-break-after:auto;break-after:auto}
@media screen{ .page{margin:0 auto 22px;box-shadow:0 10px 40px rgba(0,0,0,.34)} }

/* ---------- title block ---------- */
.masthead{display:flex;align-items:flex-end;gap:18px;border-bottom:1.6px solid var(--ink);padding-bottom:7px}
.mh-main{flex:1 1 auto;min-width:0}
.eyebrow{font-family:"IBM Plex Mono",monospace;font-size:7.6pt;letter-spacing:.17em;text-transform:uppercase;color:var(--ink-3);margin:0 0 2px}
.masthead h1{font-size:25pt;line-height:.98;letter-spacing:-.005em}
.masthead h1 em{font-style:normal;color:var(--gold)}
.mh-dek{margin:2px 0 0;font-size:9.4pt;color:var(--ink-2);max-width:74ch}
.tblock{display:grid;grid-template-columns:repeat(6,auto);gap:0;border:1px solid var(--ink);flex:0 0 auto;align-self:flex-end}
.tblock div{padding:3px 9px 4px;border-right:1px solid var(--rule)}
.tblock div:last-child{border-right:0}
.tblock dt{font-family:"IBM Plex Mono",monospace;font-size:6.2pt;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:0}
.tblock dd{font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:11.4pt;margin:0;line-height:1.1;white-space:nowrap}

/* ---------- plate ---------- */
.plate{position:relative;flex:1 1 auto;margin-top:8px}
.plate-inner{position:absolute;inset:0}
.board-svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.mat{
  fill:url(#matbg); stroke:#0E1512; stroke-width:1;
}
.col{position:absolute;top:1.33%;height:97.4%;width:21.875%}
.col .callout .c-spec{font-size:6.8pt}
.callout{margin-bottom:9px}
.col[data-placed] .callout{margin-bottom:0;position:absolute;left:0;right:0}
.col.L{left:1.172%} .col.R{left:76.953%}

.callout{
  background:var(--surface);border:1px solid var(--rule);border-left:3px solid var(--gold);
  border-radius:4px;padding:6px 9px 7px;box-shadow:0 1px 2px rgba(16,28,22,.09);
}
.callout.bonus{border-left-color:var(--copper);background:var(--paper)}
.c-head{display:flex;gap:7px;align-items:flex-start}
.c-num{
  flex:0 0 auto;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;
  font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:9.6pt;
  background:var(--gold);color:var(--surface);margin-top:1px;
}
.bonus .c-num,.ref.bonus .c-num{background:var(--copper)}
.c-id{min-width:0}
.c-head h3{font-size:14pt;line-height:1.02;font-weight:700;letter-spacing:.004em}
.c-spec{font-family:"IBM Plex Mono",monospace;font-size:7.6pt;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);margin:1px 0 0}
.c-brief{margin:5px 0 0;font-size:8.5pt;line-height:1.32;color:var(--ink-2)}

/* ---------- reference pages ---------- */
.sheet{flex:1 1 auto;margin-top:9px;display:flex;flex-direction:column;gap:9px;min-height:0}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;flex:1 1 auto;min-height:0}
.ref{
  background:var(--surface);border:1px solid var(--rule);border-top:3px solid var(--gold);
  border-radius:4px;padding:9px 11px 10px;display:flex;flex-direction:column;overflow:hidden;
}
.ref.bonus{border-top-color:var(--copper);background:var(--paper)}
.r-head{display:flex;gap:9px;align-items:flex-start;padding-bottom:8px;border-bottom:1px solid var(--rule-2)}
.r-head h3{font-size:19pt;line-height:1.02;font-weight:700}
.r-fn{margin:9px 0 0;font-size:10.4pt;line-height:1.42;color:var(--ink-2)}
.r-fn b,.r-note b{color:var(--ink);font-weight:600}
.r-note{
  margin:7px 0 0;padding:6px 8px;border-left:2px solid var(--gold);background:var(--gold-soft);
  font-size:9.9pt;line-height:1.4;color:var(--ink-2);border-radius:0 3px 3px 0;
}
.bonus .r-note{border-left-color:var(--copper);background:var(--copper-soft)}
.r-chips{list-style:none;margin:auto 0 0;padding:8px 0 0;display:flex;flex-wrap:wrap;gap:4px}
.r-chips li{
  font-family:"IBM Plex Mono",monospace;font-size:8pt;letter-spacing:.01em;
  border:1px solid var(--rule);background:var(--bg);color:var(--ink-2);padding:3px 7px;border-radius:3px;
}

/* ---------- flow inset + sources ---------- */
.inset{background:var(--surface);border:1px solid var(--rule);border-top:3px solid var(--ink);border-radius:4px;padding:9px 11px;display:flex;flex-direction:column}
.inset h3{font-size:15pt;line-height:1}
.inset .c-spec{margin-bottom:4px}
.flow{width:100%;flex:1 1 auto;min-height:0;margin-top:2px}
.fb{fill:var(--bg);stroke:var(--rule);stroke-width:1.2}
.fb.pwr{fill:var(--copper-soft);stroke:var(--copper)}
.fb.cpu{fill:var(--gold-soft);stroke:var(--gold);stroke-width:1.8}
.fb.pch{fill:var(--gold-soft);stroke:var(--gold)}
.fb.aux{fill:var(--surface-2);stroke:var(--rule)}
.ft{font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:17px;fill:var(--ink);text-anchor:middle}
.ft.big{font-size:22px;font-weight:700}
.fl{font-family:"IBM Plex Mono",monospace;font-size:11px;fill:var(--ink-3)}
.fa{fill:none;stroke:currentColor;stroke-width:1.6}
.fa.two{marker-start:url(#ar);marker-end:url(#ar)}

.srcbox{border-top-color:var(--ink)}
.srcbox ol{list-style:none;margin:8px 0 0;padding:0}
.srcbox li{margin:0 0 4px;line-height:1.22;display:flex;flex-direction:column}
.srcbox .s-n{font-size:7.7pt}
.s-n{font-weight:600;color:var(--ink)}
.s-w{color:var(--ink-2);font-size:7.1pt}
.s-u{font-family:"IBM Plex Mono",monospace;font-size:5.7pt;color:var(--ink-3);word-break:break-all}

/* ---------- footer ---------- */
.foot{
  display:flex;justify-content:space-between;align-items:center;gap:14px;
  border-top:1px solid var(--rule);margin-top:7px;padding-top:4px;
  font-family:"IBM Plex Mono",monospace;font-size:6.8pt;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink-3);flex:0 0 auto;
}
.key{display:flex;gap:14px;align-items:center;text-transform:none;letter-spacing:.04em}
.key i{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:-1px}
.key i.g{background:var(--gold)} .key i.c{background:var(--copper)}

/* ---------- board svg internals (from source artwork) ---------- */
.silk{font-family:"IBM Plex Mono",monospace;fill:#D9E4DA;opacity:.62;letter-spacing:.04em}
.badge-t{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:22px;fill:#0B0F0C}
.leadline{fill:none;stroke-linecap:round;stroke-linejoin:round}
</style>
</head>
<body>

<!-- ============================ PLATE 1 ============================ -->
<section class="page" id="p1">
  <header class="masthead">
    <div class="mh-main">
      <p class="eyebrow">${D.meta.form}</p>
      <h1>Anatomy of an <em>ATX Motherboard</em></h1>
      <p class="mh-dek">${D.meta.subtitle}. Every part below does one job in the chain that turns wall power into a running operating system. The seven required components are numbered in gold; six additional components are numbered in copper.</p>
    </div>
    <dl class="tblock">
      <div><dt>Prepared by</dt><dd>${D.meta.author}</dd></div>
      <div><dt>Course</dt><dd>${D.meta.course}</dd></div>
      <div><dt>Plate</dt><dd>1 of 3</dd></div>
      <div><dt>View</dt><dd>Top · 1:1</dd></div>
      <div><dt>Rev</dt><dd>1.0</dd></div>
      <div><dt>Sheet</dt><dd>Component map</dd></div>
    </dl>
  </header>

  <div class="plate">
    <div class="plate-inner" id="plate">
      <svg class="board-svg" id="board" viewBox="0 0 ${VW} ${VH}"
           role="img" aria-label="Top-down diagram of an ATX motherboard with thirteen numbered components">
        <defs>
          ${DEFS.replace(/^<defs>|<\/defs>$/gm, '')}
          <linearGradient id="matbg" x1="0" y1="0" x2=".4" y2="1">
            <stop offset="0" stop-color="#18201D"/><stop offset=".55" stop-color="#0D1311"/>
            <stop offset="1" stop-color="#070A09"/>
          </linearGradient>
        </defs>
        <rect class="mat" x="${TX + 250 - 46}" y="${TY + 110 - 46}" width="${1160 + 92}" height="${940 + 92}" rx="12"/>
        <g transform="translate(${TX},${TY})">
          ${ART}
          ${realism}
        </g>
        <g id="leaders"></g>
        ${badges}
      </svg>
      <div class="col L">${colL}</div>
      <div class="col R">${colR}</div>
    </div>
  </div>

  <div class="foot">
    <span>${D.meta.author} · ${D.meta.course} · Plate 1 · Component map</span>
    <span class="key">
      <span><i class="g"></i>Required components 1–7</span>
      <span><i class="c"></i>Additional components 8–13</span>
    </span>
    <span>Composite reference layout · not a copy of any manufacturer's product</span>
  </div>
</section>

<!-- ============================ PLATE 2 ============================ -->
<section class="page" id="p2">
  <header class="masthead">
    <div class="mh-main">
      <p class="eyebrow">Plate 2 · required components</p>
      <h1>The Seven <em>Required Components</em></h1>
      <p class="mh-dek">What each part does, and how it contributes to the overall operation of the computer.</p>
    </div>
    <dl class="tblock">
      <div><dt>Prepared by</dt><dd>${D.meta.author}</dd></div>
      <div><dt>Course</dt><dd>${D.meta.course}</dd></div>
      <div><dt>Plate</dt><dd>2 of 3</dd></div>
      <div><dt>Items</dt><dd>1 – 7</dd></div>
      <div><dt>Rev</dt><dd>1.0</dd></div>
      <div><dt>Sheet</dt><dd>Reference</dd></div>
    </dl>
  </header>
  <div class="sheet">
    <div class="grid">
      ${core}
      <article class="inset">
        <div class="r-head" style="border:0;padding:0">
          <div class="c-id">
            <h3>How the parts connect</h3>
            <p class="c-spec">Power and data flow</p>
          </div>
        </div>
        ${flow}
      </article>
    </div>
  </div>
  <div class="foot">
    <span>${D.meta.author} · ${D.meta.course} · Plate 2 · Required components 1–7</span>
    <span class="key"><span><i class="g"></i>Required components 1–7</span></span>
    <span>Page 2 of 3</span>
  </div>
</section>

<!-- ============================ PLATE 3 ============================ -->
<section class="page" id="p3">
  <header class="masthead">
    <div class="mh-main">
      <p class="eyebrow">Plate 3 · additional components</p>
      <h1>Six <em>Additional Components</em></h1>
      <p class="mh-dek">Parts beyond the required seven that a modern ATX board depends on, with the same accuracy standard applied.</p>
    </div>
    <dl class="tblock">
      <div><dt>Prepared by</dt><dd>${D.meta.author}</dd></div>
      <div><dt>Course</dt><dd>${D.meta.course}</dd></div>
      <div><dt>Plate</dt><dd>3 of 3</dd></div>
      <div><dt>Items</dt><dd>8 – 13</dd></div>
      <div><dt>Rev</dt><dd>1.0</dd></div>
      <div><dt>Sheet</dt><dd>Reference</dd></div>
    </dl>
  </header>
  <div class="sheet">
    <div class="grid">${bonus}
      <article class="inset" style="border-top-color:var(--copper)">
        <div class="r-head" style="border:0;padding:0">
          <div class="c-id">
            <h3>Reading the board</h3>
            <p class="c-spec">Conventions used on Plate 1</p>
          </div>
        </div>
        <p class="r-fn">Silkscreen text printed beside each connector (<span class="mono">EATX12V_1</span>, <span class="mono">DIMM_A1</span>, <span class="mono">SATA6G_1&ndash;4</span>, <span class="mono">F_PANEL</span>) matches the naming a real board manual uses, so a part found on the plate can be found in a manual.</p>
        <p class="r-fn">The nine ringed holes are ATX mounting points; brass standoffs in the case thread into them and ground the board. Green traces are the copper routing between components, and the small gold circles are vias carrying a signal to another layer of the board.</p>
        <p class="r-note" style="border-left-color:var(--copper);background:var(--copper-soft)"><b>Scale &mdash; </b>the board is drawn at true ATX proportions, 305 &times; 244 mm, so the relative size of every component on the plate reflects the real part.</p>
      </article>
      <article class="ref srcbox">
        <div class="r-head">
          <div class="c-id">
            <h3>Sources consulted</h3>
            <p class="c-spec">Each figure checked against the source beside it</p>
          </div>
        </div>
        <ol>${sources}</ol>
      </article>
    </div>
  </div>
  <div class="foot">
    <span>${D.meta.author} · ${D.meta.course} · Plate 3 · Additional components 8–13</span>
    <span class="key"><span><i class="c"></i>Additional components 8–13</span></span>
    <span>Page 3 of 3</span>
  </div>
</section>

<script>
/* Leader lines are drawn after layout so the callout columns can size themselves
   to their own content. Each line leaves the inner edge of a card, runs a short
   horizontal stub, then strikes the component it names.                        */
var TARGETS = ${JSON.stringify(targets)};
var VW = ${VW}, VH = ${VH};
var GOLD = ${JSON.stringify(GOLD)}, COPPER = ${JSON.stringify(COPPER)};
var GAP = 9;

/* Each callout is pulled level with the component it names, then neighbours are
   pushed apart just enough to stop them overlapping. Leaders come out close to
   horizontal, so no line has to cut across the board to reach its part. */
function placeColumn(side){
  var col   = document.querySelector('.col.' + side);
  var plate = document.getElementById('plate');
  var pb    = plate.getBoundingClientRect();
  var cb    = col.getBoundingClientRect();
  var offset = cb.top - pb.top;

  var items = [].map.call(col.querySelectorAll('.callout'), function(el){
    var tgt = TARGETS[el.dataset.id];
    return { el: el, h: el.offsetHeight, want: (tgt[1] / VH) * pb.height - offset };
  });
  items.sort(function(a, b){ return a.want - b.want; });
  var BLEND = 0.42;
  items.forEach(function(it, i){
    var even = (i + 0.5) * cb.height / items.length;
    it.want = it.want * (1 - BLEND) + even * BLEND;
  });

  var sum = items.reduce(function(s, i){ return s + i.h; }, 0);
  if (sum + GAP * (items.length - 1) >= cb.height){
    var extra = (cb.height - sum) / (items.length - 1), y = 0;
    items.forEach(function(i){ i.top = y; y += i.h + extra; });
  } else {
    var y2 = 0;
    items.forEach(function(i){ i.top = Math.max(y2, i.want - i.h / 2); y2 = i.top + i.h + GAP; });
    var over = items[items.length - 1].top + items[items.length - 1].h - cb.height;
    for (var k = items.length - 1; k >= 0 && over > 0; k--){
      items[k].top -= over;
      over = (k > 0) ? (items[k - 1].top + items[k - 1].h + GAP) - items[k].top : -items[k].top;
      if (over < 0) break;
    }
    if (items[0].top < 0) items[0].top = 0;
  }
  items.forEach(function(i){ i.el.style.top = i.top + 'px'; });
  col.setAttribute('data-placed', '');
}

function drawLeaders(){
  var plate = document.getElementById('plate');
  var g     = document.getElementById('leaders');
  var pb    = plate.getBoundingClientRect();
  var sx    = VW / pb.width, sy = VH / pb.height;
  g.textContent = '';

  document.querySelectorAll('.callout').forEach(function(el){
    var right = el.dataset.side === 'R';
    var pt    = TARGETS[el.dataset.id];
    var r     = el.getBoundingClientRect();
    var x0    = (right ? r.left - pb.left : r.right - pb.left) * sx;
    var y0    = (r.top - pb.top + r.height / 2) * sy;
    var stub  = right ? -30 : 30;
    var colour = el.classList.contains('bonus') ? COPPER : GOLD;
    var d = 'M' + x0 + ' ' + y0 + ' H' + (x0 + stub) + ' L' + pt[0] + ' ' + pt[1];

    ['#05100C', colour].forEach(function(c, i){
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', 'leadline');
      p.setAttribute('stroke', c);
      p.setAttribute('stroke-width', i ? 2 : 5.5);
      if (!i) p.setAttribute('opacity', '.5');
      g.appendChild(p);
    });
    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', pt[0]); dot.setAttribute('cy', pt[1]);
    dot.setAttribute('r', 5); dot.setAttribute('fill', colour);
    dot.setAttribute('stroke', '#05100C'); dot.setAttribute('stroke-width', 1.2);
    g.appendChild(dot);
  });
}

function layout(){
  placeColumn('L'); placeColumn('R'); drawLeaders();
  document.documentElement.dataset.leaders = 'ready';
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
else window.addEventListener('load', layout);
</script>
</body>
</html>`;

fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/submission.html', html);
console.log('build/submission.html  %d KB', Math.round(html.length / 1024));
