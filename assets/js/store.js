/* AWA SOUNDS &#x2014; Beat Store (data-driven, BeatStars-style + 3-mode view toggle)
   View modes: grid (default) &#x2192; list (waveform bar) &#x2192; viz (animated waveform)
   Filter bar: genre tag chips above the list.
   Waveform: seeded deterministic bars; gold progress fill during playback;
             viz mode adds requestAnimationFrame pulse animation. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const list = document.getElementById("beat-list");
  if (!list) return;

  const money = (n) => "&#x00A3;" + Number(n).toFixed(0);
  const memberPrice = (n) => Math.round(n * (1 - (CFG.memberDiscount || 0)));
  const isMember = () => window.AWAAuth && AWAAuth.isMember();
  let likeSet = new Set();

  /* &#x2500;&#x2500;&#x2500; Injected CSS &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  const style = document.createElement("style");
  style.textContent = `
    .bstore-toolbar{display:flex;justify-content:space-between;align-items:center;
      margin-bottom:20px;gap:12px;flex-wrap:wrap}
    .bstore-filters{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
    .bsft-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;
      color:var(--muted);margin-right:2px}
    .bsf-btn{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;
      letter-spacing:.05em;text-transform:uppercase;
      border:1px solid var(--line);background:transparent;
      color:var(--muted);cursor:pointer;transition:.15s;font-family:var(--ff-display)}
    .bsf-btn.active,.bsf-btn:hover{background:var(--gold);color:#040200;border-color:var(--gold)}
    .bstore-view-toggle{display:inline-flex;background:var(--panel);
      border:1px solid var(--line);border-radius:8px;overflow:hidden;flex-shrink:0}
    .bvt-btn{padding:7px 12px;font-size:11px;font-family:var(--ff-display);font-weight:700;
      letter-spacing:.06em;text-transform:uppercase;border:none;cursor:pointer;
      background:transparent;color:var(--muted);transition:.15s;
      display:flex;align-items:center;gap:5px}
    .bvt-btn.active{background:var(--gold);color:#040200}

    /* LIST VIEW */
    .bstore.view-list{display:flex;flex-direction:column;gap:6px}
    .bstore.view-list .bcard{
      display:grid;grid-template-columns:64px 1fr auto;align-items:center;
      background:var(--panel);border:1px solid var(--line);border-radius:12px;
      padding:10px 16px;gap:14px;transition:border-color .2s}
    .bstore.view-list .bcard:hover{border-color:var(--line-strong)}
    .bstore.view-list .bcard.playing{border-color:var(--gold)}
    .bstore.view-list .bcard-art{width:64px;height:64px;border-radius:8px;overflow:hidden;
      flex-shrink:0;position:relative}
    .bstore.view-list .bcard-art img{width:100%;height:100%;object-fit:cover}
    .bstore.view-list .bcard-play{position:absolute;inset:0;display:flex;
      align-items:center;justify-content:center;background:rgba(0,0,0,.5);
      opacity:0;transition:.15s;border:none;cursor:pointer;color:#fff;border-radius:0}
    .bstore.view-list .bcard:hover .bcard-play,
    .bstore.view-list .bcard.playing .bcard-play{opacity:1}
    .bstore.view-list .bcard-body{display:flex;flex-direction:column;gap:3px;min-width:0}
    .bstore.view-list .bcard-title{font-size:14px;font-weight:600;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .bstore.view-list .bcard-sub{font-size:11px;color:var(--muted)}
    .bcard-waveform-wrap{position:relative;margin-top:5px}
    .bcard-waveform{width:100%;height:32px;display:block;cursor:pointer}
    .bcard-wf-time{position:absolute;right:0;top:-16px;font-size:10px;
      color:var(--muted);font-family:monospace;opacity:0;transition:.2s}
    .bcard.playing .bcard-wf-time{opacity:1}
    .bstore.view-list .bcard-tags{display:none}
    .bstore.view-list .bcard-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
    .bstore.view-list .bcard-from{display:none}
    .bstore.view-list .bcard-buy{padding:8px 14px;font-size:12px;white-space:nowrap}

    /* VIZ VIEW */
    .bstore.view-viz{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
    .bstore.view-viz .bcard{background:var(--panel);border:1px solid var(--line);
      border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:.2s}
    .bstore.view-viz .bcard:hover{border-color:var(--line-strong);transform:translateY(-2px)}
    .bstore.view-viz .bcard.playing{border-color:var(--gold)}
    .bstore.view-viz .bcard-art{width:100%;height:120px;position:relative;overflow:hidden}
    .bstore.view-viz .bcard-art img{width:100%;height:100%;object-fit:cover}
    .bstore.view-viz .bcard-play{position:absolute;inset:0;display:flex;
      align-items:center;justify-content:center;background:rgba(0,0,0,.45);
      opacity:0;transition:.15s;border:none;cursor:pointer;color:#fff}
    .bstore.view-viz .bcard:hover .bcard-play,
    .bstore.view-viz .bcard.playing .bcard-play{opacity:1}
    .bcard-viz-wrap{padding:8px 14px 4px;background:var(--bg-2,#0a0a0c)}
    .bcard-viz-canvas{width:100%;height:44px;display:block;cursor:pointer}
    .bstore.view-viz .bcard-body{padding:10px 14px 14px;display:flex;flex-direction:column;gap:5px}
    .bstore.view-viz .bcard-title{font-size:14px;font-weight:700}
    .bstore.view-viz .bcard-sub{font-size:11px;color:var(--muted)}
    .bstore.view-viz .bcard-actions{margin-top:4px}
  `;
  document.head.appendChild(style);

  /* &#x2500;&#x2500;&#x2500; Waveform engine &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  function seededRng(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function() { h ^= h << 13; h ^= h >> 7; h ^= h << 17; return (h >>> 0) / 4294967296; };
  }

  function genWave(id, bars) {
    const rng = seededRng(id); const raw = [];
    for (let i = 0; i < bars; i++) raw.push(0.12 + rng() * 0.88);
    return raw.map((v, i) => ((raw[i-1]||v) + v + v + (raw[i+1]||v)) / 4);
  }

  function drawWave(cv, data, progress, animated, frame) {
    const W = cv.offsetWidth || cv.width || 200;
    const H = cv.offsetHeight || cv.height || 32;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    const n = data.length;
    const barW = W / (n * 1.35);
    const gap   = barW * 0.35;
    const step  = barW + gap;
    const cx    = W * (progress || 0);
    for (let i = 0; i < n; i++) {
      const x = i * step;
      let amp = data[i];
      if (animated && x <= cx) amp = amp * (0.65 + 0.35 * Math.abs(Math.sin(frame * 0.07 + i * 0.38)));
      const bh = Math.max(2, amp * H * 0.88);
      const y  = (H - bh) / 2;
      const played = x <= cx;
      if (played) {
        const g = ctx.createLinearGradient(0, y, 0, y + bh);
        g.addColorStop(0, "#f7ecc7"); g.addColorStop(1, "#b9975a");
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = "rgba(198,204,212,0.16)";
      }
      const r = Math.min(2, barW / 2);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, bh, r); else ctx.rect(x, y, barW, bh);
      ctx.fill();
    }
  }

  const anims = {};
  function startAnim(cv, data, getP) {
    const key = cv.dataset.bid;
    if (anims[key]) cancelAnimationFrame(anims[key]);
    let f = 0;
    (function tick() { drawWave(cv, data, getP(), true, f++); anims[key] = requestAnimationFrame(tick); })();
  }
  function stopAnim(cv, data) {
    const key = cv.dataset.bid;
    if (anims[key]) { cancelAnimationFrame(anims[key]); delete anims[key]; }
    drawWave(cv, data, 0, false, 0);
  }

  /* &#x2500;&#x2500;&#x2500; Card renderers &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  function iconPlay() {
    return `<svg class="i-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg class="i-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`;
  }
  function iconLike() {
    return `<button class="ib ib-like" aria-label="Save beat" title="Save"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg></button>`;
  }
  function iconSave() {
    return `<button class="ib ib-save" aria-label="Add to playlist" title="Add to playlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h11M4 12h11M4 17h7M17 12v8M13 16h8"/></svg></button>`;
  }

  function card(b) {
    const el = document.createElement("article");
    el.className = "bcard"; el.dataset.id = b.id;
    if (b.preview) el.dataset.preview = b.preview;
    el.innerHTML = `
      <div class="bcard-art">
        <img src="${b.cover}" alt="${esc(b.title)} cover art" loading="lazy"
             onerror="this.style.opacity=0;this.parentNode.classList.add('noimg')">
        <button class="bcard-play" aria-label="Play preview">${iconPlay()}</button>
      </div>
      <div class="bcard-body">
        <h3 class="bcard-title">${esc(b.title)}</h3>
        <div class="bcard-sub">Prod. ${esc(b.producer)} &#x00B7; ${b.bpm} BPM &#x00B7; ${esc(b.key)}</div>
        <div class="bcard-tags">${(b.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="bcard-actions">
          <span class="bcard-from">from <b>${money(CFG.licenses.mp3.price)}</b></span>
          <div class="bcard-icons">${iconLike()}${iconSave()}</div>
          <button class="btn btn-primary bcard-buy">License</button>
        </div>
      </div>`;
    return el;
  }

  function cardList(b) {
    const el = document.createElement("article");
    el.className = "bcard"; el.dataset.id = b.id;
    if (b.preview) el.dataset.preview = b.preview;
    const wd = genWave(b.id, 55);
    el._waveData = wd;
    el.innerHTML = `
      <div class="bcard-art">
        <img src="${b.cover}" alt="${esc(b.title)}" loading="lazy" onerror="this.style.opacity=0">
        <button class="bcard-play" aria-label="Play">${iconPlay()}</button>
      </div>
      <div class="bcard-body">
        <h3 class="bcard-title">${esc(b.title)}</h3>
        <div class="bcard-sub">Prod. ${esc(b.producer)} &#x00B7; ${b.bpm} BPM &#x00B7; ${esc(b.key)}</div>
        <div class="bcard-waveform-wrap">
          <canvas class="bcard-waveform" data-bid="${esc(b.id)}" width="200" height="32"></canvas>
          <span class="bcard-wf-time">0:00</span>
        </div>
      </div>
      <div class="bcard-actions">
        <div class="bcard-icons">${iconLike()}${iconSave()}</div>
        <button class="btn btn-primary bcard-buy">License</button>
      </div>`;
    requestAnimationFrame(() => { const cv = el.querySelector(".bcard-waveform"); if (cv) drawWave(cv, wd, 0, false, 0); });
    return el;
  }

  function cardViz(b) {
    const el = document.createElement("article");
    el.className = "bcard"; el.dataset.id = b.id;
    if (b.preview) el.dataset.preview = b.preview;
    const wd = genWave(b.id, 75);
    el._waveData = wd;
    el.innerHTML = `
      <div class="bcard-art">
        <img src="${b.cover}" alt="${esc(b.title)}" loading="lazy" onerror="this.style.opacity=0">
        <button class="bcard-play" aria-label="Play">${iconPlay()}</button>
      </div>
      <div class="bcard-viz-wrap">
        <canvas class="bcard-viz-canvas" data-bid="${esc(b.id)}" width="240" height="44"></canvas>
      </div>
      <div class="bcard-body">
        <h3 class="bcard-title">${esc(b.title)}</h3>
        <div class="bcard-sub">Prod. ${esc(b.producer)} &#x00B7; ${b.bpm} BPM &#x00B7; ${esc(b.key)}</div>
        <div class="bcard-tags">${(b.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="bcard-actions">
          <span class="bcard-from">from <b>${money(CFG.licenses.mp3.price)}</b></span>
          <div class="bcard-icons">${iconLike()}${iconSave()}</div>
          <button class="btn btn-primary bcard-buy">License</button>
        </div>
      </div>`;
    requestAnimationFrame(() => { const cv = el.querySelector(".bcard-viz-canvas"); if (cv) drawWave(cv, wd, 0, false, 0); });
    return el;
  }

  /* &#x2500;&#x2500;&#x2500; State &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  let viewMode  = localStorage.getItem("awa-beat-view") || "grid";
  let filterTag = null;
  let BEATS     = [];

  /* &#x2500;&#x2500;&#x2500; Toolbar &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  const toolbar = document.createElement("div");
  toolbar.className = "bstore-toolbar";
  toolbar.innerHTML = `
    <div class="bstore-filters" id="bstore-filters"></div>
    <div class="bstore-view-toggle" title="Change view layout">
      <button class="bvt-btn${viewMode==="grid"?" active":""}" data-view="grid">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>Grid
      </button>
      <button class="bvt-btn${viewMode==="list"?" active":""}" data-view="list">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z"/></svg>List
      </button>
      <button class="bvt-btn${viewMode==="viz"?" active":""}" data-view="viz">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12h2v3H2zM6 8h2v8H6zM10 5h2v14h-2zM14 9h2v6h-2zM18 6h2v12h-2z"/></svg>Wave
      </button>
    </div>`;
  list.parentElement.insertBefore(toolbar, list);

  toolbar.querySelectorAll(".bvt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      viewMode = btn.dataset.view;
      localStorage.setItem("awa-beat-view", viewMode);
      toolbar.querySelectorAll(".bvt-btn").forEach(b => b.classList.toggle("active", b.dataset.view === viewMode));
      if (playingEl) { audio.pause(); stopVisual(); }
      renderBeats();
    });
  });

  function buildFilters() {
    const counts = {};
    BEATS.forEach(b => (b.tags||[]).forEach(t => { counts[t] = (counts[t]||0)+1; }));
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,9).map(([t])=>t);
    const el = document.getElementById("bstore-filters");
    el.innerHTML = `<span class="bsft-label">Filter:</span>`;
    const allBtn = document.createElement("button");
    allBtn.className = "bsf-btn active"; allBtn.textContent = "All";
    allBtn.addEventListener("click", () => { filterTag=null; el.querySelectorAll(".bsf-btn").forEach(b=>b.classList.remove("active")); allBtn.classList.add("active"); renderBeats(); });
    el.appendChild(allBtn);
    top.forEach(tag => {
      const btn = document.createElement("button");
      btn.className = "bsf-btn"; btn.textContent = tag;
      btn.addEventListener("click", () => { filterTag=tag; el.querySelectorAll(".bsf-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); renderBeats(); });
      el.appendChild(btn);
    });
  }

  function renderBeats() {
    Object.keys(anims).forEach(k => { cancelAnimationFrame(anims[k]); delete anims[k]; });
    list.className = "bstore view-" + viewMode;
    list.innerHTML = "";
    const beats = filterTag ? BEATS.filter(b=>(b.tags||[]).includes(filterTag)) : BEATS;
    beats.forEach(b => {
      let el;
      if (viewMode === "list") el = cardList(b);
      else if (viewMode === "viz") el = cardViz(b);
      else el = card(b);
      list.appendChild(el);
    });
    reflectLikes();
  }

  (async function initBeats() {
    BEATS = (window.AWACMS ? await AWACMS.beats() : (CFG.beats||[])) || [];
    buildFilters();
    renderBeats();
  })();

  /* &#x2500;&#x2500;&#x2500; Audio playback &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  const audio = new Audio();
  let playingEl = null;

  const stopVisual = () => {
    if (!playingEl) return;
    playingEl.classList.remove("playing");
    const cv = playingEl.querySelector(".bcard-waveform, .bcard-viz-canvas");
    if (cv && playingEl._waveData) stopAnim(cv, playingEl._waveData);
    playingEl = null;
  };
  audio.addEventListener("ended", stopVisual);

  audio.addEventListener("timeupdate", () => {
    if (!playingEl || !audio.duration) return;
    const prog = audio.currentTime / audio.duration;
    if (viewMode === "list") {
      const cv = playingEl.querySelector(".bcard-waveform");
      if (cv && playingEl._waveData) drawWave(cv, playingEl._waveData, prog, false, 0);
      const t = playingEl.querySelector(".bcard-wf-time");
      if (t) { const m=Math.floor(audio.currentTime/60), s=Math.floor(audio.currentTime%60).toString().padStart(2,"0"); t.textContent=m+":"+s; }
    }
  });

  list.addEventListener("click", (e) => {
    const play = e.target.closest(".bcard-play");
    if (play) {
      const el = play.closest(".bcard");
      const src = el.dataset.preview;
      if (playingEl === el) { audio.pause(); stopVisual(); return; }
      stopVisual();
      if (!src) { flash(el, "Preview coming soon"); return; }
      audio.src = src; audio.play().catch(()=>{});
      el.classList.add("playing"); playingEl = el;
      if (viewMode === "viz") {
        const cv = el.querySelector(".bcard-viz-canvas");
        if (cv && el._waveData) startAnim(cv, el._waveData, ()=> audio.duration ? audio.currentTime/audio.duration : 0);
      }
      return;
    }
    const wf = e.target.closest(".bcard-waveform, .bcard-viz-canvas");
    if (wf && playingEl && wf.closest(".bcard") === playingEl && audio.duration) {
      const r = wf.getBoundingClientRect();
      audio.currentTime = audio.duration * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      return;
    }
    const like = e.target.closest(".ib-like");
    if (like) { toggleLike(like.closest(".bcard")); return; }
    const save = e.target.closest(".ib-save");
    if (save) { addToPlaylist(save.closest(".bcard")); return; }
    const buy = e.target.closest(".bcard-buy");
    if (buy) { openLicense(buy.closest(".bcard").dataset.id); return; }
  });

  /* &#x2500;&#x2500;&#x2500; Likes &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  function toggleLike(el) {
    AWAAuth.requireAuth(async () => {
      const id=el.dataset.id, btn=el.querySelector(".ib-like");
      const client=AWAAuth.client(), uid=AWAAuth.user().id;
      const on=btn.classList.toggle("on");
      if (on) { likeSet.add(id); await client.from("likes").upsert({user_id:uid,beat_id:id}); }
      else { likeSet.delete(id); await client.from("likes").delete().match({user_id:uid,beat_id:id}); }
    }, "Sign in to save beats to your account.");
  }

  async function addToPlaylist(el) {
    AWAAuth.requireAuth(async () => {
      const id=el.dataset.id, client=AWAAuth.client(), uid=AWAAuth.user().id;
      const {data:pls}=await client.from("playlists").select("id,name").eq("user_id",uid).order("created_at");
      let target;
      if (!pls||!pls.length) {
        const name=prompt("Name your first playlist:","My Playlist");
        if (name===null) return;
        const {data}=await client.from("playlists").insert({user_id:uid,name:name||"My Playlist"}).select().single();
        target=data;
      } else {
        const choice=prompt("Add to which playlist? Type the number, or a new name:\n"+pls.map((p,i)=>`${i+1}. ${p.name}`).join("\n"),"1");
        if (choice===null) return;
        const n=parseInt(choice,10);
        if (n>=1&&n<=pls.length) target=pls[n-1];
        else { const {data}=await client.from("playlists").insert({user_id:uid,name:choice}).select().single(); target=data; }
      }
      if (!target) return;
      await client.from("playlist_items").upsert({playlist_id:target.id,beat_id:id});
      flash(el,"Added to "+target.name);
    }, "Sign in to build playlists.");
  }

  async function reflectLikes() {
    document.querySelectorAll(".ib-like.on").forEach(b=>b.classList.remove("on"));
    const sess=window.AWAAuth&&AWAAuth.user();
    if (!sess) { likeSet=new Set(); return; }
    const {data}=await AWAAuth.client().from("likes").select("beat_id").eq("user_id",AWAAuth.user().id);
    likeSet=new Set();
    (data||[]).forEach(r => {
      likeSet.add(r.beat_id);
      const el=list.querySelector(`.bcard[data-id="${r.beat_id}"] .ib-like`);
      if (el) el.classList.add("on");
    });
    repriceLicense();
  }
  if (window.AWAAuth) AWAAuth.onChange(()=>reflectLikes());

  /* &#x2500;&#x2500;&#x2500; License modal &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  let lm=null, currentBeat=null;
  function buildLicenseModal() {
    lm=document.createElement("div"); lm.className="lic-modal";
    lm.innerHTML=`
      <div class="lic-card">
        <button class="lic-close" aria-label="Close">&times;</button>
        <div class="lic-head"><span class="eyebrow">License</span><h3 class="lic-title"></h3></div>
        <div class="lic-note"></div>
        <div class="lic-tiers"></div>
        <p class="lic-fine">Every license includes a signed copy of the contract, delivered on purchase. Prices in GBP. <a href="account.html">Insider members</a> save ${Math.round((CFG.memberDiscount||0)*100)}% on every tier.</p>
      </div>`;
    document.body.appendChild(lm);
    lm.addEventListener("click",(e)=>{ if (e.target===lm||e.target.closest(".lic-close")) closeLicense(); });
  }

  function tierRow(beat,key) {
    const L=CFG.licenses[key];
    const link=(beat.pay&&beat.pay[key])||"";
    const member=isMember();
    let ph;
    if (L.price==null) ph=`<span class="lic-price">Enquire</span>`;
    else if (member) ph=`<span class="lic-price"><s>${money(L.price)}</s> ${money(memberPrice(L.price))}</span>`;
    else ph=`<span class="lic-price">${money(L.price)}</span>`;
    return `<div class="lic-tier">
      <div class="lic-tier-main">
        <b>${L.name}</b>
        <small>${L.streams==="Unlimited"?"Unlimited streams &#x00B7; you own it":"Up to "+L.streams+" streams"}</small>
        <a class="lic-view" href="${L.doc}" target="_blank" rel="noopener">View contract</a>
      </div>
      <div class="lic-tier-buy">
        ${ph}
        <button class="btn btn-primary lic-go" data-key="${key}" data-link="${link}">${L.price==null?"Enquire":"Buy"}</button>
      </div>
    </div>`;
  }

  function openLicense(beatId) {
    currentBeat=BEATS.find(b=>b.id===beatId); if (!currentBeat) return;
    if (!lm) buildLicenseModal();
    lm.querySelector(".lic-title").textContent=currentBeat.title;
    lm.querySelector(".lic-note").innerHTML=isMember()
      ?`<span class="lic-badge">Insider price applied</span>`
      :`<span class="lic-badge ghost"><a href="account.html">Become an Insider</a> for ${Math.round((CFG.memberDiscount||0)*100)}% off</span>`;
    lm.querySelector(".lic-tiers").innerHTML=["mp3","wav","trackout","exclusive"].map(k=>tierRow(currentBeat,k)).join("");
    lm.querySelectorAll(".lic-go").forEach(btn=>btn.addEventListener("click",()=>checkout(btn.dataset.key,btn.dataset.link)));
    lm.classList.add("open"); document.body.style.overflow="hidden";
  }
  function repriceLicense() { if (lm&&lm.classList.contains("open")&&currentBeat) openLicense(currentBeat.id); }
  function closeLicense() { if (lm) { lm.classList.remove("open"); document.body.style.overflow=""; } }

  function checkout(key,link) {
    const L=CFG.licenses[key];
    if (link) { window.open(link,"_blank","noopener"); closeLicense(); setTimeout(()=>showCoverUpsell(currentBeat),1200); return; }
    const to=CFG.enquiryEmail||"awasound.music@gmail.com";
    const subj=encodeURIComponent(`Beat enquiry &#x2014; ${currentBeat.title} (${L.name})`);
    const body=encodeURIComponent(`Hi Awa Sounds,\n\nI'd like the ${L.name} license for "${currentBeat.title}" (Prod. ${currentBeat.producer}).\n\nName:\nArtist name:\n\nThanks.`);
    window.location.href=`mailto:${to}?subject=${subj}&body=${body}`;
    closeLicense(); setTimeout(()=>showCoverUpsell(currentBeat),800);
  }

  /* &#x2500;&#x2500;&#x2500; Post-purchase cover upsell &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  function showCoverUpsell(beat) {
    const allCovers=CFG.covers||[];
    const matched=allCovers.filter(c=>!c.auctionOnly).slice(0,3);
    if (!matched.length) return;
    const panel=document.createElement("div"); panel.className="cover-upsell-panel";
    panel.innerHTML=`<div class="cup-inner">
      <button class="cup-close">&times;</button>
      <div class="cup-eyebrow">Complete Your Look</div>
      <h3 class="cup-title">Cover art that matches the energy of "${beat.title}"</h3>
      <p class="cup-sub">Your beat needs a visual identity. These covers fit the same world.</p>
      <div class="cup-grid">${matched.map(c=>`
        <a href="cover-store.html?id=${c.id}" class="cup-card">
          <div class="cup-img" style="background:var(--bg3)">
            ${c.img?`<img src="${c.img}" alt="${esc(c.title)}" loading="lazy">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:28px">&#x1F5BC;</div>'}
          </div>
          <div class="cup-info">
            <div class="cup-name">${esc(c.title)}</div>
            <div class="cup-price">&#xa3;${c.price}${c.subPrice?` <span style="font-size:10px;opacity:.5">&#x00B7; Insider &#xa3;${c.subPrice}</span>`:""}</div>
          </div>
        </a>`).join("")}
      </div>
      <a href="cover-store.html" class="cup-browse">Browse all covers &#8594;</a>
    </div>`;
    document.body.appendChild(panel);
    setTimeout(()=>panel.classList.add("open"),30);
    panel.querySelector(".cup-close").addEventListener("click",()=>{ panel.classList.remove("open"); setTimeout(()=>panel.remove(),350); });
    panel.addEventListener("click",e=>{ if (e.target===panel) { panel.classList.remove("open"); setTimeout(()=>panel.remove(),350); } });
  }

  /* &#x2500;&#x2500;&#x2500; helpers &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500; */
  function flash(el,msg) {
    const t=document.createElement("div"); t.className="bcard-flash"; t.textContent=msg;
    el.appendChild(t); setTimeout(()=>t.classList.add("show"),10);
    setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(),300); },1600);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g,c=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }
})();
