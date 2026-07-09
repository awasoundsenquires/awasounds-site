/* AWA SOUNDS — Cover Art store (data-driven)
   Renders window.AWA.covers into #cover-list: hover-cycle 2 preview videos,
   save (registered users, stored as likes 'cover:<id>'), and a detail modal
   with the still image, both motion versions, Save and Buy. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const list = document.getElementById("cover-list");
  if (!list) return;

  const COVERS = CFG.covers || [];
  const money = (n) => "£" + Number(n).toFixed(0);
  const memberPrice = (n) => Math.round(n * (1 - (CFG.memberDiscount || 0)));
  const likeId = (id) => "cover:" + id;
  const isMember = () => window.AWAAuth && AWAAuth.isMember();
  let likeSet = new Set();

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
        <div class="store-price"><span class="now">${money(c.price)}</span>${c.premium ? `<span class="subprice">Members ${money(c.subPrice)}</span>` : ""}</div>
      </div>`;
    return el;
  }

  COVERS.forEach(c => list.appendChild(card(c)));

  /* Hover-cycle the two preview videos (mirrors main.js store-card behaviour) */
  list.querySelectorAll(".cover-card.has-motion").forEach(cardEl => {
    const vid = cardEl.querySelector(".media-video");
    const dots = cardEl.querySelectorAll(".previews span");
    const srcs = (cardEl.dataset.videos || "").split(",").filter(Boolean);
    let idx = 0, timer = null;
    const show = (i) => { idx = i; if (vid && srcs[i]) { vid.src = srcs[i]; vid.play().catch(() => {}); } dots.forEach((d, di) => d.classList.toggle("on", di === i)); };
    cardEl.addEventListener("mouseenter", () => { if (!srcs.length) return; show(0); timer = setInterval(() => show((idx + 1) % srcs.length), 3200); });
    cardEl.addEventListener("mouseleave", () => { clearInterval(timer); if (vid) vid.pause(); dots.forEach((d, di) => d.classList.toggle("on", di === 0)); });
  });

  /* Clicks: save button, or open detail */
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

  /* Reflect saved covers on auth */
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

  /* ---------- Detail modal ---------- */
  let dm = null, current = null;
  function build() {
    dm = document.createElement("div");
    dm.className = "cover-modal";
    dm.innerHTML = `
      <div class="cover-card-lg">
        <button class="cover-close" aria-label="Close">&times;</button>
        <div class="cover-stage">
          <img class="cover-still" alt="">
          <video class="cover-vid" muted loop playsinline></video>
        </div>
        <div class="cover-info">
          <div class="cover-head"><div><span class="eyebrow">Cover Art</span><h3 class="cover-title"></h3><div class="cover-sub"></div></div><button class="ib-like cover-save-lg" aria-label="Save"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.5 2 5 5.2 5 7.3 5 8.7 6.2 12 9c3.3-2.8 4.7-4 6.8-4 3.2 0 4.8 3.5 3.2 6.8C19.5 16.4 12 21 12 21z"/></svg></button></div>
          <div class="cover-tabs"><button data-v="still" class="on">Still</button><button data-v="0">Motion 1</button><button data-v="1">Motion 2</button></div>
          <p class="cover-desc">One-time exclusive. Ships as a 3000×3000 still plus two animated versions (visualizers) for your release and socials. Once sold, it's retired.</p>
          <div class="cover-buy"><span class="cover-price"></span><button class="btn btn-primary cover-buy-btn">Buy cover</button></div>
        </div>
      </div>`;
    document.body.appendChild(dm);
    dm.addEventListener("click", (e) => { if (e.target === dm || e.target.closest(".cover-close")) close(); });
  }

  function openDetail(id) {
    current = COVERS.find(c => c.id === id);
    if (!current) return;
    if (!dm) build();
    const still = dm.querySelector(".cover-still");
    const vid = dm.querySelector(".cover-vid");
    still.src = current.img;
    dm.querySelector(".cover-title").textContent = current.title;
    dm.querySelector(".cover-sub").textContent = current.sub;
    const member = isMember();
    const price = current.premium ? (member ? current.subPrice : current.price) : (member ? memberPrice(current.price) : current.price);
    dm.querySelector(".cover-price").innerHTML = member
      ? `<s>${money(current.price)}</s> ${money(price)} <em>member</em>`
      : `${money(current.price)}${current.premium ? ` · <span class="cover-memhint">Members ${money(current.subPrice)}</span>` : ""}`;
    // save state
    const saveBtn = dm.querySelector(".cover-save-lg");
    saveBtn.classList.toggle("on", likeSet.has(current.id));
    saveBtn.onclick = () => { toggleSaveById(current.id, saveBtn); };
    // tabs
    const showStill = () => { still.style.display = ""; vid.style.display = "none"; vid.pause(); };
    const showVid = (i) => { still.style.display = "none"; vid.style.display = ""; vid.src = current.videos[i]; vid.play().catch(() => {}); };
    dm.querySelectorAll(".cover-tabs button").forEach(b => {
      b.onclick = () => {
        dm.querySelectorAll(".cover-tabs button").forEach(x => x.classList.toggle("on", x === b));
        if (b.dataset.v === "still") showStill(); else showVid(parseInt(b.dataset.v, 10));
      };
    });
    dm.querySelector(".cover-tabs button").classList.add("on");
    dm.querySelectorAll(".cover-tabs button").forEach((x, i) => x.classList.toggle("on", i === 0));
    showStill();
    dm.querySelector(".cover-buy-btn").onclick = () => buy(current);
    dm.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() { if (dm) { dm.classList.remove("open"); dm.querySelector(".cover-vid").pause(); document.body.style.overflow = ""; } }

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

  function buy(c) {
    if (c.pay) { window.open(c.pay, "_blank", "noopener"); return; }
    const to = CFG.enquiryEmail || "awasound.music@gmail.com";
    const subj = encodeURIComponent(`Cover art enquiry — ${c.title}`);
    const body = encodeURIComponent(`Hi Awa Sounds,\n\nI'd like to buy the "${c.title}" cover (${c.sub}).\n\nName:\nRelease title:\n\nThanks.`);
    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
  }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
})();
