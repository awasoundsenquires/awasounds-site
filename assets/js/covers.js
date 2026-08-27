/* AWA SOUNDS â€” Cover Art store v3
   Features:
   - Pair card display (clean | titled side-by-side always visible in grid)
   - Cinema scroll rail (horizontal film strip pinned by GSAP, driven by scroll)
   - Series filter tabs (Chrome Universe Â· Void Â· Gold Season Â· Flux Â· Earth Chrome)
   - releaseDate-based countdown for coming-soon covers
   - GG watermark canvas overlay on all preview images (anti-piracy)
   - Side-by-side modal with video previews
   - Receipt FX animation wired to buy flow
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
  "use strict";

  const CFG   = window.AWA || {};
  const list  = document.getElementById("cover-list");
  if (!list) return;

  const COVERS      = (CFG.covers || []).filter(c => !c.auctionOnly && !c.comingSoon);
  const COMING_SOON = (CFG.covers || []).filter(c => !c.auctionOnly && c.comingSoon);

  const money      = n  => "Â£" + Number(n).toFixed(0);
  const esc        = s  => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const coverDisc  = CFG.coverMemberDiscount != null ? CFG.coverMemberDiscount : (CFG.memberDiscount || 0);
  const memberPrice = n  => Math.round(n * (1 - coverDisc));
  const likeId     = id => "cover:" + id;
  const isMember   = () => window.AWAAuth && AWAAuth.isMember();
  const daysUntil  = d  => Math.max(0, Math.ceil((new Date(d) - Date.now()) / 864e5));

  const SERIES_LABELS = {
    "chrome-universe": "Chrome Universe",
    "void":            "Void Series",
    "gold-season":     "Gold Season",
    "flux":            "Flux",
    "earth-chrome":    "Earth Chrome"
  };

  let likeSet    = new Set();
  let activeSeries = "all";

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     CSS â€” pair cards + cinema rail + series filter + coming-soon
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  const STYLE = `
  /* â”€â”€ Cinema Rail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Series Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .series-filter{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:28px}
  .series-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--panel,#111318);border:1px solid var(--line);border-radius:8px;font-size:11px;font-weight:700;font-family:'Space Grotesk',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#9aa1ab);cursor:pointer;transition:.15s;white-space:nowrap}
  .series-btn:hover{border-color:rgba(224,160,48,.4);color:var(--hi,#e0e0f0)}
  .series-btn.active{background:rgba(224,160,48,.08);border-color:rgba(224,160,48,.5);color:var(--gold,#e0a030)}
  .series-btn .s-count{font-size:9px;background:rgba(255,255,255,.08);border-radius:4px;padding:1px 5px;margin-left:2px;font-weight:600;letter-spacing:.04em}

  /* â”€â”€ Pair Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .pair-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
  .pair-card{background:var(--panel,#111318);border:1px solid var(--line,#222238);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s,transform .2s}
  .pair-card:hover{border-color:rgba(224,160,48,.3);transform:translateY(-2px)}

  .pair-card-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 8px}
  .pair-series-tag{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#9aa1ab);font-family:'Space Grotesk',sans-serif}
  .pair-header-right{display:flex;align-items:center;gap:8px}
  .pair-premium{font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--gold,#e0a030);background:rgba(224,160,48,.1);border:1px solid rgba(224,160,48,.25);border-radius:4px;padding:2px 7px;font-family:'Space Grotesk',sans-serif}
  .cover-save{background:none;border:none;cursor:pointer;color:var(--muted,#9aa1ab);transition:color .15s;padding:4px;display:flex;align-items:center;justify-content:center}
  .cover-save:hover,.cover-save.on{color:var(--gold,#e0a030)}

  .pair-images{display:grid;grid-template-columns:1fr 24px 1fr;gap:0;padding:0 14px 4px}
  .pair-slot{display:flex;flex-direction:column;gap:0}
  .pair-art{position:relative;overflow:hidden;border-radius:8px;aspect-ratio:1/1;background:#000}
  .pair-art img{width:100%;height:100%;object-fit:cover;display:block}
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

  /* â”€â”€ Coming Soon Pair Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .cover-modal{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:900;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s;padding:20px}
  .cover-modal.open{opacity:1;pointer-events:all}
  .cover-card-lg{background:var(--bg2,#0e0e1c);border:1px solid var(--line,#222238);border-radius:14px;width:100%;max-width:860px;max-height:92vh;overflow-y:auto;position:relative;padding:24px}
  .cover-close{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--silver,#7070a0);font-size:22px;cursor:pointer;line-height:1;padding:4px 8px}
  .cover-close:hover{color:var(--hi,#e0e0f0)}
  .cover-modal h3{font-family:'Space Grotesk',sans-serif;font-size:20px;color:var(--hi,#e0e0f0);margin:0 0 4px}
  .cover-modal .eyebrow{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted,#3a3a60);display:block;margin-bottom:6px}
  .cover-modal .cover-sub{font-size:12px;color:var(--silver,#7070a0);margin-bottom:16px}
  .cov-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
  .cov-side{position:relative;border-radius:10px;overflow:hidden;background:#000}
  .cov-side img{width:100%;display:block;aspect-ratio:1/1;object-fit:cover}
  .cov-side-lbl{position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(0deg,rgba(0,0,0,.75)0%,transparent);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700}
  .cov-vids{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px}
  .cov-vid-wrap{border-radius:10px;overflow:hidden;background:#000;position:relative;cursor:pointer}
  .cov-vid-wrap video{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
  .cov-vid-lbl{position:absolute;bottom:0;left:0;right:0;padding:6px 10px;background:linear-gradient(0deg,rgba(0,0,0,.75)0%,transparent);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#fff;font-family:'Space Grotesk',sans-serif}
  .cov-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.7;transition:.15s}
  .cov-vid-play:hover{opacity:1}
  .cov-info-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:16px;border-top:1px solid var(--line,#222238)}
  .cov-price .now{font-size:22px;font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--hi,#e0e0f0)}
  .cov-price .subprice{font-size:12px;color:var(--silver,#7070a0);margin-left:8px}
  .cov-actions{display:flex;align-items:center;gap:10px}
  .cov-save-lg{background:none;border:1px solid var(--line,#222238);border-radius:8px;padding:9px 14px;cursor:pointer;color:var(--silver,#7070a0);transition:.15s}
  .cov-save-lg:hover,.cov-save-lg.on{border-color:var(--gold,#e0a030);color:var(--gold,#e0a030)}
  @media(max-width:600px){.cov-pair,.pair-images{grid-template-columns:1fr}.pair-divider{display:none}.pair-grid{grid-template-columns:1fr}.cs-pair-grid{grid-template-columns:1fr}}
  `;

  const styleEl = document.createElement("style");
  styleEl.id = "covers-v3-css";
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Cinema Scroll Rail
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function initCinemaRail() {
    const track = document.getElementById("coverCinemaTrack");
    if (!track) return;

    // Insert cover pair thumbnails Ã— 2 (for enough scroll travel)
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

    // GSAP ScrollTrigger pin + horizontal scrub
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

      // Wait for images to give accurate scrollWidth
      if (document.readyState === "complete") {
        setupScrub();
      } else {
        window.addEventListener("load", setupScrub, { once: true });
      }
    } else {
      // CSS fallback: auto-scroll marquee
      const styleF = document.createElement("style");
      styleF.textContent = `
        @keyframes cinemaDrift { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        #coverCinemaTrack { animation: cinemaDrift 40s linear infinite; }
        .cover-cinema-section { height: 560px; }
      `;
      document.head.appendChild(styleF);
    }
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Series Filter
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     GG Watermark
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(12, W * 0.055)}px 'Space Grotesk',Arial,sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const step = W * 0.32, angle = -28 * Math.PI / 180;
      for (let y = -step; y < H + step; y += step * 0.65) {
        for (let x = -step; x < W + step; x += step) {
          ctx.save();
          ctx.translate(x + (y % (step * 2) < step ? 0 : step * 0.5), y);
          ctx.rotate(angle);
          ctx.fillText("GG", 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();
    }
    drawWM();
    new ResizeObserver(drawWM).observe(artEl);
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Pair Card
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function pairCard(c) {
    const el = document.createElement("article");
    el.className = "pair-card";
    el.dataset.id = c.id;
    el.dataset.series = c.series || "chrome-universe";
    el.dataset.videos = (c.videos || []).join(",");

    const memPx = c.premium && c.subPrice != null
      ? Math.min(c.subPrice, memberPrice(c.price))
      : memberPrice(c.price);

    el.innerHTML = `
      <div class="pair-card-header">
        <span class="pair-series-tag">${esc(SERIES_LABELS[c.series] || "Cover Art")}</span>
        <div class="pair-header-right">
          ${c.premium ? '<span class="pair-premium">Premium</span>' : ""}
          <button class="cover-save ib-like" aria-label="Save" title="Save to wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg>
          </button>
        </div>
      </div>

      <div class="pair-images">
        <div class="pair-slot">
          <div class="pair-art" data-side="clean">
            <img src="${esc(c.imgClean || c.img)}" alt="${esc(c.title)} clean" loading="lazy">
          </div>
          <div class="pair-slot-label">CLEAN</div>
        </div>

        <div class="pair-divider">
          <div class="pair-divider-line"></div>
          <div class="pair-divider-icon">âŸ·</div>
          <div class="pair-divider-line"></div>
        </div>

        <div class="pair-slot">
          <div class="pair-art" data-side="titled">
            <img src="${esc(c.img)}" alt="${esc(c.title)} titled" loading="lazy">
            <div class="pair-title-overlay">
              <span class="pair-title-text">${esc(c.title).toUpperCase()}</span>
              <span class="pair-artist-text">AWA SOUNDS</span>
            </div>
          </div>
          <div class="pair-slot-label">WITH TITLE</div>
        </div>
      </div>

      <div class="pair-footer">
        <div class="pair-info">
          <h4 class="pair-title-name">${esc(c.title)}</h4>
          <div class="pair-sub">${esc(c.sub)} Â· 3000Ã—3000 + 2 videos</div>
        </div>
        <div class="pair-price-actions">
          <div class="pair-price-stack">
            <span class="pair-price-now">${money(c.price)}</span>
            <span class="pair-price-mem">Members ${money(memPx)}</span>
          </div>
          <div class="pair-btns">
            <button class="btn btn-ghost btn-sm btn-xs pair-preview-btn">Preview</button>
            <button class="btn btn-primary btn-sm btn-xs pair-buy-btn">Buy ${money(c.price)}</button>
          </div>
        </div>
      </div>`;

    // GG watermark on both art panels
    el.querySelectorAll(".pair-art").forEach(artEl => {
      const img = artEl.querySelector("img");
      if (img.complete) applyWatermark(artEl);
      else img.addEventListener("load", () => applyWatermark(artEl), { once: true });
    });

    el.querySelector(".pair-preview-btn").addEventListener("click", e => { e.stopPropagation(); openDetail(c.id); });
    el.querySelector(".pair-buy-btn").addEventListener("click",    e => { e.stopPropagation(); triggerBuy(c, isMember(), memPx); });
    el.querySelector(".cover-save").addEventListener("click",      e => { e.stopPropagation(); toggleSave(el); });

    return el;
  }

  // Render pair grid
  COVERS.forEach(c => list.appendChild(pairCard(c)));

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Save / Auth
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function toggleSave(cardEl) {
    AWAAuth.requireAuth(async () => {
      const id = cardEl.dataset.id, btn = cardEl.querySelector(".cover-save");
      const client = AWAAuth.client(), uid = AWAAuth.user().id;
      const on = btn.classList.toggle("on");
      if (on) { likeSet.add(id); await client.from("likes").upsert({ user_id: uid, beat_id: likeId(id) }); }
      else     { likeSet.delete(id); await client.from("likes").delete().match({ user_id: uid, beat_id: likeId(id) }); }
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

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Detail Modal
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  let dm = null, current = null;

  function buildModal() {
    dm = document.createElement("div");
    dm.className = "cover-modal";
    dm.innerHTML = `
      <div class="cover-card-lg">
        <button class="cover-close" aria-label="Close">&times;</button>
        <span class="eyebrow">Cover Art â€” Awa Sounds</span>
        <h3 class="cover-title"></h3>
        <div class="cover-sub"></div>
        <div class="cov-pair">
          <div class="cov-side" id="cov-clean-side">
            <img class="cov-img-clean" alt="Clean version">
            <div class="cov-side-lbl">Clean</div>
          </div>
          <div class="cov-side" id="cov-titled-side">
            <img class="cov-img-titled" alt="With title">
            <div class="cov-side-lbl">With Title</div>
          </div>
        </div>
        <div class="cov-vids" id="cov-vids"></div>
        <div class="cov-info-bar">
          <div class="cov-price"><span class="now"></span><span class="subprice"></span></div>
          <div class="cov-actions">
            <button class="cov-save-lg" aria-label="Save">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg>
            </button>
            <button class="btn btn-primary cov-buy-btn">Buy cover</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(dm);
    dm.addEventListener("click", e => { if (e.target === dm || e.target.closest(".cover-close")) closeModal(); });
  }

  function openDetail(id) {
    current = COVERS.find(c => c.id === id);
    if (!current) return;
    if (!dm) buildModal();

    const c = current;
    dm.querySelector(".cover-title").textContent = c.title;
    dm.querySelector(".cover-sub").textContent   = c.sub + " Â· 3000Ã—3000 + 2 motion files";

    const cleanSide = document.getElementById("cov-clean-side");
    const titledSide = document.getElementById("cov-titled-side");
    dm.querySelector(".cov-img-clean").src  = c.imgClean || c.img;
    dm.querySelector(".cov-img-titled").src = c.img;
    cleanSide.style.display    = "";
    titledSide.style.gridColumn = "";

    const vids = document.getElementById("cov-vids");
    vids.innerHTML = "";
    (c.videos || []).forEach((src, i) => {
      const wrap = document.createElement("div");
      wrap.className = "cov-vid-wrap";
      wrap.innerHTML = `<video muted loop playsinline preload="none" src="${src}"></video>
        <div class="cov-vid-lbl">Motion ${i + 1}</div>
        <div class="cov-vid-play"><svg width="40" height="40" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="12" fill="rgba(0,0,0,.55)"/><polygon points="10,8 17,12 10,16" fill="#fff"/></svg></div>`;
      const video = wrap.querySelector("video");
      wrap.addEventListener("click", () => {
        if (video.paused) { video.play().catch(() => {}); wrap.querySelector(".cov-vid-play").style.display = "none"; }
        else              { video.pause(); wrap.querySelector(".cov-vid-play").style.display = ""; }
      });
      vids.appendChild(wrap);
    });
    vids.style.display = (c.videos && c.videos.length) ? "" : "none";

    const member  = isMember();
    const memPx   = c.premium && c.subPrice != null ? Math.min(c.subPrice, memberPrice(c.price)) : memberPrice(c.price);
    const price   = member ? memPx : c.price;
    dm.querySelector(".cov-price .now").textContent = money(price);
    dm.querySelector(".cov-price .subprice").innerHTML = member ? `<em style="font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold,#e0a030)">Insider price applied</em>` : `Â· Members ${money(memPx)}`;

    const saveBtn = dm.querySelector(".cov-save-lg");
    saveBtn.classList.toggle("on", likeSet.has(c.id));
    saveBtn.onclick = () => toggleSaveById(c.id, saveBtn);
    dm.querySelector(".cov-buy-btn").onclick = () => triggerBuy(c, member, memPx);

    dm.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!dm) return;
    dm.classList.remove("open");
    document.body.style.overflow = "";
    dm.querySelectorAll("video").forEach(v => v.pause());
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Receipt FX + Buy
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function triggerBuy(c, member, memPx) {
    const priceVal = member && memPx ? memPx : c.price;
    if (window.AWAReceiptFX) {
      closeModal();
      AWAReceiptFX.show({
        title: c.title, price: money(c.price), memberPrice: money(priceVal),
        isMember: member, onConfirm: () => openPayLink(c), onCancel: () => {}
      });
    } else {
      openPayLink(c);
    }
  }

  function openPayLink(c) {
    if (c.pay) { window.open(c.pay, "_blank", "noopener"); return; }
    const to   = CFG.enquiryEmail || "awasound.music@gmail.com";
    const subj = encodeURIComponent(`Cover art enquiry â€” ${c.title}`);
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
      else     { likeSet.delete(id); await client.from("likes").delete().match({ user_id: uid, beat_id: likeId(id) }); }
    }, "Sign in to save cover art.");
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Coming Soon â€” Pair View
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  (function renderComingSoon() {
    const container = document.getElementById("coming-soon-list");
    if (!container || !COMING_SOON.length) return;

    const grid = document.createElement("div");
    grid.className = "cs-pair-grid";

    COMING_SOON.forEach(c => {
      const days = c.releaseDate ? daysUntil(c.releaseDate) : (c.releaseInDays || 30);
      const el   = document.createElement("article");
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
              <span class="pair-artist-text">AWA SOUNDS</span>
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
        this.textContent = "Notified âœ“";
      });

      grid.appendChild(el);
    });

    container.appendChild(grid);
  })();

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     GSAP animations for pair cards (via scroll-cinema.js already
     handles section titles; we add pair card reveals here)
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

  /* â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  initCinemaRail();
  initSeriesFilter();
  initPairCardAnimations();

})();
