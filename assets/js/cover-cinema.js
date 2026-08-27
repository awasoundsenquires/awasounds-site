/* cover-cinema.js â€” scroll-world scrub engine config for the Cover Art Store
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
        scroll: 1.7, linger: 0.5,
        accent:  '#8caade',
        eyebrow: '9 covers Â· chrome series',
        title:   'Chrome Universe',
        body:    'Liquid mercury, deep space metallics, mirror surfaces. Cold, cinematic, architectural.',
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
        scroll: 1.7, linger: 0.5,
        accent:  '#9060c8',
        eyebrow: '10 covers Â· void series',
        title:   'Void Series',
        body:    'Obsidian, deep blacks, fractured light. For artists who live in the dark.',
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
        scroll: 1.7, linger: 0.5,
        accent:  '#c8a84b',
        eyebrow: '8 covers Â· gold season',
        title:   'Gold Season',
        body:    'Warm amber, champagne, desert gold. Luxury without pretence.',
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
        scroll: 1.7, linger: 0.5,
        accent:  '#50a0c8',
        eyebrow: '7 covers Â· flux',
        title:   'Flux',
        body:    'Gradients, static, drift. Fluid and mathematical.',
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
        scroll: 1.7, linger: 0.5,
        accent:  '#b07a5c',
        eyebrow: '6 covers Â· earth chrome',
        title:   'Earth Chrome',
        body:    'Industrial steel, volcanic stone, foundry heat. Raw and grounded.',
        tags:    ['Gunmetal', 'Foundry', 'Basalt', 'Mineral', 'Ember', 'Ore'],
        cta: {
          primary:   { label: 'Browse Earth Chrome', href: '#cover-grid' },
          secondary: { label: 'View all covers', href: '#cover-grid' }
        }
      }
    ],

    connectors:       [],
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
