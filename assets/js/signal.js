/* AWA SOUNDS ‚Äî The Signal (signal.js)
   Public link-in-bio renderer for signal.html?u=USERNAME
   Reads signal_pages + profiles from Supabase. No auth required for viewing. */
(function () {
  "use strict";

  const root    = document.getElementById("sig-root");
  const loading = document.getElementById("sig-loading");

  /* Helpers */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function ytEmbed(url) {
    try {
      const u = new URL(url);
      let id = u.searchParams.get("v") || u.pathname.split("/").pop();
      if (!id) return null;
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1`;
    } catch(e) { return null; }
  }
  function spotifyEmbed(url) {
    try {
      const u = new URL(url);
      const path = u.pathname.replace("/", "/embed/");
      return `https://open.spotify.com${path}`;
    } catch(e) { return null; }
  }

  /* Get username from URL */
  const params   = new URLSearchParams(window.location.search);
  const username = (params.get("u") || "").trim().toLowerCase();

  if (!username) { showNotFound("No username in URL. Use ?u=yourname"); return; }

  /* Wait for Supabase client (auth.js exposes AWAAuth.client()) */
  let tries = 0;
  const waitForClient = setInterval(async () => {
    tries++;
    if (tries > 40) { clearInterval(waitForClient); showNotFound("Could not connect to database."); return; }
    if (!window.AWAAuth || !AWAAuth.client) return;
    clearInterval(waitForClient);
    await render();
  }, 150);

  async function render() {
    const db = AWAAuth.client();

    /* 1. Look up profile by username */
    const { data: profile, error: pErr } = await db
      .from("profiles")
      .select("id, artist_name, display_name, username, profile_image, bio, genre_tags, social_links")
      .eq("username", username)
      .maybeSingle();

    if (pErr || !profile) { showNotFound(`No Signal found for @${username}`); return; }

    /* 2. Look up signal page */
    const { data: signal, error: sErr } = await db
      .from("signal_pages")
      .select("*")
      .eq("user_id", profile.id)
      .eq("published", true)
      .maybeSingle();

    if (sErr || !signal) { showNotFound(`@${username}'s Signal is not published yet.`); return; }

    /* 3. Parse blocks */
    let blocks = [];
    try { blocks = JSON.parse(signal.blocks || "[]"); } catch(e) {}

    /* 4. Parse social links */
    let social = {};
    try { social = JSON.parse(profile.social_links || "{}"); } catch(e) {}

    /* 5. Record page view (fire and forget) */
    db.from("signal_analytics").insert({ user_id: profile.id, event_type: "view" }).then(() => {});

    /* 6. Accent color */
    const accent = signal.accent_color || "#d9c38f";
    document.documentElement.style.setProperty("--signal-accent", accent);

    /* 7. Build DOM */
    const displayName = profile.artist_name || profile.display_name || username;
    let html = buildSignalPage(displayName, profile, blocks, social, accent);
    loading.style.display = "none";
    root.style.display = "";
    root.innerHTML = html;

    /* 8. Wire click tracking */
    root.querySelectorAll("[data-block-id]").forEach(el => {
      el.addEventListener("click", () => {
        db.from("signal_analytics").insert({ user_id: profile.id, block_id: el.dataset.blockId, event_type: "click" }).then(() => {});
      });
    });
  }

  function buildSignalPage(displayName, profile, blocks, social, accent) {
    let sections = "";

    blocks.forEach(blk => {
      switch(blk.type) {
        case "hero_image": {
          if (!blk.image_url) break;
          sections += `<div class="sig-hero">
            <img src="${esc(blk.image_url)}" alt="" loading="lazy" onerror="this.style.opacity=0">
            <div class="sig-hero-overlay"></div>
            ${blk.overlay_text ? `<div class="sig-hero-text"><h1>${esc(blk.overlay_text)}</h1>${blk.sub_text ? `<p>${esc(blk.sub_text)}</p>` : ""}</div>` : ""}
          </div>`;
          break;
        }
        case "text": {
          if (!blk.headline && !blk.body) break;
          sections += `<div class="sig-text-block">
            ${blk.headline ? `<h2>${esc(blk.headline)}</h2>` : ""}
            ${blk.body     ? `<p>${esc(blk.body)}</p>` : ""}
          </div>`;
          break;
        }
        case "link_button": {
          if (!blk.url || !blk.label) break;
          sections += `<a class="sig-btn" href="${esc(blk.url)}" target="_blank" rel="noopener" data-block-id="${esc(blk.id)}"
            style="background:${esc(accent)};color:#0a0a0c">${esc(blk.label)}</a>`;
          break;
        }
        case "youtube": {
          const src = blk.url ? ytEmbed(blk.url) : null;
          if (!src) break;
          sections += `<div class="sig-yt"><iframe src="${esc(src)}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
          break;
        }
        case "spotify": {
          const src = blk.url ? spotifyEmbed(blk.url) : null;
          if (!src) break;
          sections += `<div class="sig-spotify"><iframe src="${esc(src)}" height="152" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture" loading="lazy"></iframe></div>`;
          break;
        }
        case "social_row": {
          const links = [
            { key:"instagram", label:"Instagram" },
            { key:"youtube",   label:"YouTube" },
            { key:"spotify",   label:"Spotify" },
            { key:"tiktok",    label:"TikTok" }
          ].filter(d => blk[d.key]);
          if (!links.length) break;
          sections += `<div class="sig-social-row">${
            links.map(d => `<a class="sig-social-btn" href="${esc(blk[d.key])}" target="_blank" rel="noopener" data-block-id="${esc(blk.id)}">${esc(d.label)}</a>`).join("")
          }</div>`;
          break;
        }
      }
    });

    /* If no hero block, show profile header */
    const hasHero = blocks.some(b => b.type === "hero_image" && b.image_url);
    const profileHeader = hasHero ? "" : buildProfileHeader(displayName, profile, accent);

    /* Awa Sounds watermark */
    const watermark = `<a class="sig-awa-mark" href="https://awasounds.com" target="_blank" rel="noopener">
      <img src="assets/img/logo-mark.png" alt="Awa Sounds">
      awasounds.com
    </a>`;

    return `
    <div class="sig-page" style="--signal-accent:${esc(accent)}">
      ${sections.includes("sig-hero") ? sections.split("</div>")[0] + "</div>" : ""}
      <div class="sig-content">
        ${profileHeader}
        ${hasHero ? sections.replace(/^.*?<\/div>/s, "") : sections}
        <div class="sig-footer">
          <a href="https://awasounds.com">Powered by Awa Sounds</a>
        </div>
      </div>
      ${watermark}
    </div>`;
  }

  function buildProfileHeader(displayName, profile, accent) {
    const avatarHtml = profile.profile_image
      ? `<div style="width:80px;height:80px;border-radius:50%;overflow:hidden;margin:0 auto 16px;border:3px solid ${esc(accent)}"><img src="${esc(profile.profile_image)}" style="width:100%;height:100%;object-fit:cover" alt=""></div>`
      : `<div style="width:80px;height:80px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#1a1710,#0a0a0c);border:2px solid ${esc(accent)};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-family:var(--ff-display);font-size:28px;font-weight:700;color:${esc(accent)}">${esc(initials(displayName))}</div>`;

    let genreTags = [];
    try { genreTags = JSON.parse(profile.genre_tags || "[]"); } catch(e) {}

    return `
    <div style="text-align:center;margin-bottom:28px;padding-top:40px">
      ${avatarHtml}
      <h1 style="font-family:var(--ff-display);font-size:clamp(22px,5vw,36px);font-weight:700;letter-spacing:-.02em;margin-bottom:6px">${esc(displayName)}</h1>
      ${profile.username ? `<div style="color:var(--faint);font-size:13px;margin-bottom:10px">@${esc(profile.username)}</div>` : ""}
      ${profile.bio ? `<p style="color:var(--muted);font-size:14px;max-width:46ch;margin:0 auto 14px;line-height:1.6">${esc(profile.bio)}</p>` : ""}
      ${genreTags.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${genreTags.map(t => `<span class="genre-tag">${esc(t)}</span>`).join("")}</div>` : ""}
    </div>`;
  }

  function initials(name) {
    return String(name).trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "A";
  }

  function showNotFound(msg) {
    loading.style.display = "none";
    root.style.display = "";
    root.innerHTML = `<div class="sig-not-found">
      <div style="font-size:48px">‚ö°</div>
      <h2>Signal not found</h2>
      <p>${esc(msg)}</p>
      <a class="btn btn-ghost" href="index.html" style="margin-top:20px;display:inline-flex">Back to Awa Sounds</a>
    </div>`;
  }
})();
