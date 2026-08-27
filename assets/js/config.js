/* AWA SOUNDS â€” central config
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
  enquiryEmail: "awasound.music@gmail.com",

  /* --- Membership --- */
  membershipPayLink: "",
  membershipPrice: 4.99,
  memberDiscount: 0.15,
  coverMemberDiscount: 0.30,

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
    { id:"credits_10",  label:"10 Credits",       emoji:"âš¡", type:"credits",        value:"10",  weight:30, color:"#1e1e2e" },
    { id:"credits_25",  label:"25 Credits",       emoji:"ðŸ’Ž", type:"credits",        value:"25",  weight:20, color:"#111a11" },
    { id:"credits_50",  label:"50 Credits",       emoji:"ðŸ”¥", type:"credits",        value:"50",  weight:8,  color:"#11111a" },
    { id:"disc_10",     label:"10% Off",          emoji:"âœ¦",  type:"discount_pct",   value:"10",  weight:20, color:"#1e140a" },
    { id:"disc_15",     label:"15% Off",          emoji:"â˜…",  type:"discount_pct",   value:"15",  weight:10, color:"#1e0f0a" },
    { id:"two_for_one", label:"Get One Free",     emoji:"ðŸŽ¨", type:"two_for_one",    value:null,  weight:6,  color:"#140a1e" },
    { id:"free_edit",   label:"Free Cover Edit",  emoji:"âœï¸", type:"free_edit",      value:null,  weight:4,  color:"#0a141e" },
    { id:"album_disc",  label:"Album Pack âˆ’30%",  emoji:"ðŸ“€", type:"album_discount", value:"30",  weight:2,  color:"#1a1600" }
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
      id:            "chrome-universe-vol1",
      code:          "AWA-PACK-001",
      title:         "Chrome Universe Vol. 1",
      subtitle:      "9 covers â€” same metallic universe, 9 distinct worlds",
      mood:          "Silver, chrome, liquid metal aesthetics",
      coverIds:      ["mercury","ember-fold","violet-drift","shatter","champagne","gunmetal","chrome-smoke","harmattan","foundry"],
      priceGBP:      49,
      memberPriceGBP:34,
      available:     10,
      tag:           "Best Value"
    },
    {
      id:            "void-series-vol1",
      code:          "AWA-PACK-002",
      title:         "Void Series Vol. 1",
      subtitle:      "10 Vault Drop exclusives â€” darkness with identity",
      mood:          "Deep space, psychedelic chrome, unknown terrain",
      coverIds:      ["onyx","void-drift","phantom","eclipse","midnight-fold","null","abyss","dark-arc","shadow-chrome","undertow"],
      priceGBP:      69,
      memberPriceGBP:49,
      available:     5,
      tag:           "Limited"
    },
    {
      id:            "gold-season-vol1",
      code:          "AWA-PACK-003",
      title:         "Gold Season Vol. 1",
      subtitle:      "8 covers â€” warm gold, royal chrome, amber haze",
      mood:          "Gold, amber, bronze â€” premium warm palette",
      coverIds:      ["amber","gilded","bronze-arc","oro","sovereign","sun-chrome","heat","amber-smoke"],
      priceGBP:      45,
      memberPriceGBP:32,
      available:     8,
      tag:           "Popular"
    }
  ],

  activePromos: [
    { type:"buy_2_get_1", label:"Buy 2 covers, get 1 free from our free selection", code:"", expiresHours: null },
    { type:"bundle",      label:"Cover + WAV Lease â€” save 20%", code:"BUNDLE20", expiresHours: null }
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

  /* â”€â”€ COVER ART CATALOGUE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     Fields:
       series:       used for filter tabs â€” "chrome-universe" | "void" | "gold-season" | "flux" | "earth-chrome"
       img:          path to artwork (currently same image serves as both clean base)
       imgClean:     explicit clean version path (same as img until separate clean renders exist)
       comingSoon:   true â†’ not purchasable; releaseDate shows countdown
       releaseDate:  ISO date "YYYY-MM-DD" for coming-soon countdown
       auctionOnly:  true â†’ never shown in store, only in Vault Drop
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  covers: [

    /* â”€â”€ CHROME UNIVERSE SERIES (9 â€” real artwork exists) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"mercury",      series:"chrome-universe", title:"Mercury",      sub:"Liquid chrome",   img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:["assets/img/cover-blue-1.mp4","assets/img/cover-blue-2.mp4"],        price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"ember-fold",   series:"chrome-universe", title:"Ember Fold",   sub:"Molten silver",   img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:["assets/img/cover-ember-1.mp4","assets/img/cover-ember-2.mp4"],      price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"violet-drift", series:"chrome-universe", title:"Violet Drift", sub:"Rippled chrome",  img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:["assets/img/cover-violet-1.mp4","assets/img/cover-violet-2.mp4"],    price:39, premium:true,  auctionOnly:false, subPrice:19, pay:"" },
    { id:"shatter",      series:"chrome-universe", title:"Shatter",      sub:"Steel shards",    img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:["assets/img/cover-shards-1.mp4","assets/img/cover-shards-2.mp4"],    price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"champagne",    series:"chrome-universe", title:"Champagne",    sub:"Gold chrome",     img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:["assets/img/cover-gold-1.mp4","assets/img/cover-gold-2.mp4"],        price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"gunmetal",     series:"chrome-universe", title:"Gunmetal",     sub:"Faceted metal",   img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:["assets/img/cover-gunmetal-1.mp4","assets/img/cover-gunmetal-2.mp4"],price:39, premium:true,  auctionOnly:false, subPrice:19, pay:"" },
    { id:"chrome-smoke", series:"chrome-universe", title:"Chrome Smoke", sub:"Smoke & metal",   img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:["assets/img/cover-smoke-1.mp4","assets/img/cover-smoke-2.mp4"],      price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"harmattan",    series:"chrome-universe", title:"Harmattan",    sub:"Dusty silver",    img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:["assets/img/cover-sand-1.mp4","assets/img/cover-sand-2.mp4"],        price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"foundry",      series:"chrome-universe", title:"Foundry",      sub:"Molten steel",    img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[],                                                                    price:39, premium:false, auctionOnly:false, pay:"" },

    /* â”€â”€ VOID SERIES (10) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"onyx",          series:"void", title:"Onyx",          sub:"Pure void",       img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:44, premium:false, auctionOnly:false, pay:"" },
    { id:"void-drift",    series:"void", title:"Void Drift",    sub:"Chrome void",     img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:44, premium:true,  auctionOnly:false, subPrice:29, pay:"" },
    { id:"phantom",       series:"void", title:"Phantom",       sub:"Ghost metal",     img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:44, premium:false, auctionOnly:false, pay:"" },
    { id:"eclipse",       series:"void", title:"Eclipse",       sub:"Total dark",      img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:44, premium:true,  auctionOnly:false, subPrice:29, pay:"" },
    { id:"midnight-fold", series:"void", title:"Midnight Fold", sub:"Night metal",     img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:44, premium:false, auctionOnly:false, pay:"" },
    { id:"null-field",    series:"void", title:"Null",          sub:"Zero signal",     img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"abyss",         series:"void", title:"Abyss",         sub:"Deep void",       img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:44, premium:true,  auctionOnly:false, subPrice:29, pay:"" },
    { id:"dark-arc",      series:"void", title:"Dark Arc",      sub:"Curved void",     img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:44, premium:false, auctionOnly:false, pay:"" },
    { id:"shadow-chrome", series:"void", title:"Shadow Chrome", sub:"Matte void",      img:"assets/img/gen-cover-sand.png",    imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"undertow",      series:"void", title:"Undertow",      sub:"Slow void",       img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:44, premium:false, auctionOnly:false, pay:"" },

    /* â”€â”€ GOLD SEASON SERIES (8) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"amber",        series:"gold-season", title:"Amber",        sub:"Warm gold",      img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"gilded",       series:"gold-season", title:"Gilded",       sub:"Pure gold",      img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:44, premium:true,  auctionOnly:false, subPrice:29, pay:"" },
    { id:"bronze-arc",   series:"gold-season", title:"Bronze Arc",   sub:"Copper chrome",  img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"oro",          series:"gold-season", title:"Oro",          sub:"Spanish gold",   img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:44, premium:false, auctionOnly:false, pay:"" },
    { id:"sovereign",    series:"gold-season", title:"Sovereign",    sub:"Royal gold",     img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:49, premium:true,  auctionOnly:false, subPrice:34, pay:"" },
    { id:"sun-chrome",   series:"gold-season", title:"Sun Chrome",   sub:"Golden light",   img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"heat",         series:"gold-season", title:"Heat",         sub:"Summer gold",    img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"amber-smoke",  series:"gold-season", title:"Amber Smoke",  sub:"Golden haze",    img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:39, premium:false, auctionOnly:false, pay:"" },

    /* â”€â”€ FLUX SERIES (7) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"signal",       series:"flux", title:"Signal",       sub:"Radio static",    img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"current",      series:"flux", title:"Current",      sub:"Electric chrome", img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"wave",         series:"flux", title:"Wave",         sub:"Chrome ripple",   img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:44, premium:true,  auctionOnly:false, subPrice:29, pay:"" },
    { id:"frequency",    series:"flux", title:"Frequency",    sub:"Signal chrome",   img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"static",       series:"flux", title:"Static",       sub:"White noise",     img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"pulse",        series:"flux", title:"Pulse",        sub:"Chrome beat",     img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"arc-surge",    series:"flux", title:"Arc Surge",    sub:"Electric arc",    img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:44, premium:true,  auctionOnly:false, subPrice:29, pay:"" },

    /* â”€â”€ EARTH CHROME SERIES (6) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"terracotta",    series:"earth-chrome", title:"Terracotta",    sub:"Earth metal",    img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"clay",          series:"earth-chrome", title:"Clay",          sub:"Warm earth",     img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"sienna",        series:"earth-chrome", title:"Sienna",        sub:"Red earth",      img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"desert-chrome", series:"earth-chrome", title:"Desert Chrome", sub:"Arid metal",     img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:44, premium:false, auctionOnly:false, pay:"" },
    { id:"ochre",         series:"earth-chrome", title:"Ochre",         sub:"Yellow earth",   img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:39, premium:false, auctionOnly:false, pay:"" },
    { id:"loam",          series:"earth-chrome", title:"Loam",          sub:"Dark earth",     img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:39, premium:false, auctionOnly:false, pay:"" },

    /* â”€â”€ COMING SOON â€” Batch 1: 12 Sept 2026 (16 days) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"frost",     series:"void",         title:"Frost",     sub:"Ice chrome",      img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:44, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-09-12", pay:"" },
    { id:"blizzard",  series:"chrome-universe",title:"Blizzard",sub:"Winter metal",    img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:39, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-09-12", pay:"" },
    { id:"arctic",    series:"void",         title:"Arctic",    sub:"Polar chrome",    img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:44, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-09-12", pay:"" },
    { id:"glacier",   series:"chrome-universe",title:"Glacier", sub:"Frozen metal",    img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:44, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-09-12", pay:"" },

    /* â”€â”€ COMING SOON â€” Batch 2: 26 Sept 2026 (30 days) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"midnight-signal",series:"flux",    title:"Midnight Signal",sub:"Night static",  img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:39, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-09-26", pay:"" },
    { id:"neon-drift", series:"flux",        title:"Neon Drift",  sub:"Electric violet",  img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:44, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-09-26", pay:"" },
    { id:"plasma",     series:"flux",        title:"Plasma",      sub:"Hot chrome",       img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:44, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-09-26", pay:"" },
    { id:"quantum",    series:"void",        title:"Quantum",     sub:"Future metal",     img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:49, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-09-26", pay:"" },

    /* â”€â”€ COMING SOON â€” Batch 3: 10 Oct 2026 (44 days) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"crimson",   series:"gold-season",  title:"Crimson",     sub:"Red chrome",       img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:39, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"ruby",      series:"gold-season",  title:"Ruby",        sub:"Gem chrome",       img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:44, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"scarlet",   series:"gold-season",  title:"Scarlet",     sub:"Vivid red",        img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:39, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"blood-arc", series:"void",         title:"Blood Arc",   sub:"Deep red void",    img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:44, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },

    /* â”€â”€ COMING SOON â€” Batch 4: 24 Oct 2026 (58 days) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"titan",       series:"earth-chrome",title:"Titan",       sub:"Heavy metal",     img:"assets/img/gen-cover-sand.png",     imgClean:"assets/img/gen-cover-sand.png",     videos:[], price:49, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", pay:"" },
    { id:"iron-summit", series:"earth-chrome",title:"Iron Summit", sub:"Peak metal",      img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:44, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", pay:"" },
    { id:"steel-rain",  series:"earth-chrome",title:"Steel Rain",  sub:"Metal fall",      img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:39, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", pay:"" },
    { id:"void-matrix", series:"void",        title:"Void Matrix", sub:"Digital void",    img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:44, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", pay:"" },

    /* â”€â”€ COMING SOON â€” Batch 5: 7 Nov 2026 (72 days) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    { id:"chrome-forest",series:"earth-chrome",title:"Chrome Forest",sub:"Nature metal",  img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:44, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"jade-chrome",  series:"earth-chrome",title:"Jade Chrome",  sub:"Green metal",   img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:39, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"emerald",      series:"earth-chrome",title:"Emerald",      sub:"Pure gem chrome",img:"assets/img/gen-cover-gold.png",    imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:49, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"ice-fold",     series:"chrome-universe",title:"Ice Fold",  sub:"Crystal cold",  img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:39, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"void-signal",  series:"void",        title:"Void Signal",  sub:"Static dark",   img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:44, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },

    /* â”€â”€ AUCTION ONLY (Vault Drop exclusive â€” never shown in store) â”€â”€â”€â”€â”€ */
    { id:"onyx-rain",    title:"Onyx Rain",    sub:"Vault Drop exclusive", img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"sol-chrome",   title:"Sol Chrome",   sub:"Vault Drop exclusive", img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"iron-bloom",   title:"Iron Bloom",   sub:"Vault Drop exclusive", img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"midnight-arc", title:"Midnight Arc", sub:"Vault Drop exclusive", img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:null, auctionOnly:true, pay:"" }
  ]
};
