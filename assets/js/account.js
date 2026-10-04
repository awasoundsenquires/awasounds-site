/* AWA SOUNDS — My Studio (account.js v2)
   Profile banner/avatar, posts, likes, The Signal editor, + original functionality.
   Requires config.js + auth.js (AWAAuth) loaded first. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const $ = (s) => document.querySelector(s);
  let BEATS = CFG.beats || [];
  const beatById  = (id) => BEATS.find(b => b.id === id);
  const coverById = (id) => (CFG.covers || []).find(c => c.id === id);
  const money = (n) => String.fromCharCode(163) + Number(n).toFixed(0);
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function flash(btn, msg) {
    const t = btn.textContent; btn.textContent = msg; btn.disabled = true;
    setTimeout(() => { btn.textContent = t; btn.disabled = false; }, 1400);
  }

  const guest = $("#acc-guest"), loading = $("#acc-loading"), app = $("#acc-app");
  if (!app) return;

  if (!window.AWAAuth || !AWAAuth.enabled) {
    loading.hidden = true; guest.hidden = false;
    $("#acc-signin").addEventListener("click", () => alert("Accounts are launching soon."));
    return;
  }

  $("#acc-signin").addEventListener("click", () => AWAAuth.openModal("Sign in to your Awa Sounds account."));
  $("#acc-signout").addEventListener("click", async () => { await AWAAuth.signOut(); });

  /* ── Tabs ──────────────────────────────────────────────────── */
  document.querySelectorAll(".acc-tabs button").forEach(b =>
    b.addEventListener("click", () => selectTab(b.dataset.panel)));
  function selectTab(panel) {
    document.querySelectorAll(".acc-tabs button").forEach(x => x.classList.toggle("on", x.dataset.panel === panel));
    document.querySelectorAll(".acc-panel").forEach(p => p.classList.toggle("on", p.dataset.panel === panel));
  }

  const client = () => AWAAuth.client();
  const uid    = () => AWAAuth.user().id;
  let PROFILE  = null;

  /* Open tab from sessionStorage (set by Awa Tools nav) */
  (function checkTabParam() {
    try {
      const tab = sessionStorage.getItem("awa_open_tab");
      if (tab) { sessionStorage.removeItem("awa_open_tab"); selectTab(tab); }
    } catch(e) {}
  })();

  AWAAuth.onChange(async (sess, profile) => {
    loading.hidden = true;
    if (!sess) { guest.hidden = false; app.hidden = true; return; }
    guest.hidden = true; app.hidden = false;
    PROFILE = profile || {};
    if (window.AWACMS) BEATS = (await AWACMS.beats()) || BEATS;
    renderStudioIdentity(sess, PROFILE);
    fillSettingsForm(PROFILE);
    loadStats();
    loadLyrics();
    loadLikes();
    loadCoverArt();
    loadPlaylists();
    renderMembership(PROFILE);
    loadCreditBalance();
    loadCreditHistory();
    loadPosts();
    initSignalEditor();
    wireReferral();
  });

  /* ── Helpers ─────────────────────────────────────────────────── */
  function firstName(sess, p) {
    return (p && (p.display_name || p.artist_name)) || sess.user.email.split("@")[0];
  }
  function initials(name) {
    return String(name).trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "A";
  }
  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }

  /* ── Studio Identity ─────────────────────────────────────────── */
  function renderStudioIdentity(sess, p) {
    const name   = firstName(sess, p);
    const member = AWAAuth.isMember();

    /* Avatar */
    const avatarEl = $("#studio-avatar-el");
    if (p.profile_image) {
      avatarEl.style.backgroundImage = `url(${p.profile_image})`;
      avatarEl.textContent = "";
    } else {
      avatarEl.style.backgroundImage = "";
      avatarEl.textContent = initials(p.artist_name || name);
    }

    /* Composer avatar */
    const compAv = $("#composer-avatar");
    if (compAv) {
      if (p.profile_image) { compAv.style.backgroundImage = `url(${p.profile_image})`; compAv.textContent = ""; }
      else { compAv.style.backgroundImage = ""; compAv.textContent = initials(p.artist_name || name); }
    }

    /* Banner */
    const bannerBg = $("#studio-banner-bg");
    if (p.cover_banner) bannerBg.style.backgroundImage = `url(${p.cover_banner})`;

    /* Name / handle */
    $("#studio-name-el").textContent = p.artist_name || p.display_name || name;
    const username = p.username || "";
    $("#studio-handle-el").textContent = username ? "@" + username : "";

    /* Genre tags */
    const genreRow = $("#studio-genre-row");
    const tags = [];
    if (p.genre_1) tags.push(p.genre_1);
    if (p.genre_2) tags.push(p.genre_2);
    if (p.genre_3) tags.push(p.genre_3);
    if (!tags.length && p.fav_genre) tags.push(p.fav_genre);
    genreRow.innerHTML = tags.map(t => `<span class="genre-tag">${esc(t)}</span>`).join("");

    /* Bio */
    const bioEl = $("#studio-bio-el");
    bioEl.textContent = p.bio || "";

    /* Social links */
    const linksEl = $("#studio-links-row");
    let social = {};
    try { social = p.social_links ? JSON.parse(p.social_links) : {}; } catch(e) {}
    const linkDefs = [
      { key:"instagram", label:"Instagram", icon:"&#x1F4F8;" },
      { key:"youtube",   label:"YouTube",   icon:"&#x25B6;" },
      { key:"spotify",   label:"Spotify",   icon:"&#x1F3B5;" },
      { key:"tiktok",    label:"TikTok",    icon:"&#x266A;" },
      { key:"booking",   label:"Booking",   icon:"&#x1F4E9;" }
    ];
    linksEl.innerHTML = linkDefs
      .filter(d => social[d.key])
      .map(d => `<a class="studio-link-btn" href="${esc(social[d.key])}" target="_blank" rel="noopener">${d.icon} ${d.label}</a>`)
      .join("");

    /* Member badge */
    $("#acc-status").innerHTML = member
      ? `<span class="acc-badge member">Insider &middot; active</span>`
      : `<span class="acc-badge">Free account</span>`;

    /* Signal link */
    const sigBtn = $("#studio-signal-btn");
    if (username) { sigBtn.href = `signal.html?u=${encodeURIComponent(username)}`; sigBtn.hidden = false; }
    else { sigBtn.hidden = true; }

    /* Upsell */
    const upsell = $("#acc-upsell");
    if (member) { upsell.innerHTML = ""; upsell.style.display = "none"; }
    else {
      upsell.style.display = "";
      upsell.innerHTML = `<div class="acc-upsell-in">
        <div><b>You're one step from Insider.</b> 30% off cover art, 15% off beats and services, early access to drops, and full Signal customisation.</div>
        <button class="btn btn-primary" id="acc-upsell-btn">Become an Insider &middot; ${money(CFG.membershipPrice || 4.99)}/mo</button>
      </div>`;
      $("#acc-upsell-btn").addEventListener("click", startMembership);
    }

    /* Streak (placeholder — will be a real streak table later) */
    const sv = $("#streak-value");
    if (sv) sv.textContent = "1";
  }

  /* ── Image upload helpers ─────────────────────────────────────── */
  async function compressImage(file, maxW, maxH, quality) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width, maxH / img.height);
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* Avatar upload */
  document.getElementById("avatar-file-input").addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const b64 = await compressImage(file, 300, 300, 0.80);
    const { error } = await client().from("profiles").update({ profile_image: b64 }).eq("id", uid());
    if (!error) { PROFILE.profile_image = b64; renderStudioIdentity({ user: AWAAuth.user() }, PROFILE); }
    else alert("Could not save profile image. The database column may not exist yet - run supabase-studio-schema.sql first.");
  });

  /* Banner upload */
  document.getElementById("banner-file-input").addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const b64 = await compressImage(file, 1200, 400, 0.75);
    const { error } = await client().from("profiles").update({ cover_banner: b64 }).eq("id", uid());
    if (!error) { PROFILE.cover_banner = b64; $("#studio-banner-bg").style.backgroundImage = `url(${b64})`; }
    else alert("Could not save cover banner. Run supabase-studio-schema.sql first.");
  });

  /* Edit toggle → Settings tab */
  $("#studio-edit-toggle").addEventListener("click", () => selectTab("settings"));

  /* ── Stats ───────────────────────────────────────────────────── */
  async function loadStats() {
    const box = $("#acc-stats");
    if (!box) return;
    const [likes, pls, lys, posts] = await Promise.all([
      client().from("likes").select("beat_id", { count: "exact", head: true }).eq("user_id", uid()),
      client().from("playlists").select("id", { count: "exact", head: true }).eq("user_id", uid()),
      client().from("lyrics").select("id", { count: "exact", head: true }).eq("user_id", uid()),
      client().from("studio_posts").select("id", { count: "exact", head: true }).eq("user_id", uid())
    ]);
    const member = AWAAuth.isMember();
    const tiles = [
      { n: posts.count || 0,  l: "Posts" },
      { n: likes.count || 0,  l: "Saved" },
      { n: lys.count || 0,    l: "Lyrics" },
      { n: member ? "Insider" : "Free", l: member ? "Membership" : "Account" }
    ];
    box.innerHTML = tiles.map(t => `<div class="acc-stat"><b>${t.n}</b><small>${esc(t.l)}</small></div>`).join("");
  }

  /* ── Settings form ───────────────────────────────────────────── */
  function fillSettingsForm(p) {
    const f = $("#acc-profile-form");
    if (!f) return;
    const safe = (v) => v || "";
    f.display_name.value = safe(p.display_name);
    f.artist_name.value  = safe(p.artist_name);
    f.username.value     = safe(p.username);
    f.role.value         = safe(p.role);
    f.fav_genre.value    = safe(p.fav_genre);
    f.bio.value          = safe(p.bio);
    let gt = []; try { gt = JSON.parse(p.genre_tags || "[]"); } catch(e) {}
    f.genre_1.value = gt[0] || "";
    f.genre_2.value = gt[1] || "";
    f.genre_3.value = gt[2] || "";
    let sl = {}; try { sl = JSON.parse(p.social_links || "{}"); } catch(e) {}
    if (f.instagram) f.instagram.value = safe(sl.instagram);
    if (f.youtube)   f.youtube.value   = safe(sl.youtube);
    if (f.spotify)   f.spotify.value   = safe(sl.spotify);
    if (f.apple_music) f.apple_music.value = safe(sl.apple_music);
    if (f.tiktok)    f.tiktok.value    = safe(sl.tiktok);
    if (f.booking)   f.booking.value   = safe(sl.booking);
  }

  $("#acc-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, note = $("#acc-profile-note");
    const uname = f.username.value.trim().toLowerCase().replace(/[^a-z0-9\-]/g, "");
    const genre_tags = JSON.stringify([f.genre_1.value.trim(), f.genre_2.value.trim(), f.genre_3.value.trim()].filter(Boolean));
    const social_links = JSON.stringify({
      instagram: f.instagram ? f.instagram.value.trim() : "",
      youtube:   f.youtube   ? f.youtube.value.trim()   : "",
      spotify:   f.spotify   ? f.spotify.value.trim()   : "",
      apple_music: f.apple_music ? f.apple_music.value.trim() : "",
      tiktok:    f.tiktok    ? f.tiktok.value.trim()    : "",
      booking:   f.booking   ? f.booking.value.trim()   : ""
    });
    const payload = {
      display_name:  f.display_name.value.trim() || null,
      artist_name:   f.artist_name.value.trim()  || null,
      username:      uname || null,
      role:          f.role.value || null,
      fav_genre:     f.fav_genre.value.trim() || null,
      bio:           f.bio.value.trim() || null,
      genre_tags,
      social_links
    };
    note.textContent = "Saving..."; note.style.color = "var(--muted)";
    const { error } = await client().from("profiles").update(payload).eq("id", uid());
    if (error) {
      /* Fallback for older schema (no new columns yet) */
      const { error: e2 } = await client().from("profiles").update({
        display_name: payload.display_name, artist_name: payload.artist_name,
        role: payload.role, fav_genre: payload.fav_genre, bio: payload.bio
      }).eq("id", uid());
      note.style.color = e2 ? "#e8637a" : "var(--gold)";
      note.textContent = e2 ? "Error: " + error.message : "Basic info saved. New fields need schema update.";
      PROFILE = Object.assign({}, PROFILE, { display_name: payload.display_name, artist_name: payload.artist_name });
    } else {
      note.style.color = "var(--gold)"; note.textContent = "Settings saved";
      PROFILE = Object.assign({}, PROFILE, payload);
    }
    renderStudioIdentity({ user: AWAAuth.user() }, PROFILE);
    setTimeout(() => { note.textContent = ""; }, 2600);
  });

  /* ── Posts ───────────────────────────────────────────────────── */
  let postPage = 0;
  const POST_LIMIT = 20;

  async function loadPosts() {
    const feed = $("#posts-feed");
    feed.innerHTML = `<div class="post-loading">Loading posts...</div>`;
    try {
      const { data, error } = await client()
        .from("studio_posts")
        .select("*")
        .eq("user_id", uid())
        .order("created_at", { ascending: false })
        .limit(POST_LIMIT);
      if (error) throw error;
      feed.innerHTML = "";
      if (!data || !data.length) {
        feed.innerHTML = `<div class="post-loading">No posts yet. Write something above.</div>`;
        return;
      }
      /* Get user's own likes on these posts */
      const ids = data.map(p => p.id);
      const { data: likeData } = await client()
        .from("studio_post_likes")
        .select("post_id")
        .eq("user_id", uid())
        .in("post_id", ids);
      const likedSet = new Set((likeData || []).map(l => l.post_id));
      data.forEach(post => feed.appendChild(buildPostCard(post, likedSet.has(post.id))));
    } catch(err) {
      feed.innerHTML = `<div class="post-loading" style="color:#e8637a">Could not load posts. Run supabase-studio-schema.sql to create the posts table.</div>`;
    }
  }

  function buildPostCard(post, liked) {
    const p = PROFILE || {};
    const name = p.artist_name || p.display_name || "You";
    const t = new Date(post.created_at);
    const timeStr = t.toLocaleDateString("en-GB", { day:"2-digit", month:"short" }) + " at " + t.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
    const avatarStyle = p.profile_image ? `style="background-image:url(${p.profile_image})"` : "";
    const avatarChar  = p.profile_image ? "" : initials(name);

    let mediaHtml = "";
    if (post.post_type === "image" && post.image_url) {
      mediaHtml = `<div class="post-img"><img src="${esc(post.image_url)}" alt="" loading="lazy"></div>`;
    } else if ((post.post_type === "link" || post.link_url) && post.link_url) {
      const title = esc(post.link_title || post.link_url);
      const domain = (() => { try { return new URL(post.link_url).hostname; } catch(e) { return post.link_url; } })();
      mediaHtml = `<a class="post-link-card" href="${esc(post.link_url)}" target="_blank" rel="noopener">
        <span class="link-icon">&#x1F517;</span>
        <span class="link-text"><b>${title}</b><small>${esc(domain)}</small></span>
      </a>`;
    }

    const likeCount = post.show_likes ? (post.like_count || 0) : "";
    const el = document.createElement("div");
    el.className = "post-card";
    el.dataset.postId = post.id;
    el.innerHTML = `
      <div class="post-head">
        <div class="post-avatar" ${avatarStyle}>${esc(avatarChar)}</div>
        <div><div class="post-author">${esc(name)}</div><div class="post-time">${timeStr}</div></div>
        <button class="post-delete" title="Delete post">&times;</button>
      </div>
      <div class="post-content">${esc(post.content)}</div>
      ${mediaHtml}
      <div class="post-actions">
        <button class="post-like-btn${liked ? " liked" : ""}" data-post="${esc(post.id)}">
          <svg viewBox="0 0 24 24" fill="${liked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span class="post-like-count">${likeCount}</span>
        </button>
      </div>`;

    el.querySelector(".post-delete").addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      await client().from("studio_posts").delete().eq("id", post.id);
      el.remove(); loadStats();
    });

    el.querySelector(".post-like-btn").addEventListener("click", async (ev) => {
      const btn  = ev.currentTarget;
      const isOn = btn.classList.contains("liked");
      btn.classList.toggle("liked", !isOn);
      const countEl = btn.querySelector(".post-like-count");
      const cur = parseInt(countEl.textContent) || 0;
      if (!isOn) {
        countEl.textContent = cur + 1;
        await client().from("studio_post_likes").insert({ post_id: post.id, user_id: uid() });
        await client().rpc("increment_post_like", { post_id_arg: post.id, delta: 1 });
      } else {
        countEl.textContent = Math.max(0, cur - 1);
        await client().from("studio_post_likes").delete().match({ post_id: post.id, user_id: uid() });
        await client().rpc("increment_post_like", { post_id_arg: post.id, delta: -1 });
      }
    });

    return el;
  }

  /* Post composer */
  let pendingImage = null;
  const postText     = $("#post-text");
  const postImgInput = document.getElementById("post-image-input");
  const postMediaPrev = $("#post-media-preview");
  const postLinkRow  = $("#post-link-row");
  const linkToggleBtn = $("#link-toggle-btn");
  const composerNote = $("#post-composer-note");
  const member = () => AWAAuth.isMember();

  /* Image label — hide for free users */
  document.getElementById("image-upload-label").style.display = member() ? "" : "none";
  AWAAuth.onChange && AWAAuth.onChange(() => {
    document.getElementById("image-upload-label").style.display = AWAAuth.isMember() ? "" : "none";
  });

  if (postImgInput) {
    postImgInput.addEventListener("change", async (e) => {
      const file = e.target.files[0]; if (!file) return;
      if (!AWAAuth.isMember()) {
        composerNote.textContent = "Image posts are an Insider feature. Upgrade to add photos.";
        return;
      }
      const b64 = await compressImage(file, 1200, 1200, 0.80);
      pendingImage = b64;
      postMediaPrev.hidden = false;
      postMediaPrev.innerHTML = `<img src="${b64}" alt="">`;
    });
  }

  if (linkToggleBtn) {
    linkToggleBtn.addEventListener("click", () => {
      postLinkRow.hidden = !postLinkRow.hidden;
      if (!postLinkRow.hidden) postLinkRow.querySelector(".post-link-input").focus();
    });
  }

  const postSubmit = $("#post-submit");
  if (postSubmit) {
    postSubmit.addEventListener("click", async () => {
      const content = postText.value.trim();
      if (!content && !pendingImage) { postText.focus(); return; }
      const linkUrl   = ($("#post-link-url") && $("#post-link-url").value.trim()) || null;
      const linkTitle = ($("#post-link-title") && $("#post-link-title").value.trim()) || null;
      const showLikes = $("#post-show-likes") ? $("#post-show-likes").checked : true;
      let post_type = "text";
      if (pendingImage) post_type = "image";
      else if (linkUrl) post_type = "link";
      const payload = {
        user_id:    uid(),
        content:    content || "",
        image_url:  pendingImage || null,
        link_url:   linkUrl,
        link_title: linkTitle,
        post_type,
        show_likes: showLikes
      };
      flash(postSubmit, "Posting...");
      const { error } = await client().from("studio_posts").insert(payload);
      if (error) {
        composerNote.style.color = "#e8637a";
        composerNote.textContent = error.code === "42P01"
          ? "Posts table doesn't exist yet - run supabase-studio-schema.sql first."
          : "Error: " + error.message;
        return;
      }
      /* Reset */
      postText.value = ""; pendingImage = null;
      postMediaPrev.hidden = true; postMediaPrev.innerHTML = "";
      postLinkRow.hidden = true;
      if ($("#post-link-url"))   $("#post-link-url").value   = "";
      if ($("#post-link-title")) $("#post-link-title").value = "";
      composerNote.textContent = "";
      loadPosts(); loadStats();
    });
  }

  /* ── Cover Art panel ─────────────────────────────────────────── */
  async function loadCoverArt() {
    const box = $("#cover-art-list");
    if (!box) return;
    const { data } = await client().from("likes").select("beat_id").eq("user_id", uid()).like("beat_id", "cover:%");
    box.innerHTML = "";
    let shown = 0;
    (data || []).forEach(r => {
      const c = coverById(r.beat_id.slice(6));
      if (!c) return;
      const el = document.createElement("a");
      el.className = "acc-beat"; el.href = "cover-store.html";
      el.innerHTML = `<img src="${esc(c.img)}" alt="" loading="lazy" onerror="this.style.opacity=0"><div><b>${esc(c.title)}</b><small>Cover art &middot; ${esc(c.sub || "")}</small></div>`;
      box.appendChild(el); shown++;
    });
    if (!shown) box.innerHTML = `<p class="acc-empty">No saved covers yet. Browse the store and tap the heart icon on any cover.</p>`;
  }

  /* ── Lyrics ──────────────────────────────────────────────────── */
  async function loadLyrics() {
    const { data } = await client().from("lyrics").select("*").eq("user_id", uid()).order("updated_at", { ascending: false });
    const box = $("#ly-list");
    if (!box) return;
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
      <textarea class="ly-body" rows="6" placeholder="Write your lyrics...">${esc(row.body)}</textarea>
      <div class="ly-foot">
        <span class="ly-beat">${beat ? "&#9835; " + esc(beat.title) : ""}</span>
        <div class="ly-btns">
          <button class="btn btn-ghost ly-del">Delete</button>
          <button class="btn btn-primary ly-save">Save</button>
        </div>
      </div>`;
    el.querySelector(".ly-save").addEventListener("click", async () => {
      const title = el.querySelector(".ly-title").value.trim() || "Untitled";
      const body  = el.querySelector(".ly-body").value;
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
  const lyNew = $("#ly-new");
  if (lyNew) lyNew.addEventListener("click", async () => {
    await client().from("lyrics").insert({ user_id: uid(), title: "Untitled", body: "" });
    loadLyrics(); loadStats();
  });

  /* ── Saved beats ─────────────────────────────────────────────── */
  async function loadLikes() {
    const { data } = await client().from("likes").select("beat_id").eq("user_id", uid()).order("created_at", { ascending: false });
    const box = $("#like-list");
    if (!box) return;
    box.innerHTML = "";
    let shown = 0;
    (data || []).forEach(r => {
      if (String(r.beat_id).startsWith("cover:")) return;
      const b = beatById(r.beat_id); if (!b) return;
      const el = document.createElement("a");
      el.className = "acc-beat"; el.href = "beat-store.html";
      el.innerHTML = `<img src="${esc(b.cover)}" alt="" loading="lazy" onerror="this.style.opacity=0"><div><b>${esc(b.title)}</b><small>${b.bpm} BPM &middot; ${esc(b.key)}</small></div>`;
      box.appendChild(el); shown++;
    });
    if (!shown) box.innerHTML = `<p class="acc-empty">No saved beats yet. Tap the heart on any beat in the store.</p>`;
  }

  /* ── Playlists ───────────────────────────────────────────────── */
  async function loadPlaylists() {
    const { data: pls } = await client().from("playlists").select("*").eq("user_id", uid()).order("created_at");
    const box = $("#pl-list");
    if (!box) return;
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
    }).join("") || `<li class="pl-empty">Empty &mdash; add beats from the store.</li>`;
    el.innerHTML = `<div class="pl-head"><b>${esc(pl.name)}</b><div><span class="pl-count">${items.length} beat${items.length === 1 ? "" : "s"}</span><button class="pl-del">Delete</button></div></div><ul class="pl-items">${rows}</ul>`;
    el.querySelector(".pl-del").addEventListener("click", async () => {
      if (!confirm("Delete playlist \"" + pl.name + "\"?")) return;
      await client().from("playlists").delete().eq("id", pl.id);
      loadPlaylists(); loadStats();
    });
    el.querySelectorAll(".pl-remove").forEach(btn => btn.addEventListener("click", async () => {
      const beat = btn.closest("li").dataset.beat;
      await client().from("playlist_items").delete().match({ playlist_id: pl.id, beat_id: beat });
      loadPlaylists();
    }));
    return el;
  }
  const plNew = $("#pl-new");
  if (plNew) plNew.addEventListener("click", async () => {
    const name = prompt("Playlist name:", "My Playlist");
    if (name === null) return;
    await client().from("playlists").insert({ user_id: uid(), name: name || "My Playlist" });
    loadPlaylists(); loadStats();
  });

  /* ── Membership ──────────────────────────────────────────────── */
  function renderMembership(profile) {
    const box = $("#member-box");
    if (!box) return;
    const isMem = AWAAuth.isMember();
    if (isMem) {
      const since = profile && profile.member_since ? new Date(profile.member_since).toLocaleDateString() : "";
      box.innerHTML = `<div class="member-active"><span class="acc-badge member">Insider &middot; active</span><p>You save 30% on cover art and 15% on every beat license and service.${since ? " Member since " + since + "." : ""}</p></div>`;
    } else {
      box.innerHTML = `<div class="member-offer">
        <div class="member-price">${money(CFG.membershipPrice || 4.99)}<small>/month</small></div>
        <ul>
          <li><b>30% off all cover art</b></li>
          <li>15% off every beat license</li>
          <li>15% off all other services</li>
          <li>Full Signal page personalisation</li>
          <li>Post images on your Studio page</li>
          <li>Early access to new releases and drops</li>
        </ul>
        <button class="btn btn-primary" id="member-go">Become an Insider</button>
      </div>`;
      $("#member-go").addEventListener("click", startMembership);
    }
  }
  function startMembership() {
    if (CFG.membershipPayLink) { window.open(CFG.membershipPayLink, "_blank", "noopener"); return; }
    const to   = CFG.enquiryEmail || "awasoundsenquires@gmail.com";
    const subj = encodeURIComponent("Awa Sounds Insider membership");
    const body = encodeURIComponent(`Hi Awa Sounds,\n\nI'd like to start the ${String.fromCharCode(163)}${CFG.membershipPrice || 4.99}/mo Insider membership.\n\nAccount email: ${AWAAuth.user().email}\n\nThanks.`);
    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
  }

  /* ── Credits ─────────────────────────────────────────────────── */
  async function loadCreditBalance() {
    const el = $("#acc-credit-balance");
    if (!el) return;
    const { data } = await client().from("credit_balances").select("balance").eq("user_id", uid()).maybeSingle();
    el.textContent = (data && data.balance != null) ? data.balance : "0";
  }
  async function loadCreditHistory() {
    const box = $("#acc-credit-history");
    if (!box) return;
    const { data } = await client().from("credit_ledger").select("amount, reason, created_at").eq("user_id", uid()).order("created_at", { ascending: false }).limit(50);
    if (!data || !data.length) {
      box.innerHTML = `<p class="acc-empty">No credit transactions yet. Credits are earned on registration, monthly, and through referrals.</p>`;
      return;
    }
    box.innerHTML = `<table class="cr-table"><thead><tr><th>Date</th><th>Reason</th><th>Amount</th></tr></thead><tbody>${
      data.map(r => {
        const sign = r.amount > 0 ? "+" : "";
        const cls  = r.amount > 0 ? "cr-pos" : "cr-neg";
        const date = new Date(r.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
        return `<tr><td>${date}</td><td>${esc(r.reason || "&mdash;")}</td><td class="${cls}">${sign}${r.amount} cr</td></tr>`;
      }).join("")
    }</tbody></table>`;
  }

  /* ── Referral ────────────────────────────────────────────────── */
  function wireReferral() {
    const section = document.querySelector('[data-panel="referral"] .promo-input-section');
    if (!section) return;
    const inp = section.querySelector(".promo-input");
    const btn = section.querySelector(".promo-apply-btn");
    const res = section.querySelector(".promo-result");
    if (!btn || !inp) return;
    btn.addEventListener("click", () => {
      if (window.validatePromoCode) window.validatePromoCode(inp.value.trim(), res);
    });
  }

  /* ── The Signal editor ───────────────────────────────────────── */
  let SIGNAL_DATA = { template: "the-drop", accent_color: "#d9c38f", blocks: [], published: false };

  async function initSignalEditor() {
    const isMem = AWAAuth.isMember();

    /* Member gate */
    const gate = $("#signal-member-gate");
    if (!isMem) {
      gate.hidden = false;
      document.querySelectorAll("#signal-templates,.signal-section,.signal-add-menu-wrap,.signal-blocks-list,.signal-colors,.signal-publish-btn,.signal-preview-btn").forEach(el => { if (el) el.style.pointerEvents = "none"; });
      const gateBtn = $("#signal-gate-upgrade");
      if (gateBtn) gateBtn.addEventListener("click", startMembership);
      return;
    }
    gate.hidden = true;

    /* Load existing signal */
    const { data } = await client().from("signal_pages").select("*").eq("user_id", uid()).maybeSingle();
    if (data) {
      SIGNAL_DATA.template     = data.template || "the-drop";
      SIGNAL_DATA.accent_color = data.accent_color || "#d9c38f";
      SIGNAL_DATA.published    = data.published || false;
      try { SIGNAL_DATA.blocks = JSON.parse(data.blocks || "[]"); } catch(e) { SIGNAL_DATA.blocks = []; }
      updateSignalStatus();
      renderSignalBlocks();
    }

    /* Set active template + color from loaded data */
    document.querySelectorAll(".signal-tpl").forEach(t => t.classList.toggle("on", t.dataset.tpl === SIGNAL_DATA.template));
    document.querySelectorAll(".sig-col").forEach(c => c.classList.toggle("on", c.dataset.color === SIGNAL_DATA.accent_color));

    /* Template picker */
    document.querySelectorAll(".signal-tpl").forEach(btn =>
      btn.addEventListener("click", () => {
        document.querySelectorAll(".signal-tpl").forEach(x => x.classList.remove("on"));
        btn.classList.add("on");
        SIGNAL_DATA.template = btn.dataset.tpl;
      })
    );

    /* Colour picker */
    document.querySelectorAll(".sig-col").forEach(btn =>
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sig-col").forEach(x => x.classList.remove("on"));
        btn.classList.add("on");
        SIGNAL_DATA.accent_color = btn.dataset.color;
      })
    );

    /* Add block menu */
    const addBtn = $("#signal-add-block");
    const addMenu = $("#signal-add-menu");
    if (addBtn && addMenu) {
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addMenu.hidden = !addMenu.hidden;
      });
      document.addEventListener("click", () => { addMenu.hidden = true; });
      addMenu.querySelectorAll("[data-btype]").forEach(btn =>
        btn.addEventListener("click", () => {
          addBlock(btn.dataset.btype);
          addMenu.hidden = true;
        })
      );
    }

    /* Publish */
    const pubBtn = $("#signal-publish-btn");
    if (pubBtn) pubBtn.addEventListener("click", saveSignal);

    /* Preview */
    const prevBtn = $("#signal-preview-btn");
    if (prevBtn) prevBtn.addEventListener("click", () => {
      const uname = PROFILE && PROFILE.username;
      if (!uname) { alert("Set a username in Settings first so your Signal URL works."); return; }
      window.open(`signal.html?u=${encodeURIComponent(uname)}`, "_blank");
    });

    /* Copy URL */
    const copyBtn = $("#signal-copy-btn");
    if (copyBtn) copyBtn.addEventListener("click", () => {
      const txt = $("#signal-url-text");
      if (txt) { navigator.clipboard.writeText(txt.textContent).catch(() => {}); flash(copyBtn, "Copied!"); }
    });

    /* Analytics */
    if (SIGNAL_DATA.published) loadSignalAnalytics();

    /* Signal upgrade button inside gate (already handled above) */
  }

  function updateSignalStatus() {
    const badge  = $("#signal-status-badge");
    const urlBar = $("#signal-url-bar");
    const urlTxt = $("#signal-url-text");
    const uname  = PROFILE && PROFILE.username;
    if (badge) {
      badge.textContent = SIGNAL_DATA.published ? "Live" : "Draft";
      badge.className = "signal-status-badge" + (SIGNAL_DATA.published ? " live" : "");
    }
    if (urlBar && uname && SIGNAL_DATA.published) {
      urlBar.hidden = false;
      if (urlTxt) urlTxt.textContent = `awasounds.com/signal.html?u=${uname}`;
    } else if (urlBar) { urlBar.hidden = true; }
  }

  async function saveSignal() {
    const uname = PROFILE && PROFILE.username;
    if (!uname) { alert("Set a username in Settings before publishing your Signal."); selectTab("settings"); return; }
    const pubBtn = $("#signal-publish-btn");
    if (pubBtn) { pubBtn.disabled = true; pubBtn.textContent = "Saving..."; }
    const payload = {
      user_id:      uid(),
      template:     SIGNAL_DATA.template,
      accent_color: SIGNAL_DATA.accent_color,
      blocks:       JSON.stringify(SIGNAL_DATA.blocks),
      published:    true,
      updated_at:   new Date().toISOString()
    };
    const { error } = await client().from("signal_pages").upsert(payload, { onConflict: "user_id" });
    if (pubBtn) { pubBtn.disabled = false; pubBtn.textContent = error ? "Error saving" : "Published"; setTimeout(() => { pubBtn.textContent = "Publish"; }, 2000); }
    if (!error) {
      SIGNAL_DATA.published = true;
      updateSignalStatus();
      loadSignalAnalytics();
    }
  }

  function addBlock(btype) {
    const id = "blk_" + Date.now();
    const defaults = {
      hero_image:  { id, type: btype, image_url: "", overlay_text: "", sub_text: "" },
      text:        { id, type: btype, headline: "", body: "" },
      link_button: { id, type: btype, label: "", url: "" },
      youtube:     { id, type: btype, url: "" },
      spotify:     { id, type: btype, url: "" },
      social_row:  { id, type: btype, instagram: "", youtube: "", spotify: "", tiktok: "" }
    };
    SIGNAL_DATA.blocks.push(defaults[btype] || { id, type: btype });
    renderSignalBlocks();
  }

  function renderSignalBlocks() {
    const list = $("#signal-blocks-list");
    if (!list) return;
    if (!SIGNAL_DATA.blocks.length) {
      list.innerHTML = `<div class="signal-empty-blocks">No blocks yet. Add one above to start building your Signal.</div>`;
      return;
    }
    list.innerHTML = "";
    SIGNAL_DATA.blocks.forEach((blk, idx) => {
      const el = document.createElement("div");
      el.className = "signal-block-card";
      el.innerHTML = `
        <span class="signal-block-drag">&#x283F;</span>
        <div class="signal-block-body">
          <div class="signal-block-type">${esc(blk.type.replace(/_/g, " "))}</div>
          ${blockFields(blk)}
          <div class="signal-block-actions">
            <button class="signal-block-del btn btn-ghost">Remove</button>
            ${idx > 0 ? `<button class="sig-move-up btn btn-ghost">&#x2191;</button>` : ""}
            ${idx < SIGNAL_DATA.blocks.length - 1 ? `<button class="sig-move-dn btn btn-ghost">&#x2193;</button>` : ""}
          </div>
        </div>`;
      el.querySelector(".signal-block-del").addEventListener("click", () => {
        SIGNAL_DATA.blocks.splice(idx, 1);
        renderSignalBlocks();
      });
      const upBtn = el.querySelector(".sig-move-up");
      if (upBtn) upBtn.addEventListener("click", () => {
        [SIGNAL_DATA.blocks[idx - 1], SIGNAL_DATA.blocks[idx]] = [SIGNAL_DATA.blocks[idx], SIGNAL_DATA.blocks[idx - 1]];
        renderSignalBlocks();
      });
      const dnBtn = el.querySelector(".sig-move-dn");
      if (dnBtn) dnBtn.addEventListener("click", () => {
        [SIGNAL_DATA.blocks[idx + 1], SIGNAL_DATA.blocks[idx]] = [SIGNAL_DATA.blocks[idx], SIGNAL_DATA.blocks[idx + 1]];
        renderSignalBlocks();
      });
      /* Sync inputs → SIGNAL_DATA */
      el.querySelectorAll(".signal-block-input").forEach(inp => {
        inp.addEventListener("input", () => {
          blk[inp.dataset.field] = inp.value;
        });
      });
      list.appendChild(el);
    });
  }

  function blockFields(blk) {
    const inp = (field, placeholder, val) =>
      `<input class="signal-block-input" data-field="${esc(field)}" placeholder="${esc(placeholder)}" value="${esc(val || "")}">`;
    switch(blk.type) {
      case "hero_image":  return inp("image_url","Image URL (paste direct link)",blk.image_url) + inp("overlay_text","Headline (optional)",blk.overlay_text) + inp("sub_text","Sub-text (optional)",blk.sub_text);
      case "text":        return inp("headline","Headline",blk.headline) + inp("body","Body text",blk.body);
      case "link_button": return inp("label","Button label",blk.label) + inp("url","URL",blk.url);
      case "youtube":     return inp("url","YouTube video URL",blk.url);
      case "spotify":     return inp("url","Spotify track or album URL",blk.url);
      case "social_row":  return inp("instagram","Instagram URL",blk.instagram) + inp("youtube","YouTube URL",blk.youtube) + inp("spotify","Spotify URL",blk.spotify) + inp("tiktok","TikTok URL",blk.tiktok);
      default:            return `<input class="signal-block-input" data-field="content" placeholder="Content" value="${esc(blk.content || "")}">`;
    }
  }

  async function loadSignalAnalytics() {
    const section = $("#signal-analytics-section");
    const grid    = $("#signal-analytics-grid");
    if (!section || !grid) return;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [views, clicks] = await Promise.all([
      client().from("signal_analytics").select("id", { count: "exact", head: true }).eq("user_id", uid()).eq("event_type", "view").gte("created_at", since),
      client().from("signal_analytics").select("id", { count: "exact", head: true }).eq("user_id", uid()).eq("event_type", "click").gte("created_at", since)
    ]);
    section.hidden = false;
    grid.innerHTML = [
      { n: views.count || 0,  l: "Page views" },
      { n: clicks.count || 0, l: "Link clicks" }
    ].map(s => `<div class="signal-analytics-stat"><b>${s.n}</b><small>${esc(s.l)}</small></div>`).join("");
  }
})();
