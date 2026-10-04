/* AWA SOUNDS — Cover Art store v4
Features:
- Pair card display (clean | titled side-by-side always visible in grid)
- Cinema scroll rail (horizontal film strip pinned by GSAP, driven by scroll)
- Series filter tabs
- Premium Lightbox: WITH TITLE / CLEAN / VIDEO toggle pills, fullscreen zoom, keyboard nav
- Pack Viewer: click album pack → see all covers, click through to lightbox
- GG watermark canvas overlay on all preview images (anti-piracy)
- Receipt FX animation wired to buy flow
========================================================================= */
(function () {
"use strict";

const CFG = window.AWA || {};
const list = document.getElementById("cover-list");
if (!list) return;

const COVERS = (CFG.covers || []).filter(c => !c.auctionOnly && !c.comingSoon);
const COMING_SOON = (CFG.covers || []).filter(c => !c.auctionOnly && c.comingSoon);

const money = n => String.fromCharCode(163) + Number(n).toFixed(0);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const coverDisc = CFG.coverMemberDiscount != null ? CFG.coverMemberDiscount : (CFG.memberDiscount || 0);
const memberPrice = n => Math.round(n * (1 - coverDisc));
const likeId = id => "cover:" + id;
const isMember = () => window.AWAAuth && AWAAuth.isMember();
const daysUntil = d => Math.max(0, Math.ceil((new Date(d) - Date.now()) / 864e5));

const SERIES_LABELS = {
"chrome-reign": "Chrome Reign",
"dark-matter": "Dark Matter",
"golden-hour": "Golden Hour",
"street-cinema": "Street Cinema",
"roots-chrome": "Roots & Chrome"
};

let likeSet = new Set();
let activeSeries = "all";

/* ═══════════════════════════════════════════════════════════════════════════
CSS — pair cards + cinema rail + series filter + lightbox + pack viewer
═══════════════════════════════════════════════════════════════════════════ */
const STYLE = `
/* ── Cinema Rail ──────────────────────────────────────────────────────────── */
.cover-cinema-section{position:relative;height:100vh;min-height:600px;overflow:hidden;background:#000;display:flex;flex-direction:column;justify-content:flex-end}
.cinema-top-strip{flex:1;display:flex;align-items:center;overflow:hidden;position:relative}
.cinema-track{display:flex;gap:10px;padding:0 40px;will-change:transform;flex-shrink:0}
.cinema-thumb{flex-shrink:0;width:240px;cursor:pointer;opacity:.85;transition:opacity .2s}
.cinema-thumb:hover{opacity:1}
.cinema-pair{display:grid;grid-template-columns:1fr 1fr;gap:4px;border-radius:8px;overflow:hidden;aspect-ratio:2/1}
.ct-side{position:relative;overflow:hidden;background:#000}
.ct-side img{width:100%;height:100%;object-fit:cover;display:block}
.ct-title-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:4px 6px 6px;text-align:center}
.ct-title-overlay span{display:block;font-family:'Space Grotesk',sans-serif;font-size:7px;font-weight:800;letter-spacing:.1em;color:#fff;text-transform:uppercase;line-height:1.2}
.ct-title-overlay .ct-artist{font-size:5px;letter-spacing:.15em;color:rgba(255,255,255,.5);margin-top:1px}
.ct-label{position:absolute;top:4px;left:4px;font-size:6px;letter-spacing:.12em;text-transform:uppercase;font-family:'Space Grotesk',sans-serif;font-weight:700;color:rgba(255,255,255,.55);background:rgba(0,0,0,.45);border-radius:2px;padding:1px 4px}
.cinema-thumb-name{font-size:9px;color:rgba(255,255,255,.4);font-family:'Space Grotesk',sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-top:5px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cinema-overlay{position:relative;z-index:10;padding:32px 48px 48px;background:linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.6) 60%,transparent 100%)}
.cinema-overlay .eyebrow{margin-bottom:8px;display:block}
.cinema-overlay h1{font-size:clamp(2rem,6vw,4rem);margin:0 0 12px}
.cinema-overlay .lede{margin:0 0 24px;max-width:500px;font-size:15px}
.cinema-scroll-hint{display:flex;align-items:center;gap:10px;margin-top:20px;opacity:.45}
.cinema-scroll-line{width:36px;height:1px;background:var(--silver,#7070a0);position:relative;overflow:visible}
.cinema-scroll-line::after{content:'';position:absolute;top:-2px;left:0;width:6px;height:6px;border-radius:50%;background:var(--gold,#e0a030);animation:scrollDot 1.6s ease-in-out infinite}
@keyframes scrollDot{0%{transform:translateX(0);opacity:1}70%{transform:translateX(28px);opacity:1}100%{transform:translateX(36px);opacity:0}}
.cinema-scroll-hint span{font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-family:'Space Grotesk',sans-serif;color:var(--muted,#9aa1ab)}

/* ── Series Filter ─────────────────────────────────────────────────────────── */
.series-filter{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:28px}
.series-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--panel,#111318);border:1px solid var(--line);border-radius:8px;font-size:11px;font-weight:700;font-family:'Space Grotesk',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#9aa1ab);cursor:pointer;transition:.15s;white-space:nowrap}
.series-btn:hover{border-color:rgba(224,160,48,.4);color:var(--hi,#e0e0f0)}
.series-btn.active{background:rgba(224,160,48,.08);border-color:rgba(224,160,48,.5);color:var(--gold,#e0a030)}
.series-btn .s-count{font-size:9px;background:rgba(255,255,255,.08);border-radius:4px;padding:1px 5px;margin-left:2px;font-weight:600;letter-spacing:.04em}

/* ── Pair Grid ─────────────────────────────────────────────────────────────── */
.pair-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
.pair-card{background:var(--panel,#111318);border:1px solid var(--line,#222238);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s,transform .2s}
.pair-card:hover{border-color:rgba(224,160,48,.3);transform:translateY(-2px)}

.pair-card-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 8px}
.pair-series-tag{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#9aa1ab);font-family:'Space Grotesk',sans-serif}
.pair-header-right{display:flex;align-items:center;gap:8px}
.pair-premium{font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--gold,#e0a030);background:rgba(224,160,48,.1);border:1px solid rgba(224,160,48,.25);border-radius:4px;padding:2px 7px;font-family:'Space Grotesk',sans-serif}
.pair-vid-badge{font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:4px;padding:2px 7px;font-family:'Space Grotesk',sans-serif}
.cover-save{background:none;border:1px solid transparent;border-radius:6px;cursor:pointer;color:rgba(255,255,255,.38);transition:color .15s,border-color .15s,background .15s;padding:5px;display:flex;align-items:center;justify-content:center}
.cover-save:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.75)}
.cover-save.on{color:var(--gold,#e0a030);background:rgba(224,160,48,.08);border-color:rgba(224,160,48,.2)}

.pair-images{display:grid;grid-template-columns:1fr 24px 1fr;gap:0;padding:0 14px 4px}
.pair-slot{display:flex;flex-direction:column;gap:0}
.pair-art{position:relative;overflow:hidden;border-radius:8px;aspect-ratio:1/1;background:#000;cursor:pointer}
.pair-art img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
.pair-art:hover img{transform:scale(1.03)}
.pair-title-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 55%,transparent 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:10px 8px 10px;text-align:center;pointer-events:none}
.pair-title-text{font-family:'Space Grotesk',sans-serif;font-size:clamp(9px,2vw,12px);font-weight:800;letter-spacing:.14em;color:#fff;text-transform:uppercase;line-height:1.2}
.pair-artist-text{font-size:8px;letter-spacing:.2em;color:rgba(255,255,255,.5);margin-top:3px;text-transform:uppercase;display:block}
.pair-slot-label{font-size:8px;letter-spacing:.14em;text-transform:uppercase;font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--faint,#3a3a60);margin-top:5px;text-align:center}

.pair-divider{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding-top:0}
.pair-divider-line{flex:1;width:1px;background:var(--line,#222238)}
.pair-divider-icon{font-size:11px;color:var(--faint,#3a3a60);line-height:1;flex-shrink:0}

.pair-footer{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding:12px 14px 14px;border-top:1px solid var(--line,#222238);margin-top:8px}
.pair-info{min-width:0}
h4.pair-title-name{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:var(--hi,#e0e0f0);margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pair-sub{font-size:11px;color:var(--muted,#9aa1ab)}
.pair-price-actions{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.pair-price-stack{text-align:right}
.pair-price-now{font-size:16px;font-weight:700;color:var(--hi,#e0e0f0);font-family:'Space Grotesk',sans-serif;display:block}
.pair-price-mem{font-size:10px;color:var(--muted,#9aa1ab);display:block}
.pair-btns{display:flex;gap:6px}
.btn-xs{padding:5px 10px !important;font-size:11px !important}

/* ── Coming Soon Pair Grid ──────────────────────────────────────────────────── */
.cs-pair-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:8px}
.cs-pair-card{background:var(--panel,#111318);border:1px solid var(--line,#222238);border-radius:12px;overflow:hidden}
.cs-pair-images{display:grid;grid-template-columns:1fr 1fr;gap:2px;position:relative}
.cs-pair-side{position:relative;aspect-ratio:1/1;overflow:hidden;background:#000}
.cs-pair-side img{width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(.4) brightness(.65)}
.cs-pair-side .pair-title-overlay{background:linear-gradient(to top,rgba(0,0,0,.8) 0%,rgba(0,0,0,.05) 60%,transparent 100%)}
.cs-pair-lock{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25);z-index:3}
.cs-lock-badge{background:rgba(0,0,0,.8);border:1px solid rgba(218,165,32,.4);color:rgba(218,165,32,.9);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-family:'Space Grotesk',sans-serif;padding:5px 12px;border-radius:20px}
.cs-pair-info{padding:10px 12px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.cs-pair-meta{min-width:0}
.cs-pair-title{font-size:13px;font-weight:700;color:var(--hi,#e0e0f0);font-family:'Space Grotesk',sans-serif;margin:0 0 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cs-pair-countdown{font-size:10px;color:rgba(218,165,32,.8);font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:.06em}
.cs-pair-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.cs-pair-price{font-size:14px;font-weight:700;color:var(--hi,#e0e0f0);font-family:'Space Grotesk',sans-serif}
.cs-notify{padding:5px 12px;border-radius:7px;border:1px solid rgba(218,165,32,.4);background:transparent;color:rgba(218,165,32,.9);font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:.15s;white-space:nowrap}
.cs-notify:hover{background:rgba(218,165,32,.12);border-color:rgba(218,165,32,.7)}
.cs-notify.notified{border-color:rgba(218,165,32,.2);color:var(--muted);cursor:default}

/* ── Premium Lightbox ─────────────────────────────────────────────────────── */
.cover-lb{position:fixed;inset:0;background:rgba(3,3,10,.97);z-index:9000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s;overflow:hidden}
.cover-lb.open{opacity:1;pointer-events:all}
.cover-lb-close{position:fixed;top:18px;right:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.65);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;line-height:1;transition:all .2s;z-index:9002;padding:0}
.cover-lb-close:hover{background:rgba(255,255,255,.15);color:#fff}
.cover-lb-arrow{position:fixed;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:22px;transition:all .2s;z-index:9001;padding:0}
.cover-lb-arrow:hover{background:rgba(255,255,255,.14);color:#fff}
.cover-lb-arrow.lb-prev{left:14px}
.cover-lb-arrow.lb-next{right:14px}
.cover-lb-wrap{display:flex;flex-direction:column;align-items:center;max-width:92vw;width:100%}
.cover-lb-breadcrumb{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(200,168,75,.7);cursor:pointer;margin:0 0 10px;align-self:flex-start;transition:color .15s}
.cover-lb-breadcrumb:hover{color:#c8a84b}
.cover-lb-img-frame{position:relative;width:min(76vw,720px);height:min(72vh,720px);display:flex;align-items:center;justify-content:center;cursor:zoom-in;transition:width .3s,height .3s;flex-shrink:0}
.cover-lb.lb-fs .cover-lb-img-frame{width:95vw;height:92vh;cursor:zoom-out}
.cover-lb-img-frame img,.cover-lb-img-frame video{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transition:opacity .22s}
.cover-lb-img-frame .lb-fade-hide{opacity:0;pointer-events:none}
.cover-lb-pills{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;justify-content:center}
.cover-lb-pill{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.45);background:transparent;cursor:pointer;transition:all .2s}
.cover-lb-pill.active{border-color:#c8a84b;color:#c8a84b;background:rgba(200,168,75,.09)}
.cover-lb-pill:hover:not(.active){border-color:rgba(255,255,255,.3);color:rgba(255,255,255,.8)}
.cover-lb-meta{text-align:center;margin-top:12px}
.cover-lb-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(16px,3vw,22px);font-weight:700;color:#e8e8f2;margin:0}
.cover-lb-sub{font-size:12px;color:#9aa1ab;font-family:'Space Grotesk',sans-serif;margin:3px 0 0}
.cover-lb-actions{display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap;justify-content:center}
.cover-lb-buy{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;padding:10px 24px;border-radius:7px;background:#c8a84b;color:#050508;border:none;cursor:pointer;transition:background .2s}
.cover-lb-buy:hover{background:#d9bb60}
.cover-lb-buy:disabled{background:rgba(200,168,75,.3);color:rgba(5,5,8,.5);cursor:default}
.cover-lb-savebtn{background:none;border:1px solid rgba(255,255,255,.13);border-radius:7px;padding:9px 14px;cursor:pointer;color:rgba(255,255,255,.5);transition:all .2s;display:flex;align-items:center}
.cover-lb-savebtn:hover,.cover-lb-savebtn.on{border-color:#c8a84b;color:#c8a84b}
.lb-play-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.58);border:2px solid rgba(255,255,255,.55);color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;transition:all .2s;z-index:11;padding-left:5px;pointer-events:all}
.lb-play-btn:hover{background:rgba(200,168,75,.6);border-color:#c8a84b}
.lb-play-btn.lb-fade-hide{opacity:0;pointer-events:none}

/* ── Pack Viewer ──────────────────────────────────────────────────────────── */
.pack-viewer{position:fixed;inset:0;background:rgba(3,3,10,.95);z-index:8900;overflow-y:auto;opacity:0;pointer-events:none;transition:opacity .25s}
.pack-viewer.open{opacity:1;pointer-events:all}
.pack-viewer-inner{max-width:1000px;margin:0 auto;padding:64px 24px 80px}
.pack-viewer-close{position:fixed;top:18px;right:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.65);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;line-height:1;transition:all .2s;z-index:8950;padding:0}
.pack-viewer-close:hover{background:rgba(255,255,255,.15);color:#fff}
.pack-viewer-head{margin-bottom:28px}
.pack-viewer-eyebrow{font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#c8a84b;font-family:'Space Grotesk',sans-serif;display:block;margin-bottom:6px}
.pack-viewer-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(22px,4vw,32px);font-weight:700;color:#e8e8f2;margin:0 0 8px}
.pack-viewer-desc{font-size:14px;color:#9aa1ab;margin:0}
.pv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:8px}
.pv-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .2s,border-color .2s}
.pv-card:hover{transform:translateY(-3px);border-color:rgba(200,168,75,.35)}
.pv-card img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.pv-card-label{padding:8px 10px;font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:600;color:#9aa1ab;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ── SOLD State ──────────────────────────────────────────────────────────── */
.pair-card--sold{cursor:default}
.pair-card--sold .pair-art{filter:grayscale(.35) brightness(.72)}
.pair-card--sold:hover{transform:none !important;border-color:var(--line,#222238) !important}
.pair-card--sold .pair-buy-btn{display:none !important}

.sold-tape-wrap{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}
.sold-tape{position:absolute;top:50%;left:-30%;width:160%;height:26%;background:repeating-linear-gradient(90deg,#FFD600 0px,#FFD600 16px,#111 16px,#111 32px);border-top:2px solid rgba(0,0,0,.65);border-bottom:2px solid rgba(0,0,0,.65);box-shadow:0 3px 14px rgba(0,0,0,.6);transform-origin:center}
.sold-tape-1{transform:translateY(-50%) rotate(-40deg)}
.sold-tape-2{transform:translateY(-50%) rotate(40deg)}
.sold-center-badge{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#FFD600;border:3px solid #000;border-radius:50%;width:54px;height:54px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#000;z-index:6;box-shadow:0 2px 10px rgba(0,0,0,.7)}

.sold-footer-badge{display:flex;align-items:center;gap:6px;padding:5px 14px;background:#FFD600;border:2px solid #000;border-radius:7px;font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#000;cursor:default;user-select:none}

@media(max-width:640px){
.cover-lb-arrow{display:none}
.cover-lb-img-frame{width:95vw;height:65vw}
.cover-lb.lb-fs .cover-lb-img-frame{height:82vw}
.pv-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}
.pair-grid{grid-template-columns:1fr}
.pair-images{grid-template-columns:1fr}
.pair-divider{display:none}
.cs-pair-grid{grid-template-columns:1fr}
}
`;

const styleEl = document.createElement("style");
styleEl.id = "covers-v4-css";
styleEl.textContent = STYLE;
document.head.appendChild(styleEl);

/* ═══════════════════════════════════════════════════════════════════════════
Cinema Scroll Rail
═══════════════════════════════════════════════════════════════════════════ */
function initCinemaRail() {
const track = document.getElementById("coverCinemaTrack");
if (!track) return;

const pool = [...COVERS, ...COVERS];
pool.forEach(c => {
const thumb = document.createElement("div");
thumb.className = "cinema-thumb";
thumb.title = c.title;
thumb.innerHTML = `
<div class="cinema-pair">
<div class="ct-side">
<img src="${c.imgClean || c.img}" alt="${esc(c.title)}" loading="lazy">
<span class="ct-label">Clean</span>
</div>
<div class="ct-side">
<img src="${c.img}" alt="${esc(c.title)}" loading="lazy">
<div class="ct-title-overlay">
<span>${esc(c.title).toUpperCase()}</span>
<span class="ct-artist">AWA SOUNDS</span>
</div>
<span class="ct-label">Titled</span>
</div>
</div>
<div class="cinema-thumb-name">${esc(c.title)}</div>`;
thumb.addEventListener("click", () => {
const gridEl = document.getElementById("cover-grid");
if (gridEl) gridEl.scrollIntoView({ behavior: "smooth" });
setTimeout(() => openDetail(c.id), 500);
});
track.appendChild(thumb);
});

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
const cinema = document.querySelector(".cover-cinema-section");
if (!cinema) return;

gsap.registerPlugin(ScrollTrigger);

function setupScrub() {
const travelDist = track.scrollWidth - window.innerWidth + 80;
gsap.to(track, {
x: -travelDist,
ease: "none",
scrollTrigger: {
trigger: cinema,
start: "top top",
end: () => "+=" + travelDist,
pin: true,
scrub: 0.6,
invalidateOnRefresh: true,
anticipatePin: 1
}
});
}

if (document.readyState === "complete") {
setupScrub();
} else {
window.addEventListener("load", setupScrub, { once: true });
}
} else {
const styleF = document.createElement("style");
styleF.textContent = `
@keyframes cinemaDrift { from{transform:translateX(0)} to{transform:translateX(-50%)} }
#coverCinemaTrack { animation: cinemaDrift 40s linear infinite; }
.cover-cinema-section { height: 560px; }
`;
document.head.appendChild(styleF);
}
}

/* ═══════════════════════════════════════════════════════════════════════════
Series Filter
═══════════════════════════════════════════════════════════════════════════ */
function initSeriesFilter() {
const filterEl = document.getElementById("seriesFilter");
if (!filterEl) return;

filterEl.addEventListener("click", e => {
const btn = e.target.closest(".series-btn");
if (!btn) return;
activeSeries = btn.dataset.series;
filterEl.querySelectorAll(".series-btn").forEach(b => b.classList.toggle("active", b === btn));
list.querySelectorAll(".pair-card").forEach(card => {
const show = activeSeries === "all" || card.dataset.series === activeSeries;
card.style.display = show ? "" : "none";
});
});
}

/* ═══════════════════════════════════════════════════════════════════════════
GG Watermark
═══════════════════════════════════════════════════════════════════════════ */
function applyWatermark(artEl) {
if (artEl.querySelector(".wm-canvas")) return;
const cv = document.createElement("canvas");
cv.className = "wm-canvas";
cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2";
artEl.style.position = "relative";
artEl.appendChild(cv);

function drawWM() {
const W = artEl.offsetWidth || 280, H = artEl.offsetHeight || 280;
if (!W || !H) return;
cv.width = W; cv.height = H;
const ctx = cv.getContext("2d");
ctx.clearRect(0, 0, W, H);
ctx.save();
ctx.globalAlpha = 0.11;
ctx.fillStyle = "#ffffff";
ctx.font = `bold ${Math.max(12, W * 0.055)}px 'Space Grotesk',Arial,sans-serif`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
const step = W * 0.45, angle = -28 * Math.PI / 180;
for (let y = -step; y < H + step; y += step * 0.65) {
for (let x = -step; x < W + step; x += step) {
ctx.save();
ctx.translate(x + (y % (step * 2) < step ? 0 : step * 0.5), y);
ctx.rotate(angle);
ctx.fillText("AWA", 0, 0);
ctx.restore();
}
}
ctx.restore();
}
drawWM();
new ResizeObserver(drawWM).observe(artEl);
}

/* ═══════════════════════════════════════════════════════════════════════════
Pair Card
═══════════════════════════════════════════════════════════════════════════ */
function pairCard(c) {
const el = document.createElement("article");
el.className = "pair-card" + (c.sold ? " pair-card--sold" : "");
el.dataset.id = c.id;
el.dataset.series = c.series || "chrome-reign";

const memPx = c.premium && c.subPrice != null
? Math.min(c.subPrice, memberPrice(c.price))
: memberPrice(c.price);

const hasVideo = c.videos && c.videos.length > 0;

el.innerHTML = `
<div class="pair-card-header">
<span class="pair-series-tag">${esc(SERIES_LABELS[c.series] || "Cover Art")}</span>
<div class="pair-header-right">
${c.premium ? '<span class="pair-premium">Premium</span>' : ""}
${hasVideo ? '<span class="pair-vid-badge">&#x25BA; Video</span>' : ""}
<button class="cover-save ib-like" aria-label="Save to wishlist" title="Save to wishlist">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg>
</button>
</div>
</div>

<div class="pair-images">
<div class="pair-slot">
<div class="pair-art" data-side="clean" title="Click to view">
<img src="${esc(c.imgClean || c.img)}" alt="${esc(c.title)} clean" loading="lazy">
${c.sold ? '<div class="sold-tape-wrap"><div class="sold-tape sold-tape-1"></div><div class="sold-tape sold-tape-2"></div><div class="sold-center-badge">SOLD</div></div>' : ""}
</div>
<div class="pair-slot-label">CLEAN</div>
</div>

<div class="pair-divider">
<div class="pair-divider-line"></div>
<div class="pair-divider-icon">&#9670;</div>
<div class="pair-divider-line"></div>
</div>

<div class="pair-slot">
<div class="pair-art" data-side="titled" title="Click to view">
<img src="${esc(c.img)}" alt="${esc(c.title)} titled" loading="lazy">
<div class="pair-title-overlay">
<span class="pair-title-text">${esc(c.title).toUpperCase()}</span>
<span class="pair-artist-text">YOUR NAME</span>
</div>
${c.sold ? '<div class="sold-tape-wrap"><div class="sold-tape sold-tape-1"></div><div class="sold-tape sold-tape-2"></div></div>' : ""}
</div>
<div class="pair-slot-label">WITH TITLE</div>
</div>
</div>

<div class="pair-footer">
<div class="pair-info">
<h4 class="pair-title-name">${esc(c.title)}</h4>
<div class="pair-sub">${esc(c.sub)} &#xB7; 3000&#xD7;3000 + 2 videos</div>
</div>
<div class="pair-price-actions">
<div class="pair-price-stack">
<span class="pair-price-now">${money(c.price)}</span>
<span class="pair-price-mem">Members ${money(memPx)}</span>
</div>
<div class="pair-btns">
<button class="btn btn-ghost btn-sm btn-xs pair-preview-btn">Preview</button>
${c.sold
? '<span class="sold-footer-badge">&#9632; SOLD</span>'
: `<button class="btn btn-primary btn-sm btn-xs pair-buy-btn">Buy ${money(c.price)}</button>`}
</div>
</div>
</div>`;

el.querySelectorAll(".pair-art").forEach(artEl => {
const img = artEl.querySelector("img");
if (img.complete) applyWatermark(artEl);
else img.addEventListener("load", () => applyWatermark(artEl), { once: true });

// Clicking the image opens lightbox on appropriate view
if (!c.sold) {
artEl.addEventListener("click", e => {
e.stopPropagation();
const side = artEl.dataset.side === "clean" ? "clean" : "titled";
openDetail(c.id, side);
});
}
});

el.querySelector(".pair-preview-btn").addEventListener("click", e => { e.stopPropagation(); openDetail(c.id, "titled"); });
const buyBtn = el.querySelector(".pair-buy-btn");
if (buyBtn) buyBtn.addEventListener("click", e => { e.stopPropagation(); triggerBuy(c, isMember(), memPx); });
el.querySelector(".cover-save").addEventListener("click", e => { e.stopPropagation(); toggleSave(el); });

return el;
}

// Render pair grid
COVERS.forEach(c => list.appendChild(pairCard(c)));

/* ═══════════════════════════════════════════════════════════════════════════
Save / Auth
═══════════════════════════════════════════════════════════════════════════ */
function toggleSave(cardEl) {
AWAAuth.requireAuth(async () => {
const id = cardEl.dataset.id, btn = cardEl.querySelector(".cover-save");
const client = AWAAuth.client(), uid = AWAAuth.user().id;
const on = btn.classList.toggle("on");
if (on) { likeSet.add(id); await client.from("likes").upsert({ user_id: uid, beat_id: likeId(id) }); }
else { likeSet.delete(id); await client.from("likes").delete().match({ user_id: uid, beat_id: likeId(id) }); }
}, "Sign in to save cover art to your account.");
}

if (window.AWAAuth) AWAAuth.onChange(async sess => {
list.querySelectorAll(".cover-save.on").forEach(b => b.classList.remove("on"));
likeSet = new Set();
if (!sess) return;
const { data } = await AWAAuth.client().from("likes").select("beat_id").eq("user_id", sess.user.id).like("beat_id", "cover:%");
(data || []).forEach(r => {
const id = r.beat_id.replace(/^cover:/, "");
likeSet.add(id);
const b = list.querySelector(`.pair-card[data-id="${id}"] .cover-save`);
if (b) b.classList.add("on");
});
});

/* ═══════════════════════════════════════════════════════════════════════════
Premium Lightbox
═══════════════════════════════════════════════════════════════════════════ */
let lb = null;
let lbCurrentId = null;
let lbCurrentView = "titled"; // "titled" | "clean" | "video"
let lbFromPack = null; // pack id if opened from pack viewer

// Build the lightbox DOM once
function buildLightbox() {
lb = document.createElement("div");
lb.className = "cover-lb";
lb.id = "coverLightbox";
lb.innerHTML = `
<button class="cover-lb-close" id="lbClose">&times;</button>
<button class="cover-lb-arrow lb-prev" id="lbPrev">&#x2039;</button>
<button class="cover-lb-arrow lb-next" id="lbNext">&#x203A;</button>
<div class="cover-lb-wrap">
<div class="cover-lb-breadcrumb" id="lbBreadcrumb" style="display:none">&#x2190; Back to Pack</div>
<div class="cover-lb-img-frame" id="lbImgFrame">
<img id="lbImg" src="" alt="" />
<video id="lbVid" muted loop playsinline class="lb-fade-hide"></video>
<button class="lb-play-btn lb-fade-hide" id="lbPlayBtn" aria-label="Play video">&#9654;</button>
</div>
<div class="cover-lb-pills" id="lbPills">
<button class="cover-lb-pill active" data-view="titled">With Title</button>
<button class="cover-lb-pill" data-view="clean">Clean</button>
<button class="cover-lb-pill" id="lbVideoPill" data-view="video" style="display:none">&#x25BA; Video</button>
</div>
<div class="cover-lb-meta">
<h2 class="cover-lb-title" id="lbTitle"></h2>
<p class="cover-lb-sub" id="lbSub"></p>
</div>
<div class="cover-lb-actions">
<button class="cover-lb-savebtn" id="lbSaveBtn" aria-label="Save">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg>
</button>
<button class="cover-lb-buy" id="lbBuy">Get This Cover &rarr;</button>
</div>
</div>`;
document.body.appendChild(lb);

// Apply AWA watermark over the lightbox frame (covers both img and video previews)
applyWatermark(document.getElementById("lbImgFrame"));

// Close on overlay click or × button
lb.addEventListener("click", e => {
if (e.target === lb) closeLightbox();
});
document.getElementById("lbClose").addEventListener("click", closeLightbox);

// Fullscreen on image frame click
document.getElementById("lbImgFrame").addEventListener("click", e => {
e.stopPropagation();
lb.classList.toggle("lb-fs");
});

// Pill toggle
document.getElementById("lbPills").addEventListener("click", e => {
const pill = e.target.closest(".cover-lb-pill");
if (!pill) return;
setLbView(pill.dataset.view);
});

// Navigation arrows
document.getElementById("lbPrev").addEventListener("click", e => { e.stopPropagation(); lbNavigate(-1); });
document.getElementById("lbNext").addEventListener("click", e => { e.stopPropagation(); lbNavigate(1); });

// Breadcrumb (back to pack)
document.getElementById("lbBreadcrumb").addEventListener("click", () => {
closeLightbox();
if (lbFromPack) {
setTimeout(() => openPackViewer(lbFromPack), 50);
lbFromPack = null;
}
});

// Play button fallback for when autoplay is blocked
const lbVidEl = document.getElementById("lbVid");
const lbPlayBtnEl = document.getElementById("lbPlayBtn");
lbPlayBtnEl.addEventListener("click", e => {
e.stopPropagation();
lbVidEl.play().then(() => lbPlayBtnEl.classList.add("lb-fade-hide")).catch(() => {});
});
lbVidEl.addEventListener("play", () => lbPlayBtnEl.classList.add("lb-fade-hide"));
lbVidEl.addEventListener("pause", () => {
if (!lbVidEl.classList.contains("lb-fade-hide")) lbPlayBtnEl.classList.remove("lb-fade-hide");
});
}

// Set which view (titled / clean / video) is shown
function setLbView(view) {
if (!lbCurrentId) return;
const c = COVERS.find(x => x.id === lbCurrentId);
if (!c) return;

lbCurrentView = view;

const img = document.getElementById("lbImg");
const vid = document.getElementById("lbVid");
const pills = document.querySelectorAll(".cover-lb-pill");
pills.forEach(p => p.classList.toggle("active", p.dataset.view === view));

const playBtn = document.getElementById("lbPlayBtn");
if (view === "video") {
const src = (c.videos || [])[0] || "";
vid.classList.remove("lb-fade-hide");
img.classList.add("lb-fade-hide");
if (playBtn) playBtn.classList.add("lb-fade-hide");
if (src !== vid.src) {
  vid.src = src;
  vid.addEventListener("canplay", function onCanPlay() {
    vid.removeEventListener("canplay", onCanPlay);
    vid.play().catch(() => { if (playBtn) playBtn.classList.remove("lb-fade-hide"); });
  }, { once: true });
  vid.load();
} else if (vid.paused) {
  vid.play().catch(() => { if (playBtn) playBtn.classList.remove("lb-fade-hide"); });
}
} else {
vid.pause();
vid.classList.add("lb-fade-hide");
if (playBtn) playBtn.classList.add("lb-fade-hide");
img.classList.remove("lb-fade-hide");
img.src = view === "clean" ? (c.imgClean || c.img) : c.img;
}
}

// Navigate to prev/next cover in current filtered view
function lbNavigate(dir) {
const visible = COVERS.filter(c => activeSeries === "all" || c.series === activeSeries);
const idx = visible.findIndex(c => c.id === lbCurrentId);
if (idx < 0) return;
const next = visible[(idx + dir + visible.length) % visible.length];
if (next) openDetail(next.id, lbCurrentView, lbFromPack);
}

function openDetail(id, initialView, fromPack) {
const c = COVERS.find(x => x.id === id);
if (!c) return;

if (!lb) buildLightbox();

lbCurrentId = id;
// Default to VIDEO for covers with video content, unless caller specifies a view
const hasVid = c.videos && c.videos.length > 0;
lbCurrentView = initialView || (hasVid ? "video" : "titled");
lbFromPack = fromPack || null;

// Title + sub
document.getElementById("lbTitle").textContent = c.title;
document.getElementById("lbSub").textContent = c.sub + " \u00B7 3000\u00D73000px + motion files";

// Show/hide video pill
const vidPill = document.getElementById("lbVideoPill");
if (vidPill) vidPill.style.display = (c.videos && c.videos.length) ? "" : "none";

// Breadcrumb
const bread = document.getElementById("lbBreadcrumb");
if (fromPack) {
const pack = (CFG.albumPacks || []).find(p => p.id === fromPack);
bread.textContent = "← Back to " + (pack ? pack.title : "Pack");
bread.style.display = "";
} else {
bread.style.display = "none";
}

// Buy button
const buyBtn = document.getElementById("lbBuy");
const member = isMember();
const memPx = c.premium && c.subPrice != null ? Math.min(c.subPrice, memberPrice(c.price)) : memberPrice(c.price);
const priceLabel = money(member ? memPx : c.price);
if (c.sold) {
buyBtn.disabled = true;
buyBtn.textContent = "Sold";
} else {
buyBtn.disabled = false;
buyBtn.textContent = "Get This Cover → " + priceLabel;
buyBtn.onclick = () => triggerBuy(c, member, memPx);
}

// Save button
const saveBtn = document.getElementById("lbSaveBtn");
saveBtn.classList.toggle("on", likeSet.has(c.id));
saveBtn.onclick = () => toggleSaveById(c.id, saveBtn);

// Remove fullscreen state on new cover
lb.classList.remove("lb-fs");

// Set the image view
setLbView(lbCurrentView);

lb.classList.add("open");
document.body.style.overflow = "hidden";
}

function closeLightbox() {
if (!lb) return;
lb.classList.remove("open", "lb-fs");
document.body.style.overflow = "";
const vid = document.getElementById("lbVid");
if (vid) vid.pause();
lbCurrentId = null;
}

/* Keyboard: ESC = close, ← → = navigate */
document.addEventListener("keydown", e => {
if (!lb || !lb.classList.contains("open")) return;
if (e.key === "Escape") { closeLightbox(); return; }
if (e.key === "ArrowLeft") { lbNavigate(-1); return; }
if (e.key === "ArrowRight") { lbNavigate(1); return; }
});

/* ═══════════════════════════════════════════════════════════════════════════
Receipt FX + Buy
═══════════════════════════════════════════════════════════════════════════ */
function triggerBuy(c, member, memPx) {
const priceVal = member && memPx ? memPx : c.price;
if (window.AWAReceiptFX) {
closeLightbox();
AWAReceiptFX.show({
title: c.title, price: money(c.price), memberPrice: money(priceVal),
isMember: member, onConfirm: () => openPayLink(c), onCancel: () => {}
});
} else {
openPayLink(c);
}
}

function openPayLink(c) {
if (c.sold) return;
if (c.pay) { window.open(c.pay, "_blank", "noopener"); return; }
let globalLink = CFG.coverPayLink;
if (c.price >= 50 && CFG.coverSignaturePayLink) globalLink = CFG.coverSignaturePayLink;
else if (c.price >= 40 && CFG.coverCinematicPayLink) globalLink = CFG.coverCinematicPayLink;
else if (c.price >= 35 && CFG.coverPremiumPayLink) globalLink = CFG.coverPremiumPayLink;
else if (c.price >= 25 && CFG.coverAnimatedPayLink) globalLink = CFG.coverAnimatedPayLink;
if (globalLink) { window.open(globalLink, "_blank", "noopener"); return; }
const to = CFG.enquiryEmail || "awasoundsenquires@gmail.com";
const subj = encodeURIComponent(`Cover art enquiry — ${c.title}`);
const body = encodeURIComponent(`Hi Awa Sounds,\n\nI'd like to buy the "${c.title}" cover (${c.sub}).\n\nName:\nRelease title:\n\nThanks.`);
window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
}

function toggleSaveById(id, btn) {
AWAAuth.requireAuth(async () => {
const client = AWAAuth.client(), uid = AWAAuth.user().id;
const on = btn.classList.toggle("on");
const cardBtn = list.querySelector(`.pair-card[data-id="${id}"] .cover-save`);
if (cardBtn) cardBtn.classList.toggle("on", on);
if (on) { likeSet.add(id); await client.from("likes").upsert({ user_id: uid, beat_id: likeId(id) }); }
else { likeSet.delete(id); await client.from("likes").delete().match({ user_id: uid, beat_id: likeId(id) }); }
}, "Sign in to save cover art.");
}

/* ═══════════════════════════════════════════════════════════════════════════
Pack Viewer
═══════════════════════════════════════════════════════════════════════════ */
let pv = null;

function buildPackViewer() {
pv = document.createElement("div");
pv.className = "pack-viewer";
pv.id = "packViewer";
pv.innerHTML = `
<button class="pack-viewer-close" id="pvClose">&times;</button>
<div class="pack-viewer-inner">
<div class="pack-viewer-head">
<span class="pack-viewer-eyebrow" id="pvEyebrow"></span>
<h2 class="pack-viewer-title" id="pvTitle"></h2>
<p class="pack-viewer-desc" id="pvDesc"></p>
</div>
<div class="pv-grid" id="pvGrid"></div>
</div>`;
document.body.appendChild(pv);
document.getElementById("pvClose").addEventListener("click", closePackViewer);
pv.addEventListener("click", e => { if (e.target === pv) closePackViewer(); });
}

function openPackViewer(packId) {
const packs = CFG.albumPacks || [];
const pack = packs.find(p => p.id === packId);
if (!pack || !pack.coverIds || !pack.coverIds.length) return;

if (!pv) buildPackViewer();

document.getElementById("pvEyebrow").textContent = "Album Art Pack";
document.getElementById("pvTitle").textContent = pack.title || packId;
document.getElementById("pvDesc").textContent = pack.desc || ("Includes " + pack.coverIds.length + " exclusive covers. Click any cover to view in detail.");

const grid = document.getElementById("pvGrid");
grid.innerHTML = "";

pack.coverIds.forEach(cid => {
const c = COVERS.find(x => x.id === cid) || (CFG.covers || []).find(x => x.id === cid);
if (!c) return;
const card = document.createElement("div");
card.className = "pv-card";
card.innerHTML = `<img src="${esc(c.img)}" alt="${esc(c.title)}" loading="lazy"><div class="pv-card-label">${esc(c.title)}</div>`;
card.addEventListener("click", () => {
closePackViewer();
setTimeout(() => openDetail(c.id, "titled", packId), 50);
});
grid.appendChild(card);
});

pv.classList.add("open");
document.body.style.overflow = "hidden";
}

function closePackViewer() {
if (!pv) return;
pv.classList.remove("open");
document.body.style.overflow = "";
}

// Pack keyboard close
document.addEventListener("keydown", e => {
if (pv && pv.classList.contains("open") && e.key === "Escape") closePackViewer();
});

/* ═══════════════════════════════════════════════════════════════════════════
Album Pack Card — wire "View Pack" buttons
═══════════════════════════════════════════════════════════════════════════ */
function initPackViewer() {
// Wire up HTML pack cards that have data-pack-id
document.querySelectorAll(".pack-card[data-pack-id]").forEach(card => {
const packId = card.dataset.packId;
const btn = card.querySelector(".pack-view-btn");
if (btn) btn.addEventListener("click", e => { e.preventDefault(); openPackViewer(packId); });
});

// Also add click-to-open for pack-pair-strip thumbnails (on new chrome/void/gold packs)
// These are in the HTML but wired here if they have a parent with data-pack-id
document.querySelectorAll(".pack-card").forEach(card => {
const strip = card.querySelector(".pack-pair-strip");
if (!strip) return;
const packId = card.dataset.packId;
if (!packId) return;
strip.style.cursor = "pointer";
strip.title = "Click to explore this pack";
strip.addEventListener("click", () => openPackViewer(packId));
});
}

/* ═══════════════════════════════════════════════════════════════════════════
Coming Soon — Pair View
═══════════════════════════════════════════════════════════════════════════ */
(function renderComingSoon() {
const container = document.getElementById("coming-soon-list");
if (!container || !COMING_SOON.length) return;

const grid = document.createElement("div");
grid.className = "cs-pair-grid";

COMING_SOON.forEach(c => {
const days = c.releaseDate ? daysUntil(c.releaseDate) : (c.releaseInDays || 30);
const el = document.createElement("article");
el.className = "cs-pair-card";
el.innerHTML = `
<div class="cs-pair-images">
<div class="cs-pair-side">
<img src="${esc(c.imgClean || c.img)}" alt="${esc(c.title)} clean" loading="lazy">
<span class="ct-label">Clean</span>
</div>
<div class="cs-pair-side">
<img src="${esc(c.img)}" alt="${esc(c.title)} titled" loading="lazy">
<div class="pair-title-overlay">
<span class="pair-title-text">${esc(c.title).toUpperCase()}</span>
<span class="pair-artist-text">YOUR NAME</span>
</div>
<span class="ct-label">Titled</span>
</div>
<div class="cs-pair-lock">
<span class="cs-lock-badge">Releasing in ${days} day${days !== 1 ? "s" : ""}</span>
</div>
</div>
<div class="cs-pair-info">
<div class="cs-pair-meta">
<div class="cs-pair-title">${esc(c.title)}</div>
<div class="cs-pair-countdown">${c.releaseDate ? new Date(c.releaseDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "Coming soon"}</div>
</div>
<div class="cs-pair-right">
<span class="cs-pair-price">${money(c.price)}</span>
<button class="cs-notify" data-id="${esc(c.id)}">Notify Me</button>
</div>
</div>`;

el.querySelector(".cs-notify").addEventListener("click", function() {
if (this.classList.contains("notified")) return;
this.classList.add("notified");
this.textContent = "Notified ✓";
});

grid.appendChild(el);
});

container.appendChild(grid);
})();

/* ═══════════════════════════════════════════════════════════════════════════
GSAP pair card reveal animations
═══════════════════════════════════════════════════════════════════════════ */
function initPairCardAnimations() {
if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;

ScrollTrigger.create({
trigger: list,
start: "top 85%",
once: true,
onEnter() {
Array.from(list.querySelectorAll(".pair-card")).forEach((card, i) => {
gsap.from(card, {
opacity: 0,
y: 32,
scale: 0.97,
duration: 0.7,
delay: (i % 3) * 0.08,
ease: "expo.out"
});
});
}
});
}

/* ── Init ─────────────────────────────────────────────────────────────────── */
initCinemaRail();
initSeriesFilter();
initPackViewer();
initPairCardAnimations();

})();
