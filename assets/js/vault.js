/* AWA SOUNDS — Vault Drop auction engine */
(function () {
  "use strict";

  const SUPABASE_URL = window.AWA_CONFIG?.supabaseUrl || "";
  const SUPABASE_KEY = window.AWA_CONFIG?.supabaseKey || "";
  const CREDIT_RATE_DEFAULT = 10; // 10 credits = £1

  // ── helpers ───────────────────────────────────────────────
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
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
    rate = rate || CREDIT_RATE_DEFAULT;
    return (credits / rate).toFixed(2);
  }

  function countdown(targetISO, onTick, onEnd) {
    function tick() {
      const diff = new Date(targetISO) - Date.now();
      if (diff <= 0) { onEnd(); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      onTick(h, m, s);
      setTimeout(tick, 1000);
    }
    tick();
  }

  function itemTypeBadge(type) {
    const map = { beat: "Beat", cover_art: "Cover Art", cover_art_video: "Cover Art Video" };
    return map[type] || type;
  }

  function licenceLink(type) {
    const map = {
      mp3: "licenses/mp3-lease.html",
      wav: "licenses/wav-lease.html",
      trackout: "licenses/trackout-lease.html",
      exclusive: "licenses/exclusive.html",
      cover_art: "licenses/cover-art.html",
      cover_art_video: "licenses/cover-art-video.html"
    };
    return map[type] || "licenses/auction-terms.html";
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  // ── credit balance ─────────────────────────────────────────
  let userBalance = 0;
  async function loadBalance() {
    if (!window.AWA_SESSION) return;
    const rows = await api("credit_balances?user_id=eq." + window.AWA_SESSION.user.id +
      "&select=balance");
    userBalance = rows?.[0]?.balance || 0;
    const chip = $("#nav-credits");
    const count = $("#nav-credit-count");
    if (chip) chip.style.display = "flex";
    if (count) count.textContent = userBalance;
    return userBalance;
  }

  // ── VAULT DROP LIST PAGE ──────────────────────────────────
  const grid = $("#auction-grid");
  if (grid) initVaultListPage();

  function initVaultListPage() {
    loadBalance();
    loadAuctions("live");
    nextDropDate();

    $$(".vault-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        $$(".vault-tab").forEach(t => t.classList.remove("on"));
        tab.classList.add("on");
        loadAuctions(tab.dataset.tab);
      });
    });

    // Credit pack buttons
    $$(".buy-credits-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const pack = parseInt(btn.dataset.pack);
        const price = parseInt(btn.dataset.price);
        openCreditModal(pack, price);
      });
    });
  }

  async function loadAuctions(tab) {
    if (!grid) return;
    grid.innerHTML = '<div class="auction-loading"><div class="loader-ring"></div><p>Loading…</p></div>';

    let statusFilter;
    if (tab === "live") statusFilter = "status=in.(live,closing)";
    else if (tab === "upcoming") statusFilter = "status=eq.scheduled";
    else statusFilter = "status=eq.closed";

    const auctions = await api(`auctions?${statusFilter}&order=closes_at.asc`);

    if (!auctions?.length) {
      grid.innerHTML = '<div class="auction-empty"><p>No auctions here right now.</p>' +
        (tab === "live" ? '<p>Check <b>Upcoming</b> for the next drop.</p>' : "") + "</div>";
      return;
    }

    grid.innerHTML = auctions.map(a => auctionCard(a, tab)).join("");

    // Start countdown for live cards
    auctions.filter(a => ["live","closing"].includes(a.status)).forEach(a => {
      const closeAt = a.extended_until || a.closes_at;
      const timerEl = $(`#card-timer-${a.id}`);
      if (!timerEl) return;
      countdown(closeAt,
        (h, m, s) => { timerEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; },
        () => { timerEl.closest(".auction-card").querySelector(".card-status").textContent = "Ended"; }
      );
    });
  }

  function auctionCard(a, tab) {
    const closeAt = a.extended_until || a.closes_at;
    const currentBid = a.winning_bid || a.starting_bid;
    const gbp = creditsToGBP(currentBid, a.credit_rate);
    const isLive = ["live","closing"].includes(a.status);
    return `
    <div class="auction-card" onclick="location.href='auction.html?id=${a.id}'">
      <div class="card-img-wrap">
        ${a.image_url ? `<img src="${a.image_url}" alt="${a.title}" class="card-img" />` : '<div class="card-img-ph"></div>'}
        <span class="card-status ${isLive ? "live" : ""}">${isLive ? "LIVE" : a.status === "scheduled" ? "UPCOMING" : "ENDED"}</span>
        <span class="card-type-badge">${itemTypeBadge(a.item_type)}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${a.title}</h3>
        <div class="card-price-row">
          <div>
            <div class="card-price-label">${a.winning_bid ? "Current bid" : "Starting bid"}</div>
            <div class="card-price">${currentBid} cr <span class="card-price-gbp">(£${gbp})</span></div>
          </div>
          ${isLive ? `<div class="card-timer-wrap"><div class="card-timer-label">Ends in</div><div class="card-timer" id="card-timer-${a.id}">--:--:--</div></div>` : ""}
          ${a.status === "scheduled" ? `<div class="card-opens">Opens ${formatTime(a.opens_at)}</div>` : ""}
        </div>
        ${isLive ? '<div class="card-cta btn btn-gold btn-sm">Bid now →</div>' : ""}
      </div>
    </div>`;
  }

  function nextDropDate() {
    const el = $("#next-drop-date");
    if (!el) return;
    // Next 1st or 3rd Friday
    const now = new Date();
    let d = new Date(now);
    d.setHours(18, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      if (d.getDay() === 5) { // Friday
        const dom = d.getDate();
        if (dom <= 7 || (dom >= 15 && dom <= 21)) {
          if (d > now) { el.textContent = formatTime(d.toISOString()); return; }
        }
      }
      d.setDate(d.getDate() + 1);
    }
    el.textContent = "Coming soon";
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  // ── AUCTION ROOM PAGE ──────────────────────────────────────
  const auctionRoom = $(".auction-room");
  if (auctionRoom) initAuctionRoom();

  function initAuctionRoom() {
    const params = new URLSearchParams(location.search);
    const auctionId = params.get("id");
    if (!auctionId) { location.href = "vault-drop.html"; return; }

    loadBalance();
    loadAuctionRoom(auctionId);

    // Realtime subscription via Supabase Realtime (if configured)
    subscribeToAuction(auctionId);
  }

  let currentAuction = null;
  let timerInterval = null;

  async function loadAuctionRoom(auctionId) {
    const auctions = await api(`auctions?id=eq.${auctionId}&limit=1`);
    const auction = auctions?.[0];
    if (!auction) { location.href = "vault-drop.html"; return; }
    currentAuction = auction;
    renderAuctionRoom(auction);
    loadBidHistory(auctionId);
  }

  function renderAuctionRoom(a) {
    // Item panel
    const panel = $("#auction-item-panel");
    if (panel) {
      panel.innerHTML = `
        <div class="item-type-badge">${itemTypeBadge(a.item_type)} — 1 of 1</div>
        <h2 class="item-title">${a.title}</h2>
        ${a.image_url ? `<img src="${a.image_url}" alt="${a.title}" class="item-img" />` : '<div class="item-img-ph"></div>'}
        ${a.preview_url && a.item_type === "beat" ? `
          <div class="item-audio">
            <audio controls src="${a.preview_url}" class="audio-player"></audio>
            <span class="audio-label">Preview (tagged)</span>
          </div>` : ""}
        <div class="item-desc">${a.description || ""}</div>
        <div class="item-licence">
          Comes with: <a href="${licenceLink(a.licence_type)}" target="_blank">
            ${a.licence_type?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())} Licence
          </a>
        </div>
        <div class="item-meta">
          <span>Bid increment: min ${a.bid_increment} cr</span>
          <span>Rate: ${a.credit_rate} cr = £1</span>
        </div>`;
    }

    // Status + timer
    const closeAt = a.extended_until || a.closes_at;
    const pill = $("#auction-status-pill");
    if (pill) {
      pill.textContent = a.status === "live" ? "LIVE" : a.status === "closing" ? "CLOSING" : a.status.toUpperCase();
      pill.className = "auction-status-pill " + a.status;
    }

    if (timerInterval) clearInterval(timerInterval);
    countdown(closeAt,
      (h, m, s) => {
        const th = $("#timer-h"); const tm = $("#timer-m"); const ts = $("#timer-s");
        if (th) th.textContent = pad(h);
        if (tm) tm.textContent = pad(m);
        if (ts) ts.textContent = pad(s);
      },
      () => {
        const pill = $("#auction-status-pill");
        if (pill) { pill.textContent = "ENDED"; pill.className = "auction-status-pill ended"; }
        const entry = $("#bid-entry");
        if (entry) entry.innerHTML = "<p class='auction-ended-msg'>This auction has ended.</p>";
      }
    );

    // Price
    updatePrice(a);

    // Bid entry
    const isLive = ["live","closing"].includes(a.status);
    const signedIn = !!window.AWA_SESSION;
    const bidEntry = $("#bid-entry");
    const bidSignin = $("#bid-signin");
    if (!isLive && bidEntry) {
      bidEntry.innerHTML = "<p class='auction-ended-msg'>This auction has ended.</p>";
    } else if (!signedIn && bidEntry && bidSignin) {
      bidEntry.style.display = "none";
      bidSignin.style.display = "block";
    } else if (isLive && signedIn) {
      setupBidEntry(a);
    }
  }

  function updatePrice(a) {
    const credits = a.winning_bid || a.starting_bid;
    const gbp = creditsToGBP(credits, a.credit_rate);
    const bidCr = $("#current-bid-credits");
    const bidGBP = $("#current-bid-gbp");
    const leader = $("#bid-leader");
    const count = $("#bid-count");
    if (bidCr) bidCr.textContent = credits + " cr";
    if (bidGBP) bidGBP.textContent = "£" + gbp + " GBP";
    if (leader) leader.textContent = a.winning_bid ? "Someone is winning" : "No bids yet — be first";
    if (count) {
      // Fetch count separately
      api(`bids?auction_id=eq.${a.id}&select=id`, { headers: { Prefer: "count=exact" } })
        .then(rows => { if (count) count.textContent = rows?.length || 0; });
    }
  }

  function setupBidEntry(a) {
    const input = $("#bid-input");
    const btn = $("#bid-btn");
    const hint = $("#bid-hint");
    const costRow = $("#bid-cost-row");
    const minBidEl = $("#min-bid");

    const minBid = (a.winning_bid || (a.starting_bid - a.bid_increment)) + a.bid_increment;
    if (input) { input.min = minBid; input.value = minBid; }
    if (minBidEl) minBidEl.textContent = minBid;

    if (input && costRow) {
      input.addEventListener("input", () => {
        const val = parseInt(input.value) || 0;
        const totalCost = val + a.bid_fee;
        const after = userBalance - totalCost;
        $("#bid-total-cost").textContent = totalCost;
        $("#bid-balance-after").textContent = after;
        costRow.style.display = val > 0 ? "flex" : "none";
      });
    }

    if (btn) {
      btn.addEventListener("click", async () => {
        const bidAmt = parseInt(input?.value) || 0;
        if (bidAmt < minBid) {
          showBidError(`Minimum bid is ${minBid} cr`); return;
        }
        const totalCost = bidAmt + a.bid_fee;
        if (userBalance < totalCost) {
          showBidError(`Insufficient credits. You need ${totalCost} cr but have ${userBalance} cr.`); return;
        }
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
          // Update min bid
          const newMin = bidAmt + a.bid_increment;
          if (input) { input.min = newMin; input.value = newMin; }
          if (minBidEl) minBidEl.textContent = newMin;
        } else {
          const msgs = {
            insufficient_credits: "Not enough credits.",
            bid_too_low: `Bid too low — minimum is ${result.minimum} cr.`,
            auction_ended: "Auction has ended.",
            auction_not_live: "Auction is not live.",
            not_authenticated: "Please sign in to bid."
          };
          showBidError(msgs[result?.error] || "Bid failed — please try again.");
        }
      });
    }
  }

  function showBidError(msg) {
    const hint = $("#bid-hint");
    if (hint) { hint.textContent = msg; hint.style.color = "#e05252"; }
    setTimeout(() => { if (hint) { hint.style.color = ""; } }, 4000);
  }
  function showBidSuccess(msg) {
    const hint = $("#bid-hint");
    if (hint) { hint.textContent = msg; hint.style.color = "var(--gold)"; }
    setTimeout(() => { if (hint) { hint.style.color = ""; } }, 3000);
  }

  async function loadBidHistory(auctionId) {
    const list = $("#bid-list");
    if (!list) return;
    const bids = await api(`bids?auction_id=eq.${auctionId}&order=created_at.desc&limit=50&select=bid_amount,created_at,user_id,is_winning`);
    if (!bids?.length) return;
    list.innerHTML = bids.map(b => `
      <div class="bid-row-item ${b.is_winning ? "winning" : ""}">
        <span class="bid-user">@user…${b.user_id.slice(-6)}</span>
        <span class="bid-amt">${b.bid_amount} cr</span>
        <span class="bid-time">${new Date(b.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
        ${b.is_winning ? '<span class="bid-winning-tag">↑ Leading</span>' : ""}
      </div>`).join("");
  }

  function subscribeToAuction(auctionId) {
    // Supabase Realtime channel — poll fallback every 8s if Realtime not available
    let ws;
    try {
      const wsUrl = SUPABASE_URL.replace("https://", "wss://") + "/realtime/v1/websocket?apikey=" + SUPABASE_KEY;
      ws = new WebSocket(wsUrl);
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.topic && msg.topic.includes("bids")) {
          loadAuctionRoom(auctionId);
          loadBidHistory(auctionId);
        }
      };
    } catch (e) { /* fallback */ }
    // Polling fallback every 6 seconds
    setInterval(() => {
      if (currentAuction && ["live","closing"].includes(currentAuction.status)) {
        api(`auctions?id=eq.${auctionId}&select=winning_bid,extended_until,status,winner_id,winning_price_gbp&limit=1`)
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

  // ── Credit modal (global) ──────────────────────────────────
  window.openCreditModal = function(pack, pricePence) {
    if (!window.AWA_SESSION) { location.href = "account.html"; return; }
    const modal = $("#credit-modal");
    const amtEl = $("#modal-pack-amount");
    const priceEl = $("#modal-pack-price");
    const payLink = $("#credit-modal-pay");
    if (amtEl) amtEl.textContent = pack;
    if (priceEl) priceEl.textContent = "£" + (pricePence / 100).toFixed(2);
    // Pay link goes to a GoDaddy pay link — to be set in config.js
    const links = window.AWA_CONFIG?.creditPayLinks || {};
    if (payLink) payLink.href = links[pack] || "contact.html";
    if (modal) modal.style.display = "flex";
  };

})();
