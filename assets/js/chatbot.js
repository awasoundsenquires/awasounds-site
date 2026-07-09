/* AWA SOUNDS — Concierge
   A lightweight on-brand helper that guides visitors to the right place.
   Rule-based (no external calls). Injects its own launcher + panel site-wide. */
(function () {
  "use strict";

  /* Intent map: keywords → reply + optional link. First match wins. */
  const INTENTS = [
    { k: ["beat", "instrumental", "type beat", "buy a beat", "beats"], t: "We produce beats in-house — lease or go exclusive, open to everyone. MP3 £30, WAV £45, Trackout £145.", href: "beat-store.html", cta: "Open the Beat Store" },
    { k: ["cover", "artwork", "album art", "single art", "art"], t: "Our Cover Art store has release-ready artwork, each with two animated versions. You can save your favourites too.", href: "cover-store.html", cta: "Browse Cover Art" },
    { k: ["studio", "record", "session", "book", "booking", "mix", "master"], t: "We have pro recording, mixing and mastering rooms. Sessions are by appointment in the UK.", href: "studio.html", cta: "See the Studio" },
    { k: ["demo", "submit", "sign", "signed", "a&r", "get signed", "unsigned"], t: "Send us your best record through the demo form — our A&R team reads everything and replies to what moves us.", href: "contact.html", cta: "Submit a Demo" },
    { k: ["distribut", "release my", "put my music", "spotify", "apple", "streaming"], t: "We distribute to 150+ platforms and you keep 90%+ of your revenue, with your masters staying yours. Reach out and we'll set you up.", href: "contact.html", cta: "Talk Distribution" },
    { k: ["price", "cost", "how much", "fee", "pricing", "license", "licence"], t: "Beat licenses: MP3 £30 (30k streams), WAV £45 (150k), Trackout £145 (550k), or Exclusive by enquiry. Insider members save 15%.", href: "beat-store.html", cta: "See Pricing" },
    { k: ["member", "membership", "insider", "subscribe", "discount"], t: "The £4.99/mo Insider membership saves you 15% on every beat, cover and service, plus playlists and saved items.", href: "account.html", cta: "Become an Insider" },
    { k: ["account", "login", "log in", "sign in", "playlist", "lyrics", "save", "profile"], t: "Create a free account to save beats and covers, build playlists and write lyrics to any beat.", href: "account.html", cta: "Go to Account" },
    { k: ["roster", "artists", "who is signed"], t: "Meet the artists we develop across R&B, Afrobeats, Hip-Hop, Pop and beyond.", href: "roster.html", cta: "View the Roster" },
    { k: ["release", "songs", "music", "latest", "new"], t: "Hear the latest releases from the label.", href: "releases.html", cta: "Latest Releases" },
    { k: ["about", "who are you", "label", "story"], t: "Awa Sounds is an independent UK record label — a label and an open distribution platform in one.", href: "about.html", cta: "Our Story" },
    { k: ["gallery", "photos", "visuals"], t: "Take a look at the visual world of Awa Sounds.", href: "gallery.html", cta: "Open the Gallery" },
    { k: ["contact", "email", "reach", "talk", "help", "support", "phone"], t: "The fastest way to reach us is the contact form, or email awasound.music@gmail.com.", href: "contact.html", cta: "Contact Us" }
  ];

  const CHIPS = [
    { label: "License a beat", q: "I want to license a beat" },
    { label: "Cover art", q: "I'm looking for cover art" },
    { label: "Book the studio", q: "I want to book the studio" },
    { label: "Submit a demo", q: "How do I submit a demo?" },
    { label: "Distribution", q: "I want to distribute my music" }
  ];

  const FALLBACK = { t: "I can point you to beats, cover art, the studio, distribution, submitting a demo, or your account. What are you after?", href: "contact.html", cta: "Contact the team" };

  /* ---------- Build UI ---------- */
  const root = document.createElement("div");
  root.className = "cbot";
  root.innerHTML = `
    <button class="cbot-launch" aria-label="Open the Awa Sounds concierge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg>
    </button>
    <div class="cbot-panel" role="dialog" aria-label="Awa Sounds concierge">
      <div class="cbot-head">
        <div><b>Awa Sounds</b><small>Concierge</small></div>
        <button class="cbot-close" aria-label="Close">&times;</button>
      </div>
      <div class="cbot-log"></div>
      <div class="cbot-chips"></div>
      <form class="cbot-form">
        <input type="text" placeholder="Ask me anything…" aria-label="Message" autocomplete="off">
        <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
      </form>
    </div>`;
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(root));

  const launch = root.querySelector(".cbot-launch");
  const panel = root.querySelector(".cbot-panel");
  const log = root.querySelector(".cbot-log");
  const chipsWrap = root.querySelector(".cbot-chips");
  const form = root.querySelector(".cbot-form");
  const input = form.querySelector("input");
  let greeted = false;

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function add(role, html) {
    const m = document.createElement("div");
    m.className = "cbot-msg " + role;
    m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }

  function botReply(intent) {
    let html = esc(intent.t);
    if (intent.href) html += `<a class="cbot-cta" href="${intent.href}">${esc(intent.cta)} →</a>`;
    setTimeout(() => add("bot", html), 260);
  }

  function match(text) {
    const q = text.toLowerCase();
    for (const it of INTENTS) if (it.k.some(k => q.includes(k))) return it;
    return FALLBACK;
  }

  function send(text) {
    if (!text.trim()) return;
    add("me", esc(text));
    botReply(match(text));
  }

  function renderChips() {
    chipsWrap.innerHTML = "";
    CHIPS.forEach(c => {
      const b = document.createElement("button");
      b.className = "cbot-chip"; b.textContent = c.label;
      b.addEventListener("click", () => send(c.q));
      chipsWrap.appendChild(b);
    });
  }

  function open() {
    root.classList.add("open");
    if (!greeted) {
      greeted = true;
      add("bot", "Welcome to Awa Sounds. I can help you find beats, cover art, the studio, or get your demo to our A&amp;R team. What are you after?");
      renderChips();
    }
    setTimeout(() => input.focus(), 200);
  }
  function close() { root.classList.remove("open"); }

  launch.addEventListener("click", () => root.classList.contains("open") ? close() : open());
  root.querySelector(".cbot-close").addEventListener("click", close);
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); input.value = ""; });
})();
