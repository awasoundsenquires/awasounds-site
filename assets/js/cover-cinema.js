            /* cover-cinema.js — scroll-world scrub engine config for the Cover Art Store
   Drops the scrub-engine's mountScrollWorld into #cover-world.
   Still images are used now; add clip/clipMobile URLs when Higgsfield dive
   videos are generated for each series. */
(function () {
  if (typeof window.mountScrollWorld !== 'function') return;
  var el = document.getElementById('cover-world');
  if (!el) return;

  window.mountScrollWorld(el, {
    brand:      { name: 'Awa Sounds', href: 'index.html' },
    diveScroll: 1.4,
    connScroll: 0.8,
    hint:       'scroll to explore the collection',
    nav:        true,
    atmosphere: true,

    sections: [
      {
        id:          'chrome-universe',
        label:       'Chrome Universe',
        still:       'assets/img/gen-cover-blue.png',
        stillMobile: 'assets/img/gen-cover-blue.png',
        clip:        'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001032_a10e605b-58b5-4fdc-a6fa-c6a161f36e38.mp4',
        scroll: 1.7, linger: 0.5,
        accent:  '#8caade',
        eyebrow: '9 covers · chrome series',
        title:   'Chrome Universe',
        body:    'Liquid mercury, deep space metallics, mirror surfaces. Cold, cinematic, architectural. Not templated. Not licensed to six other artists. Yours.',
        tags:    ['Mercury', 'Arc', 'Prism', 'Vapor', 'Glacier', 'Void Arc', 'Carbon', 'Steel Dreams', 'Chrome Nova'],
        cta: {
          primary:   { label: 'Browse Chrome Universe', href: '#cover-grid' },
          secondary: { label: 'View all covers', href: '#cover-grid' }
        }
      },
      {
        id:          'void',
        label:       'Void Series',
        still:       'assets/img/gen-cover-violet.png',
        stillMobile: 'assets/img/gen-cover-violet.png',
        clip:        'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001051_81efd418-0299-4741-b429-64ad9ba51181.mp4',
        scroll: 1.7, linger: 0.5,
        accent:  '#9060c8',
        eyebrow: '10 covers · void series',
        title:   'Void Series',
        body:    'Obsidian, deep blacks, fractured light. For artists who live in the dark. Built from nothing, owned by one.',
        tags:    ['Obsidian', 'Eclipse', 'Phantom', 'Dark Matter', 'Abyss', 'Vortex', 'Shadow', 'Black Sun', 'Void Pulse', 'Umbra'],
        cta: {
          primary: { label: 'Browse Void Series', href: '#cover-grid' }
        }
      },
      {
        id:          'gold-season',
        label:       'Gold Season',
        still:       'assets/img/gen-cover-gold.png',
        stillMobile: 'assets/img/gen-cover-gold.png',
        clip:        'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001032_11230ea2-c522-4938-a36f-313ed4def93e.mp4',
        scroll: 1.7, linger: 0.5,
        accent:  '#c8a84b',
        eyebrow: '8 covers · gold season',
        title:   'Gold Season',
        body:    'Warm amber, champagne, desert gold. Luxury without pretence. Made to look like it cost ten times more.',
        tags:    ['Champagne', 'Amber', 'Harmattan', 'Solstice', 'Saffron', 'Velvet', 'Gilded', 'Sunrise'],
        cta: {
          primary: { label: 'Browse Gold Season', href: '#cover-grid' }
        }
      },
      {
        id:          'flux',
        label:       'Flux',
        still:       'assets/img/gen-cover-smoke.png',
        stillMobile: 'assets/img/gen-cover-smoke.png',
        clip:        'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001032_1ca95fd8-bf63-47a6-b1c0-94f4d6f61a81.mp4',
        scroll: 1.7, linger: 0.5,
        accent:  '#50a0c8',
        eyebrow: '7 covers · flux',
        title:   'Flux',
        body:    'Gradients, static, drift. Fluid and mathematical. Art that moves because sound does.',
        tags:    ['Static', 'Gradient', 'Current', 'Pulse', 'Signal', 'Kinetic', 'Flow'],
        cta: {
          primary: { label: 'Browse Flux', href: '#cover-grid' }
        }
      },
      {
        id:          'earth-chrome',
        label:       'Earth Chrome',
        still:       'assets/img/gen-cover-foundry.png',
        stillMobile: 'assets/img/gen-cover-foundry.png',
        clip:        'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001032_8a313b77-8b3b-450e-8560-e05bf852b6c9.mp4',
        scroll: 1.7, linger: 0.5,
        accent:  '#b07a5c',
        eyebrow: '6 covers · earth chrome',
        title:   'Earth Chrome',
        body:    'Industrial steel, volcanic stone, foundry heat. Raw and grounded. No filters, no stock. Just weight.',
        tags:    ['Gunmetal', 'Foundry', 'Basalt', 'Mineral', 'Ember', 'Ore'],
        cta: {
          primary:   { label: 'Browse Earth Chrome', href: '#cover-grid' },
          secondary: { label: 'View all covers', href: '#cover-grid' }
        }
      }
    ],

    connectors: [
      'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001032_ece7eb5d-d9c9-4a0a-aed7-69c39d334060.mp4',
      'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001032_c03891fd-ff8a-42cf-83cb-950cee3f98ae.mp4',
      'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001033_f65525bb-fb11-41a4-a293-22f84c7d589a.mp4',
      'https://d8j0ntlcm91z4.cloudfront.net/user_3CK8SB2bS5zvnxJ8dKPvt4hcvS3/hf_20260928_001032_d19bc08f-6c24-432b-b108-a1a7bc3f5979.mp4'
    ],
    connectorsMobile: []
  });

  /* â”€â”€ Series filter bridge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     The engine renders one .sw-copy per section, in order.
     Map section index â†’ series filter button and fire it on CTA click. */
  var SERIES_ORDER = ['chrome-universe', 'void', 'gold-season', 'flux', 'earth-chrome'];
  el.addEventListener('click', function (e) {
    var a = e.target.closest('.sw-btn[href="#cover-grid"]');
    if (!a) return;
    var copy = a.closest('.sw-copy');
    if (!copy) return;
    var all = Array.from(el.querySelectorAll('.sw-copy'));
    var idx = all.indexOf(copy);
    if (idx < 0 || idx >= SERIES_ORDER.length) return;
    var filterBtn = document.querySelector('#seriesFilter [data-series="' + SERIES_ORDER[idx] + '"]');
    if (filterBtn) filterBtn.click();
  });
})();
