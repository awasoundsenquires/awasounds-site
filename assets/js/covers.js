/* AWA SOUNDS — Cover Art store v2
   Features:
   - GG watermark canvas overlay on all preview images (anti-piracy)
   - TITLED / CLEAN toggle button above the grid
   - Side-by-side (clean left, titled right) + videos-below modal
   - Receipt FX animation wired to buy flow
   ─────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const list = document.getElementById("cover-list");
  if (!list) return;

  const COVERS = (CFG.covers || []).filter(c => !c.auctionOnly);
  const money = (n) => "£" + Number(n).toFixed(0);
  const coverDiscount = CFG.coverMemberDiscount != null ? CFG.coverMemberDiscount : (CFG.memberDiscount || 0);
  const memberPrice = (n) => Math.round(n * (1 - coverDiscount));
  const likeId = (id) => "cover:" + id;
  const isMember = () => window.AWAAuth && AWAAuth.isMember();
  let likeSet = new Set();

  // Display mode: 'titled' (default) or 'clean'
  let displayMode = "titled";

  /* ── Clean-mode CSS ───────────────────────────────────── */
  const coverStyle = document.createElement("style");
  coverStyle.textContent = `
    #cover-list.clean-mode{gap:8px}
    #cover-list.clean-mode .store-body{display:none}
    #cover-list.clean-mode .store-card{border-radius:10px;transition:.2s}
    #cover-list.clean-mode .store-card:hover{transform:scale(1.03);z-index:1}
    #cover-list.clean-mode .art img{border-radius:10px}
    #cover-list.clean-mode .previews{display:none}
    #cover-list.clean-mode .badge{top:8px;left:8px;right:auto}
  `;
  document.head.appendChild(coverStyle);

  /* ── Toggle button ────────────────────────────────────── */
  const toggleWrap = document.createElement("div");
  toggleWrap.style.cssText = "display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-bottom:20px";
  toggleWrap.innerHTML = `
    <span style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">View</span>
    <div id="cover-toggle" style="display:inline-flex;background:var(--panel,#111318);border:1px solid var(--line);border-radius:8px;overflow:hidden" title="Toggle titled / clean gallery view">
      <button id="ct-titled" class="ct-btn" data-mode="titled" style="padding:7px 16px;font-size:11px;font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:none;cursor:pointer;background:var(--gold,#d9c38f);color:#040200;transition:.15s">WITH TEXT</button>
      <button id="ct-clean"  class="ct-btn" data-mode="clean"  style="padding:7px 16px;font-size:11px;font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:none;cursor:pointer;background:transparent;color:var(--muted,#9aa1ab);transition:.15s">GALLERY</button>
    </div>`;
  list.parentElement.insertBefore(toggleWrap, list);

  toggleWrap.querySelectorAll(".ct-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      displayMode = btn.dataset.mode;
      toggleWrap.querySelectorAll(".ct-btn").forEach(b => {
        const on = b.dataset.mode === displayMode;
        b.style.background = on ? "var(--gold,#d9c38f)" : "transparent";
        b.style.color = on ? "#040200" : "var(--muted,#9aa1ab)";
      });
      list.classList.toggle("clean-mode", displayMode === "clean");
    });
  });

  /* ── GG Watermark canvas overlay ─────────────────────── */
  function applyWatermark(artEl) {
    if (artEl.querySelector(".wm-canvas")) return;
    const cv = document.createElement("canvas");
    cv.className = "wm-canvas";
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2";
    artEl.style.position = "relative";
    artEl.appendChild(cv);

    function drawWM() {
      const W = artEl.offsetWidth || 280;
      const H = artEl.offsetHeight || 280;
      if (!W || !H) return;
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(12, W * 0.055)}px 'Space Grotesk',Arial,sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const step = W * 0.32;
      const angle = -28 * Math.PI / 180;
      for (let y = -step; y < H + step; y += step * 0.65) {
        for (let x = -step; x < W + step; x += step) {
          ctx.save();
          ctx.translate(x + (y % (step * 2) < step ? 0 : step * 0.5), y);
          ctx.rotate(angle);
          ctx.fillText("GG", 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();
    }
    drawWM();
    const ro = new ResizeObserver(drawWM);
    ro.observe(artEl);
  }

  /* ── Card builder ─────────────────────────────────────── */
  function card(c) {
    const el = document.createElement("article");
    el.className = "store-card cover-card has-motion";
    el.dataset.id = c.id;
    el.dataset.videos = (c.videos || []).join(",");
    el.innerHTML = `
      ${c.premium ? '<div class="badge">Premium</div>' : ""}
      <button class="cover-save ib-like" aria-label="Save cover" title="Save">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg>
      </button>
      <div class="art"><img src="${c.img}" alt="${esc(c.title)} cover art" loading="lazy"><video class="media-video" muted loop playsinline></video></div>
      <div class="previews"><span class="on"></span><span></span></div>
      <div class="store-body">
        <div><h4>${esc(c.title)}</h4><div class="sub">${esc(c.sub)} · 3000×3000 + 2 videos</div></div>
        <div class="store-price"><span class="now">${money(c.price)}</span><span class="subprice">Members ${money(c.premium && c.subPrice != null ? Math.min(c.subPrice, memberPrice(c.price)) : memberPrice(c.price))}</span></div>
      </div>`;

    // Apply GG watermark
    const artEl = el.querySelector(".art");
    if (artEl.querySelector("img").complete) applyWatermark(artEl);
    else el.querySelector("img").addEventListener("load", () => applyWatermark(artEl), { once: true });

    return el;
  }

  COVERS.forEach(c => list.appendChild(card(c)));

  /* ── Hover video cycle ────────────────────────────────── */
  list.querySelectorAll(".cover-card.has-motion").forEach(cardEl => {
    const vid = cardEl.querySelector(".media-video");
    const dots = cardEl.querySelectorAll(".previews span");
    const srcs = (cardEl.dataset.videos || "").split(",").filter(Boolean);
    let idx = 0, timer = null;
    const show = (i) => { idx = i; if (vid && srcs[i]) { vid.src = srcs[i]; vid.play().catch(() => {}); } dots.forEach((d, di) => d.classList.toggle("on", di === i)); };
    cardEl.addEventListener("mouseenter", () => { if (!srcs.length) return; show(0); timer = setInterval(() => show((idx + 1) % srcs.length), 3200); });
    cardEl.addEventListener("mouseleave", () => { clearInterval(timer); if (vid) vid.pause(); dots.forEach((d, di) => d.classList.toggle("on", di === 0)); });
  });

  /* ── Clicks ───────────────────────────────────────────── */
  list.addEventListener("click", (e) => {
    const save = e.target.closest(".cover-save");
    if (save) { e.preventDefault(); e.stopPropagation(); toggleSave(save.closest(".cover-card")); return; }
    const cardEl = e.target.closest(".cover-card");
    if (cardEl) openDetail(cardEl.dataset.id);
  });

  function toggleSave(cardEl) {
    AWAAuth.requireAuth(async () => {
      const id = cardEl.dataset.id, btn = cardEl.querySelector(".cover-save");
      const client = AWAAuth.client(), uid = AWAAuth.user().id;
      const on = btn.classList.toggle("on");
      if (on) { likeSet.add(id); await client.from("likes").upsert({ user_id: uid, beat_id: likeId(id) }); }
      else { likeSet.delete(id); await client.from("likes").delete().match({ user_id: uid, beat_id: likeId(id) }); }
    }, "Sign in to save cover art to your account.");
  }

  if (window.AWAAuth) AWAAuth.onChange(async (sess) => {
    list.querySelectorAll(".cover-save.on").forEach(b => b.classList.remove("on"));
    likeSet = new Set();
    if (!sess) return;
    const { data } = await AWAAuth.client().from("likes").select("beat_id").eq("user_id", sess.user.id).like("beat_id", "cover:%");
    (data || []).forEach(r => {
      const id = r.beat_id.replace(/^cover:/, "");
      likeSet.add(id);
      const b = list.querySelector(`.cover-card[data-id="${id}"] .cover-save`);
      if (b) b.classList.add("on");
    });
  });

  /* ── Detail modal — side-by-side layout ──────────────── */
  let dm = null, current = null;

  const MODAL_CSS = `
  .cover-modal{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:900;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s;padding:20px}
  .cover-modal.open{opacity:1;pointer-events:all}
  .cover-card-lg{background:var(--bg2,#0e0e1c);border:1px solid var(--line,#222238);border-radius:14px;width:100%;max-width:860px;max-height:92vh;overflow-y:auto;position:relative;padding:24px}
  .cover-close{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--silver,#7070a0);font-size:22px;cursor:pointer;line-height:1;padding:4px 8px}
  .cover-close:hover{color:var(--hi,#e0e0f0)}
  .cover-modal h3{font-family:'Space Grotesk',sans-serif;font-size:20px;color:var(--hi,#e0e0f0);margin:0 0 4px}
  .cover-modal .eyebrow{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted,#3a3a60);display:block;margin-bottom:6px}
  .cover-modal .cover-sub{font-size:12px;color:var(--silver,#7070a0);margin-bottom:16px}

  /* Side-by-side images */
  .cov-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
  .cov-side{position:relative;border-radius:10px;overflow:hidden;background:#000}
  .cov-side img{width:100%;display:block;aspect-ratio:1/1;object-fit:cover}
  .cov-side-lbl{position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(0deg,rgba(0,0,0,.75)0%,transparent);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700}

  /* Videos */
  .cov-vids{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px}
  .cov-vid-wrap{border-radius:10px;overflow:hidden;background:#000;position:relative;cursor:pointer}
  .cov-vid-wrap video{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
  .cov-vid-lbl{position:absolute;bottom:0;left:0;right:0;padding:6px 10px;background:linear-gradient(0deg,rgba(0,0,0,.75)0%,transparent);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#fff;font-family:'Space Grotesk',sans-serif}
  .cov-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.7;transition:.15s}
  .cov-vid-play:hover{opacity:1}
  .cov-vid-play svg{filter:drop-shadow(0 0 4px #000)}

  /* Info bar */
  .cov-info-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:16px;border-top:1px solid var(--line,#222238)}
  .cov-price .now{font-size:22px;font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--hi,#e0e0f0)}
  .cov-price .subprice{font-size:12px;color:var(--silver,#7070a0);margin-left:8px}
  .cov-price s{color:var(--muted,#3a3a60)}
  .cov-price em{font-style:normal;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold,#e0a030);margin-left:4px}
  .cov-actions{display:flex;align-items:center;gap:10px}
  .cov-save-lg{background:none;border:1px solid var(--line,#222238);border-radius:8px;padding:9px 14px;cursor:pointer;color:var(--silver,#7070a0);transition:.15s}
  .cov-save-lg:hover,.cov-save-lg.on{border-color:var(--gold,#e0a030);color:var(--gold,#e0a030)}
  @media(max-width:600px){.cov-pair{grid-template-columns:1fr}}
  `;

  function injectModalStyle() {
    if (document.getElementById("covers-modal-css")) return;
    const s = document.createElement("style");
    s.id = "covers-modal-css";
    s.textContent = MODAL_CSS;
    document.head.appendChild(s);
  }

  function build() {
    injectModalStyle();
    dm = document.createElement("div");
    dm.className = "cover-modal";
    dm.innerHTML = `
      <div class="cover-card-lg">
        <button class="cover-close" aria-label="Close">&times;</button>
        <span class="eyebrow">Cover Art — Awa Sounds</span>
        <h3 class="cover-title"></h3>
        <div class="cover-sub"></div>
        <!-- Side-by-side pair -->
        <div class="cov-pair">
          <div class="cov-side" id="cov-clean-side">
            <img class="cov-img-clean" alt="Clean version">
            <div class="cov-side-lbl">Clean</div>
          </div>
          <div class="cov-side" id="cov-titled-side">
            <img class="cov-img-titled" alt="With title">
            <div class="cov-side-lbl">With Title</div>
          </div>
        </div>
        <!-- Motion videos -->
        <div class="cov-vids" id="cov-vids"></div>
        <!-- Info + buy -->
        <div class="cov-info-bar">
          <div class="cov-price"><span class="now"></span><span class="subprice"></span></div>
          <div class="cov-actions">
            <button class="cov-save-lg" aria-label="Save">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg>
            </button>
            <button class="btn btn-primary cov-buy-btn">Buy cover</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(dm);
    dm.addEventListener("click", e => { if (e.target === dm || e.target.closest(".cover-close")) close(); });
  }

  function openDetail(id) {
    current = COVERS.find(c => c.id === id);
    if (!current) return;
    if (!dm) build();

    const c = current;
    dm.querySelector(".cover-title").textContent = c.title;
    dm.querySelector(".cover-sub").textContent = c.sub + " · 3000×3000 + 2 motion files";

    // Pair images
    const cleanImg = dm.querySelector(".cov-img-clean");
    const titledImg = dm.querySelector(".cov-img-titled");
    cleanImg.src = c.imgClean || c.img;
    titledImg.src = c.img;

    // Hide clean side if no separate clean version yet
    const cleanSide = document.getElementById("cov-clean-side");
    cleanSide.style.display = c.imgClean ? "" : "none";
    const titledSide = document.getElementById("cov-titled-side");
    titledSide.style.gridColumn = c.imgClean ? "" : "1 / -1";

    // Videos
    const vids = dm.querySelector("#cov-vids");
    vids.innerHTML = "";
    (c.videos || []).forEach((src, i) => {
      const wrap = document.createElement("div");
      wrap.className = "cov-vid-wrap";
      wrap.innerHTML = `<video muted loop playsinline preload="none" src="${src}"></video>
        <div class="cov-vid-lbl">Motion ${i + 1}</div>
        <div class="cov-vid-play"><svg width="40" height="40" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="12" fill="rgba(0,0,0,.55)"/><polygon points="10,8 17,12 10,16" fill="#fff"/></svg></div>`;
      const video = wrap.querySelector("video");
      wrap.addEventListener("click", () => {
        if (video.paused) { video.play().catch(() => {}); wrap.querySelector(".cov-vid-play").style.display = "none"; }
        else { video.pause(); wrap.querySelector(".cov-vid-play").style.display = ""; }
      });
      vids.appendChild(wrap);
    });
    if (!c.videos || !c.videos.length) vids.style.display = "none";
    else vids.style.display = "";

    // Price
    const member = isMember();
    const memPrice = c.premium && c.subPrice != null
      ? Math.min(c.subPrice, memberPrice(c.price))
      : memberPrice(c.price);
    const price = member ? memPrice : c.price;
    dm.querySelector(".cov-price .now").textContent = money(price);
    dm.querySelector(".cov-price .subprice").innerHTML = member
      ? `<em>Insider price applied</em>`
      : `· Members ${money(memPrice)}`;

    // Save button
    const saveBtn = dm.querySelector(".cov-save-lg");
    saveBtn.classList.toggle("on", likeSet.has(c.id));
    saveBtn.onclick = () => toggleSaveById(c.id, saveBtn);

    // Buy button → receipt animation
    dm.querySelector(".cov-buy-btn").onclick = () => triggerBuy(c, member, memPrice);

    dm.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!dm) return;
    dm.classList.remove("open");
    document.body.style.overflow = "";
    dm.querySelectorAll("video").forEach(v => v.pause());
  }

  /* ── Receipt animation → payment ─────────────────────── */
  function triggerBuy(c, member, memPrice) {
    const priceVal = member && memPrice ? memberPrice(c.price) : c.price;
    const priceStr = money(priceVal);

    if (window.AWAReceiptFX) {
      close();
      AWAReceiptFX.show({
        title: c.title,
        price: money(c.price),
        memberPrice: priceStr,
        isMember: member,
        onConfirm: () => openPayLink(c),
        onCancel: () => {}
      });
    } else {
      openPayLink(c);
    }
  }

  function openPayLink(c) {
    if (c.pay) { window.open(c.pay, "_blank", "noopener"); return; }
    const to = CFG.enquiryEmail || "awasound.music@gmail.com";
    const subj = encodeURIComponent(`Cover art enquiry — ${c.title}`);
    const body = encodeURIComponent(`Hi Awa Sounds,\n\nI'd like to buy the "${c.title}" cover (${c.sub}).\n\nName:\nRelease title:\n\nThanks.`);
    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
  }

  function toggleSaveById(id, btn) {
    AWAAuth.requireAuth(async () => {
      const client = AWAAuth.client(), uid = AWAAuth.user().id;
      const on = btn.classList.toggle("on");
      const cardBtn = list.querySelector(`.cover-card[data-id="${id}"] .cover-save`);
      if (cardBtn) cardBtn.classList.toggle("on", on);
      if (on) { likeSet.add(id); await client.from("likes").upsert({ user_id: uid, beat_id: likeId(id) }); }
      else { likeSet.delete(id); await client.from("likes").delete().match({ user_id: uid, beat_id: likeId(id) }); }
    }, "Sign in to save cover art.");
  }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
})();
