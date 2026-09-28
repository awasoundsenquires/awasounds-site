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
        clip:        'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_085800_eafeb4a9-37fe-4855-908e-a2dd183c4910.mp4',
        clipMobile:  'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_085800_eafeb4a9-37fe-4855-908e-a2dd183c4910.mp4',
        scroll: 1.8, linger: 0.4,
        accent:  '#d9c38f',
        eyebrow: 'Awa Sounds Production',
        title:   "This isn't\na catalogue.",
        body:    "It's a sound waiting for the right artist. Every beat in this store was made in-house — no loops, no stock, no licensing to six other artists. Find yours.",
        tags:    ['MP3 Lease', 'WAV Lease', 'Trackout', 'Exclusive'],
        cta: {
          primary:   { label: 'Browse Beats', href: '#beat-list' },
          secondary: { label: 'Sell Your Beats', href: 'contact.html' }
        }
      }
    ],

    connectors:       [],
    connectorsMobile: []
  });
})();
