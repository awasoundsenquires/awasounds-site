/* =============================================================================
   premium-fx.js — site-wide premium animation layer for awasounds.com
   Auto-initialises on DOMContentLoaded. Requires GSAP + ScrollTrigger (already
   loaded on every page). Respects prefers-reduced-motion throughout.
   ============================================================================= */

(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* ── 1. Magnetic cursor ────────────────────────────────────────────────── */
  function initCursor() {
    if (reduce || isMobile) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'pfx-cursor-dot';
    ring.className = 'pfx-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -200, my = -200, rx = -200, ry = -200;
    let hovering = false;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    const syncAccent = () => {
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue('--sw-accent').trim() ||
        getComputedStyle(document.documentElement)
        .getPropertyValue('--gold').trim() || '#d9c38f';
      dot.style.background  = accent;
      ring.style.borderColor = accent;
    };
    syncAccent();
    window.addEventListener('scroll', syncAccent, { passive: true });

    const MAGNETIC = 'a, button, .btn, .cover-card, .beat-card, .artist, .sw-route__dot';

    document.addEventListener('mouseover', e => {
      if (e.target.closest(MAGNETIC)) hovering = true;
    }, { passive: true });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(MAGNETIC)) hovering = false;
    }, { passive: true });

    (function raf() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`;
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px) scale(${hovering ? 1.55 : 1})`;
      requestAnimationFrame(raf);
    })();
  }

  /* ── 2. 3-D card tilt ───────────────────────────────────────────────────── */
  function initCardTilt() {
    if (reduce || isMobile) return;

    const CARDS = document.querySelectorAll('.cover-card, .beat-card, .artist, .service');
    CARDS.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          `perspective(600px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateZ(4px)`;
      }, { passive: true });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      }, { passive: true });
    });
  }

  /* ── 3. Parallax ─────────────────────────────────────────────────────────── */
  function initParallax() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;

    const targets = document.querySelectorAll(
      '.page-hero .hero-visual, .split-media img, .page-hero .hero-bg, ' +
      '.section-bg-img, .idx-scrub-cinema'
    );
    targets.forEach(el => {
      gsap.to(el, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, scrub: 1.2 }
      });
    });
  }

  /* ── 4. Word-split text reveals ─────────────────────────────────────────── */
  function initTextReveals() {
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  const targets = document.querySelectorAll(
    'h1, h2.section-title, .display, .lede, .hero-title, .hero-sub'
  );
  targets.forEach(el => {
    if (el.closest('.sw-root, #cover-world')) return;
    if (el.hasAttribute('data-reveal')) return;
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
}

  /* ── 5. Grid stagger ─────────────────────────────────────────────────────── */
  function initGridStagger() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;

    const grids = document.querySelectorAll(
      '.cover-grid, .roster-grid, .beat-grid, .pack-grid, .store-grid, .services'
    );

    grids.forEach(grid => {
      const items = Array.from(grid.querySelectorAll(
        '.cover-card, .artist, .beat-card, .pack-item, .store-item, .service'
      )).filter(el => !el.hasAttribute('data-reveal'));
      if (!items.length) return;

      gsap.from(items, {
        opacity: 0,
        y: 48,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: { trigger: grid, start: 'top 84%', once: true }
      });
    });
  }

  /* ── 6. Section atmosphere color shifts ─────────────────────────────────── */
  function initAtmosphere() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;

    const PALETTE = [
      { sel: '.hero-section, #hero',          accent: '#c9ced6' },
      { sel: '.label-section, #label',        accent: '#d9c38f' },
      { sel: '.roster-section, #roster',      accent: '#8caade' },
      { sel: '.services-section, #services',  accent: '#c9ced6' },
      { sel: '.releases-section, #releases',  accent: '#a0c88a' },
      { sel: '.store-teaser, #store-teaser',  accent: '#d9c38f' },
    ];

    PALETTE.forEach(({ sel, accent }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter:      () => gsap.to(document.documentElement, { '--gold': accent, duration: 1.2, ease: 'power1.inOut', overwrite: 'auto' }),
        onEnterBack:  () => gsap.to(document.documentElement, { '--gold': accent, duration: 1.2, ease: 'power1.inOut', overwrite: 'auto' }),
        onLeave:      () => gsap.to(document.documentElement, { '--gold': '#d9c38f', duration: 1.2, ease: 'power1.inOut', overwrite: 'auto' }),
        onLeaveBack:  () => gsap.to(document.documentElement, { '--gold': '#d9c38f', duration: 1.2, ease: 'power1.inOut', overwrite: 'auto' }),
      });
    });
  }

  /* ── 7. EQ bar animation — hover trigger (Mind rec #2) ──────────────────── */
  function initEQ() {
    if (reduce) return;
    document.querySelectorAll('.artist').forEach(card => {
      const eq = card.querySelector('.eq');
      if (!eq) return;
      card.addEventListener('mouseenter', () => eq.classList.add('pfx-eq-playing'),    { passive: true });
      card.addEventListener('mouseleave', () => eq.classList.remove('pfx-eq-playing'), { passive: true });
      card.addEventListener('focus',      () => eq.classList.add('pfx-eq-playing'),    { passive: true });
      card.addEventListener('blur',       () => eq.classList.remove('pfx-eq-playing'), { passive: true });
    });
  }

  /* ── 8. Shimmer CTAs ─────────────────────────────────────────────────────── */
  function initShimmerCTAs() {
    if (reduce) return;
    document.querySelectorAll(
      '.btn--primary, .sw-btn--primary, a[href*="pay"], .cta-btn'
    ).forEach(btn => btn.classList.add('pfx-shimmer'));
  }

  /* ── 9. Stat count-up ────────────────────────────────────────────────────── */
  function initCountUp() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;

    const stats = document.querySelectorAll('[data-count]');
    stats.forEach(el => {
      const target = parseFloat(el.dataset.count) || parseInt(el.textContent.replace(/\D/g, ''), 10);
      if (!target) return;
      const suffix = el.textContent.replace(/[\d,.]/g, '').trim();

      gsap.from({ val: 0 }, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate() { el.textContent = Math.round(this.targets()[0].val).toLocaleString() + (suffix || ''); },
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  }

  /* ── 10. Marquee pause on hover ─────────────────────────────────────────── */
  function initMarquee() {
    document.querySelectorAll('.marquee-track, .marquee, [data-marquee]').forEach(track => {
      track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
      }, { passive: true });
      track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
      }, { passive: true });
    });
  }

  /* ── CSS injection ──────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('pfx-css')) return;
    const css = `
    .pfx-cursor-dot, .pfx-cursor-ring {
      position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999;
      will-change: transform;
    }
    .pfx-cursor-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--gold, #d9c38f);
      mix-blend-mode: difference;
    }
    .pfx-cursor-ring {
      width: 36px; height: 36px; border-radius: 50%;
      border: 1.5px solid var(--gold, #d9c38f);
      opacity: 0.55;
      transition: transform 0.18s cubic-bezier(.22,1,.36,1), opacity 0.2s;
    }
    @media (hover: none) { .pfx-cursor-dot, .pfx-cursor-ring { display: none; } }
    .pfx-word { display: inline-block; overflow: hidden; vertical-align: bottom; }
    .pfx-word-inner { display: inline-block; }
    .cover-card, .beat-card, .artist, .service {
      transition: transform 0.22s cubic-bezier(.22,1,.36,1), box-shadow 0.22s ease;
    }
    .cover-card:hover, .beat-card:hover, .artist:hover {
      box-shadow: 0 18px 52px rgba(0,0,0,.55),
                  0 0 32px color-mix(in srgb, var(--gold, #d9c38f) 18%, transparent);
    }
    .eq { display: flex; align-items: flex-end; gap: 2px; height: 18px; }
    .eq i {
      display: inline-block; width: 3px; border-radius: 2px;
      background: var(--gold, #d9c38f);
      animation: pfx-eq-bar 0.9s ease-in-out infinite alternate;
    }
    .eq i:nth-child(1) { height: 6px;  animation-delay: 0s; }
    .eq i:nth-child(2) { height: 12px; animation-delay: 0.12s; }
    .eq i:nth-child(3) { height: 8px;  animation-delay: 0.24s; }
    .eq i:nth-child(4) { height: 14px; animation-delay: 0.06s; }
    .pfx-eq-playing i { animation-play-state: running; }
    .eq i { animation-play-state: paused; }
    @keyframes pfx-eq-bar {
      0%   { transform: scaleY(0.3); opacity: 0.5; }
      100% { transform: scaleY(1.0); opacity: 1; }
    }
    .pfx-shimmer { position: relative; overflow: hidden; }
    .pfx-shimmer::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(105deg,
        transparent 35%, rgba(255,255,255,.18) 50%, transparent 65%);
      background-size: 200% 100%;
      animation: pfx-shimmer-move 2.8s linear infinite;
    }
    @keyframes pfx-shimmer-move {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .stat-value, [data-count] { font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) {
      .pfx-shimmer::after { animation: none; }
      .eq i { animation: none; }
    }
    `;
    const style = document.createElement('style');
    style.id = 'pfx-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ── Boot ──────────────────────────────────────────────────────────────── */
  function boot() {
    injectCSS();
    initCursor();
    initCardTilt();
    initParallax();
    initTextReveals();
    initGridStagger();
    initAtmosphere();
    initEQ();
    initShimmerCTAs();
    initCountUp();
    initMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
