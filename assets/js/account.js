/* AWA SOUNDS — account page (client-side Supabase)
   Personalized overview, profile, lyrics, saved beats+covers, playlists, membership.
   Requires config.js + auth.js (AWAAuth) loaded first. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const $ = (s) => document.querySelector(s);
  let BEATS = CFG.beats || [];
  const beatById = (id) => BEATS.find(b => b.id === id);
  const coverById = (id) => (CFG.covers || []).find(c => c.id === id);
  const money = (n) => "£" + Number(n).toFixed(0);

  const guest = $("#acc-guest"), loading = $("#acc-loading"), app = $("#acc-app");
  if (!app) return;

  if (!window.AWAAuth || !AWAAuth.enabled) {
    loading.hidden = true; guest.hidden = false;
    $("#acc-signin").addEventListener("click", () => alert("Accounts are launching soon."));
    return;
  }

  $("#acc-signin").addEventListener("click", () => AWAAuth.openModal("Sign in to your Awa Sounds account."));
  $("#acc-signout").addEventListener("click", async () => { await AWAAuth.signOut(); });

  document.querySelectorAll(".acc-tabs button").forEach(b =>
    b.addEventListener("click", () => selectTab(b.dataset.panel)));
  function selectTab(panel) {
    document.querySelectorAll(".acc-tabs button").forEach(x => x.classList.toggle("on", x.dataset.panel === panel));
    document.querySelectorAll(".acc-panel").forEach(p => p.classList.toggle("on", p.dataset.panel === panel));
  }

  const client = () => AWAAuth.client();
  const uid = () => AWAAuth.user().id;
  let PROFILE = null;

  AWAAuth.onChange(async (sess, profile) => {
    loading.hidden = true;
    if (!sess) { guest.hidden = false; app.hidden = true; return; }
    guest.hidden = true; app.hidden = false;
    PROFILE = profile || {};
    if (window.AWACMS) BEATS = (await AWACMS.beats()) || BEATS;
    renderOverview(sess, PROFILE);
    fillProfileForm(PROFILE);
    renderQuick(PROFILE);
    loadStats(); loadLyrics(); loadLikes(); loadPlaylists(); renderMembership(PROFILE);
  });

  /* ---------- Overview ---------- */
  function firstName(sess, p) {
    return (p && (p.display_name || p.artist_name)) || sess.user.email.split("@")[0];
  }
  function initials(name) {
    const parts = String(name).trim().split(/\s+/).slice(0, 2);
    return parts.map(w => w[0]).join("").toUpperCase() || "A";
  }
  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }

  function renderOverview(sess, p) {
    const name = firstName(sess, p);
    const member = AWAAuth.isMember();
    $("#acc-avatar").textContent = initials(p.artist_name || name);
    $("#acc-greet").textContent = greeting() + ",";
    $("#acc-name").textContent = p.artist_name || name;
    const bits = [];
    if (p.role) bits.push(p.role);
    if (p.fav_genre) bits.push(p.fav_genre);
    $("#acc-tagline").textContent = bits.join(" · ") || (member ? "Insider member" : "Welcome to the inner circle");
    $("#acc-status").innerHTML = member
      ? `<span class="acc-badge member">Insider · active</span>`
      : `<span class="acc-badge">Free account</span>`;
    $("#acc-head-cta").innerHTML = member ? "" :
      `<a class="btn btn-primary" href="#" id="acc-upgrade">Go Insider · ${money(CFG.membershipPrice || 4.99)}/mo</a>`;
    const up = $("#acc-upgrade");
    if (up) up.addEventListener("click", (e) => { e.preventDefault(); startMembership(); });

    // Upsell banner (non-members only)
    const upsell = $("#acc-upsell");
    if (member) { upsell.innerHTML = ""; upsell.style.display = "none"; }
    else {
      upsell.style.display = "";
      upsell.innerHTML = `
        <div class="acc-upsell-in">
          <div><b>You're one step from Insider.</b> Save 15% on every beat, cover and service, plus early access to drops.</div>
          <button class="btn btn-primary" id="acc-upsell-btn">Become an Insider · ${money(CFG.membershipPrice || 4.99)}/mo</button>
        </div>`;
      $("#acc-upsell-btn").addEventListener("click", startMembership);
    }
  }

  async function loadStats() {
    const box = $("#acc-stats");
    const [likes, pls, lys] = await Promise.all([
      client().from("likes").select("beat_id", { count: "exact", head: true }).eq("user_id", uid()),
      client().from("playlists").select("id", { count: "exact", head: true }).eq("user_id", uid()),
      client().from("lyrics").select("id", { count: "exact", head: true }).eq("user_id", uid())
    ]);
    const member = AWAAuth.isMember();
    const tiles = [
      { n: likes.count || 0, l: "Saved" },
      { n: pls.count || 0, l: "Playlists" },
      { n: lys.count || 0, l: "Lyrics" },
      { n: member ? "15%" : "Free", l: member ? "Insider saving" : "Account" }
    ];
    box.innerHTML = tiles.map(t => `<div class="acc-stat"><b>${t.n}</b><small>${esc(t.l)}</small></div>`).join("");
  }

  /* ---------- Tailored quick actions ---------- */
  const QUICK = {
    Artist: [
      { t: "Submit your demo", d: "Get your record to our A&R team", href: "contact.html", cta: "Submit" },
      { t: "Book the studio", d: "Pro rooms, engineers, gear", href: "studio.html", cta: "Book" },
      { t: "License a beat", d: "Lease or go exclusive", href: "beat-store.html", cta: "Browse" }
    ],
    Producer: [
      { t: "Beat Store", d: "Hear the catalogue", href: "beat-store.html", cta: "Open" },
      { t: "Cover art", d: "Artwork for your releases", href: "cover-store.html", cta: "Browse" },
      { t: "Collaborate", d: "Pitch a placement or collab", href: "contact.html", cta: "Reach out" }
    ],
    Songwriter: [
      { t: "Write to a beat", d: "Draft lyrics on any instrumental", tab: "lyrics", cta: "Write" },
      { t: "License a beat", d: "Find your next record", href: "beat-store.html", cta: "Browse" },
      { t: "Submit your demo", d: "Share your writing", href: "contact.html", cta: "Submit" }
    ],
    Fan: [
      { t: "Latest releases", d: "Fresh from the label", href: "releases.html", cta: "Listen" },
      { t: "Build a playlist", d: "Collect your favourites", tab: "playlists", cta: "Create" },
      { t: "Cover art", d: "Own a piece of the aesthetic", href: "cover-store.html", cta: "Browse" }
    ],
    "Manager / Label": [
      { t: "Distribution", d: "150+ platforms, keep 90%+", href: "contact.html", cta: "Talk" },
      { t: "The roster", d: "Artists we develop", href: "roster.html", cta: "View" },
      { t: "Book the studio", d: "For your artists", href: "studio.html", cta: "Book" }
    ]
  };
  const QUICK_DEFAULT = [
    { t: "License a beat", d: "MP3 £30 · WAV £45 · Trackout £145", href: "beat-store.html", cta: "Browse" },
    { t: "Cover art", d: "Release-ready artwork + motion", href: "cover-store.html", cta: "Browse" },
    { t: "Book the studio", d: "Make records that hold up", href: "studio.html", cta: "Book" },
    { t: "Submit a demo", d: "Get in front of our A&R", href: "contact.html", cta: "Submit" }
  ];

  function renderQuick(p) {
    const box = $("#acc-quick");
    const set = (p.role && QUICK[p.role]) || QUICK_DEFAULT;
    $("#acc-quick-eyebrow").textContent = p.role ? "For you, " + p.role : "Quick actions";
    box.innerHTML = "";
    set.forEach(a => {
      const el = document.createElement(a.tab ? "button" : "a");
      el.className = "acc-quick-card";
      if (a.href) el.href = a.href;
      el.innerHTML = `<div class="acc-quick-t">${esc(a.t)}</div><div class="acc-quick-d">${esc(a.d)}</div><span class="acc-quick-cta">${esc(a.cta)} →</span>`;
      if (a.tab) el.addEventListener("click", () => selectTab(a.tab));
      box.appendChild(el);
    });
  }

  /* ---------- Profile edit ---------- */
  function fillProfileForm(p) {
    const f = $("#acc-profile-form");
    f.display_name.value = p.display_name || "";
    f.artist_name.value = p.artist_name || "";
    f.role.value = p.role || "";
    f.fav_genre.value = p.fav_genre || "";
    f.bio.value = p.bio || "";
  }
  $("#acc-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, note = $("#acc-profile-note");
    const payload = {
      display_name: f.display_name.value.trim() || null,
      artist_name: f.artist_name.value.trim() || null,
      role: f.role.value || null,
      fav_genre: f.fav_genre.value.trim() || null,
      bio: f.bio.value.trim() || null
    };
    note.textContent = "Saving…"; note.style.color = "var(--muted)";
    const { error } = await client().from("profiles").update(payload).eq("id", uid());
    if (error) {
      // Extra columns may not exist yet — fall back to display_name only.
      const { error: e2 } = await client().from("profiles").update({ display_name: payload.display_name }).eq("id", uid());
      note.style.color = e2 ? "#e8637a" : "var(--gold)";
      note.textContent = e2 ? error.message : "Name saved. Extra profile fields will store once the profile update is applied.";
      PROFILE = Object.assign({}, PROFILE, { display_name: payload.display_name });
    } else {
      note.style.color = "var(--gold)"; note.textContent = "Profile saved ✓";
      PROFILE = Object.assign({}, PROFILE, payload);
    }
    renderOverview({ user: AWAAuth.user() }, PROFILE);
    renderQuick(PROFILE);
    setTimeout(() => { note.textContent = ""; }, 2600);
  });

  /* ---------- Lyrics ---------- */
  async function loadLyrics() {
    const { data } = await client().from("lyrics").select("*").eq("user_id", uid()).order("updated_at", { ascending: false });
    const box = $("#ly-list");
    box.innerHTML = "";
    if (!data || !data.length) { box.innerHTML = `<p class="acc-empty">No lyrics yet. Start a draft and write to any beat.</p>`; return; }
    data.forEach(row => box.appendChild(lyricCard(row)));
  }
  function lyricCard(row) {
    const el = document.createElement("div");
    el.className = "ly-card";
    const beat = row.beat_id ? beatById(row.beat_id) : null;
    el.innerHTML = `
      <input class="ly-title" value="${esc(row.title)}" placeholder="Title">
      <textarea class="ly-body" rows="6" placeholder="Write your lyrics…">${esc(row.body)}</textarea>
      <div class="ly-foot">
        <span class="ly-beat">${beat ? "♪ " + esc(beat.title) : ""}</span>
        <div class="ly-btns">
          <button class="btn btn-ghost ly-del">Delete</button>
          <button class="btn btn-primary ly-save">Save</button>
        </div>
      </div>`;
    el.querySelector(".ly-save").addEventListener("click", async () => {
      const title = el.querySelector(".ly-title").value.trim() || "Untitled";
      const body = el.querySelector(".ly-body").value;
      await client().from("lyrics").update({ title, body, updated_at: new Date().toISOString() }).eq("id", row.id);
      flash(el.querySelector(".ly-save"), "Saved");
    });
    el.querySelector(".ly-del").addEventListener("click", async () => {
      if (!confirm("Delete this draft?")) return;
      await client().from("lyrics").delete().eq("id", row.id);
      loadLyrics(); loadStats();
    });
    return el;
  }
  $("#ly-new").addEventListener("click", async () => {
    await client().from("lyrics").insert({ user_id: uid(), title: "Untitled", body: "" });
    loadLyrics(); loadStats();
  });

  /* ---------- Saved items (beats + covers) ---------- */
  async function loadLikes() {
    const { data } = await client().from("likes").select("beat_id").eq("user_id", uid()).order("created_at", { ascending: false });
    const box = $("#like-list");
    box.innerHTML = "";
    let shown = 0;
    (data || []).forEach(r => {
      let el;
      if (r.beat_id.indexOf("cover:") === 0) {
        const c = coverById(r.beat_id.slice(6)); if (!c) return;
        el = document.createElement("a"); el.className = "acc-beat"; el.href = "cover-store.html";
        el.innerHTML = `<img src="${c.img}" alt="" loading="lazy" onerror="this.style.opacity=0"><div><b>${esc(c.title)}</b><small>Cover · ${esc(c.sub)}</small></div>`;
      } else {
        const b = beatById(r.beat_id); if (!b) return;
        el = document.createElement("a"); el.className = "acc-beat"; el.href = "beat-store.html";
        el.innerHTML = `<img src="${b.cover}" alt="" loading="lazy" onerror="this.style.opacity=0"><div><b>${esc(b.title)}</b><small>${b.bpm} BPM · ${esc(b.key)}</small></div>`;
      }
      box.appendChild(el); shown++;
    });
    if (!shown) box.innerHTML = `<p class="acc-empty">No saved items yet. Tap the heart on any beat or cover in the store.</p>`;
  }

  /* ---------- Playlists ---------- */
  async function loadPlaylists() {
    const { data: pls } = await client().from("playlists").select("*").eq("user_id", uid()).order("created_at");
    const box = $("#pl-list");
    box.innerHTML = "";
    if (!pls || !pls.length) { box.innerHTML = `<p class="acc-empty">No playlists yet. Create one, then add beats from the store.</p>`; return; }
    for (const pl of pls) {
      const { data: items } = await client().from("playlist_items").select("beat_id").eq("playlist_id", pl.id);
      box.appendChild(playlistCard(pl, items || []));
    }
  }
  function playlistCard(pl, items) {
    const el = document.createElement("div");
    el.className = "pl-card";
    const rows = items.map(it => {
      const b = beatById(it.beat_id);
      return `<li data-beat="${it.beat_id}"><span>${b ? esc(b.title) : it.beat_id}</span><button class="pl-remove" aria-label="Remove">&times;</button></li>`;
    }).join("") || `<li class="pl-empty">Empty — add beats from the store.</li>`;
    el.innerHTML = `
      <div class="pl-head"><b>${esc(pl.name)}</b><div><span class="pl-count">${items.length} beat${items.length === 1 ? "" : "s"}</span><button class="pl-del" aria-label="Delete playlist">Delete</button></div></div>
      <ul class="pl-items">${rows}</ul>`;
    el.querySelector(".pl-del").addEventListener("click", async () => {
      if (!confirm("Delete playlist \"" + pl.name + "\"?")) return;
      await client().from("playlists").delete().eq("id", pl.id);
      loadPlaylists(); loadStats();
    });
    el.querySelectorAll(".pl-remove").forEach(btn =>
      btn.addEventListener("click", async () => {
        const beat = btn.closest("li").dataset.beat;
        await client().from("playlist_items").delete().match({ playlist_id: pl.id, beat_id: beat });
        loadPlaylists();
      }));
    return el;
  }
  $("#pl-new").addEventListener("click", async () => {
    const name = prompt("Playlist name:", "My Playlist");
    if (name === null) return;
    await client().from("playlists").insert({ user_id: uid(), name: name || "My Playlist" });
    loadPlaylists(); loadStats();
  });

  /* ---------- Membership ---------- */
  function renderMembership(profile) {
    const box = $("#member-box");
    const member = AWAAuth.isMember();
    if (member) {
      const since = profile && profile.member_since ? new Date(profile.member_since).toLocaleDateString() : "";
      box.innerHTML = `
        <div class="member-active">
          <span class="acc-badge member">Insider · active</span>
          <p>You save ${Math.round((CFG.memberDiscount || 0) * 100)}% on every beat license, cover art and service.${since ? " Member since " + since + "." : ""}</p>
        </div>`;
    } else {
      box.innerHTML = `
        <div class="member-offer">
          <div class="member-price">${money(CFG.membershipPrice || 4.99)}<small>/month</small></div>
          <ul>
            <li>15% off every beat license</li>
            <li>15% off cover art and all services</li>
            <li>Save beats, build playlists, write lyrics</li>
            <li>Early access to new releases and drops</li>
          </ul>
          <button class="btn btn-primary" id="member-go">Become an Insider</button>
        </div>`;
      $("#member-go").addEventListener("click", startMembership);
    }
  }
  function startMembership() {
    if (CFG.membershipPayLink) { window.open(CFG.membershipPayLink, "_blank", "noopener"); return; }
    const to = CFG.enquiryEmail || "awasound.music@gmail.com";
    const subj = encodeURIComponent("Awa Sounds Insider membership");
    const body = encodeURIComponent(`Hi Awa Sounds,\n\nI'd like to start the £${CFG.membershipPrice || 4.99}/mo Insider membership.\n\nAccount email: ${AWAAuth.user().email}\n\nThanks.`);
    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
  }

  /* ---------- helpers ---------- */
  function flash(btn, msg) {
    const t = btn.textContent; btn.textContent = msg; btn.disabled = true;
    setTimeout(() => { btn.textContent = t; btn.disabled = false; }, 1200);
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
})();
