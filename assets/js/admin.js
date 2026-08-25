/* AWA SOUNDS — admin panel (no-code content management)
   Admin-only CRUD for the beat catalogue and editable site text, backed by
   Supabase with RLS (only profiles.is_admin = true can write). */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const loading = $("#adm-loading"), guest = $("#adm-guest"), denied = $("#adm-denied"), app = $("#adm-app");

  if (!window.AWAAuth || !AWAAuth.enabled) {
    loading.hidden = true; guest.hidden = false;
    $("#adm-signin").addEventListener("click", () => alert("Connect Supabase in config.js first."));
    return;
  }
  const client = () => AWAAuth.client();

  $("#adm-signin").addEventListener("click", () => AWAAuth.openModal("Admin sign-in."));
  ["#adm-signout", "#adm-signout2"].forEach(s => $(s).addEventListener("click", async () => { await AWAAuth.signOut(); }));

  document.querySelectorAll(".acc-tabs button").forEach(b =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".acc-tabs button").forEach(x => x.classList.toggle("on", x === b));
      document.querySelectorAll(".acc-panel").forEach(p => p.classList.toggle("on", p.dataset.panel === b.dataset.panel));
    }));

  AWAAuth.onChange(async (sess, profile) => {
    loading.hidden = true;
    if (!sess) { show(guest); return; }
    if (!profile || !profile.is_admin) { show(denied); return; }
    show(app);
    $("#adm-who").textContent = (profile.display_name || sess.user.email) + " · admin";
    loadBeats(); loadContent(); loadDashboard(); loadEditRequests(); loadItemCodes();
    $("#dash-refresh").addEventListener("click", loadDashboard);
  });
  function show(el) { [guest, denied, app].forEach(x => x.hidden = x !== el); }

  /* ---------------- Beats ---------------- */
  async function loadBeats() {
    const { data, error } = await client().from("beats").select("*").order("sort");
    const box = $("#beat-admin-list");
    if (error) { box.innerHTML = `<p class="acc-empty">Could not load beats. Did you run the schema? ${esc(error.message)}</p>`; return; }
    box.innerHTML = "";
    if (!data || !data.length) { box.innerHTML = `<p class="acc-empty">No beats yet. Add your first beat.</p>`; return; }
    data.forEach(b => box.appendChild(beatRow(b)));
  }

  function beatRow(b) {
    const el = document.createElement("div");
    el.className = "adm-item";
    el.innerHTML = `
      <img class="adm-thumb" src="${esc(b.cover_url || "")}" alt="" onerror="this.style.visibility='hidden'">
      <div class="adm-item-main">
        <b>${esc(b.title)}</b>
        <small>${b.bpm || "—"} BPM · ${esc(b.music_key || "—")} · ${(b.tags || []).join(", ")}</small>
      </div>
      <span class="adm-flags">${b.active ? "" : '<span class="adm-off">hidden</span>'}${hasLinks(b) ? '<span class="adm-on">links set</span>' : '<span class="adm-warn">no pay links</span>'}</span>
      <button class="btn btn-ghost adm-edit">Edit</button>`;
    el.querySelector(".adm-edit").addEventListener("click", () => openBeat(b));
    return el;
  }
  const hasLinks = (b) => !!(b.pay_mp3 || b.pay_wav || b.pay_trackout);

  const modal = $("#beat-modal"), form = $("#beat-form"), errEl = $("#beat-form-error"), delBtn = $("#beat-delete");
  let editingId = null;

  function openBeat(b) {
    editingId = b ? b.id : null;
    $("#beat-modal-title").textContent = b ? "Edit beat" : "Add beat";
    form.id.value = b ? b.id : "";
    form.id.readOnly = !!b;
    form.title.value = b ? b.title : "";
    form.producer.value = b ? (b.producer || "AWA") : "AWA";
    form.bpm.value = b && b.bpm != null ? b.bpm : "";
    form.music_key.value = b ? (b.music_key || "") : "";
    form.tags.value = b ? (b.tags || []).join(", ") : "";
    form.cover_url.value = b ? (b.cover_url || "") : "";
    form.preview_url.value = b ? (b.preview_url || "") : "";
    form.pay_mp3.value = b ? (b.pay_mp3 || "") : "";
    form.pay_wav.value = b ? (b.pay_wav || "") : "";
    form.pay_trackout.value = b ? (b.pay_trackout || "") : "";
    form.sort.value = b && b.sort != null ? b.sort : 0;
    form.active.checked = b ? !!b.active : true;
    errEl.textContent = ""; $("#cover-upload-status").textContent = "";
    delBtn.hidden = !b;
    modal.classList.add("open"); document.body.style.overflow = "hidden";
  }
  function closeBeat() { modal.classList.remove("open"); document.body.style.overflow = ""; }
  $("#beat-modal-close").addEventListener("click", closeBeat);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeBeat(); });
  $("#beat-new").addEventListener("click", () => openBeat(null));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.textContent = "";
    const slug = form.id.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug) { errEl.textContent = "A slug / ID is required."; return; }
    const row = {
      id: slug,
      title: form.title.value.trim(),
      producer: form.producer.value.trim() || "AWA",
      bpm: form.bpm.value ? parseInt(form.bpm.value, 10) : null,
      music_key: form.music_key.value.trim(),
      tags: form.tags.value.split(",").map(t => t.trim()).filter(Boolean),
      cover_url: form.cover_url.value.trim(),
      preview_url: form.preview_url.value.trim(),
      pay_mp3: form.pay_mp3.value.trim(),
      pay_wav: form.pay_wav.value.trim(),
      pay_trackout: form.pay_trackout.value.trim(),
      sort: parseInt(form.sort.value, 10) || 0,
      active: form.active.checked
    };
    const { error } = await client().from("beats").upsert(row);
    if (error) { errEl.textContent = error.message; return; }
    closeBeat(); loadBeats();
  });

  delBtn.addEventListener("click", async () => {
    if (!editingId || !confirm("Delete this beat permanently?")) return;
    const { error } = await client().from("beats").delete().eq("id", editingId);
    if (error) { errEl.textContent = error.message; return; }
    closeBeat(); loadBeats();
  });

  /* Cover upload to the optional public "covers" bucket */
  $("#cover-upload-btn").addEventListener("click", async () => {
    const file = $("#cover-file").files[0];
    const st = $("#cover-upload-status");
    if (!file) { st.textContent = "Choose a file first."; return; }
    st.textContent = "Uploading…";
    const path = (form.id.value.trim() || "cover") + "-" + Date.now() + "." + (file.name.split(".").pop() || "png");
    const { error } = await client().storage.from("covers").upload(path, file, { upsert: true });
    if (error) { st.textContent = "Upload failed: " + error.message + " (create a public 'covers' bucket)"; return; }
    const { data } = client().storage.from("covers").getPublicUrl(path);
    form.cover_url.value = data.publicUrl;
    st.textContent = "Uploaded ✓";
  });

  /* ---------------- Site content ---------------- */
  async function loadContent() {
    const { data, error } = await client().from("site_content").select("*").order("key");
    const box = $("#content-admin-list");
    if (error) { box.innerHTML = `<p class="acc-empty">${esc(error.message)}</p>`; return; }
    box.innerHTML = "";
    if (!data || !data.length) { box.innerHTML = `<p class="acc-empty">No text blocks yet. Add one with the exact key a page uses (e.g. home.hero.title).</p>`; return; }
    data.forEach(r => box.appendChild(contentRow(r)));
  }

  function contentRow(r) {
    const el = document.createElement("div");
    el.className = "ly-card";
    el.innerHTML = `
      <div class="adm-content-key"><b>${esc(r.label || r.key)}</b><code>${esc(r.key)}</code></div>
      <textarea class="ly-body" rows="3">${esc(r.value)}</textarea>
      <div class="ly-foot"><span></span><div class="ly-btns">
        <button class="btn btn-ghost c-del">Delete</button>
        <button class="btn btn-primary c-save">Save</button></div></div>`;
    el.querySelector(".c-save").addEventListener("click", async () => {
      const val = el.querySelector("textarea").value;
      const { error } = await client().from("site_content").update({ value: val, updated_at: new Date().toISOString() }).eq("key", r.key);
      flash(el.querySelector(".c-save"), error ? "Error" : "Saved");
    });
    el.querySelector(".c-del").addEventListener("click", async () => {
      if (!confirm("Delete block \"" + r.key + "\"?")) return;
      await client().from("site_content").delete().eq("key", r.key);
      loadContent();
    });
    return el;
  }

  $("#content-new").addEventListener("click", async () => {
    const key = prompt("Content key (must match the data-cms attribute on the page, e.g. home.hero.title):");
    if (!key) return;
    const label = prompt("Friendly label (optional):", "") || null;
    const { error } = await client().from("site_content").insert({ key: key.trim(), label, value: "" });
    if (error) { alert(error.message); return; }
    loadContent();
  });

  /* ---------------- Dashboard ---------------- */
  async function loadDashboard() {
    const c = client();
    const [users, credits, auctions, bids, editReqs, items] = await Promise.all([
      c.from("profiles").select("id", { count: "exact", head: true }),
      c.from("credit_ledger").select("amount", { count: "exact" }),
      c.from("auctions").select("id", { count: "exact", head: true }).in("status", ["live","closing","scheduled"]),
      c.from("bids").select("id", { count: "exact", head: true }),
      c.from("cover_edit_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      c.from("item_codes").select("id", { count: "exact", head: true })
    ]);
    $("#ds-users").textContent = users.count ?? "—";
    const totalCr = (credits.data || []).reduce((s, r) => r.amount > 0 ? s + r.amount : s, 0);
    $("#ds-credits").textContent = totalCr.toLocaleString() + " cr";
    $("#ds-auctions").textContent = auctions.count ?? "—";
    $("#ds-bids").textContent = bids.count ?? "—";
    $("#ds-edit-reqs").textContent = editReqs.count ?? "—";
    $("#ds-items").textContent = items.count ?? "—";
    // Recent bids
    const { data: recentBids } = await c.from("bids").select("bid_amount, created_at, auction_id, user_id").order("created_at", { ascending: false }).limit(5);
    const rbb = $("#dash-recent-bids");
    rbb.innerHTML = (recentBids || []).map(b =>
      `<div class="adm-item" style="display:flex;justify-content:space-between;padding:10px 14px">
        <span style="color:var(--muted);font-size:13px">${new Date(b.created_at).toLocaleDateString("en-GB")} · ${b.user_id.slice(0,8)}…</span>
        <span style="font-family:var(--ff-display);color:var(--silver-hi)">${b.bid_amount} cr</span>
      </div>`).join("") || `<p class="acc-empty">No bids yet.</p>`;
    // Pending cover edits
    const { data: pendingEdits } = await c.from("cover_edit_requests").select("item_code, artist_name, song_title, contact_email, created_at").eq("status","pending").order("created_at",{ascending:false}).limit(5);
    const peb = $("#dash-pending-edits");
    peb.innerHTML = (pendingEdits || []).map(r =>
      `<div class="adm-item" style="padding:10px 14px">
        <div style="font-weight:600;font-size:13px">${esc(r.item_code)} — ${esc(r.artist_name)} · ${esc(r.song_title)}</div>
        <div style="font-size:12px;color:var(--muted)">${esc(r.contact_email)} · ${new Date(r.created_at).toLocaleDateString("en-GB")}</div>
      </div>`).join("") || `<p class="acc-empty">No pending requests.</p>`;
    // Active auctions
    const { data: activeAuctions } = await c.from("auctions").select("title, status, winning_bid, closes_at").in("status",["live","closing","scheduled"]).order("opens_at").limit(6);
    const aab = $("#dash-auctions");
    aab.innerHTML = (activeAuctions || []).map(a =>
      `<div class="adm-item" style="display:flex;justify-content:space-between;padding:10px 14px">
        <div><span class="adm-stat-lbl">${esc(a.status).toUpperCase()}</span> &nbsp;${esc(a.title)}</div>
        <div style="font-size:13px;color:var(--muted)">Top: ${a.winning_bid || "—"} cr · closes ${new Date(a.closes_at).toLocaleDateString("en-GB")}</div>
      </div>`).join("") || `<p class="acc-empty">No active auctions.</p>`;
  }

  /* ---------------- Cover Edit Requests ---------------- */
  async function loadEditRequests() {
    const { data, error } = await client().from("cover_edit_requests").select("*").order("created_at", { ascending: false });
    const box = $("#edit-req-list");
    if (error) { box.innerHTML = `<p class="acc-empty">Error: ${esc(error.message)}</p>`; return; }
    if (!data || !data.length) { box.innerHTML = `<p class="acc-empty">No cover edit requests yet.</p>`; return; }
    box.innerHTML = "";
    data.forEach(r => {
      const el = document.createElement("div");
      el.className = "adm-item";
      const statusColor = r.status === "pending" ? "var(--gold)" : r.status === "delivered" ? "#6dca6d" : "var(--muted)";
      el.innerHTML = `
        <div class="adm-item-main" style="flex:1">
          <div style="font-weight:600">${esc(r.item_code)} — ${esc(r.artist_name)} · <em>${esc(r.song_title)}</em></div>
          <div style="font-size:13px;color:var(--muted);margin-top:4px">${esc(r.contact_email)} · £${r.fee_gbp} · ${new Date(r.created_at).toLocaleDateString("en-GB")}</div>
          ${r.extra_notes ? `<div style="font-size:12px;color:var(--faint);margin-top:2px">Notes: ${esc(r.extra_notes)}</div>` : ""}
          ${r.delivered_url ? `<div style="font-size:12px;margin-top:4px"><a href="${esc(r.delivered_url)}" target="_blank" style="color:var(--gold)">Delivered file ↗</a></div>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:140px">
          <span style="color:${statusColor};font-size:12px;font-weight:700;text-transform:uppercase">${esc(r.status)}</span>
          ${r.status === "pending" ? `
            <input type="url" placeholder="Delivered file URL" style="font-size:12px;padding:4px 8px;background:var(--bg-3);border:1px solid var(--line);border-radius:6px;color:var(--text);width:200px" class="er-url">
            <button class="btn btn-primary" style="font-size:12px;padding:4px 12px" data-id="${esc(r.id)}">Mark Delivered</button>
          ` : ""}
        </div>`;
      const deliverBtn = el.querySelector("button[data-id]");
      if (deliverBtn) {
        deliverBtn.addEventListener("click", async () => {
          const url = el.querySelector(".er-url").value.trim();
          const { error: e } = await client().from("cover_edit_requests").update({ status: "delivered", delivered_url: url || null, updated_at: new Date().toISOString() }).eq("id", r.id);
          flash(deliverBtn, e ? "Error" : "Done!");
          if (!e) loadEditRequests();
        });
      }
      box.appendChild(el);
    });
  }

  /* ---------------- Item Codes ---------------- */
  async function loadItemCodes() {
    const { data, error } = await client().from("item_codes").select("*").order("item_code");
    const box = $("#item-code-list");
    if (error) { box.innerHTML = `<p class="acc-empty">Error: ${esc(error.message)}</p>`; return; }
    if (!data || !data.length) { box.innerHTML = `<p class="acc-empty">No item codes yet. Add one above.</p>`; return; }
    box.innerHTML = "";
    data.forEach(ic => {
      const el = document.createElement("div");
      el.className = "adm-item";
      el.innerHTML = `
        <div class="adm-item-main" style="flex:1">
          <div style="font-weight:600;font-family:var(--ff-display)">${esc(ic.item_code)}</div>
          <div style="font-size:13px;color:var(--muted)">${esc(ic.item_type)} · ${esc(ic.title || "—")}</div>
        </div>
        <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:${ic.is_sold ? '#e86d6d' : '#6dca6d'}">${ic.is_sold ? "SOLD" : "AVAILABLE"}</span>`;
      box.appendChild(el);
    });
  }

  $("#item-new").addEventListener("click", () => { $("#item-form-wrap").style.display = "block"; });
  $("#item-form-cancel").addEventListener("click", () => { $("#item-form-wrap").style.display = "none"; });
  $("#item-form-save").addEventListener("click", async () => {
    const type = $("#ic-type").value, code = $("#ic-code").value.trim(), title = $("#ic-title").value.trim(), img = $("#ic-img").value.trim();
    if (!code || !type) { alert("Item type and code are required."); return; }
    const slug = code.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const { error } = await client().from("item_codes").insert({ item_type: type, item_slug: slug, item_code: code, title: title || null, image_url: img || null });
    if (error) { alert(error.message); return; }
    $("#item-form-wrap").style.display = "none";
    loadItemCodes();
  });

  /* ---------------- Credits / Membership ---------------- */
  document.addEventListener("click", async e => {
    if (e.target.id === "cr-adjust-btn") {
      const email = $("#cr-email").value.trim();
      const amount = parseInt($("#cr-amount").value);
      const note = $("#cr-note").value.trim();
      const res = $("#cr-adjust-result");
      if (!email || isNaN(amount)) { res.textContent = "Email and amount required."; return; }
      // Look up user by email via profiles
      const { data: prof } = await client().from("profiles").select("id").eq("email", email).maybeSingle();
      if (!prof) { res.textContent = "User not found: " + email; return; }
      const { error } = await client().from("credit_ledger").insert({ user_id: prof.id, amount, type: "manual_admin", note: note || "Manual admin adjustment" });
      res.textContent = error ? "Error: " + error.message : `Done — ${amount > 0 ? "+" : ""}${amount} cr applied to ${email}.`;
    }
    if (e.target.id === "mem-activate-btn" || e.target.id === "mem-remove-btn") {
      const email = $("#mem-email").value.trim();
      const isMember = e.target.id === "mem-activate-btn";
      const res = $("#mem-result");
      if (!email) { res.textContent = "Email required."; return; }
      const { data: prof } = await client().from("profiles").select("id").eq("email", email).maybeSingle();
      if (!prof) { res.textContent = "User not found: " + email; return; }
      const { error } = await client().from("profiles").update({ is_member: isMember }).eq("id", prof.id);
      res.textContent = error ? "Error: " + error.message : `Membership ${isMember ? "activated" : "removed"} for ${email}.`;
    }
  });

  /* ---------------- helpers ---------------- */
  function flash(btn, msg) { const t = btn.textContent; btn.textContent = msg; btn.disabled = true; setTimeout(() => { btn.textContent = t; btn.disabled = false; }, 1200); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
})();
