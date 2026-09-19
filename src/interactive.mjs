import fs from 'node:fs';
import { DEFS, ART, realism } from './board.mjs';

const D     = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));
const FONTS = fs.readFileSync('assets/fonts.css', 'utf8');
const C     = D.components;
const GOLD = '#E5B55C', COPPER = '#DE8A62';

const badges = C.flatMap(c => c.badges.map(([x, y]) => `
  <g class="badge-g" data-id="${c.id}" data-cat="${c.cat}">
    <circle cx="${x}" cy="${y}" r="21" fill="#05100C" opacity=".55"/>
    <circle cx="${x}" cy="${y}" r="18.5" fill="${c.cat === 'core' ? GOLD : COPPER}" stroke="#08110D" stroke-width="1.5"/>
    <text x="${x}" y="${y + 7}" text-anchor="middle" class="badge-t">${c.n}</text>
  </g>`).join('')).join('');

const card = c => `
  <article class="cell ${c.cat}">
    <div class="d-head">
      <span class="badge ${c.cat}">${c.n}</span>
      <div><div class="d-name">${c.name}</div><div class="d-sub">${c.spec}</div></div>
    </div>
    <p>${c.fn}</p>
    <p class="d-note"><b>Why it matters — </b>${c.note}</p>
    <div class="chips">${c.chips.map(x => `<span class="chip">${x}</span>`).join('')}</div>
  </article>`;

const sources = D.sources.map(([n, w, u]) =>
  `<li><span class="s-n">${n}</span><span class="s-w">${w}</span><span class="s-u">${u}</span></li>`).join('');

const html = `<title>Anatomy of an ATX Motherboard</title>
<meta name="description" content="${D.meta.subtitle}">
<style>
${FONTS}
:root{
  --bg:#E7EAE5; --surface:#F6F7F4; --surface-2:#DBDFD7; --rule:#C4CABF;
  --ink:#16211B; --ink-2:#47554C; --ink-3:#74827A;
  --gold:#8F6519; --gold-soft:#EFE2C0; --copper:#9A4A26; --copper-soft:#F2DED3;
  --good:#1C6B46; --bad:#A32C22;
  --shadow:0 1px 2px rgba(16,28,22,.08), 0 8px 24px -12px rgba(16,28,22,.28);
  color-scheme:light;
}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  --bg:#0C120F; --surface:#131A16; --surface-2:#1A231E; --rule:#28332C;
  --ink:#E7ECE6; --ink-2:#A4B0A7; --ink-3:#6F7E75;
  --gold:#E5B55C; --gold-soft:#3A2F16; --copper:#DE8A62; --copper-soft:#3A2117;
  --good:#5CC493; --bad:#E4776A;
  --shadow:0 1px 2px rgba(0,0,0,.4), 0 10px 30px -14px rgba(0,0,0,.7);
  color-scheme:dark; } }
:root[data-theme="dark"]{
  --bg:#0C120F; --surface:#131A16; --surface-2:#1A231E; --rule:#28332C;
  --ink:#E7ECE6; --ink-2:#A4B0A7; --ink-3:#6F7E75;
  --gold:#E5B55C; --gold-soft:#3A2F16; --copper:#DE8A62; --copper-soft:#3A2117;
  --good:#5CC493; --bad:#E4776A;
  --shadow:0 1px 2px rgba(0,0,0,.4), 0 10px 30px -14px rgba(0,0,0,.7);
  color-scheme:dark; }

*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);margin:0;
  font-family:"IBM Plex Sans",-apple-system,"Segoe UI",sans-serif;font-size:15px;line-height:1.55;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1560px;margin:0 auto;padding-block:26px 56px;padding-left:16px;padding-right:16px}
h1,h2,h3,.cond{font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:600;margin:0}
.mono{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace}

header.mast{border-bottom:1px solid var(--rule);padding-bottom:16px}
.eyebrow{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink-3);margin:0 0 6px}
h1{font-size:clamp(28px,4.4vw,46px);line-height:1;margin:0 0 8px;text-wrap:balance;letter-spacing:-.005em}
h1 em{font-style:normal;color:var(--gold)}
.dek{margin:0;max-width:66ch;color:var(--ink-2)}
.byline{margin:10px 0 0;font-family:"IBM Plex Mono",monospace;font-size:11.5px;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
.byline b{color:var(--ink);font-weight:600}

.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:16px}
.btn{font-family:"Barlow Condensed",sans-serif;font-size:16px;font-weight:600;letter-spacing:.03em;
  text-transform:uppercase;background:var(--surface);color:var(--ink);border:1px solid var(--rule);
  border-radius:7px;padding:7px 13px 6px;cursor:pointer;line-height:1.15;
  transition:background .15s,border-color .15s,color .15s}
.btn:hover{border-color:var(--gold);color:var(--gold)}
.btn[aria-pressed="true"]{background:var(--gold);border-color:var(--gold);color:var(--bg)}
.btn.primary{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn.primary:hover{background:var(--gold);border-color:var(--gold);color:var(--bg)}
.btn:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.hint{font-size:12.5px;color:var(--ink-3);font-family:"IBM Plex Mono",monospace;margin-left:auto}

.stage{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px;margin-top:18px;align-items:start}
@media (max-width:1080px){.stage{grid-template-columns:1fr}}
.mat{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--rule);
  background:radial-gradient(120% 100% at 30% 0%,#12181A 0%,#070A0B 78%);box-shadow:var(--shadow);padding:6px}
.mat svg{display:block;width:100%;height:auto}
.matbar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:8px 12px 9px;margin:-6px -6px 0;
  border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03)}
.key{display:flex;align-items:center;gap:6px;font-family:"IBM Plex Mono",monospace;font-size:11px;
  letter-spacing:.08em;text-transform:uppercase;color:#9AA8A0}
.dot{width:11px;height:11px;border-radius:50%;display:inline-block}
.dot.core{background:${GOLD}} .dot.bonus{background:${COPPER}}
.matbar .scale{margin-left:auto;color:#7C8A83}

.hot{fill:transparent;cursor:pointer;outline:none}
.badge-t{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:19px;fill:#0B0F0C;pointer-events:none}
.tag-box{fill:#0C1210;stroke:${GOLD};stroke-width:1.4}
.tag-box.b{stroke:${COPPER}}
.tag-t{font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:21px;fill:#F2F4F0;letter-spacing:.02em}
.tag-s{font-family:"IBM Plex Mono",monospace;font-size:12.5px;fill:#95A29A}
.lead{stroke:${GOLD};stroke-width:1.5;fill:none;opacity:.85}
.lead.b{stroke:${COPPER}}
.silk{font-family:"IBM Plex Mono",monospace;fill:#D9E4DA;opacity:.62;letter-spacing:.04em;pointer-events:none}
#spot{opacity:0;transition:opacity .28s ease;pointer-events:none}
#spot.on{opacity:.66}
#ring{opacity:0;transition:opacity .2s ease;pointer-events:none;fill:none;stroke:#FFD98A;stroke-width:3.5}
#ring.on{opacity:1;animation:breathe 2.1s ease-in-out infinite}
@keyframes breathe{0%,100%{stroke-opacity:.95}50%{stroke-opacity:.4}}
.labels{transition:opacity .2s ease}
.labels.off{opacity:0;pointer-events:none}
@media (prefers-reduced-motion:reduce){#ring.on{animation:none}*{transition-duration:.01ms !important}}

.rail{position:sticky;top:12px;display:flex;flex-direction:column;gap:14px}
@media (max-width:1080px){.rail{position:static}}
.card{background:var(--surface);border:1px solid var(--rule);border-radius:10px;box-shadow:var(--shadow)}
.detail{padding:16px 17px 18px;min-height:280px}
.d-head{display:flex;gap:11px;align-items:flex-start}
.badge{flex:0 0 auto;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;
  font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:14px;background:var(--gold);color:var(--surface)}
.badge.bonus{background:var(--copper)}
.d-name{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:27px;line-height:1.02;margin:1px 0 2px}
.d-sub{font-family:"IBM Plex Mono",monospace;font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3)}
.detail p{margin:13px 0 0;font-size:14.5px;color:var(--ink-2)}
.detail p b,.cell p b{color:var(--ink);font-weight:600}
.d-note{margin:12px 0 0;padding:9px 11px;border-left:2px solid var(--gold);background:var(--gold-soft);
  font-size:13.4px;border-radius:0 6px 6px 0}
.bonus .d-note{border-left-color:var(--copper);background:var(--copper-soft)}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}
.chip{font-family:"IBM Plex Mono",monospace;font-size:11px;border:1px solid var(--rule);background:var(--bg);
  color:var(--ink-2);padding:3px 7px;border-radius:5px}
.d-empty{color:var(--ink-3);font-size:14px}

.idx{padding:6px}
.idx h3{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:10.5px;letter-spacing:.15em;
  text-transform:uppercase;color:var(--ink-3);margin:10px 10px 6px}
.idx ol{list-style:none;margin:0;padding:0}
.idx button{display:flex;gap:10px;align-items:baseline;width:100%;text-align:left;background:none;border:0;
  border-radius:7px;padding:6px 10px;cursor:pointer;color:var(--ink);font-family:inherit;font-size:14px}
.idx button:hover{background:var(--surface-2)}
.idx button[aria-current="true"]{background:var(--gold);color:var(--surface)}
.idx button[aria-current="true"] .n,.idx button[aria-current="true"] .sub{color:var(--surface);opacity:.85}
.idx .n{font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--ink-3);width:18px;flex:0 0 auto}
.idx .nm{font-family:"Barlow Condensed",sans-serif;font-size:19px;font-weight:600;line-height:1.1;flex:0 1 auto}
.idx .sub{font-family:"IBM Plex Mono",monospace;font-size:10.5px;color:var(--ink-3);margin-left:auto;
  white-space:nowrap;padding-left:8px}

.quiz{padding:16px 17px 18px;display:none}
.quiz.on{display:block}
.detail.hide{display:none}
.q-k{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:0}
.q-prompt{font-family:"Barlow Condensed",sans-serif;font-size:26px;font-weight:600;line-height:1.1;margin:6px 0 10px}
.q-prompt span{color:var(--gold)}
.q-fb{font-size:14px;min-height:44px;margin:10px 0 0;color:var(--ink-2)}
.q-fb.good{color:var(--good)} .q-fb.bad{color:var(--bad)}
.q-score{font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--ink-3);margin:10px 0 0}
.q-bar{height:5px;background:var(--surface-2);border-radius:3px;overflow:hidden;margin-top:7px}
.q-bar i{display:block;height:100%;background:var(--gold);width:0;transition:width .3s ease}

.ref{margin-top:34px;border-top:1px solid var(--rule);padding-top:22px}
.ref h2{font-size:29px;margin:0}
.ref .sub{color:var(--ink-3);font-family:"IBM Plex Mono",monospace;font-size:11.5px;
  letter-spacing:.09em;text-transform:uppercase}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1px;background:var(--rule);
  border:1px solid var(--rule);border-radius:10px;overflow:hidden;margin-top:16px}
.cell{background:var(--surface);padding:15px 17px 17px}
.cell.bonus{background:var(--bg)}
.cell p{margin:9px 0 0;font-size:14px;color:var(--ink-2)}

.src{margin-top:30px;border-top:1px solid var(--rule);padding-top:18px}
.src h2{font-size:22px;margin:0}
.src ol{list-style:none;margin:12px 0 0;padding:0;display:grid;
  grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px 22px}
.src li{display:flex;flex-direction:column;font-size:13px;line-height:1.35}
.s-n{font-weight:600}
.s-w{color:var(--ink-2)}
.s-u{font-family:"IBM Plex Mono",monospace;font-size:10.5px;color:var(--ink-3);word-break:break-all}
footer{margin-top:30px;padding-top:14px;border-top:1px solid var(--rule);color:var(--ink-3);font-size:12.5px}
</style>

<div class="wrap">
<header class="mast">
  <p class="eyebrow">${D.meta.form}</p>
  <h1>Anatomy of an <em>ATX Motherboard</em></h1>
  <p class="dek">Every part on this board does one job in the chain that turns wall power into a running operating system. Hover or tap any part to isolate it — the seven required components are numbered in gold, six extras in copper.</p>
  <p class="byline">Prepared by <b>${D.meta.author}</b> &middot; ${D.meta.course}</p>
  <div class="toolbar">
    <button class="btn" id="btnLabels" aria-pressed="true">Callout labels</button>
    <button class="btn" id="btnBonus" aria-pressed="true">Show extras 8&ndash;13</button>
    <button class="btn primary" id="btnQuiz">Start quiz</button>
    <span class="hint" id="hint">Click a component to pin it &middot; Esc clears</span>
  </div>
</header>

<div class="stage">
<div>
<div class="mat">
  <div class="matbar">
    <span class="key"><i class="dot core"></i> Required 1&ndash;7</span>
    <span class="key"><i class="dot bonus"></i> Bonus 8&ndash;13</span>
    <span class="key scale mono">Top view &middot; 1:1 proportions</span>
  </div>
<svg viewBox="0 0 1700 1180" id="board" role="img"
     aria-label="Top-down diagram of an ATX motherboard with thirteen labeled components">
<defs>
  ${DEFS}
  <mask id="spotmask">
    <rect x="0" y="0" width="1700" height="1180" fill="#fff"/>
    <rect id="h0" x="0" y="0" width="0" height="0" rx="10" fill="#000"/>
    <rect id="h1" x="0" y="0" width="0" height="0" rx="10" fill="#000"/>
    <rect id="h2" x="0" y="0" width="0" height="0" rx="10" fill="#000"/>
  </mask>
</defs>
${ART}
${realism}
<rect id="spot" x="0" y="0" width="1700" height="1180" fill="#03070A" mask="url(#spotmask)"/>
<rect id="ring" x="0" y="0" width="0" height="0" rx="10"/>
<g id="leads"></g>
<g id="pins">${badges}</g>
<g id="tags" class="labels"></g>
<g id="hots"></g>
</svg>
</div>
</div>

<aside class="rail">
  <div class="card detail" id="detail"></div>
  <div class="card quiz" id="quiz">
    <p class="q-k">Practical &middot; question <span id="qn">1</span> of 8</p>
    <p class="q-prompt">Click the <span id="qtarget">CPU socket</span> on the board.</p>
    <p class="q-fb" id="qfb">Find it on the diagram and click it.</p>
    <div class="q-bar"><i id="qbar"></i></div>
    <p class="q-score" id="qscore"></p>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn" id="qskip">Skip</button><button class="btn" id="qend">End quiz</button>
    </div>
  </div>
  <div class="card idx" id="index"></div>
</aside>
</div>

<section class="ref">
  <h2>Component reference</h2>
  <p class="sub">Seven required &middot; six bonus &middot; what each one does</p>
  <div class="grid">${C.map(card).join('')}</div>
</section>

<section class="src">
  <h2>Sources consulted</h2>
  <p class="sub">Each figure checked against the source beside it</p>
  <ol>${sources}</ol>
</section>

<footer>Board drawn to ATX proportions (305 &times; 244 mm) as a composite reference layout, not a copy of any manufacturer's product. Prepared by ${D.meta.author} for ${D.meta.course}.</footer>
</div>

<script>
(function(){
"use strict";
var C = ${JSON.stringify(C)};
var SVGNS = "http://www.w3.org/2000/svg";
var el = function(t,a){var e=document.createElementNS(SVGNS,t);for(var k in a)e.setAttribute(k,a[k]);return e;};
var $ = function(s){return document.querySelector(s);};
var byId = {}; C.forEach(function(c){byId[c.id]=c;});
var gLeads=$("#leads"), gTags=$("#tags"), gHots=$("#hots");
var spot=$("#spot"), ring=$("#ring"), holes=[$("#h0"),$("#h1"),$("#h2")];
var TW=232, TH=52;

function tagRect(c){var t=c.tag;
  if(t.s==="top")return [t.v,28]; if(t.s==="bottom")return [t.v,1100];
  if(t.s==="left")return [8,t.v]; return [1460,t.v];}
function tagAnchor(c){var r=tagRect(c),t=c.tag;
  if(t.s==="top")return [r[0]+TW/2,r[1]+TH]; if(t.s==="bottom")return [r[0]+TW/2,r[1]];
  if(t.s==="left")return [r[0]+TW,r[1]+TH/2]; return [r[0],r[1]+TH/2];}

C.forEach(function(c){
  var b = c.cat==="bonus", cls = b?" b":"";
  var a = tagAnchor(c), r = tagRect(c);
  var g = el("g",{"class":"leadwrap","data-id":c.id,"data-cat":c.cat});
  g.appendChild(el("line",{x1:a[0],y1:a[1],x2:c.lead[0],y2:c.lead[1],stroke:"#05100C","stroke-width":"4","stroke-linecap":"round",opacity:".55"}));
  g.appendChild(el("line",{x1:a[0],y1:a[1],x2:c.lead[0],y2:c.lead[1],"class":"lead"+cls}));
  g.appendChild(el("circle",{cx:c.lead[0],cy:c.lead[1],r:"4",fill:b?"${COPPER}":"${GOLD}"}));
  gLeads.appendChild(g);

  var tg = el("g",{"class":"tagwrap","data-id":c.id,"data-cat":c.cat});
  tg.appendChild(el("rect",{x:r[0],y:r[1],width:TW,height:TH,rx:5,"class":"tag-box"+cls}));
  tg.appendChild(el("rect",{x:r[0],y:r[1],width:5,height:TH,rx:2.5,fill:b?"${COPPER}":"${GOLD}"}));
  var t1=el("text",{x:r[0]+15,y:r[1]+24,"class":"tag-t"}); t1.textContent=c.name.toUpperCase(); tg.appendChild(t1);
  var t2=el("text",{x:r[0]+15,y:r[1]+42,"class":"tag-s"}); t2.textContent=c.short; tg.appendChild(t2);
  gTags.appendChild(tg);

  c.box.forEach(function(x){
    var h = el("rect",{x:x[0],y:x[1],width:x[2],height:x[3],"class":"hot","data-id":c.id,tabindex:"0",role:"button"});
    h.setAttribute("aria-label", c.name+" — "+c.spec);
    gHots.appendChild(h);
  });
});

var sel=null, locked=false, quizOn=false;
function detail(c){
  var d=$("#detail");
  if(!c){ d.className="card detail"; d.innerHTML='<p class="d-empty">Hover any part of the board — or pick from the list below — to isolate it and read what it does.<br><br>The seven required components carry gold numbers. Bonus components carry copper.</p>'; return; }
  d.className="card detail"+(c.cat==="bonus"?" bonus":"");
  d.innerHTML='<div class="d-head"><span class="badge '+c.cat+'">'+c.n+'</span><div><div class="d-name">'+c.name+'</div><div class="d-sub">'+c.spec+'</div></div></div>'+
    '<p>'+c.fn+'</p><p class="d-note"><b>Why it matters — </b>'+c.note+'</p>'+
    '<div class="chips">'+c.chips.map(function(x){return '<span class="chip">'+x+'</span>';}).join('')+'</div>';
}
function mark(id){
  document.querySelectorAll("#index button").forEach(function(b){
    b.setAttribute("aria-current", b.dataset.id===id ? "true":"false"); });
}
function paint(c){
  if(!c){ spot.classList.remove("on"); ring.classList.remove("on"); detail(null); mark(null); return; }
  for(var i=0;i<3;i++){ var b=c.box[i];
    if(b){ holes[i].setAttribute("x",b[0]-8); holes[i].setAttribute("y",b[1]-8);
           holes[i].setAttribute("width",b[2]+16); holes[i].setAttribute("height",b[3]+16); }
    else { holes[i].setAttribute("width",0); holes[i].setAttribute("height",0); } }
  var m=c.box[0];
  ring.setAttribute("x",m[0]-8); ring.setAttribute("y",m[1]-8);
  ring.setAttribute("width",m[2]+16); ring.setAttribute("height",m[3]+16);
  spot.classList.add("on"); ring.classList.add("on"); detail(c); mark(c.id);
}
function hover(c){ if(!locked && !quizOn) paint(c); }

gHots.addEventListener("mouseover",function(e){var id=e.target.dataset.id; if(id) hover(byId[id]);});
gHots.addEventListener("mouseout",function(e){
  var rt=e.relatedTarget; if(rt && rt.dataset && rt.dataset.id) return;
  if(!locked && !quizOn) paint(null);});
gHots.addEventListener("focusin",function(e){var id=e.target.dataset.id; if(id) hover(byId[id]);});
gHots.addEventListener("click",function(e){
  var id=e.target.dataset.id; if(!id) return;
  if(quizOn){ answer(id); return; }
  if(locked && sel===id){ locked=false; sel=null; paint(null); }
  else { locked=true; sel=id; paint(byId[id]); }});
gHots.addEventListener("keydown",function(e){
  if(e.key==="Enter"||e.key===" "){ e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click",{bubbles:true})); }});
document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ locked=false; sel=null; paint(null); }});

(function(){
  var ix=$("#index");
  function list(title,arr,cls){
    var h=document.createElement("h3"); h.textContent=title; ix.appendChild(h);
    var ol=document.createElement("ol"); ol.className=cls;
    arr.forEach(function(c){
      var li=document.createElement("li"), b=document.createElement("button");
      b.dataset.id=c.id; b.type="button";
      b.innerHTML='<span class="n">'+c.n+'</span><span class="nm">'+c.name+'</span><span class="sub">'+c.short+'</span>';
      b.addEventListener("click",function(){
        if(quizOn) return;
        if(locked && sel===c.id){ locked=false; sel=null; paint(null); }
        else { locked=true; sel=c.id; paint(c); }});
      b.addEventListener("mouseenter",function(){ hover(c); });
      li.appendChild(b); ol.appendChild(li); });
    ix.appendChild(ol);
  }
  list("Required components 1–7", C.filter(function(c){return c.cat==="core";}), "core");
  list("Bonus components 8–13",  C.filter(function(c){return c.cat!=="core";}), "bonus");
})();

var btnL=$("#btnLabels"), btnB=$("#btnBonus");
btnL.addEventListener("click",function(){
  var on=btnL.getAttribute("aria-pressed")!=="true";
  btnL.setAttribute("aria-pressed",on);
  gTags.classList.toggle("off",!on); gLeads.style.opacity=on?"1":"0";});
function bonusVis(on){
  ["#leads .leadwrap","#tags .tagwrap","#pins .badge-g"].forEach(function(s){
    document.querySelectorAll(s).forEach(function(n){
      if(n.dataset.cat==="bonus") n.style.display=on?"":"none"; });});
  document.querySelectorAll("#index ol.bonus, .cell.bonus").forEach(function(n){ n.style.display=on?"":"none"; });
  document.querySelectorAll("#index h3").forEach(function(h,i){ if(i===1) h.style.display=on?"":"none"; });
}
btnB.addEventListener("click",function(){
  var on=btnB.getAttribute("aria-pressed")!=="true";
  btnB.setAttribute("aria-pressed",on); bonusVis(on);});

var pool=[], qi=0, asked=0, firstTry=true, firsts=0;
var qEl=$("#quiz"), dEl=$("#detail");
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function startQuiz(){
  quizOn=true; locked=false; sel=null; paint(null);
  var avail = btnB.getAttribute("aria-pressed")==="true" ? C.slice() : C.filter(function(c){return c.cat==="core";});
  pool = shuffle(avail.slice()).slice(0, Math.min(8, avail.length));
  qi=0; asked=0; firsts=0;
  qEl.classList.add("on"); dEl.classList.add("hide");
  $("#btnQuiz").textContent="Quiz running"; $("#hint").textContent="Click the named part on the board";
  ask();
}
function endQuiz(){
  quizOn=false; qEl.classList.remove("on"); dEl.classList.remove("hide");
  $("#btnQuiz").textContent="Start quiz"; $("#hint").textContent="Click a component to pin it · Esc clears";
  paint(null);
}
function score(){ $("#qscore").textContent="First-try correct "+firsts+" / "+qi+"  ·  attempts "+asked; }
function ask(){
  if(qi>=pool.length){
    $("#qtarget").textContent="—"; $("#qfb").className="q-fb good";
    $("#qfb").textContent="Done. "+firsts+" of "+pool.length+" correct on the first try ("+Math.round(firsts/pool.length*100)+"%).";
    $("#qbar").style.width="100%"; score(); return; }
  firstTry=true;
  $("#qn").textContent=qi+1;
  $("#qtarget").textContent=pool[qi].name.toLowerCase();
  $("#qfb").className="q-fb"; $("#qfb").textContent="Find it on the diagram and click it.";
  $("#qbar").style.width=Math.round(qi/pool.length*100)+"%"; score();
}
function answer(id){
  if(qi>=pool.length) return;
  var want=pool[qi]; asked++;
  if(id===want.id){
    if(firstTry) firsts++;
    $("#qfb").className="q-fb good";
    $("#qfb").textContent="Correct — "+want.name+". "+want.chips[0]+".";
    quizOn=false; paint(want); quizOn=true; qi++;
    setTimeout(function(){ if(quizOn){ paint(null); ask(); } }, 1250);
  } else {
    firstTry=false; $("#qfb").className="q-fb bad";
    $("#qfb").textContent="That is the "+byId[id].name.toLowerCase()+". Try again — look for "+want.short.toLowerCase()+".";
  }
  score();
}
$("#btnQuiz").addEventListener("click",function(){ if(!quizOn) startQuiz(); });
$("#qend").addEventListener("click",endQuiz);
$("#qskip").addEventListener("click",function(){ firstTry=false; qi++; paint(null); ask(); });

detail(byId.cpu); mark("cpu");
})();
</script>`;

fs.writeFileSync('build/interactive.html', html);
console.log('build/interactive.html  %d KB', Math.round(html.length / 1024));

/* GitHub Pages serves a complete document, and there a real download link works
   (the artifact sandbox blocks them), so this variant gets the PDF button. */
const cut  = html.indexOf('</style>') + '</style>'.length;
const head = html.slice(0, cut);
const body = html.slice(cut).replace('<span class="hint" id="hint">',
  '<a class="btn" href="Motherboard-Diagram.pdf" download>Download PDF</a>\n    <span class="hint" id="hint">');
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1F5A5;</text></svg>">
${head}
</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync('index.html', page);
fs.copyFileSync('build/Motherboard-Diagram.pdf', 'Motherboard-Diagram.pdf');
console.log('index.html  %d KB  (+ Motherboard-Diagram.pdf at repo root for Pages)', Math.round(page.length / 1024));
