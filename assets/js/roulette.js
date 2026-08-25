/* AWA SOUNDS — Roulette, streaks, promo codes, album packs */
(function () {
  "use strict";

  const CFG  = window.AWA || {};
  const PRIZES = CFG.roulettePrizes || [];

  // ── helpers ───────────────────────────────────────────────
  const rpc = (fn, body = {}) => fetch(
    `${CFG.supabaseUrl}/rest/v1/rpc/${fn}`,
    { method:"POST",
      headers:{ "apikey":CFG.supabaseAnonKey,
                "Authorization":"Bearer "+(window.AWA_SESSION?.access_token||CFG.supabaseAnonKey),
                "Content-Type":"application/json" },
      body: JSON.stringify(body) }
  ).then(r => r.json());

  const api = (path, opts = {}) => fetch(
    `${CFG.supabaseUrl}/rest/v1/${path}`,
    { headers:{ "apikey":CFG.supabaseAnonKey,
                "Authorization":"Bearer "+(window.AWA_SESSION?.access_token||CFG.supabaseAnonKey),
                "Content-Type":"application/json",
                "Prefer":"return=representation", ...opts.headers },
      ...opts }
  ).then(r => r.json());

  // ── Weighted random prize picker ──────────────────────────
  function pickPrize() {
    const total = PRIZES.reduce((s, p) => s + p.weight, 0);
    let rand = Math.random() * total;
    for (const p of PRIZES) { rand -= p.weight; if (rand <= 0) return p; }
    return PRIZES[0];
  }

  // ── Canvas wheel renderer ─────────────────────────────────
  function drawWheel(canvas, rotation) {
    const ctx  = canvas.getContext("2d");
    const cx   = canvas.width  / 2;
    const cy   = canvas.height / 2;
    const r    = cx - 4;
    const n    = PRIZES.length;
    const arc  = (2 * Math.PI) / n;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    PRIZES.forEach((prize, i) => {
      const start = rotation + i * arc - Math.PI / 2;
      const end   = start + arc;
      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = prize.color || "#1a1a2a";
      ctx.fill();
      // Segment border
      ctx.strokeStyle = "rgba(217,195,143,.15)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#d9c38f";
      ctx.font      = `bold ${Math.max(10, Math.floor(r * 0.095))}px 'Space Grotesk', sans-serif`;
      ctx.fillText(prize.emoji + " " + prize.label, r - 10, 4);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(217,195,143,.35)";
    ctx.lineWidth   = 3;
    ctx.stroke();
  }

  // ── Spin animation ────────────────────────────────────────
  function spinWheel(canvas, winIndex, onDone) {
    const n       = PRIZES.length;
    const arcSize = (2 * Math.PI) / n;
    // Target rotation: land winIndex segment under the pointer (top = -π/2)
    const targetAngle = -(winIndex * arcSize) - arcSize / 2;
    const totalSpin   = 5 * 2 * Math.PI + targetAngle; // 5 full rotations + target
    const duration    = 4500;
    const start       = performance.now();
    let   rotation    = 0;

    function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

    function frame(now) {
      const t    = Math.min((now - start) / duration, 1);
      rotation   = totalSpin * easeOut(t);
      drawWheel(canvas, rotation);
      if (t < 1) { requestAnimationFrame(frame); }
      else { onDone(rotation); }
    }
    requestAnimationFrame(frame);
  }

  // ── Roulette modal ────────────────────────────────────────
  function buildRouletteModal(spinType) {
    const overlay = document.createElement("div");
    overlay.className = "roulette-overlay";
    overlay.innerHTML = `
      <div class="roulette-card">
        <div class="roulette-eyebrow">Welcome to Awa Sounds</div>
        <h2 class="roulette-title">Spin for your gift 🎁</h2>
        <p class="roulette-sub">Every new member gets one spin. Win credits, discounts, or an exclusive deal.</p>
        <div class="wheel-wrap">
          <div class="wheel-pointer"></div>
          <canvas class="wheel-canvas" id="roulette-canvas" width="260" height="260"></canvas>
          <div class="wheel-center">✦</div>
        </div>
        <button class="spin-btn" id="spin-btn">Spin the Wheel</button>
        <div class="prize-reveal" id="prize-reveal">
          <div class="prize-emoji" id="prize-emoji"></div>
          <div class="prize-name"  id="prize-name"></div>
          <div class="prize-desc"  id="prize-desc"></div>
          <div class="prize-code-wrap" id="prize-code-wrap" style="display:none">
            <div class="prize-code" id="prize-code"></div>
            <div class="prize-code-hint">Use this code at checkout. Valid 30 days.</div>
          </div>
          <button class="btn btn-gold" id="prize-close" style="width:100%">Continue to Awa Sounds →</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const canvas   = overlay.querySelector("#roulette-canvas");
    const spinBtn  = overlay.querySelector("#spin-btn");
    const reveal   = overlay.querySelector("#prize-reveal");
    const closeBtn = overlay.querySelector("#prize-close");

    drawWheel(canvas, 0);

    spinBtn.addEventListener("click", async () => {
      spinBtn.disabled    = true;
      spinBtn.textContent = "Spinning…";
      const prize = pickPrize();
      const winIndex = PRIZES.indexOf(prize);

      spinWheel(canvas, winIndex, async () => {
        // Claim server-side
        const res = await rpc("claim_spin", {
          p_spin_type:   spinType || "welcome",
          p_prize_type:  prize.type,
          p_prize_value: prize.value ? String(prize.value) : null,
          p_prize_label: prize.label
        });

        // Show prize
        overlay.querySelector("#prize-emoji").textContent = prize.emoji;
        overlay.querySelector("#prize-name").textContent  = prize.label;

        let desc = "";
        let code = null;
        if (prize.type === "credits") {
          desc = `${prize.value} AWA Credits have been added to your account instantly! Use them to bid in auctions or get discounts in the store.`;
        } else if (prize.type === "discount_pct") {
          desc = `You've won ${prize.value}% off your next purchase. Your discount code is below — apply it at checkout.`;
          code = "SPIN-" + prize.id.toUpperCase() + "-" + Date.now().toString(36).slice(-4).toUpperCase();
        } else if (prize.type === "two_for_one") {
          desc = "Buy any cover art and get a second one absolutely free. Your promo code is below — use it at checkout.";
          code = "2FOR1COVER";
        } else if (prize.type === "free_edit") {
          desc = "You've won a free cover edit (song title + artist name change). Contact us with your image code and mention this prize.";
        } else if (prize.type === "album_discount") {
          desc = `${prize.value}% off any Album Pack. Your discount code is below.`;
          code = "PACKDEAL";
        }

        overlay.querySelector("#prize-desc").textContent = desc;
        if (code) {
          overlay.querySelector("#prize-code-wrap").style.display = "block";
          overlay.querySelector("#prize-code").textContent = code;
        }
        reveal.classList.add("show");
        spinBtn.style.display = "none";
      });
    });

    closeBtn.addEventListener("click", () => { overlay.remove(); });
    return overlay;
  }

  // ── Check and trigger welcome spin ───────────────────────
  async function maybeShowWelcomeSpin() {
    if (!window.AWA_SESSION) return;
    const uid  = window.AWA_SESSION.user.id;
    const rows = await api(`profiles?id=eq.${uid}&select=welcome_spin_claimed,extra_spins`);
    const prof = rows?.[0];
    if (!prof || prof.welcome_spin_claimed) return;
    // Small delay so page loads first
    setTimeout(() => buildRouletteModal("welcome"), 1200);
  }

  // ── Login streak ─────────────────────────────────────────
  async function recordStreak() {
    if (!window.AWA_SESSION) return;
    const res = await rpc("record_login_streak");
    if (res?.bonus_credits > 0 && !res.already_logged) {
      showStreakToast(res.streak, res.bonus_credits);
    }
    // Update streak widget if present
    const streakVal = document.getElementById("streak-value");
    if (streakVal && res?.streak) streakVal.textContent = res.streak;
  }

  function showStreakToast(streak, bonus) {
    const t = document.createElement("div");
    t.className = "streak-bonus-toast";
    t.textContent = `🔥 Day ${streak} streak! +${bonus} bonus credits awarded`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3800);
  }

  // ── Promo code validation ─────────────────────────────────
  window.validatePromoCode = async function(code, resultEl) {
    if (!code) return null;
    const res = await rpc("validate_promo", { p_code: code.trim().toUpperCase() });
    if (!resultEl) return res;
    resultEl.className = "promo-result " + (res.ok ? "ok" : "err");
    if (res.ok) {
      const descs = {
        percentage_off: `✓ ${res.value}% off applied`,
        credits_bonus:  `✓ ${res.value} bonus credits on purchase`,
        two_for_one:    `✓ Buy one cover, get one free`,
        album_discount: `✓ ${res.value}% off any Album Pack`,
        free_edit:      `✓ Free cover edit included`
      };
      resultEl.textContent = descs[res.type] || "✓ Promo code valid";
    } else {
      const errs = {
        invalid_code: "✗ Code not found",
        expired:      "✗ This code has expired",
        already_used: "✗ You've already used this code",
        used_up:      "✗ This code is fully redeemed",
        not_yet_active: "✗ This code isn't active yet"
      };
      resultEl.textContent = errs[res.error] || "✗ Invalid code";
    }
    return res;
  };

  // Wire promo inputs on the page
  document.querySelectorAll(".promo-apply-btn").forEach(btn => {
    const wrap  = btn.closest(".promo-input-section") || btn.parentElement;
    const input = wrap.querySelector(".promo-input");
    const res   = wrap.querySelector(".promo-result");
    if (!input) return;
    btn.addEventListener("click", () => validatePromoCode(input.value, res));
    input.addEventListener("keydown", e => { if (e.key === "Enter") validatePromoCode(input.value, res); });
  });

  // ── Album Packs render ────────────────────────────────────
  function renderAlbumPacks() {
    const container = document.getElementById("album-packs-grid");
    if (!container) return;
    const packs  = CFG.albumPacks || [];
    const covers = CFG.covers     || [];
    const isMem  = window.AWAAuth?.isMember?.() || false;

    container.innerHTML = packs.map(pack => {
      const coverImgs = pack.coverIds
        .map(id => covers.find(c => c.id === id))
        .filter(Boolean).slice(0, 8);
      const mosaicHTML = coverImgs.slice(0,4).map(c =>
        c.img
          ? `<img class="pack-mosaic-img" src="${c.img}" alt="${c.title}" loading="lazy">`
          : `<div class="pack-mosaic-ph"></div>`
      ).join("") + (coverImgs.length < 4
        ? Array(4 - coverImgs.length).fill('<div class="pack-mosaic-ph"></div>').join("")
        : "");

      const displayPrice = (isMem && pack.memberPriceGBP) ? pack.memberPriceGBP : pack.priceGBP;
      const count = pack.coverIds.length;
      const perPiece = (displayPrice / count).toFixed(2);

      return `
      <div class="pack-card" data-pack="${pack.id}">
        ${pack.tag ? `<div class="pack-card-tag">${pack.tag}</div>` : ""}
        <div class="pack-mosaic">${mosaicHTML}</div>
        <div class="pack-body">
          <div class="pack-title">${pack.title}</div>
          <div class="pack-subtitle">${count} unique pieces · ${pack.subtitle}</div>
          <div class="pack-mood">${pack.mood}</div>
          <div class="pack-meta">
            <div class="pack-price-block">
              <div class="pack-price-main">£${displayPrice}</div>
              <div class="pack-price-sub">£${perPiece}/cover · usually £${(39 * count).toLocaleString()}</div>
              ${isMem && pack.memberPriceGBP ? `<div class="pack-price-member">Insider price applied ✓</div>` : ""}
            </div>
            <div class="pack-avail">
              ${pack.available ? `<b>${pack.available}</b> left` : "In stock"}<br>
              <span style="font-size:10px">${pack.code}</span>
            </div>
          </div>
          <button class="btn btn-gold" style="width:100%;margin-top:16px" onclick="buyAlbumPack('${pack.id}')">
            Get the Pack →
          </button>
        </div>
      </div>`;
    }).join("");
  }

  window.buyAlbumPack = function(packId) {
    const pack = (CFG.albumPacks || []).find(p => p.id === packId);
    if (!pack) return;
    if (!window.AWA_SESSION) { location.href = "account.html"; return; }
    // Show a confirmation modal then redirect to contact/pay
    const msg = `Ready to get ${pack.title}?\n\n${pack.coverIds.length} unique covers for £${pack.priceGBP}.\n\nWe'll send payment instructions to your registered email.`;
    if (confirm(msg)) {
      // Log pack interest — in future wire to GoDaddy Pay Link
      const email = window.AWA_SESSION.user.email;
      window.location.href = `contact.html?subject=Album Pack — ${encodeURIComponent(pack.title)}&body=I'd like to purchase ${encodeURIComponent(pack.title)} (${pack.code}). My account email is ${encodeURIComponent(email)}.`;
    }
  };

  // ── Promo banner render ───────────────────────────────────
  function renderPromoBanners() {
    const wrap = document.getElementById("promo-banner");
    if (!wrap) return;
    const promos = CFG.activePromos || [];
    if (!promos.length) { wrap.style.display = "none"; return; }
    wrap.innerHTML = `<div class="promo-banner-wrap"><div class="promo-banner">${
      promos.map(p => `
        <div class="promo-pill" onclick="applyPromoBanner('${p.code}')">
          <span class="promo-pill-tag">${p.type === "two_for_one" ? "2 for 1" : p.type === "bundle" ? "Bundle" : "Offer"}</span>
          <span>${p.label}</span>
          ${p.code ? `<span style="font-family:monospace;font-size:11px;opacity:.6">${p.code}</span>` : ""}
        </div>`).join("")
    }</div></div>`;
  }

  window.applyPromoBanner = function(code) {
    // Copy code to clipboard and show toast
    navigator.clipboard?.writeText(code).catch(()=>{});
    const t = document.createElement("div");
    t.className = "streak-bonus-toast";
    t.textContent = `✓ Code "${code}" copied — apply at checkout`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  };

  // ── Referral code setup ───────────────────────────────────
  async function setupReferral() {
    const box = document.getElementById("referral-code-display");
    if (!box || !window.AWA_SESSION) return;
    const uid  = window.AWA_SESSION.user.id;
    const rows = await api(`profiles?id=eq.${uid}&select=referral_code`);
    let code   = rows?.[0]?.referral_code;
    if (!code) {
      // Generate one
      code = "AWA-" + uid.slice(0,6).toUpperCase();
      await api(`profiles?id=eq.${uid}`, { method:"PATCH", body: JSON.stringify({ referral_code: code }) });
    }
    const link = `${location.origin}/index.html?ref=${code}`;
    box.innerHTML = `
      <div class="referral-box">
        <h4 style="margin-bottom:8px">Refer a friend — both get 25 cr</h4>
        <p class="adm-hint">Share your link. When they make their first purchase, you both earn 25 AWA Credits instantly.</p>
        <div class="referral-link-row">
          <input class="referral-link-input" readonly value="${link}" id="ref-link-input">
          <button class="btn btn-ghost" onclick="copyReferral()">Copy</button>
        </div>
      </div>`;
    window.copyReferral = () => {
      navigator.clipboard?.writeText(link);
      const btn = document.querySelector(".referral-link-row .btn");
      if (btn) { btn.textContent = "Copied!"; setTimeout(() => btn.textContent = "Copy", 2000); }
    };
  }

  // ── Check referral param on landing ──────────────────────
  function checkReferralParam() {
    const ref = new URLSearchParams(location.search).get("ref");
    if (ref) sessionStorage.setItem("awa_ref", ref);
  }

  // ── Init ──────────────────────────────────────────────────
  checkReferralParam();
  renderPromoBanners();
  renderAlbumPacks();

  // These fire after auth state is known
  if (window.AWAAuth) {
    AWAAuth.onChange(async (sess) => {
      if (!sess) return;
      await recordStreak();
      await maybeShowWelcomeSpin();
      await setupReferral();
    });
  } else {
    // Fallback: check 1s after load
    setTimeout(async () => {
      if (!window.AWA_SESSION) return;
      await recordStreak();
      await maybeShowWelcomeSpin();
      await setupReferral();
    }, 1000);
  }

})();
