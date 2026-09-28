/* ============================================================================
   cinematic-engine.js — enhanced scroll cinema (drop-in for scrub-engine.js)
   ----------------------------------------------------------------------------
   KEY IMPROVEMENT over scrub-engine.js:
   · Direct video URLs — no blob preload wait. Seeking works within ~2s of page
     load instead of waiting for full file download (was 10–30s on slow links).
     Modern browsers issue byte-range requests; CloudFront + S3 both support this.
   · Canvas frame buffer — draws last rendered frame on canvas so scene never
     flashes black between seeks. Falls back silently if CORS isn't configured.
   · Ken Burns CSS on stills — premium slow zoom-drift animation while video loads.
   · All other scrub-engine features preserved: lerp, seek coalescing, crossfade,
     particles, mobile handling, reduced-motion, navigation, copy panels, etc.

   USAGE — identical to scrub-engine.js:
     window.mountScrollWorld(el, config)
   ============================================================================ */

function mountScrollWorld(container, config) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse  = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const smallMQ = window.matchMedia('(max-width: 860px)');
  const isMobile = () => coarse || smallMQ.matches;

  const SECTIONS    = config.sections     || [];
  const CONNECTORS  = config.connectors   || [];
  const CONNECTORS_M= config.connectorsMobile || [];
  const DIVE_W      = config.diveScroll   || 1.3;
  const CONN_W      = config.connScroll   || 0.9;
  const CROSSFADE   = (config.crossfade != null) ? config.crossfade : 0.12;
  const N = SECTIONS.length;
  if (!N) return;

  injectCinemaCSS();
  container.classList.add('sw-root');

  const SEGMENTS = [];
  SECTIONS.forEach((s, i) => {
    const dive = { kind:'dive', si:i, clip:s.clip, clipM:s.clipMobile,
                   still:s.still, stillM:s.stillMobile, accent:s.accent,
                   w:s.scroll || DIVE_W, linger:s.linger || 0 };
    SEGMENTS.push(dive); s._seg = dive;
    if (i < N - 1 && CONNECTORS[i]) {
      SEGMENTS.push({ kind:'conn', si:i, clip:CONNECTORS[i], clipM:CONNECTORS_M[i],
                      still:SECTIONS[i+1].still, stillM:SECTIONS[i+1].stillMobile,
                      accent:SECTIONS[i+1].accent, w:CONN_W });
    }
  });
  const NSEG = SEGMENTS.length;

  const sky = el('div','sw-sky');
  if (config.atmosphere !== false) {
    sky.appendChild(el('div','sw-sky__grad'));
    sky.appendChild(el('div','sw-sky__glow'));
  }
  const particles = el('div','sw-particles'); sky.appendChild(particles);
  const scrollbar     = el('div','sw-scrollbar');
  const scrollbarFill = el('span'); scrollbar.appendChild(scrollbarFill);
  const topbar = el('div','sw-topbar');
  if (config.brand) {
    const brand = el('a','sw-brand'); brand.href = config.brand.href || '#';
    brand.appendChild(el('span','sw-brand__mark'));
    const nm = el('span','sw-brand__name'); nm.textContent = config.brand.name || '';
    brand.appendChild(nm); topbar.appendChild(brand);
  }
  const nav = el('nav','sw-nav');
  if (config.nav !== false) topbar.appendChild(nav);
  if (config.cta && config.cta.label) {
    const c = el('a','sw-topcta'); c.href = config.cta.href || '#';
    c.textContent = config.cta.label; topbar.appendChild(c);
  }
  const stage     = el('div','sw-stage');
  const copylayer = el('div','sw-copylayer');
  const route     = el('div','sw-route');
  const hint      = el('div','sw-hint');
  const hintText  = el('span'); hintText.textContent = config.hint || 'scroll';
  hint.appendChild(hintText); hint.appendChild(el('i'));
  const track = el('div','sw-track');
  [sky, scrollbar, topbar, stage, copylayer, route, hint, track].forEach(n => container.appendChild(n));

  SEGMENTS.forEach(s => {
    const scene = el('div','sw-scene');
    scene.style.setProperty('--sw-accent', s.accent || '');
    const img = el('img','sw-scene__still');
    img.alt = ''; img.decoding = 'async'; img.loading = 'lazy';
    const poster = (isMobile() && s.stillM) ? s.stillM : s.still;
    if (poster) img.src = poster;
    scene.appendChild(img);
    const canvas = el('canvas','sw-scene__canvas');
    scene.appendChild(canvas);
    stage.appendChild(scene);
    s.el = scene; s.img = img; s.canvas = canvas; s.ctx = null;
    s.video = null; s.hasClip = false; s.loading = false; s.ready = false;
    s.cur = 0; s.target = 0; s.visible = false;
  });

  const copies = [], dots = [];
  SECTIONS.forEach((s, i) => {
    const c = el('article','sw-copy');
    c.style.setProperty('--sw-accent', s.accent || '');
    c.innerHTML =
      '<span class="sw-copy__num">' + pad(i+1) + ' / ' + pad(N) + '</span>' +
      (s.eyebrow ? '<span class="sw-copy__eyebrow">' + esc(s.eyebrow) + '</span>' : '') +
      (s.title   ? '<h2 class="sw-copy__title">'    + esc(s.title)   + '</h2>'   : '') +
      (s.body    ? '<p  class="sw-copy__body">'     + esc(s.body)    + '</p>'    : '') +
      (s.tags && s.tags.length ? '<ul class="sw-copy__tags">' + s.tags.map(t=>'<li>'+esc(t)+'</li>').join('') + '</ul>' : '') +
      (s.cta ? '<div class="sw-copy__cta">' + ctaBtns(s.cta) + '</div>' : '');
    copylayer.appendChild(c); copies.push(c);
    const dot = el('button','sw-route__dot');
    dot.style.setProperty('--sw-accent', s.accent || '');
    dot.innerHTML = '<span class="sw-route__label">' + esc(s.label||'') + '</span><i></i>';
    dot.addEventListener('click', () => jumpTo(i));
    route.appendChild(dot); dots.push(dot);
    if (config.nav !== false) {
      const b = el('button','sw-nav__item'); b.textContent = s.label || '';
      b.addEventListener('click', () => jumpTo(i)); nav.appendChild(b);
    }
  });

  const clamp = (x, a=0, b=1) => Math.min(b, Math.max(a, x));
  const smooth = x => { x=clamp(x); return x*x*(3-2*x); };
  const lingerEase = (x, L) => {
    L = clamp(L);
    const c = x - 0.5;
    return (1-L)*x + L*(4*c*c*c + 0.5);
  };

  let vh=window.innerHeight, stageX=0, totalW=0, activeIndex=-1, ticking=false;
  let laidOutW = window.innerWidth;

  function layout() {
    vh = window.innerHeight; laidOutW = window.innerWidth;
    stageX = window.innerWidth > 860 ? 4 : 0;
    let off = 0;
    SEGMENTS.forEach(s => { s.start=off*vh; off+=s.w; s.end=off*vh; });
    totalW = off;
    track.style.height = (totalW*vh + vh) + 'px';
    read();
  }

  function jumpTo(i) {
    const seg = SECTIONS[i]._seg;
    window.scrollTo({ top:seg.start+(seg.end-seg.start)*0.5, behavior:reduce?'auto':'smooth' });
  }

  function loadClip(s) {
    if (reduce || s.loading || !s.clip) return;
    s.loading = true;
    const url = (isMobile() && s.clipM) ? s.clipM : s.clip;
    const v = document.createElement('video');
    v.className = 'sw-scene__video';
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted',''); v.setAttribute('playsinline','');
    v.crossOrigin = 'anonymous';
    v.src = url;
    v.addEventListener('loadedmetadata', () => {
      s.canvas.width  = v.videoWidth  || 1280;
      s.canvas.height = v.videoHeight || 720;
      try { s.ctx = s.canvas.getContext('2d'); } catch(e) {}
      s.ready = true;
      read();
    });
    v.addEventListener('seeked', () => {
      if (s.ctx) {
        try { s.ctx.drawImage(v, 0, 0, s.canvas.width, s.canvas.height); }
        catch(e) { s.ctx = null; }
      }
      s.el.classList.add('has-clip');
    });
    v.addEventListener('loadeddata', () => {
      try { v.pause(); } catch(e) {}
      if (userReady) primeVideo(v);
    });
    v.load();
    s.el.appendChild(v); s.video = v; s.hasClip = true;
  }

  function read() {
    const y     = window.scrollY || window.pageYOffset;
    const fade  = CROSSFADE * vh;
    let ci = 0;
    for (let i=0; i<NSEG; i++) if (y >= SEGMENTS[i].start) ci = i;
    for (let i=0; i<NSEG; i++) {
      const s = SEGMENTS[i];
      if (y > s.start - 1.6*vh && y < s.end + 1.6*vh) loadClip(s);
      const local = clamp((y-s.start)/(s.end-s.start), 0, 1);
      s.target = s.linger ? lingerEase(local, s.linger) : local;
      let outside = 0;
      if (y < s.start) outside = s.start - y;
      else if (y > s.end) outside = y - s.end;
      const op = smooth(1 - outside/fade);
      s.el.style.opacity = op;
      s.visible = op > 0.001;
      s.el.style.zIndex = (i===ci) ? '120' : String(100+Math.round(op*10));
      if (!s.hasClip || !s.ready) {
        if (!reduce) {
          const sc = 1.03 + local*0.06;
          s.img.style.transform = 'translateX(' + (stageX-2) + 'vw) scale(' + sc.toFixed(3) + ')';
        }
      }
    }
    for (let i=0; i<N; i++) {
      const seg = SECTIONS[i]._seg;
      const pr  = clamp((y-seg.start)/(seg.end-seg.start), 0, 1);
      const before = y<seg.start, after = y>seg.end;
      let cop;
      if (i===0)        cop = after ? 0 : smooth(1-pr/0.62);
      else if (i===N-1) cop = before ? 0 : smooth(pr/0.4);
      else              cop = (before||after) ? 0 : smooth(1-Math.abs(pr-0.5)/0.5);
      const c = copies[i];
      c.style.opacity   = cop;
      c.style.transform = reduce ? 'none' : 'translateY(' + ((0.5-pr)*4) + 'vh)';
      c.style.pointerEvents = cop>0.5 ? 'auto' : 'none';
    }
    const cur  = SEGMENTS[ci];
    const near = clamp(cur.kind==='dive' ? cur.si : (((y-cur.start)/(cur.end-cur.start))>0.5 ? cur.si+1 : cur.si), 0, N-1);
    if (near !== activeIndex) {
      activeIndex = near;
      dots.forEach((d,k)  => d.classList.toggle('is-active', k===near));
      nav.querySelectorAll('.sw-nav__item').forEach((n,k) => n.classList.toggle('is-active', k===near));
      container.style.setProperty('--sw-accent', SECTIONS[near].accent||'');
    }
    scrollbarFill.style.transform = 'scaleX(' + clamp(y/(totalW*vh)) + ')';
    hint.style.opacity = clamp(1-y/(0.5*vh));
    if (particles) particles.style.transform = 'translate3d(0,' + (-y*0.05) + 'px,0)';
    ticking = false;
  }

  function raf() {
    const eps = isMobile() ? 0.02 : 0.008;
    for (let i=0; i<NSEG; i++) {
      const s = SEGMENTS[i];
      if (!s.hasClip || !s.ready || !s.video) continue;
      if (s.video.seeking) continue;
      if (!s.visible && Math.abs(s.cur-s.target) < 0.002) continue;
      const lerpK = s.visible ? 0.22 : 0.15;
      s.cur += (s.target-s.cur) * (reduce ? 1 : lerpK);
      const dur = s.video.duration || 1;
      const t   = clamp(s.cur, 0, 0.999) * dur;
      if (Math.abs(s.video.currentTime-t) > eps) {
        try { s.video.currentTime = t; } catch(e) {}
      }
    }
    requestAnimationFrame(raf);
  }

  let userReady = false;
  function primeVideo(v) {
    if (!isMobile() || !v) return;
    try { const p=v.play(); if (p&&p.then) p.then(()=>{ try{v.pause();}catch(e){} }).catch(()=>{}); }
    catch(e) {}
  }
  function onFirstGesture() {
    if (userReady) return; userReady=true;
    SEGMENTS.forEach(s => primeVideo(s.video));
  }
  window.addEventListener('pointerdown', onFirstGesture, { once:true, passive:true });
  window.addEventListener('touchstart',  onFirstGesture, { once:true, passive:true });
  seedParticles(particles, reduce || coarse);
  window.addEventListener('scroll',  () => { if(!ticking){ticking=true;requestAnimationFrame(read);} }, { passive:true });
  function onResize() { if (coarse && window.innerWidth===laidOutW) return; layout(); }
  window.addEventListener('resize',          onResize);
  window.addEventListener('orientationchange', layout);
  window.addEventListener('load',              layout);
  layout();
  requestAnimationFrame(raf);

  function el(tag,cls) { const n=document.createElement(tag); if(cls) n.className=cls; return n; }
  function pad(n) { return String(n).padStart(2,'0'); }
  function esc(s) { return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function ctaBtns(cta) {
    let h='';
    if(cta.primary)   h+='<a class="sw-btn sw-btn--primary" href="'+esc(cta.primary.href||'#')+'">'+esc(cta.primary.label)+'</a>';
    if(cta.secondary) h+='<a class="sw-btn sw-btn--ghost"   href="'+esc(cta.secondary.href||'#')+'">'+esc(cta.secondary.label)+'</a>';
    return h;
  }
}

function seedParticles(host, reduce) {
  if (!host || reduce) return;
  const kinds = ['dot','dot','ring'];
  const seeds = [7,23,41,58,71,88,12,34,52,66,83,95,18,29,47,63,77,91,5,38,55,69,82,97];
  for (let k=0; k<20; k++) {
    const s = document.createElement('span');
    s.className = 'sw-pt sw-pt--'+kinds[k%kinds.length];
    s.style.left = seeds[k%seeds.length]+'vw';
    s.style.top  = ((seeds[(k*3)%seeds.length]*1.3)%100)+'vh';
    s.style.setProperty('--sw-sc', (0.5+((seeds[(k*5)%seeds.length]%60)/60)*1.1).toFixed(2));
    const dur = 14+(seeds[(k*7)%seeds.length]%22);
    s.style.animationDuration = dur+'s';
    s.style.animationDelay   = (-(seeds[(k*2)%seeds.length]%dur))+'s';
    host.appendChild(s);
  }
}

function injectCinemaCSS() {
  if (document.getElementById('sw-css')) return;
  const css = `
  .sw-root{--sw-bg:#050506;--sw-ink:#e9ecf1;--sw-ink-soft:#9aa1ab;--sw-accent:#c9ced6;
    --sw-font-display:"Space Grotesk",system-ui,sans-serif;--sw-font-body:"Inter",system-ui,sans-serif;
    color:var(--sw-ink);font-family:var(--sw-font-body)}
  html,body{margin:0;background:var(--sw-bg,#050506);overflow-x:hidden}
  .sw-sky{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:var(--sw-bg)}
  .sw-sky__grad{position:absolute;inset:-10%;background:linear-gradient(178deg,color-mix(in srgb,var(--sw-accent) 8%,var(--sw-bg)) 0%,var(--sw-bg) 55%,color-mix(in srgb,var(--sw-accent) 4%,var(--sw-bg)) 100%)}
  .sw-sky__glow{position:absolute;inset:0;background:radial-gradient(60% 42% at 74% 16%,color-mix(in srgb,var(--sw-accent) 14%,transparent),transparent 70%),radial-gradient(46% 34% at 50% 50%,color-mix(in srgb,#fff 20%,transparent),transparent 70%)}
  .sw-particles{position:absolute;inset:-6% -2%;will-change:transform}
  .sw-pt{position:absolute;width:13px;height:13px;transform:scale(var(--sw-sc,1));opacity:0;animation:sw-drift linear infinite}
  .sw-pt::before{content:"";position:absolute;inset:0;border-radius:50%}
  .sw-pt--dot::before{background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--sw-accent) 50%,#000),#000 82%)}
  .sw-pt--ring::before{background:transparent;border:2px solid color-mix(in srgb,var(--sw-accent) 40%,transparent)}
  @keyframes sw-drift{0%{opacity:0;transform:scale(var(--sw-sc)) translate(0,12vh) rotate(0)}12%{opacity:.4}88%{opacity:.35}100%{opacity:0;transform:scale(var(--sw-sc)) translate(4vw,-22vh) rotate(210deg)}}
  .sw-scrollbar{position:fixed;top:0;left:0;right:0;height:2px;z-index:60;background:color-mix(in srgb,var(--sw-accent) 12%,transparent)}
  .sw-scrollbar span{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--sw-accent)}
  .sw-topbar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:clamp(14px,2.4vw,26px) clamp(18px,5vw,64px)}
  .sw-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--sw-ink)}
  .sw-brand__mark{width:24px;height:28px;border-radius:7px 7px 10px 10px;background:linear-gradient(160deg,var(--sw-accent),color-mix(in srgb,var(--sw-accent) 60%,#000));box-shadow:0 6px 14px color-mix(in srgb,var(--sw-accent) 30%,transparent)}
  .sw-brand__name{font-family:var(--sw-font-display);font-weight:700;font-size:1.1rem}
  .sw-nav{display:flex;gap:4px;padding:5px;background:color-mix(in srgb,#fff 8%,transparent);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.08);border-radius:999px}
  .sw-nav__item{font:inherit;font-size:.82rem;color:var(--sw-ink-soft);border:0;background:transparent;cursor:pointer;padding:7px 14px;border-radius:999px;transition:color .25s,background .25s}
  .sw-nav__item:hover{color:var(--sw-ink)}
  .sw-nav__item.is-active{color:#050506;background:var(--sw-accent)}
  .sw-topcta{text-decoration:none;font-weight:600;font-size:.9rem;color:#050506;background:var(--sw-ink);padding:10px 20px;border-radius:999px;white-space:nowrap}
  .sw-stage{position:fixed;inset:0;z-index:10;pointer-events:none}
  .sw-scene{position:absolute;inset:0;opacity:0;overflow:hidden;will-change:opacity}
  .sw-scene__still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 42%;will-change:transform;animation:sw-ken-burns 14s ease-in-out infinite alternate}
  @keyframes sw-ken-burns{0%{transform:scale(1.0) translate(0%,0%)}33%{transform:scale(1.05) translate(-0.8%,0.4%)}66%{transform:scale(1.03) translate(0.6%,-0.3%)}100%{transform:scale(1.07) translate(-0.4%,0.2%)}}
  .sw-scene__canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0;transition:opacity .3s}
  .sw-scene.has-clip .sw-scene__canvas{opacity:1}
  .sw-scene__video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 42%;z-index:1}
  .sw-scene.has-clip .sw-scene__still{opacity:0;animation:none}
  .sw-copylayer{position:fixed;inset:0;z-index:20;pointer-events:none}
  .sw-copylayer::before{content:"";position:absolute;inset:0;width:min(58vw,780px);background:linear-gradient(90deg,rgba(5,5,6,.9) 0%,rgba(5,5,6,.65) 34%,rgba(5,5,6,.3) 62%,transparent 100%)}
  .sw-copy{position:absolute;left:clamp(18px,5vw,64px);top:50%;transform:translateY(-50%);width:min(42vw,460px);opacity:0;will-change:opacity,transform}
  .sw-copy__num{font-family:ui-monospace,Menlo,monospace;font-size:.74rem;letter-spacing:.12em;color:var(--sw-ink-soft)}
  .sw-copy__eyebrow{display:block;margin-top:18px;font-family:var(--sw-font-display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--sw-accent)}
  .sw-copy__title{font-family:var(--sw-font-display);font-weight:700;color:var(--sw-ink);font-size:clamp(2rem,4.4vw,3.5rem);line-height:1.03;margin:12px 0 0;letter-spacing:-.01em;text-shadow:0 2px 30px rgba(5,5,6,.8)}
  .sw-copy__body{margin-top:18px;font-size:clamp(1rem,1.25vw,1.14rem);line-height:1.55;color:rgba(233,236,241,.75);max-width:40ch;text-shadow:0 1px 16px rgba(5,5,6,.9)}
  .sw-copy__tags{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0}
  .sw-copy__tags li{font-size:.82rem;font-weight:600;color:color-mix(in srgb,var(--sw-accent) 80%,#fff);padding:7px 14px;border-radius:999px;background:rgba(201,206,214,.08);border:1px solid rgba(201,206,214,.2)}
  .sw-copy__cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;pointer-events:auto}
  .sw-btn{text-decoration:none;font-weight:600;font-size:.95rem;padding:13px 24px;border-radius:999px;transition:transform .2s,box-shadow .2s}
  .sw-btn--primary{color:#050506;background:var(--sw-ink)}
  .sw-btn--primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,206,214,.2)}
  .sw-btn--ghost{color:var(--sw-ink);border:1.5px solid rgba(201,206,214,.25)}
  .sw-btn--ghost:hover{transform:translateY(-2px)}
  .sw-route{position:fixed;right:clamp(14px,2.4vw,30px);top:50%;z-index:40;transform:translateY(-50%);display:flex;flex-direction:column;gap:22px;padding:18px 10px}
  .sw-route::before{content:"";position:absolute;left:50%;top:22px;bottom:22px;width:1px;transform:translateX(-50%);background:var(--sw-accent);opacity:.2}
  .sw-route__dot{position:relative;border:0;background:transparent;cursor:pointer;width:14px;height:14px;display:grid;place-items:center}
  .sw-route__dot i{width:7px;height:7px;border-radius:50%;background:color-mix(in srgb,var(--sw-accent) 35%,transparent);transition:transform .3s,background .3s,box-shadow .3s}
  .sw-route__dot:hover i{transform:scale(1.3);background:var(--sw-accent)}
  .sw-route__dot.is-active i{background:var(--sw-accent);transform:scale(1.5);box-shadow:0 0 0 4px color-mix(in srgb,var(--sw-accent) 18%,transparent)}
  .sw-route__label{position:absolute;right:24px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;font-size:.78rem;font-weight:600;color:var(--sw-ink);background:rgba(5,5,6,.7);backdrop-filter:blur(8px);padding:5px 11px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;border:1px solid rgba(201,206,214,.15)}
  .sw-route__dot:hover .sw-route__label,.sw-route__dot.is-active .sw-route__label{opacity:1;transform:translateY(-50%) translateX(0)}
  .sw-hint{position:fixed;left:50%;bottom:26px;z-index:30;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--sw-ink-soft);transition:opacity .3s}
  .sw-hint i{width:22px;height:34px;border-radius:12px;border:2px solid rgba(201,206,214,.22);position:relative}
  .sw-hint i::after{content:"";position:absolute;left:50%;top:7px;width:4px;height:7px;border-radius:2px;background:var(--sw-accent);transform:translateX(-50%);animation:sw-wheel 1.7s ease-in-out infinite}
  @keyframes sw-wheel{0%{opacity:0;top:6px}40%{opacity:1}100%{opacity:0;top:17px}}
  .sw-track{position:relative;z-index:1;width:100%;pointer-events:none}
  @media(max-width:860px){.sw-nav{display:none}.sw-copylayer::before{width:100%;height:60%;top:auto;bottom:0;background:linear-gradient(0deg,rgba(5,5,6,.92) 8%,rgba(5,5,6,.5) 46%,transparent 100%)}.sw-copy{left:clamp(18px,5vw,64px);right:clamp(18px,5vw,64px);top:auto;bottom:clamp(64px,14vh,120px);transform:none;width:auto;max-width:560px;bottom:calc(clamp(56px,12dvh,110px) + env(safe-area-inset-bottom))}.sw-copy__title{font-size:clamp(1.9rem,7.5vw,2.7rem)}.sw-copy__body{max-width:none;font-size:clamp(.98rem,3.6vw,1.1rem)}.sw-scene__video,.sw-scene__still{object-position:center 46%}.sw-hint{bottom:calc(20px + env(safe-area-inset-bottom))}.sw-route{gap:16px;right:6px}.sw-route__label{display:none}}
  @media(max-width:860px) and (orientation:portrait){.sw-scene__video,.sw-scene__still,.sw-scene__canvas{object-position:center 44%}}
  @media(hover:none) and (pointer:coarse){.sw-route{padding:14px 6px}.sw-route__dot{width:28px;height:28px}.sw-btn{padding:15px 26px}}
  @media(prefers-reduced-motion:reduce){.sw-hint i::after{animation:none}.sw-pt{display:none}.sw-scene__still{animation:none}}
  `;
  const style = document.createElement('style'); style.id = 'sw-css';
  style.textContent = '@layer sw {\n' + css + '\n}';
  document.head.appendChild(style);
}

if (typeof module !== 'undefined' && module.exports) module.exports = { mountScrollWorld };
if (typeof window !== 'undefined') window.mountScrollWorld = mountScrollWorld;
