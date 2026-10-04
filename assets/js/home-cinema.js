/* home-cinema.js — scroll-world config for the Awa Sounds home page
   Mounts on #home-world. Requires cinematic-engine.js loaded first.
   3-act arc: Identity → Conflict → Invitation */
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

      /* ACT 1 — IDENTITY */
      {
        id:          'awa-identity',
        label:       'Awa Sounds',
        still:       'assets/img/gen-hero-chrome.jpg',
        stillMobile: 'assets/img/gen-hero-chrome.jpg',
        clip:        'assets/img/hero-video.mp4',
        clipMobile:  'assets/img/hero-video.mp4',
        scroll: 1.8, linger: 0.4,
        accent:  '#c9ced6',
        eyebrow: 'Independent Record Label \u00B7 United Kingdom',
        title:   'Independent.\nCinematic.\nPermanent.',
        tags:    ['Beats', 'Cover Art', 'Releases', 'Insider'],
        cta: {
          primary:   { label: 'Submit Your Demo',  href: 'contact.html' },
          secondary: { label: 'Explore the Label', href: 'roster.html' }
        }
      },

      /* ACT 2 — CONFLICT */
      {
        id:          'awa-conflict',
        label:       'The Stance',
        still:       'assets/img/gen-studio-console.png',
        stillMobile: 'assets/img/gen-studio-console.png',
        clip:        'assets/img/portrait-sable.mp4',
        clipMobile:  'assets/img/portrait-sable.mp4',
        scroll: 1.6, linger: 0.5,
        accent:  '#d9c38f',
        eyebrow: 'The A&R Problem',
        title:   'The Industry\nRents Artists.\nWe Don\u2019t.',
        body:    'Real studio time. Real strategy. Real A&R.',
        cta: {
          primary:   { label: 'See Who We Develop', href: 'roster.html' }
        }
      },

      /* ACT 3 — INVITATION */
      {
        id:          'awa-invitation',
        label:       'Submit',
        still:       'assets/img/gen-vault-door.jpg',
        stillMobile: 'assets/img/gen-vault-door.jpg',
        clip:        'assets/img/studio-logo-2.mp4',
        clipMobile:  'assets/img/studio-logo-2.mp4',
        scroll: 1.4, linger: 0.6,
        accent:  '#a08c6e',
        eyebrow: 'Are You Next',
        title:   'Submit Your\nDemo.',
        body:    'One shot. No middlemen. We listen to everything.',
        cta: {
          primary:   { label: 'Submit Now',      href: 'contact.html' },
          secondary: { label: 'See Who Made It', href: 'roster.html' }
        }
      }

    ],

    connectors:       [],
    connectorsMobile: []
  });
})();
