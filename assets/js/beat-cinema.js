/* beat-cinema.js — scroll-world config for the Beat Store page
   Mounts on #beat-world. Requires cinematic-engine.js loaded first. */
(function () {
  if (typeof window.mountScrollWorld !== 'function') return;
  var el = document.getElementById('beat-world');
  if (!el) return;

  window.mountScrollWorld(el, {
    brand:      { name: 'Awa Sounds', href: 'index.html' },
    diveScroll: 1.6,
    hint:       'scroll to enter the studio',
    nav:        false,
    atmosphere: true,

    sections: [
      {
        id:          'beat-studio',
        label:       'Beat Store',
        still:       'assets/img/gen-hero-chrome.jpg',
        stillMobile: 'assets/img/gen-hero-chrome.jpg',
        clip:        'assets/img/beatstore-scroll.mp4',
        clipMobile:  'assets/img/beatstore-scroll.mp4',
        scroll: 1.8, linger: 0.4,
        accent:  '#d9c38f',
        eyebrow: 'Awa Sounds Production',
        title:   "This isn't\na catalogue.",
        body:    "It's a sound waiting for the right artist. Every beat in this store was made in-house — no loops, no stock, no licensing to six other artists. Find yours.",
        tags:    ['MP3 Lease', 'WAV Lease', 'Trackout', 'Exclusive'],
        cta: {
                primary:   { label: 'Get a Custom Beat', href: 'contact.html?reason=custom-beat#demo-form' },
          secondary: { label: 'Sell Your Beats', href: 'contact.html' }
        }
      }
    ],

    connectors:       [],
    connectorsMobile: []
  });
})();
