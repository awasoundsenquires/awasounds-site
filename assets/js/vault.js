/* AWA SOUNDS — Vault Drop auction engine + presence system */
(function () {
  "use strict";

  const CFG = window.AWA || {};
  const SUPABASE_URL = CFG.supabaseUrl || "";
  const SUPABASE_KEY = CFG.supabaseAnonKey || "";
  const MAX_BIDDERS  = CFG.maxBidderSlots      || 8;
  const ALERT_MS     = CFG.inactivityAlertMs   || 45000;
  const DEMOTE_MS    = CFG.inactivityDemoteMs  || 60000;
  const HB_MS        = CFG.heartbeatIntervalMs || 20000;

  // ── helpers ───────────────────────────────────────────────
  const $ = (s, c = document) => c.querySelector(s);
  const api = (path, opts = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + (window.AWA_SESSION?.access_token || SUPABASE_KEY),
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...opts.headers
    },
    ...opts
  }).then(r => r.json());

  const rpc = (fn, body) => fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + (window.AWA_SESSION?.access_token || SUPABASE_KEY),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(r => r.json());

  function creditsToGBP(credits, rate) {
    return (credits / (rate || 10)).toFixed(2);
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function countdown(targetISO, onTick, onEnd) {
    function tick() {
      const diff = new Date(targetISO) - Date.now();
      if (diff <= 0) { onEnd(); return; }
      onTick(Math.floor(diff/3600000), Math.floor((diff%3600000)/60000), Math.floor((diff%60000)/1000));
      setTimeout(tick, 1000);
    }
    tick();
  }
  function itemTypeBadge(t) {
    return { beat:"Beat", cover_art:"Cover Art", cover_art_video:"Cover Art Video" }[t] || t;
  }
  function licenceLink(t) {
    return ({ mp3:"licenses/mp3-lease.html", wav:"licenses/wav-lease.html",
      trackout:"licenses/trackout-lease.html", exclusive:"licenses/exclusive.html",
      cover_art:"licenses/cover-art.html", cover_art_video:"licenses/cover-art-video.html"
    })[t] || "licenses/auction-terms.html";
  }
  function formatTime(iso) {
    return new Date(iso).toLocaleString("en-GB",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
  }

  // ── credit balance ────────────────────────────────────────
  let userBalance = 0;
  async function loadBalance() {
    if (!window.AWA_SESSION) return 0;
    const rows = await api("credit_balances?user_id=eq." + window.AWA_SESSION.user.id + "&select=balance");
    userBalance = rows?.[0]?.balance || 0;
    const chip  = $("#nav-credits");
    const count = $("#nav-credit-count");
    if (chip)  chip.style.display = "flex";
    if (count) count.textContent  = userBalance;
    return userBalance;
  }

  // ── VAULT LIST PAGE ───────────────────────────────────────
  const grid = $("#auction-grid");
  if (grid) initVaultListPage();

  function initVaultListPage() {
    loadBalance();
    loadAuctions("live");
    nextDropDate();
    document.querySelectorAll(".vault-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".vault-tab").forEach(t => t.classList.remove("on"));
        tab.classList.add("on");
        loadAuctions(tab.dataset.tab);
      });
    });
    document.querySelectorAll(".buy-credits-btn").forEach(btn => {
      btn.addEventListener("click", () => openCreditModal(+btn.dataset.pack, +btn.dataset.price));
    });
  }

  async function loadAuctions(tab) {
    if (!grid) return;
    grid.innerHTML = '<div class="auction-loading"><div class="loader-ring"></div><p>Loading…</p></div>';
    const filter = tab === "live" ? "status=in.(live,closing)" : tab === "upcoming" ? "status=eq.scheduled" : "status=eq.closed";
    const auctions = await api(`auctions?${filter}&order=closes_at.asc`);
    if (!auctions?.length) {
      grid.innerHTML = '<div class="auction-empty"><p>No auctions here right now.</p>' +
        (tab === "live" ? "<p>Check <b>Upcoming</b> for the next drop.</p>" : "") + "</div>";
      return;
    }
    grid.innerHTML = auctions.map(a => auctionCard(a)).join("");
    auctions.filter(a => ["live","closing"].includes(a.status)).forEach(a => {
      const el = $(`#card-timer-${a.id}`);
      if (!el) return;
      countdown(a.extended_until || a.closes_at,
        (h,m,s) => { el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; },
        () => { el.closest(".auction-card").querySelector(".card-status").textContent = "Ended"; }
      );
    });
  }

  function auctionCard(a) {
    const isLive  = ["live","closing"].includes(a.status);
    const isQueue = a.session_mode === "queue";

    if (isQueue) {
      // ── Queue-mode session card ──
      const total   = a.total_products || 0;
      const current = a.current_position || 0;
      const pct     = total ? Math.round((current / total) * 100) : 0;
      const statusLabel = isLive ? "LIVE SESSION" : a.status === "scheduled" ? "UPCOMING" : "ENDED";
      return `
      <div class="auction-card auction-card-queue" onclick="location.href='auction.html?id=${a.id}'">
        <div class="card-img-wrap">
          ${a.image_url ? `<img src="${a.image_url}" alt="${a.title}" class="card-img"/>` : '<div class="card-img-ph"></div>'}
          <span class="card-status ${isLive?"live":""}">${statusLabel}</span>
          <span class="card-type-badge">Session · ${total} items</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${a.title}</h3>
          <div class="card-queue-meta">
            <span>⏱ 5 min per product</span>
            <span>${total} products · bids from ${a.starting_bid||50} cr</span>
          </div>
          ${isLive ? `
            <div class="card-queue-progress">
              <div class="cqp-bar"><div class="cqp-fill" style="width:${pct}%"></div></div>
              <span class="cqp-label">Item ${current} of ${total}</span>
            </div>
            <div class="card-cta btn btn-gold btn-sm">Join session →</div>` : ""}
          ${a.status === "scheduled" ? `<div class="card-opens">Opens ${formatTime(a.opens_at)}</div>` : ""}
        </div>
      </div>`;
    }

    // ── Single-item auction card (original) ──
    const currentBid = a.winning_bid || a.starting_bid;
    return `
    <div class="auction-card" onclick="location.href='auction.html?id=${a.id}'">
      <div class="card-img-wrap">
        ${a.image_url ? `<img src="${a.image_url}" alt="${a.title}" class="card-img"/>` : '<div class="card-img-ph"></div>'}
        <span class="card-status ${isLive?"live":""}">${isLive?"LIVE":a.status==="scheduled"?"UPCOMING":"ENDED"}</span>
        <span class="card-type-badge">${itemTypeBadge(a.item_type)}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${a.title}</h3>
        <div class="card-price-row">
          <div>
            <div class="card-price-label">${a.winning_bid?"Current bid":"Starting bid"}</div>
            <div class="card-price">${currentBid} cr <span class="card-price-gbp">(£${creditsToGBP(currentBid,a.credit_rate)})</span></div>
          </div>
          ${isLive ? `<div class="card-timer-wrap"><div class="card-timer-label">Ends in</div><div class="card-timer" id="card-timer-${a.id}">--:--:--</div></div>` : ""}
          ${a.status==="scheduled" ? `<div class="card-opens">Opens ${formatTime(a.opens_at)}</div>` : ""}
        </div>
        ${isLive ? '<div class="card-cta btn btn-gold btn-sm">Bid now →</div>' : ""}
      </div>
    </div>`;
  }

  function nextDropDate() {
    const el = $("#next-drop-date");
    if (!el) return;
    const now = new Date();
    let d = new Date(now);
    d.setHours(18, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      if (d.getDay() === 5) {
        const dom = d.getDate();
        if (dom <= 7 || (dom >= 15 && dom <= 21)) {
          if (d > now) { el.textContent = formatTime(d.toISOString()); return; }
        }
      }
      d.setDate(d.getDate() + 1);
    }
    el.textContent = "Coming soon";
  }

  // ── AUCTION ROOM PAGE ─────────────────────────────────────
  const auctionRoom = $(".auction-room");
  if (auctionRoom) initAuctionRoom();

  let currentAuction = null;
  let presenceState   = { mode: "viewer", queue_position: null };
  let inactivityTimer  = null;
  let alertTimer       = null;
  let heartbeatTimer   = null;

  function initAuctionRoom() {
    const params    = new URLSearchParams(location.search);
    const auctionId = params.get("id");
    if (!auctionId) { location.href = "vault-drop.html"; return; }
    loadBalance();
    loadAuctionRoom(auctionId);
    subscribeToAuction(auctionId);
    // Join as viewer if signed in
    if (window.AWA_SESSION) {
      rpc("join_auction", { p_auction_id: auctionId });
      pollRoomState(auctionId);
    }
  }

  async function loadAuctionRoom(auctionId) {
    const rows = await api(`auctions?id=eq.${auctionId}&limit=1`);
    const a    = rows?.[0];
    if (!a) { location.href = "vault-drop.html"; return; }
    currentAuction = a;

    if (a.session_mode === "queue") {
      // ── Queue-mode: 5-min product session ──
      document.body.classList.add("queue-mode");
      const badge = document.getElementById("duration-badge");
      if (badge) badge.style.display = "inline-flex";
      await loadSessionQueue(auctionId);
      updateSessionProgressBar();
    } else {
      // ── Single-item auction (legacy) ──
      renderAuctionRoom(a);
      loadBidHistory(auctionId);
    }
  }

  function renderAuctionRoom(a) {
    const panel = $("#auction-item-panel");
    if (panel) {
      const itemCode = a.item_code ? `<span style="font-size:12px;color:var(--faint);font-family:monospace">${a.item_code}</span>` : "";
      panel.innerHTML = `
        <div class="item-type-badge">${itemTypeBadge(a.item_type)} — 1 of 1 ${itemCode}</div>
        <h2 class="item-title">${a.title}</h2>
        ${a.image_url ? `<img src="${a.image_url}" alt="${a.title}" class="item-img"/>` : '<div class="item-img-ph"></div>'}
        ${a.preview_url && a.item_type==="beat" ? `<div class="item-audio"><audio controls src="${a.preview_url}" class="audio-player"></audio><span class="audio-label">Preview (tagged)</span></div>` : ""}
        <div class="item-desc">${a.description||""}</div>
        <div class="item-licence">Comes with: <a href="${licenceLink(a.licence_type)}" target="_blank">${(a.licence_type||"").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} Licence</a></div>
        <div class="item-meta">
          <span>Increment: min ${a.bid_increment} cr</span>
          <span>Rate: ${a.credit_rate} cr = £1</span>
          ${a.min_price_gbp ? `<span>Reserve: £${a.min_price_gbp}</span>` : ""}
        </div>`;
    }
    const closeAt = a.extended_until || a.closes_at;
    const pill    = $("#auction-status-pill");
    if (pill) { pill.textContent = a.status.toUpperCase(); pill.className = "auction-status-pill " + a.status; }
    countdown(closeAt,
      (h,m,s) => {
        const th=$("#timer-h"),tm=$("#timer-m"),ts=$("#timer-s");
        if(th) th.textContent=pad(h); if(tm) tm.textContent=pad(m); if(ts) ts.textContent=pad(s);
      },
      () => {
        if(pill){pill.textContent="ENDED";pill.className="auction-status-pill ended";}
        const en=$("#bid-entry"); if(en) en.innerHTML="<p class='auction-ended-msg'>This auction has ended.</p>";
        clearPresenceTimers();
      }
    );
    updatePrice(a);
    const isLive   = ["live","closing"].includes(a.status);
    const signedIn = !!window.AWA_SESSION;
    const bidEntry = $("#bid-entry");
    const bidSign  = $("#bid-signin");
    if (!isLive && bidEntry) {
      bidEntry.innerHTML = "<p class='auction-ended-msg'>This auction has ended.</p>";
    } else if (!signedIn && bidEntry && bidSign) {
      bidEntry.style.display = "none"; bidSign.style.display = "block";
    } else if (isLive && signedIn) {
      setupBidEntry(a);
      renderModePanel(a.id);
    }
  }

  function updatePrice(a) {
    const credits = a.winning_bid || a.starting_bid;
    const bidCr   = $("#current-bid-credits");
    const bidGBP  = $("#current-bid-gbp");
    const leader  = $("#bid-leader");
    const cnt     = $("#bid-count");
    if (bidCr)  bidCr.textContent  = credits + " cr";
    if (bidGBP) bidGBP.textContent = "£" + creditsToGBP(credits, a.credit_rate) + " GBP";
    if (leader) leader.textContent = a.winning_bid ? "Someone is winning" : "No bids yet — be first";
    if (cnt)    api(`bids?auction_id=eq.${a.id}&select=id`).then(r => { if(cnt) cnt.textContent = r?.length||0; });
  }

  // ── PRESENCE / BIDDER SLOTS ───────────────────────────────

  async function pollRoomState(auctionId) {
    const update = async () => {
      const state = await rpc("get_room_state", { p_auction_id: auctionId });
      if (!state) return;
      // Capacity bar
      const capB = $("#cap-bidders"), capV = $("#cap-viewers");
      const capQ = $("#cap-queue"),   capQW = $("#cap-queue-wrap");
      if (capB) capB.textContent = (state.bidders || 0) + "/" + MAX_BIDDERS;
      if (capV) capV.textContent = state.viewers || 0;
      if (state.queue > 0) {
        if (capQW) capQW.style.display = "flex";
        if (capQ)  capQ.textContent    = state.queue;
      } else {
        if (capQW) capQW.style.display = "none";
      }
      // Update local presence state
      if (state.my_mode && state.my_mode !== presenceState.mode) {
        presenceState.mode           = state.my_mode;
        presenceState.queue_position = state.my_queue_position;
        renderModePanel(auctionId);
        // If just promoted from queue to bidder
        if (state.my_mode === "bidder") { startInactivityTimers(auctionId); startHeartbeat(auctionId); }
      }
    };
    update();
    setInterval(update, 8000);
  }

  function renderModePanel(auctionId) {
    const panel   = $("#mode-panel");
    const bidEntry = $("#bid-entry");
    if (!panel) return;
    if (presenceState.mode === "bidder") {
      panel.style.display = "flex";
      panel.innerHTML = `
        <p><b>You're in Bidder Mode</b> — place a bid every 60s to keep your slot.</p>
        <button class="btn btn-ghost btn-sm" id="demote-btn">Return to viewer</button>`;
      panel.querySelector("#demote-btn").addEventListener("click", async () => {
        await rpc("demote_to_viewer", { p_auction_id: auctionId });
        presenceState.mode = "viewer";
        clearPresenceTimers();
        renderModePanel(auctionId);
      });
      if (bidEntry) bidEntry.style.display = "flex";
    } else if (presenceState.mode === "queue") {
      panel.style.display = "flex";
      panel.className     = "mode-panel mode-panel-queue";
      panel.innerHTML     = `<p>You're <b>#${presenceState.queue_position}</b> in the queue. You'll enter Bidder Mode as soon as a slot opens.</p>`;
      if (bidEntry) bidEntry.style.display = "none";
    } else {
      // viewer
      panel.style.display = "flex";
      panel.className     = "mode-panel";
      panel.innerHTML     = `
        <p>You're watching. <b>Enter Bidder Mode</b> to place bids — limited to ${MAX_BIDDERS} active bidders.</p>
        <button class="btn btn-gold btn-sm" id="enter-bidder-btn">Enter Bidder Mode</button>`;
      panel.querySelector("#enter-bidder-btn").addEventListener("click", async () => {
        const res = await rpc("request_bidder_mode", { p_auction_id: auctionId, p_max_bidders: MAX_BIDDERS });
        if (res?.ok && res.mode === "bidder") {
          presenceState.mode = "bidder";
          startInactivityTimers(auctionId);
          startHeartbeat(auctionId);
          renderModePanel(auctionId);
        } else if (res?.mode === "queue") {
          presenceState.mode           = "queue";
          presenceState.queue_position = res.position;
          renderModePanel(auctionId);
        } else if (res?.error === "insufficient_credits") {
          showBidError(`Need at least ${res.required} cr to enter bidder mode. Top up below.`);
        } else {
          showBidError(res?.error || "Could not enter bidder mode.");
        }
      });
      if (bidEntry) bidEntry.style.display = "none";
    }
  }

  function startHeartbeat(auctionId) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (presenceState.mode === "bidder") rpc("heartbeat_presence", { p_auction_id: auctionId });
    }, HB_MS);
  }

  function startInactivityTimers(auctionId) {
    clearPresenceTimers();
    let remaining = Math.ceil((DEMOTE_MS - ALERT_MS) / 1000);
    // Alert fires at ALERT_MS
    alertTimer = setTimeout(() => {
      const alertEl = $("#inactivity-alert");
      const countEl = $("#inactivity-countdown");
      if (alertEl) alertEl.style.display = "block";
      const ticker = setInterval(() => {
        remaining--;
        if (countEl) countEl.textContent = remaining;
        if (remaining <= 0) clearInterval(ticker);
      }, 1000);
      // Demote fires at DEMOTE_MS
      inactivityTimer = setTimeout(async () => {
        if (alertEl) alertEl.style.display = "none";
        if (presenceState.mode !== "bidder") return;
        await rpc("demote_to_viewer", { p_auction_id: auctionId });
        presenceState.mode = "viewer";
        clearPresenceTimers();
        renderModePanel(auctionId);
        showBidError("You were moved to viewer mode due to inactivity.");
      }, DEMOTE_MS - ALERT_MS);
    }, ALERT_MS);
  }

  function resetInactivityTimers(auctionId) {
    const alertEl = $("#inactivity-alert");
    if (alertEl) alertEl.style.display = "none";
    startInactivityTimers(auctionId);
  }

  function clearPresenceTimers() {
    clearTimeout(alertTimer);
    clearTimeout(inactivityTimer);
    clearInterval(heartbeatTimer);
  }

  // ── BID ENTRY ─────────────────────────────────────────────

  function setupBidEntry(a) {
    const input   = $("#bid-input");
    const btn     = $("#bid-btn");
    const minBidEl = $("#min-bid");
    const costRow  = $("#bid-cost-row");
    const minBid   = (a.winning_bid || (a.starting_bid - a.bid_increment)) + a.bid_increment;
    if (input)    { input.min = minBid; input.value = minBid; }
    if (minBidEl)   minBidEl.textContent = minBid;

    if (input && costRow) {
      input.addEventListener("input", () => {
        const val = parseInt(input.value) || 0;
        $("#bid-total-cost").textContent   = val + a.bid_fee;
        $("#bid-balance-after").textContent = userBalance - val - a.bid_fee;
        costRow.style.display = val > 0 ? "flex" : "none";
      });
    }

    if (btn) {
      btn.addEventListener("click", async () => {
        if (presenceState.mode !== "bidder") {
          showBidError("Enter Bidder Mode first to place a bid."); return;
        }
        const bidAmt   = parseInt(input?.value) || 0;
        const totalCost = bidAmt + a.bid_fee;
        if (bidAmt < minBid)           { showBidError(`Minimum bid is ${minBid} cr`); return; }
        if (userBalance < totalCost)   { showBidError(`Need ${totalCost} cr — you have ${userBalance} cr.`); return; }
        btn.textContent = "Placing…"; btn.disabled = true;
        const result = await rpc("place_bid", { p_auction_id: a.id, p_bid_amount: bidAmt });
        btn.disabled = false; btn.textContent = "Bid";

        if (result?.ok) {
          userBalance -= totalCost;
          const navCount = $("#nav-credit-count");
          if (navCount) navCount.textContent = userBalance;
          if (result.extended) {
            const warn = $("#snipe-warning");
            if (warn) { warn.style.display = "flex"; setTimeout(() => warn.style.display = "none", 8000); }
          }
          showBidSuccess(`Bid of ${bidAmt} cr placed!`);
          const newMin = bidAmt + a.bid_increment;
          if (input)    { input.min = newMin; input.value = newMin; }
          if (minBidEl)   minBidEl.textContent = newMin;
          // A bid resets inactivity timer
          resetInactivityTimers(a.id);
        } else {
          const msgs = {
            insufficient_credits: "Not enough credits.",
            bid_too_low:          `Bid too low — minimum is ${result.minimum} cr.`,
            auction_ended:        "Auction has ended.",
            auction_not_live:     "Auction is not live.",
            not_authenticated:    "Please sign in.",
            not_in_bidder_mode:   "Enter Bidder Mode first."
          };
          showBidError(msgs[result?.error] || "Bid failed — try again.");
        }
      });
    }
  }

  function showBidError(msg) {
    const h = $("#bid-hint");
    if (h) { h.textContent = msg; h.style.color = "#e05252"; }
    setTimeout(() => { if (h) h.style.color = ""; }, 5000);
  }
  function showBidSuccess(msg) {
    const h = $("#bid-hint");
    if (h) { h.textContent = msg; h.style.color = "var(--gold)"; }
    setTimeout(() => { if (h) h.style.color = ""; }, 3000);
  }

  // ── BID HISTORY ───────────────────────────────────────────

  async function loadBidHistory(auctionId) {
    const list = $("#bid-list");
    if (!list) return;
    const bids = await api(`bids?auction_id=eq.${auctionId}&order=created_at.desc&limit=50&select=bid_amount,created_at,user_id,is_winning`);
    if (!bids?.length) return;
    list.innerHTML = bids.map(b => `
      <div class="bid-row-item ${b.is_winning?"winning":""}">
        <span class="bid-user">@user…${b.user_id.slice(-6)}</span>
        <span class="bid-amt">${b.bid_amount} cr</span>
        <span class="bid-time">${new Date(b.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
        ${b.is_winning ? '<span class="bid-winning-tag">↑ Leading</span>' : ""}
      </div>`).join("");
  }

  // ── PRODUCT QUEUE (5-min session mode) ───────────────────

  let sessionQueue   = [];        // full queue array from get_session_queue
  let liveItem       = null;      // the currently live auction_queue row
  let queueCountdown = null;      // setTimeout handle for per-item countdown

  async function loadSessionQueue(auctionId) {
    const data = await rpc("get_session_queue", { p_session_id: auctionId });
    if (!Array.isArray(data)) return;
    sessionQueue = data;
    liveItem     = data.find(q => q.status === "live") || null;
    renderQueueRail(auctionId);
    if (liveItem) renderLiveItem(auctionId, liveItem);
  }

  function renderQueueRail(auctionId) {
    const rail = $("#product-queue-rail");
    if (!rail) return;
    const total  = sessionQueue.length;
    const doneN  = sessionQueue.filter(q => ["sold","passed"].includes(q.status)).length;
    const liveN  = sessionQueue.filter(q => q.status === "live").length;
    rail.innerHTML = `
      <div class="pq-header">
        <span class="pq-title">Session Products</span>
        <span class="pq-prog">${doneN + liveN} / ${total}</span>
      </div>
      <div class="pq-list">
        ${sessionQueue.map((q, i) => {
          const isLive   = q.status === "live";
          const isSold   = q.status === "sold";
          const isPassed = q.status === "passed";
          const isQueued = q.status === "queued";
          return `<div class="pq-item ${isLive?"pq-live":""} ${isSold?"pq-sold":""} ${isPassed?"pq-passed":""}">
            <div class="pq-pos">${q.position}</div>
            <div class="pq-thumb" style="${q.image_url?`background-image:url(${q.image_url})`:""};background-size:cover;background-position:center"></div>
            <div class="pq-info">
              <div class="pq-name">${q.title}</div>
              <div class="pq-meta">${isLive?"⚡ LIVE NOW":isSold?"✓ Sold — "+q.winning_bid+" cr":isPassed?"Passed":"Queued"}</div>
            </div>
            ${isLive?'<div class="pq-live-dot"></div>':""}
          </div>`;
        }).join("")}
      </div>`;
  }

  function renderLiveItem(auctionId, item) {
    // Update the main item panel to reflect the live queue item
    const panel = $("#auction-item-panel");
    if (panel) {
      panel.innerHTML = `
        <div class="item-type-badge pq-badge">
          Product ${item.position} of ${sessionQueue.length} — <span class="pq-badge-type">${itemTypeBadge(item.item_type)}</span>
          ${item.item_code ? `<span style="font-family:monospace;font-size:11px;margin-left:6px;opacity:.5">${item.item_code}</span>` : ""}
        </div>
        <h2 class="item-title">${item.title}</h2>
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="item-img"/>` : '<div class="item-img-ph"></div>'}`;
    }

    // 5-minute countdown for this item
    clearTimeout(queueCountdown);
    const closeAt = item.extended_until || item.closes_at;
    const pill    = $("#auction-status-pill");
    if (pill) { pill.textContent = "LIVE"; pill.className = "auction-status-pill live"; }

    // Anti-snipe banner: show when < 60 s remain
    let snipeBannerShown = false;

    countdown(closeAt,
      (h, m, s) => {
        const th = $("#timer-h"), tm = $("#timer-m"), ts = $("#timer-s");
        if (th) th.textContent = pad(h);
        if (tm) tm.textContent = pad(m);
        if (ts) ts.textContent = pad(s);
        // Colour the timer red in last 60 s
        const timerEl = $(".auction-timer-block");
        if (timerEl) timerEl.classList.toggle("timer-urgent", h === 0 && m === 0 && s <= 60);
        // Anti-snipe warning
        if (!snipeBannerShown && h === 0 && m === 0 && s <= 60) {
          snipeBannerShown = true;
          const warn = $("#snipe-warning");
          if (warn) { warn.style.display = "flex"; warn.textContent = "⚡ Last 60 seconds — bids extend time by 90s!"; }
        }
        // Update bid entry min for this item
        updateItemPrice(item, auctionId);
      },
      async () => {
        // Item expired on this client — call advance_product to move to the next
        if (pill) { pill.textContent = "ADVANCING…"; pill.className = "auction-status-pill closing"; }
        const warn = $("#snipe-warning"); if (warn) warn.style.display = "none";
        const res = await rpc("advance_product", { p_session_id: auctionId });
        if (res?.ok) {
          if (res.reason === "session_complete") {
            if (pill) { pill.textContent = "SESSION ENDED"; pill.className = "auction-status-pill ended"; }
            const bidEntry = $("#bid-entry");
            if (bidEntry) bidEntry.innerHTML = "<p class='auction-ended-msg'>All products in this session have been auctioned. Thank you for joining!</p>";
            clearPresenceTimers();
          } else {
            // Brief pause then reload the queue
            setTimeout(() => loadSessionQueue(auctionId), 1200);
          }
        } else if (res?.reason === "still_live") {
          // Another client already advanced; just refresh
          setTimeout(() => loadSessionQueue(auctionId), 600);
        }
      }
    );

    // Wire bid button to include queue_item_id
    setupQueueBidEntry(auctionId, item);
  }

  function updateItemPrice(item, auctionId) {
    // Re-fetch live item state every 6s for winning_bid updates
    // (Realtime covers bid events; this is the polling fallback)
    const minBid  = (item.winning_bid || (item.starting_bid - item.bid_increment)) + item.bid_increment;
    const bidCr   = $("#current-bid-credits");
    const bidGBP  = $("#current-bid-gbp");
    const leader  = $("#bid-leader");
    if (bidCr)  bidCr.textContent  = (item.winning_bid || item.starting_bid) + " cr";
    if (bidGBP) bidGBP.textContent = "£" + creditsToGBP(item.winning_bid || item.starting_bid, currentAuction?.credit_rate || 10) + " GBP";
    if (leader) leader.textContent = item.winning_bid ? "Someone is winning" : "No bids yet — be first";
    const minBidEl = $("#min-bid");
    if (minBidEl) minBidEl.textContent = minBid;
  }

  function setupQueueBidEntry(auctionId, item) {
    const input    = $("#bid-input");
    const btn      = $("#bid-btn");
    const minBidEl = $("#min-bid");
    const costRow  = $("#bid-cost-row");
    const bidFee   = CFG.bidFeeCredits || 5;
    let minBid     = (item.winning_bid || (item.starting_bid - item.bid_increment)) + item.bid_increment;
    if (input)    { input.min = minBid; input.value = minBid; }
    if (minBidEl)   minBidEl.textContent = minBid;
    if (input && costRow) {
      input.addEventListener("input", () => {
        const val = parseInt(input.value) || 0;
        const tc  = $("#bid-total-cost"), ba = $("#bid-balance-after");
        if (tc) tc.textContent = val + bidFee;
        if (ba) ba.textContent = userBalance - val - bidFee;
        costRow.style.display = val > 0 ? "flex" : "none";
      });
    }
    if (!btn) return;
    // Remove old listener by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", async () => {
      if (presenceState.mode !== "bidder") { showBidError("Enter Bidder Mode first."); return; }
      const bidAmt    = parseInt(input?.value) || 0;
      const totalCost = bidAmt + bidFee;
      if (bidAmt < minBid)          { showBidError(`Minimum bid is ${minBid} cr`); return; }
      if (userBalance < totalCost)  { showBidError(`Need ${totalCost} cr — you have ${userBalance} cr.`); return; }
      newBtn.textContent = "Placing…"; newBtn.disabled = true;
      const result = await rpc("place_bid", {
        p_auction_id:    auctionId,
        p_bid_amount:    bidAmt,
        p_queue_item_id: item.id
      });
      newBtn.disabled = false; newBtn.textContent = "Bid";
      if (result?.ok) {
        userBalance -= totalCost;
        const navCount = $("#nav-credit-count"); if (navCount) navCount.textContent = userBalance;
        if (result.extended) {
          // Update liveItem with new closing time and re-render
          item.extended_until = result.new_close;
          liveItem = item;
          const warn = $("#snipe-warning");
          if (warn) { warn.style.display = "flex"; warn.textContent = "⚡ Bid in last 60s — 90 seconds added!"; setTimeout(() => warn.style.display = "none", 8000); }
        }
        item.winning_bid = bidAmt;
        minBid = bidAmt + item.bid_increment;
        showBidSuccess(`Bid of ${bidAmt} cr placed!`);
        if (input)    { input.min = minBid; input.value = minBid; }
        if (minBidEl)   minBidEl.textContent = minBid;
        resetInactivityTimers(auctionId);
        // Refresh bid history
        loadQueueBidHistory(auctionId, item.id);
      } else {
        const msgs = {
          insufficient_credits: "Not enough credits.",
          bid_too_low:          `Minimum is ${result?.minimum} cr.`,
          item_not_live:        "This product is no longer live — it may have advanced.",
          item_expired:         "Time ran out on this product.",
          not_authenticated:    "Please sign in.",
          not_in_bidder_mode:   "Enter Bidder Mode first."
        };
        showBidError(msgs[result?.error] || "Bid failed — try again.");
      }
    });
  }

  function updateSessionProgressBar() {
    const bar   = document.getElementById("session-progress-bar");
    const fill  = document.getElementById("sesh-fill");
    const left  = document.getElementById("sesh-label-left");
    const right = document.getElementById("sesh-label-right");
    if (!bar || !sessionQueue.length) return;
    const total  = sessionQueue.length;
    const done   = sessionQueue.filter(q => ["sold","passed"].includes(q.status)).length;
    const liveN  = sessionQueue.filter(q => q.status === "live").length;
    const current = done + liveN;
    const pct    = Math.round((current / total) * 100);
    if (fill)  fill.style.width   = pct + "%";
    if (left)  left.textContent   = "Vault Drop Session";
    if (right) right.textContent  = `${current} / ${total}`;
  }

  async function loadQueueBidHistory(auctionId, itemId) {
    const list = $("#bid-list");
    if (!list) return;
    const bids = await api(`bids?auction_id=eq.${auctionId}&queue_item_id=eq.${itemId}&order=created_at.desc&limit=30&select=bid_amount,created_at,user_id,is_winning`);
    if (!bids?.length) { list.innerHTML = "<div class='bid-empty'>No bids yet</div>"; return; }
    list.innerHTML = bids.map(b => `
      <div class="bid-row-item ${b.is_winning?"winning":""}">
        <span class="bid-user">@user…${b.user_id.slice(-6)}</span>
        <span class="bid-amt">${b.bid_amount} cr</span>
        <span class="bid-time">${new Date(b.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
        ${b.is_winning ? '<span class="bid-winning-tag">↑ Leading</span>' : ""}
      </div>`).join("");
  }

  // ── REALTIME + POLLING ────────────────────────────────────

  function subscribeToAuction(auctionId) {
    const isQueue = () => currentAuction?.session_mode === "queue";

    // Realtime WebSocket (signed-in users)
    if (window.AWA_SESSION) {
      try {
        const wsUrl = SUPABASE_URL.replace("https://","wss://") + "/realtime/v1/websocket?apikey=" + SUPABASE_KEY;
        const ws    = new WebSocket(wsUrl);
        ws.onopen = () => {
          // Subscribe to bids table and auction_queue table
          ws.send(JSON.stringify({ topic:`realtime:public:bids:auction_id=eq.${auctionId}`,          event:"phx_join", payload:{}, ref:1 }));
          ws.send(JSON.stringify({ topic:`realtime:public:auction_queue:session_id=eq.${auctionId}`, event:"phx_join", payload:{}, ref:2 }));
          ws.send(JSON.stringify({ topic:`realtime:public:auction_presence:auction_id=eq.${auctionId}`, event:"phx_join", payload:{}, ref:3 }));
        };
        ws.onmessage = e => {
          const msg = JSON.parse(e.data);
          if (!msg.topic) return;
          if (msg.topic.includes("bids") || msg.topic.includes("auction_queue")) {
            if (isQueue()) {
              loadSessionQueue(auctionId).then(() => updateSessionProgressBar());
            } else {
              loadAuctionRoom(auctionId);
              loadBidHistory(auctionId);
            }
          }
        };
        ws.onerror = () => {}; // fall through to polling
      } catch(e) {}
    }

    // Polling fallback — every 6s
    setInterval(() => {
      if (!currentAuction || !["live","closing"].includes(currentAuction.status)) return;

      if (isQueue()) {
        // Poll auction_queue for the live item's winning_bid or extended_until changes
        if (!liveItem) return;
        api(`auction_queue?id=eq.${liveItem.id}&select=winning_bid,extended_until,status&limit=1`)
          .then(rows => {
            if (!rows?.[0]) return;
            const fresh = rows[0];
            // Item advanced to sold/passed by another client
            if (fresh.status !== "live") {
              loadSessionQueue(auctionId).then(() => updateSessionProgressBar());
              return;
            }
            // New bid or extension
            if (fresh.winning_bid !== liveItem.winning_bid) {
              liveItem.winning_bid = fresh.winning_bid;
              updateItemPrice(liveItem, auctionId);
              loadQueueBidHistory(auctionId, liveItem.id);
            }
            if (fresh.extended_until && fresh.extended_until !== liveItem.extended_until) {
              liveItem.extended_until = fresh.extended_until;
              const warn = $("#snipe-warning");
              if (warn) { warn.style.display = "flex"; warn.textContent = "⚡ Bid in last 60s — 90 seconds added!"; setTimeout(() => warn.style.display = "none", 8000); }
            }
          });
      } else {
        // Single-item mode polling
        api(`auctions?id=eq.${auctionId}&select=winning_bid,extended_until,status,winner_id&limit=1`)
          .then(rows => {
            if (!rows?.[0]) return;
            const fresh = rows[0];
            if (fresh.winning_bid !== currentAuction.winning_bid || fresh.extended_until !== currentAuction.extended_until) {
              Object.assign(currentAuction, fresh);
              updatePrice(currentAuction);
              loadBidHistory(auctionId);
              if (fresh.extended_until && fresh.extended_until !== currentAuction.extended_until) {
                const warn = $("#snipe-warning");
                if (warn) { warn.style.display = "flex"; setTimeout(() => warn.style.display = "none", 8000); }
              }
            }
          });
      }
    }, 6000);
  }

  // ── CREDIT MODAL (global) ─────────────────────────────────

  window.openCreditModal = function(pack, pricePence) {
    if (!window.AWA_SESSION) { location.href = "account.html"; return; }
    const modal   = $("#credit-modal");
    const amtEl   = $("#modal-pack-amount");
    const priceEl = $("#modal-pack-price");
    const payLink  = $("#credit-modal-pay");
    if (amtEl)   amtEl.textContent  = pack;
    if (priceEl) priceEl.textContent = "£" + (pricePence / 100).toFixed(2);
    const links = (window.AWA || {}).creditPayLinks || {};
    if (payLink) payLink.href = links[pack] || "contact.html";
    if (modal)   modal.style.display = "flex";
  };

})();
