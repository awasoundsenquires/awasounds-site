/* AWA SOUNDS — CMS reader (public side)
   Pulls the beat catalogue and editable text blocks from Supabase so the
   admin panel can change them with no code. Falls back to config.js when
   Supabase is not configured or a fetch fails, so the site always renders.
   Load AFTER config.js + auth.js, BEFORE store.js. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const client = (window.AWAAuth && AWAAuth.client && AWAAuth.client()) || null;

  /* Map a Supabase beats row → the shape store.js expects (config.js style). */
  function rowToBeat(r) {
    return {
      id: r.id, title: r.title, producer: r.producer || "AWA",
      bpm: r.bpm, key: r.music_key || "", tags: r.tags || [],
      cover: r.cover_url || "", preview: r.preview_url || "",
      pay: { mp3: r.pay_mp3 || "", wav: r.pay_wav || "", trackout: r.pay_trackout || "" }
    };
  }

  async function loadBeats() {
    if (!client) return CFG.beats || [];
    try {
      const { data, error } = await client.from("beats").select("*").eq("active", true).order("sort");
      if (error || !data || !data.length) return CFG.beats || [];
      return data.map(rowToBeat);
    } catch (e) { return CFG.beats || []; }
  }

  async function loadContent() {
    if (!client) return {};
    try {
      const { data } = await client.from("site_content").select("key,value");
      const map = {};
      (data || []).forEach(r => map[r.key] = r.value);
      return map;
    } catch (e) { return {}; }
  }

  /* Swap any element with data-cms="key" for its stored value. */
  async function applyContent() {
    const nodes = document.querySelectorAll("[data-cms]");
    if (!nodes.length) return;
    const map = await loadContent();
    nodes.forEach(el => {
      const v = map[el.getAttribute("data-cms")];
      if (v == null || v === "") return;
      if (el.dataset.cmsHtml === "true") el.innerHTML = v;
      else el.textContent = v;
    });
  }

  const beatsPromise = loadBeats();

  window.AWACMS = {
    hasBackend: !!client,
    beats: () => beatsPromise,
    content: loadContent
  };

  document.addEventListener("DOMContentLoaded", applyContent);
})();
