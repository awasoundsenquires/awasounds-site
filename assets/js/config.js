/* AWA SOUNDS ‚Äî central config
   Paste your keys here (all of these are safe to expose in a public static site):
   - Supabase anon key is public by design; data is protected by Row Level Security.
   - Web3Forms access key is a public submit key.
   - GoDaddy Pay Links are just checkout URLs.
   Leave a value empty ("") and the site degrades gracefully (buy buttons fall back
   to an email enquiry; account features stay hidden until Supabase keys are set). */
window.AWA = {
  /* --- Supabase (Awa Sounds project, awasoundsenquires@gmail.com) --- */
  supabaseUrl:     "https://rhiwtvdtbdudgtdqgjkc.supabase.co",
  supabaseAnonKey: "sb_publishable_Qy5KbtIGofTrZyTheHifKA_qY3fWg0I",

  /* --- Contact / demo form --- */
  web3formsKey: "eb514f46-d5ae-43ff-9ffc-933f8041340c",
  enquiryEmail: "awasoundsenquires@gmail.com",

  /* --- Membership --- */
  membershipPayLink: "https://buy.stripe.com/4gM14m76d3mD05SbtSawo03",
  membershipPrice: 4.99,
  memberDiscount: 0.15,
  coverMemberDiscount: 0.30,
     coverMidPayLink: "https://buy.stripe.com/28E3cubmtcXdg4Q69yawo0f",

  /* --- Beat store global pay links (Stripe ‚Äî one per tier, same for all beats) --- */
  beatPayLinks: {
    mp3:      "https://buy.stripe.com/7sYcN4eyF2iz3i4btSawo00",
    wav:      "https://buy.stripe.com/6oUcN49el0arg4Q7dCawo01",
    trackout: "https://buy.stripe.com/7sY5kCbmt6yP4m87dCawo02"
  },

  /* --- Cover art pay links per tier --- */
  coverPayLink:          "https://buy.stripe.com/7sYcN4629f5l3i49lKawo09",  /* ¬£15 Lifestyle */
  coverAnimatedPayLink:  "https://buy.stripe.com/3cIfZggGNbT9f0M1Tiawo0a",  /* ¬£25 Editorial  */
  coverPremiumPayLink:   "https://buy.stripe.com/14A5kCgGNaP5f0M0Peawo06",  /* ¬£35 Standard   */
  coverCinematicPayLink: "https://buy.stripe.com/aFabJ0629g9p19W0Peawo07",  /* ¬£40 Cinematic  */
  coverSignaturePayLink: "https://buy.stripe.com/28E9ASeyF2iz4m841qawo08",  /* ¬£50 Signature  */

  /* --- Vault Drop Auction --- */
  creditPayLinks: { 100: "", 250: "", 500: "" },
  defaultCreditRate: 10,
  storeRedemptionRate: { free: 20, member: 15 },
  maxDiscountPct: { free: 0.20, member: 0.35 },
  minPaymentFloorGBP: 15,
  monthlyFreeCredits: 20,
  monthlyMemberCredits: 50,
  bidFeeCredits: 5,
  productDurationMs: 300000,
  antiSnipeWindowMs: 60000,
  antiSnipeExtendMs: 90000,
  minProductsPerSession: 10,
  maxProductsPerSession: 15,
  maxBidderSlots: 8,
  maxViewersPerRoom: 20,
  maxLiveRooms: 6,
  inactivityAlertMs: 45000,
  inactivityDemoteMs: 60000,
  rejoinPriorityMs: 120000,
  heartbeatIntervalMs: 20000,

  roulettePrizes: [
    { id:"credits_10",  label:"10 Credits",       emoji:"‚ö°", type:"credits",        value:"10",  weight:30, color:"#1e1e2e" },
    { id:"credits_25",  label:"25 Credits",       emoji:"üíé", type:"credits",        value:"25",  weight:20, color:"#111a11" },
    { id:"credits_50",  label:"50 Credits",       emoji:"üî•", type:"credits",        value:"50",  weight:8,  color:"#11111a" },
    { id:"disc_10",     label:"10% Off",          emoji:"‚ú¶",  type:"discount_pct",   value:"10",  weight:20, color:"#1e140a" },
    { id:"disc_15",     label:"15% Off",          emoji:"‚òÖ",  type:"discount_pct",   value:"15",  weight:10, color:"#1e0f0a" },
    { id:"two_for_one", label:"Get One Free",     emoji:"üé®", type:"two_for_one",    value:null,  weight:6,  color:"#140a1e" },
    { id:"free_edit",   label:"Free Cover Edit",  emoji:"‚úèÔ∏è", type:"free_edit",      value:null,  weight:4,  color:"#0a141e" },
    { id:"album_disc",  label:"Album Pack ‚àí30%",  emoji:"üìÄ", type:"album_discount", value:"30",  weight:2,  color:"#1a1600" }
  ],

  streakMilestones: { 5:10, 7:5, 10:25, 14:10, 21:15, 30:50 },

  referralCredits: {
    purchaseShareBonus: 5,
    regBonusReferrer: 0,
    regBonusReferred: 0,
    firstPurchaseBonus: 25
  },

  albumPacks: [
    {
      id:            "chrome-reign-vol1",
      code:          "AWA-PACK-001",
      title:         "Chrome Reign Vol. 1",
      subtitle:      "9 covers ‚Äî same metallic universe, 9 distinct worlds",
      mood:          "Silver, chrome, liquid metal aesthetics",
      coverIds:      ["mercury","ember-fold","violet-drift","shatter","champagne","gunmetal","chrome-smoke","harmattan","foundry"],
      priceGBP:      50,
      memberPriceGBP:35,
      available:     10,
      tag:           "Best Value"
    },
    {
      id:            "dark-matter-vol1",
      code:          "AWA-PACK-002",
      title:         "Dark Matter Vol. 1",
      subtitle:      "10 covers ‚Äî darkness with identity",
      mood:          "Deep space, psychedelic chrome, unknown terrain",
      coverIds:      ["onyx","void-drift","phantom","eclipse","midnight-fold","null-field","abyss","dark-arc","shadow-chrome","undertow"],
      priceGBP:      50,
      memberPriceGBP:35,
      available:     5,
      tag:           "Limited"
    },
    {
      id:            "golden-hour-vol1",
      code:          "AWA-PACK-003",
      title:         "Golden Hour Vol. 1",
      subtitle:      "8 covers ‚Äî warm gold, royal chrome, amber haze",
      mood:          "Gold, amber, bronze ‚Äî premium warm palette",
      coverIds:      ["amber","gilded","bronze-arc","oro","sovereign","sun-chrome","heat","amber-smoke"],
      priceGBP:      50,
      memberPriceGBP:35,
      available:     8,
      tag:           "Popular"
    }
  ],

  activePromos: [
    { type:"buy_2_get_1", label:"Buy 2 covers, get 1 free from our free selection", code:"", expiresHours: null },
    { type:"bundle",      label:"Cover + WAV Lease ‚Äî save 20%", code:"BUNDLE20", expiresHours: null }
  ],

  licenses: {
    mp3:       { name:"MP3 Lease",  price:30,  streams:"30,000",   doc:"licenses/mp3-lease.html",     includes:["MP3 beat file","30,000 streams/sales limit"],                                              excludes:["Cover image","Animated cover video"] },
    wav:       { name:"WAV Lease",  price:45,  streams:"150,000",  doc:"licenses/wav-lease.html",     includes:["WAV beat file","150,000 streams/sales limit"],                                             excludes:["Cover image","Animated cover video"] },
    trackout:  { name:"Trackout",   price:145, streams:"550,000",  doc:"licenses/trackout-lease.html",includes:["WAV beat file","550,000 streams/sales limit"],                                             excludes:["Cover image","Animated cover video"] },
    stems:     { name:"Stems + Unlimited Streaming", price:299, streams:"Unlimited", doc:"licenses/trackout-lease.html", includes:["All stem files (WAV)","Unlimited commercial streams","Full mixing flexibility"], excludes:["Cover image","Animated cover video"] },
    exclusive: { name:"Exclusive",  price:null,streams:"Unlimited",doc:"licenses/exclusive.html",     includes:["WAV beat file","All stem files","Cover image (PNG)","Animated cover video (MP4)","Unlimited streams","Full ownership transfer","Removed from catalogue"], excludes:[] }
  },

  beats: [
    { id:"african-stamina",  title:"African Stamina",  producer:"AWA", bpm:113, key:"A&#x266f; Minor", tags:["Afrobeats","Afro Vibes","Tribal"],     cover:"assets/img/beat-african-stamina.png",  preview:"", stems:true, pay:{ mp3:"", wav:"", trackout:"", stems:"" } },
    { id:"chrome-nights",    title:"Chrome Nights",    producer:"AWA", bpm:92,  key:"A Minor",         tags:["R&B","Trapsoul"],                        cover:"assets/img/beat-chrome-nights.png",   preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"lagos-after-dark", title:"Lagos After Dark", producer:"AWA", bpm:105, key:"F Minor",         tags:["Afrobeats","Pop"],                       cover:"assets/img/beat-lagos-after-dark.png",preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"no-cosign",        title:"No Cosign",        producer:"AWA", bpm:140, key:"G Minor",         tags:["Trap","Drill"],                          cover:"assets/img/beat-no-cosign.png",       preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"silver-static",    title:"Silver Static",    producer:"AWA", bpm:120, key:"C Major",         tags:["Pop","Electronic"],                      cover:"assets/img/beat-silver-static.png",   preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"ember-room",       title:"Ember Room",       producer:"AWA", bpm:84,  key:"D Minor",         tags:["Alt R&B","Soul"],                        cover:"assets/img/beat-ember-room.png",      preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"foundry",          title:"Foundry",          producer:"AWA", bpm:128, key:"E Minor",         tags:["Hip-Hop","Boom Bap"],                    cover:"assets/img/beat-foundry.png",         preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"onyx-trap",        title:"Onyx Trap",        producer:"AWA", bpm:140, key:"F# Minor",        tags:["Trap","Dark Trap","Hard"],               cover:"assets/img/gen-studio-control.png",   preview:"https://cdn1.suno.ai/d815af2f-e686-4eaf-af7b-f62f27cf7e13.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"afro-sunrise",     title:"Afro Sunrise",     producer:"AWA", bpm:108, key:"A Major",         tags:["Afrobeats","Afro","Summer"],             cover:"assets/img/gen-stage.png",            preview:"https://cdn1.suno.ai/5a031591-23c5-42e0-8a2b-ecbee04c8ebb.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"midnight-drive",   title:"Midnight Drive",   producer:"AWA", bpm:96,  key:"G Minor",         tags:["R&B","Pop","Night"],                     cover:"assets/img/gen-studio-console.png",   preview:"https://cdn1.suno.ai/08a610bd-7c1e-46cd-940f-b80588e992f2.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"lagos-bounce",     title:"Lagos Bounce",     producer:"AWA", bpm:115, key:"D Major",         tags:["Afrobeats","Dancehall","Party"],         cover:"assets/img/gen-mic.png",              preview:"https://cdn1.suno.ai/754d832f-4910-4041-b340-f021bab57afa.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"steel-cut",        title:"Steel Cut",        producer:"AWA", bpm:145, key:"C# Minor",        tags:["UK Drill","Drill","Dark"],               cover:"assets/img/gen-beats-atmos.jpg",      preview:"https://cdn1.suno.ai/642fe1dc-7522-446e-8280-5fd15cd8e6c1.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"vapor-chrome",     title:"Vapor Chrome",     producer:"AWA", bpm:130, key:"E Major",         tags:["Future Bass","Pop","Electronic"],        cover:"assets/img/gen-chrome-texture.jpg",   preview:"https://cdn1.suno.ai/b7c1a794-2fbe-46f4-80de-9f6e86dc510e.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"red-room",         title:"Red Room",         producer:"AWA", bpm:84,  key:"B Minor",         tags:["Trap-Soul","R&B","Moody"],               cover:"assets/img/gen-studio-booth.png",     preview:"https://cdn1.suno.ai/914532d0-3263-47dd-9173-7351a50cc686.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"iron-temple",      title:"Iron Temple",      producer:"AWA", bpm:90,  key:"G# Minor",        tags:["Boom Bap","Hip-Hop","Classic"],          cover:"assets/img/gen-vinyl.png",            preview:"https://cdn1.suno.ai/c928ce5e-6199-4a9f-8249-47d311199278.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"crystal-wave",     title:"Crystal Wave",     producer:"AWA", bpm:110, key:"A Major",         tags:["Afropop","Electronic","Tropical"],       cover:"assets/img/gen-hero-2.png",           preview:"https://cdn1.suno.ai/b1a07325-a925-41ec-95bf-c861275b28e1.mp3", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"black-mirror",     title:"Black Mirror",     producer:"AWA", bpm:78,  key:"D Minor",         tags:["Dark R&B","Alternative","Moody"],        cover:"assets/img/gen-hero-1.png",           preview:"https://cdn1.suno.ai/b7e50c81-d2a3-4d01-87f6-994754fd6e06.mp3", pay:{ mp3:"", wav:"", trackout:"" } }
  ],

  /* ‚îÄ‚îÄ COVER ART CATALOGUE ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ
     Fields:
       series:       used for filter tabs ‚Äî "chrome-reign" | "dark-matter" | "golden-hour" | "street-cinema" | "roots-chrome"
       img:          path to artwork (currently same image serves as both clean base)
       imgClean:     explicit clean version path (same as img until separate clean renders exist)
       comingSoon:   true ‚Üí not purchasable; releaseDate shows countdown
       releaseDate:  ISO date "YYYY-MM-DD" for coming-soon countdown
       auctionOnly:  true ‚Üí never shown in store, only in Vault Drop
     Active catalogue: 51 covers (11+12+9+8+11) ‚Äî comingSoon not counted
     ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
  covers: [

    /* ‚îÄ‚îÄ CHROME REIGN SERIES (11) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"mercury",      series:"chrome-reign", title:"Mercury",      sub:"Liquid chrome",    img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:["assets/img/cover-blue-1.mp4","assets/img/cover-blue-2.mp4"],        price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"ember-fold",   series:"chrome-reign", title:"Ember Fold",   sub:"Molten silver",    img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:["assets/img/cover-ember-1.mp4","assets/img/cover-ember-2.mp4"],      price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"violet-drift", series:"chrome-reign", title:"Violet Drift", sub:"Rippled chrome",   img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:["assets/img/cover-violet-1.mp4","assets/img/cover-violet-2.mp4"],    price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"shatter",      series:"chrome-reign", title:"Shatter",      sub:"Steel shards",     img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:["assets/img/cover-shards-1.mp4","assets/img/cover-shards-2.mp4"],    price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"champagne",    series:"chrome-reign", title:"Champagne",    sub:"Gold chrome",      img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:["assets/img/cover-gold-1.mp4","assets/img/cover-gold-2.mp4"],        price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"gunmetal",     series:"chrome-reign", title:"Gunmetal",     sub:"Faceted metal",    img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:["assets/img/cover-gunmetal-1.mp4","assets/img/cover-gunmetal-2.mp4"],price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"chrome-smoke", series:"chrome-reign", title:"Chrome Smoke", sub:"Smoke & metal",    img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:["assets/img/cover-smoke-1.mp4","assets/img/cover-smoke-2.mp4"],      price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"harmattan",    series:"chrome-reign", title:"Harmattan",    sub:"Dusty silver",     img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:["assets/img/cover-sand-1.mp4","assets/img/cover-sand-2.mp4"],        price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"foundry",      series:"chrome-reign", title:"Foundry",      sub:"Molten steel",     img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[],                                                                    price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"silver-peak",  series:"chrome-reign", title:"Silver Peak",  sub:"Mountain chrome",  img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"liquid-arc",   series:"chrome-reign", title:"Liquid Arc",   sub:"Flowing silver",   img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },

    /* ‚îÄ‚îÄ DARK MATTER SERIES (12) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"onyx",          series:"dark-matter", title:"Onyx",          sub:"Pure void",        img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"void-drift",    series:"dark-matter", title:"Void Drift",    sub:"Chrome void",      img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"phantom",       series:"dark-matter", title:"Phantom",       sub:"Ghost metal",      img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"eclipse",       series:"dark-matter", title:"Eclipse",       sub:"Total dark",       img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"midnight-fold", series:"dark-matter", title:"Midnight Fold", sub:"Night metal",      img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"null-field",    series:"dark-matter", title:"Null",          sub:"Zero signal",      img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"abyss",         series:"dark-matter", title:"Abyss",         sub:"Deep void",        img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"dark-arc",      series:"dark-matter", title:"Dark Arc",      sub:"Curved void",      img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"shadow-chrome", series:"dark-matter", title:"Shadow Chrome", sub:"Matte void",       img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"undertow",      series:"dark-matter", title:"Undertow",      sub:"Slow void",        img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"deep-null",     series:"dark-matter", title:"Deep Null",     sub:"Absolute dark",    img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"void-prism",    series:"dark-matter", title:"Void Prism",    sub:"Dark refraction",  img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },

    /* ‚îÄ‚îÄ GOLDEN HOUR SERIES (9) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"amber",        series:"golden-hour", title:"Amber",        sub:"Warm gold",       img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"gilded",       series:"golden-hour", title:"Gilded",       sub:"Pure gold",       img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"bronze-arc",   series:"golden-hour", title:"Bronze Arc",   sub:"Copper chrome",   img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"oro",          series:"golden-hour", title:"Oro",          sub:"Spanish gold",    img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"sovereign",    series:"golden-hour", title:"Sovereign",    sub:"Royal gold",      img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"sun-chrome",   series:"golden-hour", title:"Sun Chrome",   sub:"Golden light",    img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"heat",         series:"golden-hour", title:"Heat",         sub:"Summer gold",     img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"amber-smoke",  series:"golden-hour", title:"Amber Smoke",  sub:"Golden haze",     img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"rose-gold",    series:"golden-hour", title:"Rose Gold",    sub:"Blush chrome",    img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:25, premium:false, auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ STREET CINEMA SERIES (8) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"signal",       series:"street-cinema", title:"Signal",       sub:"Radio static",    img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"current",      series:"street-cinema", title:"Current",      sub:"Electric chrome", img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"wave",         series:"street-cinema", title:"Wave",         sub:"Chrome ripple",   img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"frequency",    series:"street-cinema", title:"Frequency",    sub:"Signal chrome",   img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"static",       series:"street-cinema", title:"Static",       sub:"White noise",     img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"pulse",        series:"street-cinema", title:"Pulse",        sub:"Chrome beat",     img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"arc-surge",    series:"street-cinema", title:"Arc Surge",    sub:"Electric arc",    img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"surge",        series:"street-cinema", title:"Surge",        sub:"Power chrome",    img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ ROOTS & CHROME SERIES (11) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"terracotta",    series:"roots-chrome", title:"Terracotta",    sub:"Earth metal",     img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"clay",          series:"roots-chrome", title:"Clay",          sub:"Warm earth",      img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"sienna",        series:"roots-chrome", title:"Sienna",        sub:"Red earth",       img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"desert-chrome", series:"roots-chrome", title:"Desert Chrome", sub:"Arid metal",      img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"ochre",         series:"roots-chrome", title:"Ochre",         sub:"Yellow earth",    img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"loam",          series:"roots-chrome", title:"Loam",          sub:"Dark earth",      img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"fossil",        series:"roots-chrome", title:"Fossil",        sub:"Ancient chrome",  img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:15, premium:false, auctionOnly:false, pay:"" },
    { id:"flint",         series:"roots-chrome", title:"Flint",         sub:"Struck metal",    img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"dune-chrome",   series:"roots-chrome", title:"Dune Chrome",   sub:"Sand-swept metal",img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"titan",         series:"roots-chrome", title:"Titan",         sub:"Heavy metal",     img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:35, premium:true,  auctionOnly:false, subPrice:24, pay:"" },
    { id:"iron-summit",   series:"roots-chrome", title:"Iron Summit",   sub:"Peak metal",      img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:15, premium:false, auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ COMING SOON ‚Äî Batch 3: 10 Oct 2026 ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"crimson",   series:"golden-hour",  title:"Crimson",     sub:"Red chrome",      img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:15, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"ruby",      series:"golden-hour",  title:"Ruby",        sub:"Gem chrome",      img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", subPrice:24, pay:"" },
    { id:"scarlet",   series:"golden-hour",  title:"Scarlet",     sub:"Vivid red",       img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:15, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"blood-arc", series:"dark-matter",  title:"Blood Arc",   sub:"Deep red void",   img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", subPrice:24, pay:"" },

    /* ‚îÄ‚îÄ COMING SOON ‚Äî Batch 4: 24 Oct 2026 ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"steel-rain",  series:"roots-chrome", title:"Steel Rain",  sub:"Metal fall",      img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:15, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", pay:"" },
    { id:"void-matrix", series:"dark-matter",  title:"Void Matrix", sub:"Digital void",    img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", subPrice:24, pay:"" },

    /* ‚îÄ‚îÄ COMING SOON ‚Äî Batch 5: 7 Nov 2026 ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"chrome-forest",series:"roots-chrome",title:"Chrome Forest",sub:"Nature metal",   img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:15, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"jade-chrome",  series:"roots-chrome",title:"Jade Chrome",  sub:"Green metal",    img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:15, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"emerald",      series:"roots-chrome",title:"Emerald",      sub:"Pure gem chrome",img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", subPrice:24, pay:"" },
    { id:"ice-fold",     series:"chrome-reign",title:"Ice Fold",     sub:"Crystal cold",   img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:15, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"void-signal",  series:"dark-matter", title:"Void Signal",  sub:"Static dark",    img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:15, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },

    /* ‚îÄ‚îÄ AUCTION ONLY (Vault Drop exclusive ‚Äî never shown in store) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"onyx-rain",    title:"Onyx Rain",    sub:"Vault Drop exclusive", img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"sol-chrome",   title:"Sol Chrome",   sub:"Vault Drop exclusive", img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"iron-bloom",   title:"Iron Bloom",   sub:"Vault Drop exclusive", img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"midnight-arc", title:"Midnight Arc", sub:"Vault Drop exclusive", img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:null, auctionOnly:true, pay:"" }
  ]
};
