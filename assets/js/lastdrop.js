/* AWA SOUNDS — Last Drop social proof toasts
   Shows recent purchase activity to build FOMO & trust.
   Fires 3-5 times per session, 12s apart, auto-dismisses after 5s. */
(function () {
  "use strict";

  const POOL = [
    { type:"beat",   name:"Chrome Nights",    tier:"WAV Lease",  loc:"Manchester" },
    { type:"cover",  name:"Mercury",                              loc:"London" },
    { type:"beat",   name:"Lagos After Dark", tier:"MP3 Lease",  loc:"Leeds" },
    { type:"member",                                              loc:"Birmingham" },
    { type:"beat",   name:"African Stamina",  tier:"Trackout",   loc:"Bristol" },
    { type:"cover",  name:"Ember Fold",                          loc:"Glasgow" },
    { type:"beat",   name:"No Cosign",        tier:"WAV Lease",  loc:"Nottingham" },
    { type:"cover",  name:"Champagne",                           loc:"Sheffield" },
    { type:"beat",   name:"Ember Room",       tier:"Exclusive",  loc:"Edinburgh" },
    { type:"member",                                              loc:"Cardiff" },
    { type:"beat",   name:"Silver Static",    tier:"MP3 Lease",  loc:"Newcastle" },
    { type:"cover",  name:"Violet Drift",                        loc:"Leicester" },
  ];

  const AGO = ["just now","1 min ago","2 min ago","4 min ago","6 min ago","11 min ago","18 min ago","27 min ago","34 min ago","48 min ago"];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildToast(item, ago) {
    const wrap = document.createElement("div");
    wrap.className = "ld-toast";

    let icon, msg;
    if (item.type === "cover") {
      icon = "🖼️";
      msg = `Someone from <b>${item.loc}</b> just purchased <b>${item.name}</b> cover art`;
    } else if (item.type === "member") {
      icon = "✦";
      msg = `Someone from <b>${item.loc}</b> just became an <b>Insider Member</b>`;
    } else {
      icon = "🎵";
      const tierStr = item.tier ? ` <span class="ld-tier">${item.tier}</span>` : "";
      msg = `Someone from <b>${item.loc}</b> just licensed <b>${item.name}</b>${tierStr}`;
    }

    wrap.innerHTML = `
      <span class="ld-icon">${icon}</span>
      <div class="ld-body">
        <div class="ld-msg">${msg}</div>
        <div class="ld-time">${ago}</div>
      </div>
      <button class="ld-x" aria-label="Dismiss">×</button>`;

    wrap.querySelector(".ld-x").addEventListener("click", () => out(wrap));
    return wrap;
  }

  function out(el) {
    el.classList.add("ld-out");
    setTimeout(() => el.remove(), 380);
  }

  function init() {
    if (window.innerWidth < 500) return;
    const container = Object.assign(document.createElement("div"), { id: "ld-wrap" });
    document.body.appendChild(container);

    const pool = shuffle([...POOL]);
    const agoPool = shuffle([...AGO]);
    let idx = 0;
    const MAX = Math.min(pool.length, 4);

    function next() {
      if (idx >= MAX) return;
      const toast = buildToast(pool[idx], agoPool[idx % agoPool.length]);
      idx++;
      container.appendChild(toast);
      requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("ld-in")));
      const tid = setTimeout(() => { if (toast.isConnected) out(toast); }, 5200);
      toast.querySelector(".ld-x").addEventListener("click", () => clearTimeout(tid), { once: true });
      if (idx < MAX) setTimeout(next, 13000);
    }

    setTimeout(next, 7000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
