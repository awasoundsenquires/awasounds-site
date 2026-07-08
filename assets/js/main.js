/* AWA SOUNDS — interactions (no dependencies) */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* Preloader */
  window.addEventListener("load", () => {
    const p = $(".preload");
    if (p) setTimeout(() => p.classList.add("done"), 350);
  });

  /* Nav scroll state */
  const nav = $(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const burger = $(".burger"), links = $(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      links.classList.toggle("open");
      burger.classList.toggle("active");
    });
    $$(".nav-links a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }

  /* Scroll direction — drives the reversed reveal on the way up */
  let lastY = window.scrollY;
  document.body.classList.add("dir-down");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 4) {
      const up = y < lastY;
      document.body.classList.toggle("dir-up", up);
      document.body.classList.toggle("dir-down", !up);
      lastY = y;
    }
  }, { passive: true });

  /* Reveal on scroll — bidirectional: replays entering, reverses leaving (locked loop) */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.target.classList.toggle("in", e.isIntersecting));
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach(el => io.observe(el));

  /* Count-up stats */
  const countEls = $$("[data-count]");
  if (countEls.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target, target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "";
        if (reduce) { el.textContent = target + suffix; return; }
        const dur = 1600, start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    countEls.forEach(el => cio.observe(el));
  }

  /* FAQ accordion */
  $$(".faq-item").forEach(item => {
    const q = $(".faq-q", item), a = $(".faq-a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq-item.open").forEach(o => { o.classList.remove("open"); $(".faq-a", o).style.maxHeight = null; });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* Magnetic buttons */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    $$(".btn").forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28 - 2}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });

    /* Service spotlight follow */
    $$(".service").forEach(s => {
      s.addEventListener("mousemove", (e) => {
        const r = s.getBoundingClientRect();
        s.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        s.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });

    /* Cursor glow */
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    let gx = 0, gy = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => { gx = e.clientX; gy = e.clientY; });
    (function loop() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.left = cx + "px"; glow.style.top = cy + "px";
      requestAnimationFrame(loop);
    })();
  }

  /* Hero parallax */
  if (!reduce) {
    const media = $(".hero-media");
    if (media) window.addEventListener("scroll", () => {
      media.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    }, { passive: true });
  }

  /* Audio toggle — controls hero video sound */
  const toggle = $(".audio-toggle"), vid = $(".hero-media video");
  if (toggle && vid) {
    toggle.classList.add("muted");
    toggle.addEventListener("click", () => {
      vid.muted = !vid.muted;
      toggle.classList.toggle("muted", vid.muted);
      if (!vid.muted) vid.play().catch(() => {});
    });
  }

  /* Demo play buttons — visual feedback only (placeholder for real audio) */
  $$("[data-play]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      el.classList.toggle("playing");
    });
  });

  /* 3D tilt + glow-follow on cards */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    $$(".artist, .release, .store-card").forEach(card => {
      const glow = document.createElement("div");
      glow.className = "tilt-glow";
      card.appendChild(glow);
      const MAX = 7;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * MAX * 2, ry = (px - 0.5) * MAX * 2;
        card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        glow.style.setProperty("--gx", px * 100 + "%");
        glow.style.setProperty("--gy", py * 100 + "%");
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* Store card: cycle 2 video previews on hover */
  $$(".store-card.has-motion").forEach(card => {
    const vid = $(".media-video", card);
    const dots = $$(".previews span", card);
    const srcs = (card.dataset.videos || "").split(",").filter(Boolean);
    let idx = 0, timer = null;
    const show = (i) => {
      idx = i;
      if (vid && srcs[i]) { vid.src = srcs[i]; vid.play().catch(() => {}); }
      dots.forEach((d, di) => d.classList.toggle("on", di === i));
    };
    card.addEventListener("mouseenter", () => {
      if (!srcs.length) return;
      show(0);
      timer = setInterval(() => show((idx + 1) % srcs.length), 3200);
    });
    card.addEventListener("mouseleave", () => {
      clearInterval(timer);
      if (vid) vid.pause();
      dots.forEach((d, di) => d.classList.toggle("on", di === 0));
    });
  });

  /* Artist card: play living-portrait video on hover */
  $$(".artist.has-motion").forEach(card => {
    const vid = $(".media-video", card);
    if (!vid) return;
    card.addEventListener("mouseenter", () => vid.play().catch(() => {}));
    card.addEventListener("mouseleave", () => { vid.pause(); });
  });

  /* Year in footer */
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
})();
