/* home-cinema.js — scroll-world config for the Awa Sounds home page
   Mounts on #home-world. Requires cinematic-engine.js loaded first.
   Single section: atmospheric void intro — label content follows immediately */
(function () {
  if (typeof window.mountScrollWorld !== 'function') return;
  var el = document.getElementById('home-world');
  if (!el) return;

  window.mountScrollWorld(el, {
    brand:      { name: 'Awa Sounds', href: 'index.html' },
    diveScroll: 1.6,
    hint:       'scroll to discover',
    nav:        false,
    atmosphere: true,

    sections: [
      {
        id:          'awa-identity',
        label:       'Awa Sounds',
        still:       'assets/img/gen-hero-chrome.jpg',
        stillMobile: 'assets/img/gen-hero-chrome.jpg',
        clip:        'assets/img/studio-ambiance.mp4',
        clipMobile:  'assets/img/studio-ambiance.mp4',
        scroll: 1.8, linger: 0.4, reverse: true,
        accent:  '#c9ced6',
        eyebrow: 'Independent Record Label \u00B7 United Kingdom',
        title:   'Independent.\nCinematic.\nPermanent.',
        cta: {
          primary:   { label: 'Submit Your Demo',  href: 'contact.html' },
          secondary: { label: 'Explore the Label', href: 'roster.html' }
        }
      }
    ],

    connectors:       [],
    connectorsMobile: []
  });
})();
