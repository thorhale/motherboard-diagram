import fs from 'node:fs';

let h = fs.readFileSync('build/submission.html', 'utf8');

// The artifact platform supplies the document skeleton, so ship only title + style + content.
h = h.replace(/^[\s\S]*?<title>/, '<title>')
     .replace(/<\/head>\s*<body>/, '')
     .replace(/<\/body>\s*<\/html>\s*$/, '');

// The plates are a fixed 17in wide. Scale the whole deck to the viewport so the
// page reads on a phone without ever scrolling sideways.
const screenCss = `
/* ---------- screen presentation (print output is unaffected) ---------- */
@media screen{
  :root{color-scheme:light}
  body{background:#8C968D;margin:0;padding-block:16px}
  #deckwrap{margin:0 auto;overflow:hidden}
  #deck{width:1632px;transform-origin:top left}
  .page{margin:0 auto 16px;box-shadow:0 14px 48px rgba(6,14,10,.42)}
  .deck-note{
    max-width:1632px;margin:0 auto 14px;padding:0 16px;
    font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;
    font-size:clamp(8px,1.6vw,11px);line-height:1.5;
    letter-spacing:.1em;text-transform:uppercase;color:#E8EDE7;
    display:flex;gap:10px 18px;flex-wrap:wrap;justify-content:space-between;
  }
}
@media print{ .deck-note{display:none} #deck{width:auto;transform:none!important} #deckwrap{height:auto!important;width:auto!important} }
</style>`;
h = h.replace('</style>', screenCss);

h = h.replace(/(<!-- =+ PLATE 1 =+ -->)/,
  `<div class="deck-note"><span>Anatomy of an ATX Motherboard · 3 plates</span><span>Plates 1–3 · print at 17 × 11 in</span></div>
<div id="deckwrap"><div id="deck">
$1`);
h = h.replace(/(\n<script>)/, '\n</div></div>\n$1');

// layout() measures unscaled boxes, so it has to run before the deck is scaled;
// the fit is pure presentation and re-runs on resize.
const bootSrc = [
  "function fit(){",
  "  var wrap = document.getElementById('deckwrap'), deck = document.getElementById('deck');",
  "  if (!wrap || !deck) return;",
  "  var s = Math.min(1, (window.innerWidth - 24) / 1632);",
  "  deck.style.transform = 'scale(' + s + ')';",
  "  wrap.style.width  = Math.round(1632 * s) + 'px';",
  "  wrap.style.height = Math.round(deck.offsetHeight * s) + 'px';",
  "}",
  "function boot(){ layout(); fit(); }",
  "if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);",
  "else window.addEventListener('load', boot);",
  "window.addEventListener('resize', fit);"
].join('\n');

const oldBoot = "if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);\nelse window.addEventListener('load', layout);";
if (!h.includes(oldBoot)) throw new Error('boot hook not found in submission.html');
h = h.replace(oldBoot, bootSrc);

fs.writeFileSync('build/artifact.html', h);
console.log('build/artifact.html  %d KB', Math.round(h.length / 1024));
console.log('  wrapper tags removed:', !/<!doctype|<html|<\/body>/i.test(h));
console.log('  has title:', /<title>/.test(h.slice(0, 8192)));
