/* AWA SOUNDS — central config
   Paste your keys here (all of these are safe to expose in a public static site):
   - Supabase anon key is public by design; data is protected by Row Level Security.
   - Web3Forms access key is a public submit key.
   - GoDaddy Pay Links are just checkout URLs.
   Leave a value empty ("") and the site degrades gracefully (buy buttons fall back
   to an email enquiry; account features stay hidden until Supabase keys are set). */
window.AWA = {
  /* --- Supabase (Awa Sounds project, awasoundsenquires@gmail.com) --- */
  supabaseUrl:     "https://rhiwtvdtbdudgtdqgjkc.supabase.co",
  supabaseAnonKey: "sb_publishable_Qy5KbtIGofTrZyTheHifKA_qY3fWg0I",   // publishable (browser-safe) key

  /* --- Contact / demo form --- */
  web3formsKey: "eb514f46-d5ae-43ff-9ffc-933f8041340c",   // Web3Forms (Awa Sounds Website) → awasoundsenquires@gmail.com
  enquiryEmail: "awasound.music@gmail.com",

  /* --- Membership --- */
  membershipPayLink: "", // GoDaddy Pay Link for the £4.99/mo Insider membership
  membershipPrice: 4.99,
  memberDiscount: 0.15,       // 15% off beats + services for members
  coverMemberDiscount: 0.30,  // 30% off cover art for members

  /* --- Vault Drop Auction --- */
  // AWA Credits pricing (GoDaddy Pay Links — fill in after creating products)
  creditPayLinks: {
    100: "",   // £8 — paste GoDaddy Pay Link here
    250: "",   // £18
    500: ""    // £30
  },
  // Credit-to-GBP rate (purchase): 10 cr = £1
  defaultCreditRate: 10,
  // Store redemption rates (worse than purchase rate — protects margin)
  storeRedemptionRate: {
    free:   20,    // free users: 20 cr = £1 off
    member: 15     // members: 15 cr = £1 off
  },
  // Max discount % of item price via credits (stacked discounts still capped)
  maxDiscountPct: {
    free:   0.20,  // free users: max 20% off
    member: 0.35   // members: max 35% off (+ their 15% price discount)
  },
  // Minimum payment after credits — credits can never wipe a purchase below this
  minPaymentFloorGBP: 15,
  // Monthly credit grants (accumulated, never expire)
  monthlyFreeCredits: 20,
  monthlyMemberCredits: 50,    // Insider (£4.99/mo) — ~£5 face value at purchase rate
  // Bid fee per bid attempt (non-refundable, covers platform cost)
  bidFeeCredits: 5,

  /* --- Vault Drop session model ---
     Each bidding day = one session with 10–15 products queued in order.
     Each product gets exactly 5 minutes of live bidding, then the next goes live.
     Anti-snipe: last 60 s of a product's window → one 90-second extension max. */
  productDurationMs:    300000,  // 5 minutes per product (never changes)
  antiSnipeWindowMs:    60000,   // bid in the last 60 s → triggers extension
  antiSnipeExtendMs:    90000,   // one-time 90-second extension per product
  minProductsPerSession: 10,     // minimum queue size per session
  maxProductsPerSession: 15,     // maximum queue size per session

  /* --- Auction Room Limits (tuned for Supabase free tier: 200 connections) ---
     Only bidders hold Realtime connections (~8 bidders × 6 rooms = 48 total).
     Viewers use 6s polling — no Realtime connection needed. */
  maxBidderSlots: 8,           // active bidders per room
  maxViewersPerRoom: 20,       // soft cap shown in UI (viewers use polling, not Realtime)
  maxLiveRooms: 6,             // run up to 6 simultaneous auctions on free tier
  inactivityAlertMs: 45000,    // 45s — alert before demotion
  inactivityDemoteMs: 60000,   // 60s — auto-demote to viewer if no bid placed
  rejoinPriorityMs: 120000,    // 2-min priority window if you were recently bumped
  heartbeatIntervalMs: 20000,  // send heartbeat every 20s while in bidder mode

  /* --- Welcome Roulette prizes (weighted random) ---
     weight: higher = more common. Total weights = 100.
     Customers spin once on registration; extra spins earned via referrals / milestones. */
  roulettePrizes: [
    { id:"credits_10",  label:"10 Credits",       emoji:"⚡", type:"credits",        value:"10",  weight:30, color:"#1e1e2e" },
    { id:"credits_25",  label:"25 Credits",       emoji:"💎", type:"credits",        value:"25",  weight:20, color:"#111a11" },
    { id:"credits_50",  label:"50 Credits",       emoji:"🔥", type:"credits",        value:"50",  weight:8,  color:"#11111a" },
    { id:"disc_10",     label:"10% Off",          emoji:"✦",  type:"discount_pct",   value:"10",  weight:20, color:"#1e140a" },
    { id:"disc_15",     label:"15% Off",          emoji:"★",  type:"discount_pct",   value:"15",  weight:10, color:"#1e0f0a" },
    { id:"two_for_one", label:"Get One Free",     emoji:"🎨", type:"two_for_one",    value:null,  weight:6,  color:"#140a1e" },
    { id:"free_edit",   label:"Free Cover Edit",  emoji:"✏️", type:"free_edit",      value:null,  weight:4,  color:"#0a141e" },
    { id:"album_disc",  label:"Album Pack −30%",  emoji:"📀", type:"album_discount", value:"30",  weight:2,  color:"#1a1600" }
  ],

  /* --- Streak milestones (bonus credits on consecutive daily logins) ---
     The record_login_streak() SQL function handles the actual award. */
  streakMilestones: { 5:10, 7:5, 10:25, 14:10, 21:15, 30:50 },

  /* --- Referral rewards ---
     Rules:
     • Each purchase (beat or cover) the buyer earns 1 share — share link shows post-purchase.
       Sharing = small credit reward (5 cr) for buyer only, 1 per purchase, not per share click.
     • Referral code: unique per user. New user registers with code → BOTH get a free spin (1× per registration).
     • Referred user makes their first purchase → REFERRING user earns 25 credits (not referred user).
     • All bonuses are one-time caps. No stacking. */
  referralCredits: {
    purchaseShareBonus:  5,   // buyer gets 5 cr for sharing post-purchase (1 per purchase event)
    regBonusReferrer:    0,   // referrer spin (handled via extra_spins grant, not credits)
    regBonusReferred:    0,   // referred spin (same — grant 1 extra_spin each at registration)
    firstPurchaseBonus: 25,   // referring user earns 25 cr when referred makes first purchase
  },

  /* --- Album Packs ---
     coverIds: must be IDs from the covers array (auctionOnly covers can also be in packs).
     available: null = unlimited; number = limited run (show countdown).
     priceGBP: full price; memberPriceGBP: Insider price. */
  albumPacks: [
    {
      id:            "chrome-universe-vol1",
      code:          "AWA-PACK-001",
      title:         "Chrome Universe Vol. 1",
      subtitle:      "7 covers — same metallic universe, 7 distinct worlds",
      mood:          "Silver, chrome, liquid metal aesthetics",
      coverIds:      ["mercury","ember-fold","chrome-smoke","shatter","champagne","gunmetal","harmattan"],
      priceGBP:      49,
      memberPriceGBP:34,
      available:     10,
      tag:           "Best Value"
    },
    {
      id:            "void-series-vol1",
      code:          "AWA-PACK-002",
      title:         "Void Series Vol. 1",
      subtitle:      "10 Vault Drop exclusives — darkness with identity",
      mood:          "Deep space, psychedelic chrome, unknown terrain",
      coverIds:      ["onyx-rain","sol-chrome","iron-bloom","midnight-arc","onyx-rain","sol-chrome","iron-bloom","midnight-arc","onyx-rain","sol-chrome"],
      priceGBP:      69,
      memberPriceGBP:49,
      available:     5,
      tag:           "Limited"
    }
  ],

  /* --- Promos (active promotional banners shown on the site) --- */
  activePromos: [
    { type:"two_for_one", label:"Buy one cover, get one FREE", code:"2FOR1COVER", expiresHours: 336 },
    { type:"bundle",      label:"Cover + WAV Lease — save 20%", code:"BUNDLE20",  expiresHours: null }
  ],

  /* --- License tiers (global; same for every beat) ---
     IMPORTANT: Cover image and animated cover video are EXCLUSIVE license only.
     MP3/WAV/Trackout/Stems licenses purchase the MUSIC ONLY — no image or video asset.
     Exclusive buyers receive: music (WAV) + cover image (PNG) + animated cover video (MP4). */
  licenses: {
    mp3:       { name: "MP3 Lease",  price: 30,   streams: "30,000",  doc: "licenses/mp3-lease.html",    includes: ["MP3 beat file", "30,000 streams/sales limit"], excludes: ["Cover image", "Animated cover video"] },
    wav:       { name: "WAV Lease",  price: 45,   streams: "150,000", doc: "licenses/wav-lease.html",    includes: ["WAV beat file", "150,000 streams/sales limit"], excludes: ["Cover image", "Animated cover video"] },
    trackout:  { name: "Trackout",   price: 145,  streams: "550,000", doc: "licenses/trackout-lease.html", includes: ["WAV beat file", "550,000 streams/sales limit"], excludes: ["Cover image", "Animated cover video"] },
    stems:     { name: "Stems + Unlimited Streaming", price: 299, streams: "Unlimited", doc: "licenses/trackout-lease.html",
                 includes: ["All stem files (WAV)", "Unlimited commercial streams", "Full mixing flexibility"],
                 excludes: ["Cover image", "Animated cover video"] },
    exclusive: { name: "Exclusive",  price: null, streams: "Unlimited", doc: "licenses/exclusive.html",
                 includes: ["WAV beat file", "All stem files", "Cover image (PNG)", "Animated cover video (MP4)", "Unlimited streams", "Full ownership transfer", "Removed from catalogue"],
                 excludes: [] }
  },

  /* --- Beat catalogue ---
     pay: per-tier GoDaddy Pay Link for THIS beat. Empty → Buy button emails an enquiry.
     preview: optional mp3/clip for the play button (leave "" for now). */
  beats: [
    { id:"african-stamina", title:"African Stamina", producer:"AWA", bpm:113, key:"A♯ Minor", tags:["Afrobeats","Afro Vibes","Tribal"], cover:"assets/img/beat-african-stamina.png", preview:"", stems:true, pay:{ mp3:"", wav:"", trackout:"", stems:"" } },
    { id:"chrome-nights",  title:"Chrome Nights",   producer:"AWA", bpm:92,  key:"Am", tags:["R&B","Trapsoul"],       cover:"assets/img/beat-chrome-nights.png",  preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"lagos-after-dark", title:"Lagos After Dark", producer:"AWA", bpm:105, key:"Fm", tags:["Afrobeats","Pop"],     cover:"assets/img/beat-lagos-after-dark.png", preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"no-cosign",      title:"No Cosign",       producer:"AWA", bpm:140, key:"Gm", tags:["Trap","Drill"],          cover:"assets/img/beat-no-cosign.png",      preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"silver-static",  title:"Silver Static",   producer:"AWA", bpm:120, key:"C",  tags:["Pop","Electronic"],      cover:"assets/img/beat-silver-static.png",  preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"ember-room",     title:"Ember Room",      producer:"AWA", bpm:84,  key:"Dm", tags:["Alt R&B","Soul"],        cover:"assets/img/beat-ember-room.png",     preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"foundry",        title:"Foundry",         producer:"AWA", bpm:128, key:"Em", tags:["Hip-Hop","Boom Bap"],    cover:"assets/img/beat-foundry.png",        preview:"", pay:{ mp3:"", wav:"", trackout:"" } }
  ],

  /* --- Cover Art catalogue ---
     auctionOnly: true  → NEVER shown in the cover store, only appears in Vault Drop.
                  false → available for direct purchase in the store.
     This keeps store stock and auction stock completely separate. */
  covers: [
    { id:"mercury",     title:"Mercury",     sub:"Liquid chrome",  img:"assets/img/gen-cover-blue.png",     imgClean:"", videos:["assets/img/cover-blue-1.mp4","assets/img/cover-blue-2.mp4"],        price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"ember-fold",  title:"Ember Fold",  sub:"Molten silver",  img:"assets/img/gen-cover-ember.png",    imgClean:"", videos:["assets/img/cover-ember-1.mp4","assets/img/cover-ember-2.mp4"],      price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"violet-drift",title:"Violet Drift",sub:"Rippled chrome", img:"assets/img/gen-cover-violet.png",   imgClean:"", videos:["assets/img/cover-violet-1.mp4","assets/img/cover-violet-2.mp4"],    price:39, premium:true,  auctionOnly:false, subPrice:19, pay:"" },
    { id:"shatter",     title:"Shatter",     sub:"Steel shards",   img:"assets/img/gen-cover-shards.png",   imgClean:"", videos:["assets/img/cover-shards-1.mp4","assets/img/cover-shards-2.mp4"],    price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"champagne",   title:"Champagne",   sub:"Gold chrome",    img:"assets/img/gen-cover-gold.png",     imgClean:"", videos:["assets/img/cover-gold-1.mp4","assets/img/cover-gold-2.mp4"],        price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"gunmetal",    title:"Gunmetal",    sub:"Faceted metal",  img:"assets/img/gen-cover-gunmetal.png", imgClean:"", videos:["assets/img/cover-gunmetal-1.mp4","assets/img/cover-gunmetal-2.mp4"],price:39, premium:true,  auctionOnly:false, subPrice:19, pay:"" },
    { id:"chrome-smoke",title:"Chrome Smoke",sub:"Smoke & metal",  img:"assets/img/gen-cover-smoke.png",    imgClean:"", videos:["assets/img/cover-smoke-1.mp4","assets/img/cover-smoke-2.mp4"],      price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"harmattan",   title:"Harmattan",   sub:"Dusty silver",   img:"assets/img/gen-cover-sand.png",     imgClean:"", videos:["assets/img/cover-sand-1.mp4","assets/img/cover-sand-2.mp4"],        price:39, premium:false, auctionOnly:false, pay:"" },
    // ── Auction-only covers (Vault Drop exclusive — never shown in store) ──
    { id:"onyx-rain",   title:"Onyx Rain",   sub:"Vault Drop exclusive", img:"assets/img/gen-cover-onyx.png",  videos:[], price:null, premium:false, auctionOnly:true, pay:"" },
    { id:"sol-chrome",  title:"Sol Chrome",  sub:"Vault Drop exclusive", img:"assets/img/gen-cover-sol.png",   videos:[], price:null, premium:false, auctionOnly:true, pay:"" },
    { id:"iron-bloom",  title:"Iron Bloom",  sub:"Vault Drop exclusive", img:"assets/img/gen-cover-iron.png",  videos:[], price:null, premium:false, auctionOnly:true, pay:"" },
    { id:"midnight-arc",title:"Midnight Arc",sub:"Vault Drop exclusive", img:"assets/img/gen-cover-arc.png",   videos:[], price:null, premium:false, auctionOnly:true, pay:"" }
  ]
};
