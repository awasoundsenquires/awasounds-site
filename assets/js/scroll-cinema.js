/* AWA SOUNDS — Scroll Cinema
   Doctrine: restraint as power. Weight before speed.
   One thing moves at a time. Chrome headlines emerge — never slide.
   Gold is the interrupt. Stillness is the premium signal.
*/
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ─── INDEX: Studio scrub interlude ──────────────────────────── */
  const idxVideo = document.getElementById('idx-scrub-video');
  if (idxVideo) {
    idxVideo.pause();
    idxVideo.currentTime = 0;

    function initIdxScrub() {
      const t1 = document.getElementById('idx-text-1');
      const t2 = document.getElementById('idx-text-2');
      const t3 = document.getElementById('idx-text-3');

      ScrollTrigger.create({
        trigger: '.idx-scrub-cinema',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate(self) {
          const p = self.progress;

          if (idxVideo.readyState >= 2 && idxVideo.duration) {
            idxVideo.currentTime = p * idxVideo.duration;
          }

          t1.style.opacity = p < 0.18
            ? p / 0.18
            : p < 0.32 ? 1
            : Math.max(0, 1 - (p - 0.32) / 0.14);

          t2.style.opacity = p < 0.38 ? 0
            : p < 0.50 ? (p - 0.38) / 0.12
            : p < 0.64 ? 1
            : Math.max(0, 1 - (p - 0.64) / 0.13);

          t3.style.opacity = p < 0.76 ? 0
            : Math.min(1, (p - 0.76) / 0.12);
        }
      });
    }

    if (idxVideo.readyState >= 1) {
      initIdxScrub();
    } else {
      idxVideo.addEventListener('loadedmetadata', initIdxScrub, { once: true });
    }
  }

  if (reduce) return;

  document.querySelectorAll('.section-title.chrome').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });
  });

  document.querySelectorAll('.section-title:not(.chrome)').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0,
      y: 18,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  if (document.querySelector('.roster-grid')) {
    gsap.from('.roster-grid .artist', {
      scrollTrigger: { trigger: '.roster-grid', start: 'top 78%', once: true },
      opacity: 0,
      y: 40,
      scale: 0.96,
      stagger: 0.12,
      duration: 0.85,
      ease: 'power3.out'
    });
  }

  if (document.querySelector('.releases')) {
    gsap.from('.releases .release', {
      scrollTrigger: { trigger: '.releases', start: 'top 80%', once: true },
      opacity: 0,
      y: 12,
      stagger: 0.09,
      duration: 0.65,
      ease: 'expo.out'
    });
  }

  if (document.querySelector('.wwd')) {
    gsap.from('.wwd .wwd-item', {
      scrollTrigger: { trigger: '.wwd', start: 'top 82%', once: true },
      opacity: 0,
      y: 28,
      stagger: 0.07,
      duration: 0.6,
      ease: 'power3.out'
    });
  }

  if (document.querySelector('.stats')) {
    gsap.from('.stat', {
      scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true },
      opacity: 0,
      y: 16,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power3.out'
    });
  }

  const logoReveal = document.querySelector('.logo-reveal-wrap');
  if (logoReveal) {
    gsap.from(logoReveal, {
      scrollTrigger: { trigger: logoReveal, start: 'top 80%', once: true },
      opacity: 0,
      x: -44,
      scale: 0.94,
      duration: 1.0,
      ease: 'expo.out'
    });
  }

  document.querySelectorAll('.sub-banner, .cta-banner').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      opacity: 0,
      y: 20,
      duration: 0.75,
      delay: i * 0.04,
      ease: 'power3.out'
    });
  });

  if (document.querySelector('.pack-grid')) {
    gsap.from('.pack-card', {
      scrollTrigger: { trigger: '.pack-grid', start: 'top 80%', once: true },
      opacity: 0,
      y: 40,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  const storeGrid = document.querySelector('.store-grid');
  if (storeGrid) {
    ScrollTrigger.create({
      trigger: storeGrid,
      start: 'top 85%',
      once: true,
      onEnter() {
        Array.from(storeGrid.querySelectorAll('.store-card')).forEach((card, i) => {
          gsap.from(card, {
            opacity: 0,
            x: i % 2 === 0 ? -16 : 16,
            y: 14,
            duration: 0.72,
            delay: (i % 4) * 0.09,
            ease: 'expo.out'
          });
        });
      }
    });
  }

  if (document.querySelector('.studio-room')) {
    ScrollTrigger.create({
      trigger: '.studio-room',
      start: 'top 80%',
      once: true,
      onEnter() {
        gsap.from('.studio-room .bstore .beat-card', {
          opacity: 0,
          y: 28,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.1
        });
      }
    });
  }

  const galleryItems = document.querySelectorAll('.gallery-item, .gallery img');
  if (galleryItems.length) {
    galleryItems.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        opacity: 0,
        scale: 1.03,
        duration: 0.8,
        delay: (i % 3) * 0.06,
        ease: 'power2.out'
      });
    });
  }

  document.querySelectorAll('.eyebrow').forEach(el => {
    if (el.closest('[data-reveal]')) return;
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  });

  const footer = document.querySelector('footer');
  if (footer) {
    gsap.from('footer .foot-grid', {
      scrollTrigger: { trigger: footer, start: 'top 94%', once: true },
      opacity: 0,
      y: 18,
      duration: 0.65,
      ease: 'power2.out'
    });
  }

  document.querySelectorAll('.section + .section').forEach(sec => {
    const prev = sec.previousElementSibling;
    if (!prev) return;
    const prevBg = getComputedStyle(prev).backgroundColor;
    const curBg  = getComputedStyle(sec).backgroundColor;
    if (prevBg === curBg && prevBg !== 'rgba(0, 0, 0, 0)') {
      sec.style.setProperty('margin-top', '-1px');
    }
  });

})();
