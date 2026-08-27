/* AWA SOUNDS — Roulette wheel + engagement UI */
(function () {
  "use strict";

  const CFG   = window.AWA || {};
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

  // ── Casino segment palette ────────────────────────────────
  const CASINO_COLORS = [
    '#b8192a','#1a4b9e','#0d1b3e','#9a1222',
    '#163d8c','#0b1630','#7a4e12','#c01e30'
  ];

  function tint(hex, amt) {
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const c=v=>Math.max(0,Math.min(255,v+amt));
    return`rgb(${c(r)},${c(g)},${c(b)})`;
  }

  // ── Casino-style canvas wheel renderer ───────────────────
  function drawWheel(canvas, rotation) {
    const ctx = canvas.getContext("2d");
    const SZ  = canvas.width;
    const CX  = SZ/2, CY = SZ/2;
    const R   = SZ * 0.44;
    const BEZEL_OUT = R + SZ * 0.052;
    const n   = PRIZES.length;
    const arc = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, SZ, SZ);

    // Drop shadow
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.88)'; ctx.shadowBlur=30; ctx.shadowOffsetY=12;
    ctx.beginPath(); ctx.arc(CX,CY,BEZEL_OUT,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,.01)'; ctx.fill();
    ctx.restore();

    // Black base disc
    ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
    ctx.fillStyle='#04040c'; ctx.fill();

    // Segments
    for (let i=0;i<n;i++) {
      const s=rotation+i*arc-Math.PI/2, e=s+arc, m=s+arc/2;
      const base = CASINO_COLORS[i % CASINO_COLORS.length];

      ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,R-2,s,e); ctx.closePath();
      const rg=ctx.createRadialGradient(CX,CY,R*.04,CX,CY,R);
      rg.addColorStop(0,'rgba(0,0,0,.8)');
      rg.addColorStop(.22,tint(base,-30));
      rg.addColorStop(.52,base);
      rg.addColorStop(.76,tint(base,30));
      rg.addColorStop(.9, tint(base,12));
      rg.addColorStop(1,  tint(base,-22));
      ctx.fillStyle=rg; ctx.fill();

      // Gloss sheen arc
      ctx.save();
      ctx.beginPath(); ctx.moveTo(CX,CY);
      ctx.arc(CX,CY,R-2,s+arc*.05,s+arc*.44); ctx.closePath();
      const gg=ctx.createRadialGradient(CX,CY,R*.58,CX,CY,R-3);
      gg.addColorStop(0,'rgba(255,255,255,0)');
      gg.addColorStop(.7,'rgba(255,255,255,.04)');
      gg.addColorStop(1,'rgba(255,255,255,.16)');
      ctx.fillStyle=gg; ctx.fill();
      ctx.restore();
    }

    // Gold spokes
    for (let i=0;i<n;i++) {
      const a=rotation+i*arc-Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(CX+5*Math.cos(a),CY+5*Math.sin(a));
      ctx.lineTo(CX+(R-1)*Math.cos(a),CY+(R-1)*Math.sin(a));
      ctx.strokeStyle='#c0980c'; ctx.lineWidth=3; ctx.stroke();
      ctx.strokeStyle='rgba(255,228,100,.24)'; ctx.lineWidth=1; ctx.stroke();
    }

    // Labels
    for (let i=0;i<n;i++) {
      const s=rotation+i*arc-Math.PI/2, m=s+arc/2;
      ctx.save();
      ctx.translate(CX+(R*.63)*Math.cos(m),CY+(R*.63)*Math.sin(m));
      ctx.rotate(m+Math.PI/2);
      ctx.textAlign='center'; ctx.textBaseline='middle';

      ctx.font=`${Math.round(R*.11)}px serif`;
      ctx.globalAlpha=.9;
      ctx.fillText(PRIZES[i].emoji||'',0,-R*.1);
      ctx.globalAlpha=1;

      ctx.font=`700 ${Math.round(R*.072)}px 'Space Grotesk',sans-serif`;
      ctx.fillStyle='#f2e090';
      ctx.shadowColor='rgba(0,0,0,.95)'; ctx.shadowBlur=5;
      ctx.fillText(PRIZES[i].label||'',0,R*.043);
      ctx.restore();
    }

    // Dark inner ring between bezel and segments
    ctx.beginPath(); ctx.arc(CX,CY,R+1,0,Math.PI*2);
    ctx.strokeStyle='#060610'; ctx.lineWidth=9; ctx.stroke();

    // Gold bezel ring
    const bg=ctx.createLinearGradient(CX-BEZEL_OUT,CY-BEZEL_OUT,CX+BEZEL_OUT,CY+BEZEL_OUT);
    bg.addColorStop(0,   '#3e2c06');
    bg.addColorStop(.08, '#c89a1a');
    bg.addColorStop(.18, '#f0d84e');
    bg.addColorStop(.3,  '#c0880e');
    bg.addColorStop(.48, '#e8c038');
    bg.addColorStop(.6,  '#9e6e08');
    bg.addColorStop(.72, '#d0a020');
    bg.addColorStop(.85, '#e0b830');
    bg.addColorStop(1,   '#3e2c06');
    ctx.beginPath();
    ctx.arc(CX,CY,BEZEL_OUT,0,Math.PI*2,false);
    ctx.arc(CX,CY,R+6,0,Math.PI*2,true);
    ctx.fillStyle=bg; ctx.fill();

    // Bezel outer shadow edge
    ctx.beginPath(); ctx.arc(CX,CY,BEZEL_OUT-1,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,0,0,.7)'; ctx.lineWidth=4; ctx.stroke();

    // Bezel inner bright edge
    ctx.beginPath(); ctx.arc(CX,CY,R+7,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,228,110,.38)'; ctx.lineWidth=1.6; ctx.stroke();

    // Bezel specular top-left sheen
    const sg=ctx.createLinearGradient(CX-BEZEL_OUT*.9,CY-BEZEL_OUT*.9,CX+BEZEL_OUT*.2,CY+BEZEL_OUT*.2);
    sg.addColorStop(0,'rgba(255,255,210,.26)');
    sg.addColorStop(.4,'rgba(255,245,160,.08)');
    sg.addColorStop(1,'rgba(255,245,160,0)');
    ctx.beginPath();
    ctx.arc(CX,CY,BEZEL_OUT-2,0,Math.PI*2,false);
    ctx.arc(CX,CY,R+8,0,Math.PI*2,true);
    ctx.fillStyle=sg; ctx.fill();
  }

  // ── Corrected exponential-friction spin ───────────────────
  // Physics: vel *= FRICTION^(dt/DT) each frame (frame-rate independent).
  // Velocity formula corrects for the stop threshold so the wheel
  // naturally halts near the target — NO snap correction at end.
  // Winner is read from the actual stopped angle.
  function spinWheel(canvas, ptrEl, winIndex, onDone) {
    const n   = PRIZES.length;
    const ARC = (2 * Math.PI) / n;
    const FRICTION  = 0.984;
    const DT        = 0.01667; // 60fps frame time (s)
    const STOP_VEL  = 0.04;    // rad/s — below this we consider stopped
    const CS = 22, CD = 5.5;   // clapper spring / damping

    let rotation = 0;
    let vel = 0;
    let cA = 0, cV = 0, lastSeg = -1;

    function clapperTick(wheelVel, dt) {
      // Which segment is at the pointer (top)?
      const norm = (((-rotation) % (Math.PI*2)) + (Math.PI*2)) % (Math.PI*2);
      const seg  = Math.floor(norm / ARC);
      if (seg !== lastSeg && lastSeg !== -1) {
        // Clockwise spin (vel>0) → surface at top goes LEFT → crystal deflects LEFT (−)
        cV += -Math.sign(wheelVel) * Math.min(Math.abs(wheelVel) * 0.28, 3.0);
      }
      lastSeg = seg;
      cV += (-CS*cA - CD*cV) * dt;
      cA += cV * dt;
      cA = Math.max(-1, Math.min(1, cA));
      if (ptrEl) ptrEl.style.transform = `translateX(-50%) rotate(${cA}rad)`;
    }

    // Target angle: winner segment centre at the top pointer
    const winTarget = -(winIndex * ARC + ARC/2);
    const fullRots  = (6 + Math.floor(Math.random() * 4)) * Math.PI * 2;

    // Forward distance from 0 to winTarget (within one revolution), then add full rotations
    const dist = ((winTarget % (Math.PI*2)) + (Math.PI*2)) % (Math.PI*2);
    const totalDist = fullRots + dist;

    // Corrected velocity: accounts for stop threshold (no snap needed)
    // dist = DT/(1−F) × (vel₀ − STOP_VEL)  ⟹  vel₀ = dist×(1−F)/DT + STOP_VEL
    vel = totalDist * (1 - FRICTION) / DT + STOP_VEL;

    let lastTs = performance.now();

    function frame(ts) {
      const dt = Math.min((ts - lastTs) / 1000, 0.04); lastTs = ts;
      vel *= Math.pow(FRICTION, dt / DT);
      rotation += vel * dt;
      clapperTick(vel, dt);
      drawWheel(canvas, rotation);

      if (Math.abs(vel) > STOP_VEL) {
        requestAnimationFrame(frame);
      } else {
        vel = 0;
        // Read actual winner — no snap, no sudden jump
        const norm       = (((-rotation) % (Math.PI*2)) + (Math.PI*2)) % (Math.PI*2);
        const actualIdx  = Math.floor(norm / ARC);

        // Settle clapper smoothly
        (function settle() {
          cV += (-CS*cA - CD*cV) * 0.016;
          cA += cV * 0.016;
          if (ptrEl) ptrEl.style.transform = `translateX(-50%) rotate(${cA}rad)`;
          if (Math.abs(cA) > 0.003 || Math.abs(cV) > 0.008) requestAnimationFrame(settle);
        })();

        onDone(rotation, actualIdx);
      }
    }
    requestAnimationFrame(frame);
  }

  // ── Roulette modal ────────────────────────────────────────
  function buildRouletteModal(spinType) {
    const overlay = document.createElement("div");
    overlay.className = "roulette-overlay";
    overlay.innerHTML = `
      <div class="roulette-card">
        <div class="roulette-eyebrow">Awa Sounds · Insider Reward</div>
        <h2 class="roulette-title">VAULT SPIN</h2>
        <p class="roulette-sub">Every new member gets one spin — win credits, discounts, or an exclusive deal.</p>

        <div class="wheel-wrap">
          <div class="wheel-ptr" id="wheel-ptr">
            <div class="wptr-bracket"></div>
            <div class="wptr-crystal"></div>
          </div>
          <canvas class="wheel-canvas" id="roulette-canvas" width="300" height="300"></canvas>
          <div class="wheel-center"></div>
          <div class="spin-hand" id="spin-hand">🖐️</div>
        </div>

        <div class="wheel-pedestal">
          <div class="ped-stem"></div>
          <div class="ped-base"></div>
        </div>

        <button class="spin-btn" id="spin-btn">Spin the Vault</button>

        <div class="prize-reveal" id="prize-reveal">
          <div class="prize-emoji" id="prize-emoji"></div>
          <div class="prize-name"  id="prize-name"></div>
          <div class="prize-desc"  id="prize-desc"></div>
          <div class="prize-code-wrap" id="prize-code-wrap" style="display:none">
            <div class="prize-code" id="prize-code"></div>
            <div class="prize-code-hint">Use this code at checkout. Valid 30 days.</div>
          </div>
          <button class="btn btn-gold" id="prize-close" style="width:100%;margin-top:4px">Continue to Awa Sounds →</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const canvas  = overlay.querySelector("#roulette-canvas");
    const ptrEl   = overlay.querySelector("#wheel-ptr");
    const spinBtn = overlay.querySelector("#spin-btn");
    const handEl  = overlay.querySelector("#spin-hand");
    const reveal  = overlay.querySelector("#prize-reveal");
    const closeBtn = overlay.querySelector("#prize-close");

    drawWheel(canvas, 0);

    spinBtn.addEventListener("click", async () => {
      spinBtn.disabled    = true;
      spinBtn.textContent = "Spinning…";

      const prize    = pickPrize();
      const winIndex = PRIZES.indexOf(prize);

      // Animated hand — appears, spins the wheel, exits
      handEl.style.display = 'block';
      handEl.classList.add('is-active');
      handEl.addEventListener('animationend', () => {
        handEl.style.display = 'none';
        handEl.classList.remove('is-active');
      }, { once: true });

      spinWheel(canvas, ptrEl, winIndex, async (finalRot, actualIdx) => {
        // Use the segment the pointer is ACTUALLY pointing at — no snap discrepancy
        const actualPrize = (PRIZES[actualIdx] !== undefined) ? PRIZES[actualIdx] : prize;

        // Claim server-side with the actual prize
        await rpc("claim_spin", {
          p_spin_type:   spinType || "welcome",
          p_prize_type:  actualPrize.type,
          p_prize_value: actualPrize.value ? String(actualPrize.value) : null,
          p_prize_label: actualPrize.label
        });

        // Build reveal
        overlay.querySelector("#prize-emoji").textContent = actualPrize.emoji || "🎁";
        overlay.querySelector("#prize-name").textContent  = actualPrize.label;

        let desc = "", code = null;
        if (actualPrize.type === "credits") {
          desc = `${actualPrize.value} AWA Credits have been added to your account instantly! Use them to bid in auctions or get discounts in the store.`;
        } else if (actualPrize.type === "discount_pct") {
          desc = `You've won ${actualPrize.value}% off your next purchase. Your discount code is below — apply it at checkout.`;
          code = "SPIN-" + (actualPrize.id||"DISC").toUpperCase() + "-" + Date.now().toString(36).slice(-4).toUpperCase();
        } else if (actualPrize.type === "two_for_one") {
          desc = "Buy any cover art and get a second one absolutely free. Your promo code is below — use it at checkout.";
          code = "2FOR1COVER";
        } else if (actualPrize.type === "free_edit") {
          desc = "You've won a free cover edit (song title + artist name change). Contact us with your image code and mention this prize.";
        } else if (actualPrize.type === "album_discount") {
          desc = `${actualPrize.value}% off any Album Pack. Your discount code is below.`;
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

    closeBtn.addEventListener("click", () => overlay.remove());
    return overlay;
  }

  // ── Check and trigger welcome spin ───────────────────────
  async function maybeShowWelcomeSpin() {
    if (!window.AWA_SESSION) return;
    const uid  = window.AWA_SESSION.user.id;
    const rows = await api(`profiles?id=eq.${uid}&select=welcome_spin_claimed,extra_spins`);
    const prof = rows?.[0];
    if (!prof || prof.welcome_spin_claimed) return;
    setTimeout(() => buildRouletteModal("welcome"), 1200);
  }

  // ── Login streak ─────────────────────────────────────────
  async function recordStreak() {
    if (!window.AWA_SESSION) return;
    const res = await rpc("record_login_streak");
    if (res?.bonus_credits > 0 && !res.already_logged) showStreakToast(res.streak, res.bonus_credits);
    const sv = document.getElementById("streak-value");
    if (sv && res?.streak) sv.textContent = res.streak;
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
        invalid_code:   "✗ Code not found",
        expired:        "✗ This code has expired",
        already_used:   "✗ You've already used this code",
        used_up:        "✗ This code is fully redeemed",
        not_yet_active: "✗ This code isn't active yet"
      };
      resultEl.textContent = errs[res.error] || "✗ Invalid code";
    }
    return res;
  };

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
        .filter(Boolean).slice(0, 4);
      const mosaicHTML = coverImgs.slice(0,4).map(c =>
        c.img
          ? `<img class="pack-mosaic-img" src="${c.img}" alt="${c.title}" loading="lazy">`
          : `<div class="pack-mosaic-ph"></div>`
      ).join("") + (coverImgs.length < 4
        ? Array(4-coverImgs.length).fill('<div class="pack-mosaic-ph"></div>').join("") : "");

      const displayPrice = (isMem && pack.memberPriceGBP) ? pack.memberPriceGBP : pack.priceGBP;
      const count = pack.coverIds.length;
      const perPiece = (displayPrice/count).toFixed(2);

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
              <div class="pack-price-sub">£${perPiece}/cover · usually £${(39*count).toLocaleString()}</div>
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
    const pack = (CFG.albumPacks||[]).find(p=>p.id===packId);
    if (!pack) return;
    if (!window.AWA_SESSION) { location.href="account.html"; return; }
    const msg=`Ready to get ${pack.title}?\n\n${pack.coverIds.length} unique covers for £${pack.priceGBP}.\n\nWe'll send payment instructions to your registered email.`;
    if (confirm(msg)) {
      const email=window.AWA_SESSION.user.email;
      window.location.href=`contact.html?subject=Album Pack — ${encodeURIComponent(pack.title)}&body=I'd like to purchase ${encodeURIComponent(pack.title)} (${pack.code}). My account email is ${encodeURIComponent(email)}.`;
    }
  };

  // ── Promo banner render ───────────────────────────────────
  function renderPromoBanners() {
    const wrap = document.getElementById("promo-banner");
    if (!wrap) return;
    const promos = CFG.activePromos || [];
    if (!promos.length) { wrap.style.display="none"; return; }
    wrap.innerHTML = `<div class="promo-banner-wrap"><div class="promo-banner">${
      promos.map(p=>`
        <div class="promo-pill" onclick="applyPromoBanner('${p.code}')">
          <span class="promo-pill-tag">${p.type==="buy_2_get_1"?"Buy 2 Get 1":p.type==="bundle"?"Bundle":"Offer"}</span>
          <span>${p.label}</span>
          ${p.code?`<span style="font-family:monospace;font-size:11px;opacity:.6">${p.code}</span>`:""}
        </div>`).join("")
    }</div></div>`;
  }

  window.applyPromoBanner = function(code) {
    navigator.clipboard?.writeText(code).catch(()=>{});
    const t=document.createElement("div");
    t.className="streak-bonus-toast";
    t.textContent=`✓ Code "${code}" copied — apply at checkout`;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),3200);
  };

  // ── Referral code setup ───────────────────────────────────
  async function setupReferral() {
    const box=document.getElementById("referral-code-display");
    if (!box||!window.AWA_SESSION) return;
    const uid=window.AWA_SESSION.user.id;
    const rows=await api(`profiles?id=eq.${uid}&select=referral_code`);
    let code=rows?.[0]?.referral_code;
    if (!code) {
      code="AWA-"+uid.slice(0,6).toUpperCase();
      await api(`profiles?id=eq.${uid}`,{method:"PATCH",body:JSON.stringify({referral_code:code})});
    }
    const link=`${location.origin}/index.html?ref=${code}`;
    box.innerHTML=`
      <div class="referral-box">
        <h4 style="margin-bottom:8px">Refer a friend — both get 25 cr</h4>
        <p class="adm-hint">Share your link. When they make their first purchase, you both earn 25 AWA Credits instantly.</p>
        <div class="referral-link-row">
          <input class="referral-link-input" readonly value="${link}" id="ref-link-input">
          <button class="btn btn-ghost" onclick="copyReferral()">Copy</button>
        </div>
      </div>`;
    window.copyReferral=()=>{
      navigator.clipboard?.writeText(link);
      const btn=document.querySelector(".referral-link-row .btn");
      if(btn){btn.textContent="Copied!";setTimeout(()=>btn.textContent="Copy",2000);}
    };
  }

  function checkReferralParam() {
    const ref=new URLSearchParams(location.search).get("ref");
    if (ref) sessionStorage.setItem("awa_ref",ref);
  }

  // ── Init ──────────────────────────────────────────────────
  checkReferralParam();
  renderPromoBanners();
  renderAlbumPacks();

  if (window.AWAAuth) {
    AWAAuth.onChange(async (sess) => {
      if (!sess) return;
      await recordStreak();
      await maybeShowWelcomeSpin();
      await setupReferral();
    });
  } else {
    setTimeout(async () => {
      if (!window.AWA_SESSION) return;
      await recordStreak();
      await maybeShowWelcomeSpin();
      await setupReferral();
    }, 1000);
  }

})();
