/* about-cinema.js — scroll-world config for the About page
   Mounts on #about-world. Requires cinematic-engine.js loaded first. */
(function () {
  if (typeof window.mountScrollWorld !== 'function') return;
  var el = document.getElementById('about-world');
  if (!el) return;

  window.mountScrollWorld(el, {
    brand:      { name: 'Awa Sounds', href: 'index.html' },
    diveScroll: 1.6,
    hint:       'scroll to explore',
    nav:        false,
    atmosphere: true,

    sections: [
      {
        id:          'awa-about',
        label:       'About Awa Sounds',
        still:       'assets/img/gen-hero-chrome.jpg',
        stillMobile: 'assets/img/gen-hero-chrome.jpg',
        clip:        'assets/img/about-scroll.mp4',
        clipMobile:  'assets/img/about-scroll.mp4',
        scroll: 1.8, linger: 0.4,
        accent:  '#c9ced6',
        eyebrow: 'Independent Record Label · United Kingdom',
        title:   'The Story\nof Awa Sounds.',
        cta: {
          primary:   { label: 'Submit Your Demo', href: 'contact.html' },
          secondary: { label: 'Meet the Roster',  href: 'roster.html' }
        }
      }
    ],

    connectors:       [],
    connectorsMobile: []
  });
})();
