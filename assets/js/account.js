/* AWA SOUNDS — account page (client-side Supabase)
   Profile, lyrics editor, saved beats, playlists, membership.
   Requires config.js + auth.js (AWAAuth) loaded first. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const $ = (s) => document.querySelector(s);
  let BEATS = CFG.beats || [];
  const beatById = (id) => BEATS.find(b => b.id === id);
  const money = (n) => "£" + Number(n).toFixed(0);

  const guest = $("#acc-guest"), loading = $("#acc-loading"), app = $("#acc-app");
  if (!app) return;

  /* Not configured yet → invite, don't spin forever. */
  if (!window.AWAAuth || !AWAAuth.enabled) {
    loading.hidden = true; guest.hidden = false;
    $("#acc-signin").addEventListener("click", () => alert("Accounts are launching soon."));
    return;
  }

  $("#acc-signin").addEventListener("click", () => AWAAuth.openModal("Sign in to your Awa Sounds account."));
  $("#acc-signout").addEventListener("click", async () => { await AWAAuth.signOut(); });

  /* Tab switching */
  document.querySelectorAll(".acc-tabs button").forEach(b =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".acc-tabs button").forEach(x => x.classList.toggle("on", x === b));
      document.querySelectorAll(".acc-panel").forEach(p => p.classList.toggle("on", p.dataset.panel === b.dataset.panel));
    }));

  const client = () => AWAAuth.client();
  const uid = () => AWAAuth.user().id;

  AWAAuth.onChange(async (sess, profile) => {
    loading.hidden = true;
    if (!sess) { guest.hidden = false; app.hidden = true; return; }
    guest.hidden = true; app.hidden = false;
    if (window.AWACMS) BEATS = (await AWACMS.beats()) || BEATS;
    renderHead(sess, profile);
    loadLyrics(); loadLikes(); loadPlaylists(); renderMembership(profile);
  });

  /* ---------- Header ---------- */
  function renderHead(sess, profile) {
    $("#acc-name").textContent = (profile && profile.display_name) || sess.user.email.split("@")[0];
    const member = AWAAuth.isMember();
    $("#acc-status").innerHTML = member
      ? `<span class="acc-badge member">Insider member</span>`
      : `<span class="acc-badge">Free account</span>`;
    $("#acc-head-cta").innerHTML = member ? "" :
      `<a class="btn btn-primary" href="#" id="acc-upgrade">Become an Insider · ${money(CFG.membershipPrice || 4.99)}/mo</a>`;
    const up = $("#acc-upgrade");
    if (up) up.addEventListener("click", (e) => { e.preventDefault(); startMembership(); });
  }

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
      loadLyrics();
    });
    return el;
  }

  $("#ly-new").addEventListener("click", async () => {
    await client().from("lyrics").insert({ user_id: uid(), title: "Untitled", body: "" });
    loadLyrics();
  });

  /* ---------- Saved items (beats + covers) ---------- */
  const coverById = (id) => (CFG.covers || []).find(c => c.id === id);
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
      loadPlaylists();
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
    loadPlaylists();
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
