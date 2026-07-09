/* AWA SOUNDS — Beat Store (data-driven, BeatStars-style)
   Renders window.AWA.beats into #beat-list. Play preview, like + save-to-playlist
   (registered users only, via AWAAuth), and a license/buy picker per beat that
   routes to a GoDaddy Pay Link — or falls back to an email enquiry. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const list = document.getElementById("beat-list");
  if (!list) return;

  const money = (n) => "£" + Number(n).toFixed(0);
  const memberPrice = (n) => Math.round(n * (1 - (CFG.memberDiscount || 0)));
  const isMember = () => window.AWAAuth && AWAAuth.isMember();
  let likeSet = new Set();

  /* ---------- Render beat cards ---------- */
  function card(b) {
    const el = document.createElement("article");
    el.className = "bcard";
    el.dataset.id = b.id;
    if (b.preview) el.dataset.preview = b.preview;
    el.innerHTML = `
      <div class="bcard-art">
        <img src="${b.cover}" alt="${esc(b.title)} cover art" loading="lazy"
             onerror="this.style.opacity=0;this.parentNode.classList.add('noimg')">
        <button class="bcard-play" aria-label="Play preview">
          <svg class="i-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="i-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
        </button>
      </div>
      <div class="bcard-body">
        <h3 class="bcard-title">${esc(b.title)}</h3>
        <div class="bcard-sub">Prod. ${esc(b.producer)} · ${b.bpm} BPM · ${esc(b.key)}</div>
        <div class="bcard-tags">${b.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="bcard-actions">
          <span class="bcard-from">from <b>${money(CFG.licenses.mp3.price)}</b></span>
          <div class="bcard-icons">
            <button class="ib ib-like" aria-label="Save beat" title="Save"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg></button>
            <button class="ib ib-save" aria-label="Add to playlist" title="Add to playlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h11M4 12h11M4 17h7M17 12v8M13 16h8"/></svg></button>
          </div>
          <button class="btn btn-primary bcard-buy">License</button>
        </div>
      </div>`;
    return el;
  }

  let BEATS = [];
  (async function initBeats() {
    BEATS = (window.AWACMS ? await AWACMS.beats() : (CFG.beats || [])) || [];
    list.innerHTML = "";
    BEATS.forEach(b => list.appendChild(card(b)));
    reflectLikes();
  })();

  /* ---------- Play preview (single audio element) ---------- */
  const audio = new Audio();
  let playingEl = null;
  const stopVisual = () => { if (playingEl) { playingEl.classList.remove("playing"); playingEl = null; } };
  audio.addEventListener("ended", stopVisual);

  list.addEventListener("click", (e) => {
    const play = e.target.closest(".bcard-play");
    if (play) {
      const el = play.closest(".bcard");
      const src = el.dataset.preview;
      if (playingEl === el) { audio.pause(); stopVisual(); return; }
      stopVisual();
      if (!src) { flash(el, "Preview coming soon"); return; }
      audio.src = src; audio.play().catch(() => {});
      el.classList.add("playing"); playingEl = el;
      return;
    }
    const like = e.target.closest(".ib-like");
    if (like) { toggleLike(like.closest(".bcard")); return; }
    const save = e.target.closest(".ib-save");
    if (save) { addToPlaylist(save.closest(".bcard")); return; }
    const buy = e.target.closest(".bcard-buy");
    if (buy) { openLicense(buy.closest(".bcard").dataset.id); return; }
  });

  /* ---------- Likes (registered only) ---------- */
  function toggleLike(el) {
    AWAAuth.requireAuth(async () => {
      const id = el.dataset.id, btn = el.querySelector(".ib-like");
      const client = AWAAuth.client(), uid = AWAAuth.user().id;
      const on = btn.classList.toggle("on");
      if (on) { likeSet.add(id); await client.from("likes").upsert({ user_id: uid, beat_id: id }); }
      else { likeSet.delete(id); await client.from("likes").delete().match({ user_id: uid, beat_id: id }); }
    }, "Sign in to save beats to your account.");
  }

  async function addToPlaylist(el) {
    AWAAuth.requireAuth(async () => {
      const id = el.dataset.id, client = AWAAuth.client(), uid = AWAAuth.user().id;
      const { data: pls } = await client.from("playlists").select("id,name").eq("user_id", uid).order("created_at");
      let target;
      if (!pls || !pls.length) {
        const name = prompt("Name your first playlist:", "My Playlist");
        if (name === null) return;
        const { data } = await client.from("playlists").insert({ user_id: uid, name: name || "My Playlist" }).select().single();
        target = data;
      } else {
        const choice = prompt(
          "Add to which playlist? Type the number, or a new name:\n" +
          pls.map((p, i) => `${i + 1}. ${p.name}`).join("\n"), "1");
        if (choice === null) return;
        const n = parseInt(choice, 10);
        if (n >= 1 && n <= pls.length) target = pls[n - 1];
        else { const { data } = await client.from("playlists").insert({ user_id: uid, name: choice }).select().single(); target = data; }
      }
      if (!target) return;
      await client.from("playlist_items").upsert({ playlist_id: target.id, beat_id: id });
      flash(el, "Added to " + target.name);
    }, "Sign in to build playlists.");
  }

  /* Reflect existing likes when auth resolves or beats (re)render. */
  async function reflectLikes() {
    document.querySelectorAll(".ib-like.on").forEach(b => b.classList.remove("on"));
    const sess = window.AWAAuth && AWAAuth.user();
    if (!sess) { likeSet = new Set(); return; }
    const { data } = await AWAAuth.client().from("likes").select("beat_id").eq("user_id", AWAAuth.user().id);
    likeSet = new Set();
    (data || []).forEach(r => {
      likeSet.add(r.beat_id);
      const el = list.querySelector(`.bcard[data-id="${r.beat_id}"] .ib-like`);
      if (el) el.classList.add("on");
    });
    repriceLicense();
  }
  if (window.AWAAuth) AWAAuth.onChange(() => reflectLikes());

  /* ---------- License / buy picker ---------- */
  let lm = null, currentBeat = null;
  function buildLicenseModal() {
    lm = document.createElement("div");
    lm.className = "lic-modal";
    lm.innerHTML = `
      <div class="lic-card">
        <button class="lic-close" aria-label="Close">&times;</button>
        <div class="lic-head"><span class="eyebrow">License</span><h3 class="lic-title"></h3></div>
        <div class="lic-note"></div>
        <div class="lic-tiers"></div>
        <p class="lic-fine">Every license includes a signed copy of the contract, delivered on purchase. Prices in GBP. <a href="account.html">Insider members</a> save ${Math.round((CFG.memberDiscount || 0) * 100)}% on every tier.</p>
      </div>`;
    document.body.appendChild(lm);
    lm.addEventListener("click", (e) => { if (e.target === lm || e.target.closest(".lic-close")) closeLicense(); });
  }

  function tierRow(beat, key) {
    const L = CFG.licenses[key];
    const link = (beat.pay && beat.pay[key]) || "";
    const member = isMember();
    let priceHtml;
    if (L.price == null) priceHtml = `<span class="lic-price">Enquire</span>`;
    else if (member) priceHtml = `<span class="lic-price"><s>${money(L.price)}</s> ${money(memberPrice(L.price))}</span>`;
    else priceHtml = `<span class="lic-price">${money(L.price)}</span>`;
    const btnLabel = L.price == null ? "Enquire" : "Buy";
    return `
      <div class="lic-tier">
        <div class="lic-tier-main">
          <b>${L.name}</b>
          <small>${L.streams === "Unlimited" ? "Unlimited streams · you own it" : "Up to " + L.streams + " streams"}</small>
          <a class="lic-view" href="${L.doc}" target="_blank" rel="noopener">View contract</a>
        </div>
        <div class="lic-tier-buy">
          ${priceHtml}
          <button class="btn btn-primary lic-go" data-key="${key}" data-link="${link}">${btnLabel}</button>
        </div>
      </div>`;
  }

  function openLicense(beatId) {
    currentBeat = BEATS.find(b => b.id === beatId);
    if (!currentBeat) return;
    if (!lm) buildLicenseModal();
    lm.querySelector(".lic-title").textContent = currentBeat.title;
    lm.querySelector(".lic-note").innerHTML = isMember()
      ? `<span class="lic-badge">Insider price applied</span>`
      : `<span class="lic-badge ghost"><a href="account.html">Become an Insider</a> for ${Math.round((CFG.memberDiscount || 0) * 100)}% off</span>`;
    lm.querySelector(".lic-tiers").innerHTML =
      ["mp3", "wav", "trackout", "exclusive"].map(k => tierRow(currentBeat, k)).join("");
    lm.querySelectorAll(".lic-go").forEach(btn =>
      btn.addEventListener("click", () => checkout(btn.dataset.key, btn.dataset.link)));
    lm.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function repriceLicense() { if (lm && lm.classList.contains("open") && currentBeat) openLicense(currentBeat.id); }
  function closeLicense() { if (lm) { lm.classList.remove("open"); document.body.style.overflow = ""; } }

  function checkout(key, link) {
    const L = CFG.licenses[key];
    if (link) { window.open(link, "_blank", "noopener"); return; }
    // Fallback: no Pay Link configured yet → email enquiry.
    const to = CFG.enquiryEmail || "awasound.music@gmail.com";
    const subj = encodeURIComponent(`Beat enquiry — ${currentBeat.title} (${L.name})`);
    const body = encodeURIComponent(
      `Hi Awa Sounds,\n\nI'd like the ${L.name} license for "${currentBeat.title}" (Prod. ${currentBeat.producer}).\n\nName:\nArtist name:\n\nThanks.`);
    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
  }

  /* ---------- helpers ---------- */
  function flash(el, msg) {
    const t = document.createElement("div"); t.className = "bcard-flash"; t.textContent = msg;
    el.appendChild(t); setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 1600);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
})();
