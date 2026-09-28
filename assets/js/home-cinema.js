/* home-cinema.js — scroll-world config for the Awa Sounds home page
   Mounts on #home-world. Requires cinematic-engine.js loaded first. */
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
        id:          'awa-world',
        label:       'Awa Sounds',
        still:       'assets/img/gen-hero-chrome.jpg',
        stillMobile: 'assets/img/gen-hero-chrome.jpg',
        clip:        'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_085801_9fd78305-18ae-403a-9049-91c4a9242d30.mp4',
        clipMobile:  'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_085801_9fd78305-18ae-403a-9049-91c4a9242d30.mp4',
        scroll: 1.8, linger: 0.4,
        accent:  '#c9ced6',
        eyebrow: 'Independent Record Label · United Kingdom',
        title:   'Independent.\nCinematic.\nPermanent.',
        body:    'The industry stopped developing artists and started renting them distribution. We do it the old way and the new way at once — real A&R, real studio time, real strategy, then release it everywhere that matters.',
        tags:    ['Artist Development', 'Distribution', 'Beat Store', 'Cover Art'],
        cta: {
          primary:   { label: 'Submit Your Demo', href: 'contact.html' },
          secondary: { label: 'Explore the Label', href: 'roster.html' }
        }
      }
    ],

    connectors:       [],
    connectorsMobile: []
  });
})();
