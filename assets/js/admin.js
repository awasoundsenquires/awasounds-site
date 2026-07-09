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
    loadBeats(); loadContent();
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

  /* ---------------- helpers ---------------- */
  function flash(btn, msg) { const t = btn.textContent; btn.textContent = msg; btn.disabled = true; setTimeout(() => { btn.textContent = t; btn.disabled = false; }, 1200); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
})();
