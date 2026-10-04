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
      coverIds:      ["shattered-chrome","silver-wave","silver-lava","lava","red-lava","glass","dark-crystal","lightning-burst","the-purple-wave"],
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
      coverIds:      ["balaclava","balaclava-ii","dark-hood","after-hours","after-hours-ii","3am","blue-queen","blue-queen-ii","blue-silhouette","smoker"],
      priceGBP:      50,
      memberPriceGBP:35,
      available:     5,
      tag:           "Limited"
    },
    {
      id:            "golden-hour-vol1",
      code:          "AWA-PACK-003",
      title:         "Golden Hour Vol. 1",
      subtitle:      "8 covers ‚Äî warm gold, warm nights, golden moments",
      mood:          "Gold, amber, warm tones ‚Äî premium warm palette",
      coverIds:      ["gold-vinyl","the-gold-wave","bonfire","beetle-sunset","beetle-sunset-ii","close-eyes","clear-chain","she"],
      priceGBP:      50,
      memberPriceGBP:35,
      available:     8,
      tag:           "Popular"
    },
    {
      id:            "tribe-vol1",
      code:          "AWA-PACK-004",
      title:         "Tribe Vol. 01",
      subtitle:      "13 covers — African identity, black & gold presence",
      mood:          "Minimalist African line art, black and gold on clean ground",
      coverIds:      ["adinkra-chrome","adinkra-chrome-ii","african-king","afronaut","afronaut-ii","afro-fusion","lagos","tribal","solo","bentley-night-ii","smoke-chain"],
      priceGBP:      49,
      memberPriceGBP:34,
      available:     10,
      tag:           "Legacy"
    },
    {
      id:            "afro-japan-vol2",
      code:          "AWA-PACK-005",
      title:         "Afro Japan Vol. 02",
      subtitle:      "9 covers — Afrofuturist meets ukiyo-e",
      mood:          "Deep amber, vermilion, wave compositions, high contrast illustration",
      coverIds:      ["anime-rooftop","ankara-rooftop","ankara-rooftop-ii","ankara-dance","ankara-dance-ii","beach-party","bentley-night","black-coupe"],
      priceGBP:      39,
      memberPriceGBP:27,
      available:     8,
      tag:           "Legacy"
    },
    {
      id:            "bathroom-love-vol3",
      code:          "AWA-PACK-006",
      title:         "Bathroom Love Vol. 03",
      subtitle:      "8 covers — intimate, hazy, candlelit",
      mood:          "Steam, mirrors, rose petals — emotional realism for R&B and soul",
      coverIds:      ["bonfire","beetle-sunset","beetle-sunset-ii","close-eyes","clear-chain","she","creation","gold-vinyl"],
      priceGBP:      35,
      memberPriceGBP:25,
      available:     8,
      tag:           "Legacy"
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
    { id:"shattered-chrome",  series:"chrome-reign",  title:"Shattered Chrome",  sub:"Fractured metal",    img:"assets/img/covers/SHATTERED-CHROME-with-title.webp",  imgClean:"assets/img/covers/SHATTERED-CHROME-no-title.webp",  videos:["assets/video/covers/SHATTERED-CHROME-V1.mp4","assets/video/covers/SHATTERED-CHROME-V2.mp4"], price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"silver-wave",       series:"chrome-reign",  title:"Silver Wave",       sub:"Chrome tide",        img:"assets/img/covers/SILVER-WAVE-with-title.webp",       imgClean:"assets/img/covers/SILVER-WAVE-no-title.webp",       videos:["assets/video/covers/SILVER-WAVE-V1.mp4","assets/video/covers/SILVER-WAVE-V2.mp4"],             price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"silver-lava",       series:"chrome-reign",  title:"Silver Lava",       sub:"Molten silver",      img:"assets/img/covers/SILVER-LAVA-with-title.webp",       imgClean:"assets/img/covers/SILVER-LAVA-no-title.webp",       videos:["assets/video/covers/SILVER-LAVA-V1.mp4","assets/video/covers/SILVER-LAVA-V2.mp4"],             price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"lava",              series:"chrome-reign",  title:"Lava",              sub:"Volcanic flow",      img:"assets/img/covers/LAVA-with-title.webp",              imgClean:"assets/img/covers/LAVA-no-title.webp",              videos:["assets/video/covers/LAVA.mp4"],                                                                price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"red-lava",          series:"chrome-reign",  title:"Red Lava",          sub:"Crimson metal",      img:"assets/img/covers/RED-LAVA-with-title.webp",          imgClean:"assets/img/covers/RED-LAVA-no-title.webp",          videos:["assets/video/covers/RED-LAVA-V1.mp4","assets/video/covers/RED-LAVA-V2.mp4"],                 price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"glass",             series:"chrome-reign",  title:"Glass",             sub:"Crystal chrome",     img:"assets/img/covers/GLASS-with-title.webp",             imgClean:"assets/img/covers/GLASS-no-title.webp",             videos:["assets/video/covers/GLASS.mp4"],                                                               price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"dark-crystal",      series:"chrome-reign",  title:"Dark Crystal",      sub:"Obsidian facets",    img:"assets/img/covers/DARK-CRYSTAL-with-title.webp",      imgClean:"assets/img/covers/DARK-CRYSTAL-no-title.webp",      videos:["assets/video/covers/DARK-CRYSTAL-V1.mp4","assets/video/covers/DARK-CRYSTAL-V2.mp4"],         price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"lightning-burst",   series:"chrome-reign",  title:"Lightning Burst",   sub:"Electric chrome",    img:"assets/img/covers/LIGHTNING-BURST-with-title.webp",   imgClean:"assets/img/covers/LIGHTNING-BURST-no-title.webp",   videos:["assets/video/covers/LIGHTNING-BURST.mp4"],                                                    price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"the-purple-wave",   series:"chrome-reign",  title:"The Purple Wave",   sub:"Violet chrome",      img:"assets/img/covers/THE-PURPLE-WAVE-with-title.webp",   imgClean:"assets/img/covers/THE-PURPLE-WAVE-no-title.webp",   videos:["assets/video/covers/THE-PURPLE-WAVE-V1.mp4","assets/video/covers/THE-PURPLE-WAVE-V2.mp4"], price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"waves",             series:"chrome-reign",  title:"Waves",             sub:"Chrome ocean",       img:"assets/img/covers/WAVES-with-title.webp",             imgClean:"assets/img/covers/WAVES-no-title.webp",             videos:["assets/video/covers/WAVES-V1.mp4","assets/video/covers/WAVES-V2.mp4"],                     price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"blue-window",       series:"chrome-reign",  title:"Blue Window",       sub:"Chrome glass",       img:"assets/img/covers/BLUE-WINDOW-with-title.webp",       imgClean:"assets/img/covers/BLUE-WINDOW-no-title.webp",       videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ DARK MATTER SERIES (12) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"balaclava",         series:"dark-matter",   title:"Balaclava",         sub:"Masked identity",    img:"assets/img/covers/BALACLAVA-with-title.webp",         imgClean:"assets/img/covers/BALACLAVA-no-title.webp",         videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"balaclava-ii",      series:"dark-matter",   title:"Ghost",             sub:"Masked presence",    img:"assets/img/covers/BALACLAVA-II-with-title.webp",      imgClean:"assets/img/covers/BALACLAVA-II-no-title.webp",      videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"dark-hood",         series:"dark-matter",   title:"Dark Hood",         sub:"Shadow figure",      img:"assets/img/covers/DARK-HOOD-with-title.webp",         imgClean:"assets/img/covers/DARK-HOOD-no-title.png",          videos:["assets/video/covers/DARK-HOOD.mp4"],                                                          price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"after-hours",       series:"dark-matter",   title:"After Hours",       sub:"Night session",      img:"assets/img/covers/AFTER-HOURS-with-title.png",        imgClean:"assets/img/covers/AFTER-HOURS-no-title.webp",       videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"after-hours-ii",    series:"dark-matter",   title:"Last Call",         sub:"Late night session",  img:"assets/img/covers/AFTER-HOURS-II-with-title.png",     imgClean:"assets/img/covers/AFTER-HOURS-II-no-title.webp",    videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"3am",               series:"dark-matter",   title:"3AM",               sub:"3 AM streets",       img:"assets/img/covers/3AM-with-title.webp",               imgClean:"assets/img/covers/3AM-no-title.webp",               videos:["assets/video/covers/3AM.mp4"],                                                                price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"blue-queen",        series:"dark-matter",   title:"Blue Queen",        sub:"Royal dark",         img:"assets/img/covers/BLUE-QUEEN-with-title.webp",        imgClean:"assets/img/covers/BLUE-QUEEN-no-title.webp",        videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"blue-queen-ii",     series:"dark-matter",   title:"Sapphire",          sub:"Cobalt royalty",     img:"assets/img/covers/BLUE-QUEEN-II-with-title.webp",     imgClean:"assets/img/covers/BLUE-QUEEN-II-no-title.webp",     videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"blue-silhouette",   series:"dark-matter",   title:"Blue Silhouette",   sub:"Shadow form",        img:"assets/img/covers/BLUE-SILHOUETTE-with-title.webp",   imgClean:"assets/img/covers/BLUE-SILHOUETTE-no-title.png",    videos:["assets/video/covers/BLUE-SILHOUETTE-V1.mp4","assets/video/covers/BLUE-SILHOUETTE-V2.mp4","assets/video/covers/BLUE-SILHOUETTE-V3.mp4"], price:35, premium:true, auctionOnly:false, pay:"" },
    { id:"smoker",            series:"dark-matter",   title:"Smoker",            sub:"Haze figure",        img:"assets/img/covers/SMOKER-with-title.webp",            imgClean:"assets/img/covers/SMOKER-no-title.webp",            videos:["assets/video/covers/SMOKER-V1.mp4","assets/video/covers/SMOKER-V2.mp4"],                 price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"chain-drop",        series:"dark-matter",   title:"Chain Drop",        sub:"Chain noir",         img:"assets/img/covers/CHAIN-DROP-with-title.webp",        imgClean:"assets/img/covers/CHAIN-DROP-no-title.png",         videos:["assets/video/covers/CHAIN-DROP.mp4"],                                                         price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"bodega-cat",        series:"dark-matter",   title:"Bodega Cat",        sub:"Street icon",        img:"assets/img/covers/BODEGA-CAT-with-title.webp",        imgClean:"assets/img/covers/BODEGA-CAT-no-title.webp",        videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ GOLDEN HOUR SERIES (9) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"gold-vinyl",        series:"golden-hour",   title:"Gold Vinyl",        sub:"Spinning gold",      img:"assets/img/covers/GOLD-VINYL-with-title.webp",        imgClean:"assets/img/covers/GOLD-VINYL-no-title.webp",        videos:["assets/video/covers/GOLD-VINYL.mp4"],                                                         price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"the-gold-wave",     series:"golden-hour",   title:"The Gold Wave",     sub:"Golden tide",        img:"assets/img/covers/THE-GOLD-WAVE-with-title.webp",     imgClean:"assets/img/covers/THE-GOLD-WAVE-no-title.webp",     videos:["assets/video/covers/THE-GOLD-WAVE-V1.mp4","assets/video/covers/THE-GOLD-WAVE-V2.mp4"],     price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"bonfire",           series:"golden-hour",   title:"Bonfire",           sub:"Warm glow",          img:"assets/img/covers/BONFIRE-with-title.webp",           imgClean:"assets/img/covers/BONFIRE-no-title.webp",           videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"beetle-sunset",     series:"golden-hour",   title:"Beetle Sunset",     sub:"Golden ride",        img:"assets/img/covers/BEETLE-SUNSET-with-title.webp",     imgClean:"assets/img/covers/BEETLE-SUNSET-no-title.webp",     videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"beetle-sunset-ii",  series:"golden-hour",   title:"Golden Ride",       sub:"Chrome on the road", img:"assets/img/covers/BEETLE-SUNSET-II-with-title.webp",  imgClean:"assets/img/covers/BEETLE-SUNSET-II-no-title.webp",  videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"close-eyes",        series:"golden-hour",   title:"Close Eyes",        sub:"Golden moment",      img:"assets/img/covers/CLOSE-EYES-with-title.png",         imgClean:"assets/img/covers/CLOSE-EYES-no-title.png",         videos:["assets/video/covers/CLOSE-EYES.mp4"],                                                         price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"clear-chain",       series:"golden-hour",   title:"Clear Chain",       sub:"Crystal gold",       img:"assets/img/covers/CLEAR-CHAIN-with-title.webp",       imgClean:"assets/img/covers/CLEAR-CHAIN-no-title.png",        videos:["assets/video/covers/CLEAR-CHAIN.mp4"],                                                        price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"she",               series:"golden-hour",   title:"She",               sub:"Golden presence",    img:"assets/img/covers/SHE-with-title.webp",               imgClean:"assets/img/covers/SHE-no-title.png",                videos:["assets/video/covers/SHE.mp4"],                                                                price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"creation",          series:"golden-hour",   title:"Creation",          sub:"Golden birth",       img:"assets/img/covers/CREATION-with-title.webp",          imgClean:"assets/img/covers/CREATION-no-title.webp",          videos:["assets/video/covers/CREATION.mp4"],                                                           price:35, premium:true,  auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ STREET CINEMA SERIES (8) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"anime-rooftop",     series:"street-cinema", title:"Anime Rooftop",     sub:"Tokyo heights",      img:"assets/img/covers/ANIME-ROOFTOP-with-title.webp",     imgClean:"assets/img/covers/ANIME-ROOFTOP-no-title.webp",     videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"ankara-rooftop",    series:"street-cinema", title:"Ankara Rooftop",    sub:"African skyline",    img:"assets/img/covers/ANKARA-ROOFTOP-with-title.webp",    imgClean:"assets/img/covers/ANKARA-ROOFTOP-no-title.webp",    videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"ankara-rooftop-ii", series:"street-cinema", title:"Sky View",          sub:"Rooftop heights",    img:"assets/img/covers/ANKARA-ROOFTOP-II-with-title.webp", imgClean:"assets/img/covers/ANKARA-ROOFTOP-II-no-title.webp", videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"ankara-dance",      series:"street-cinema", title:"Ankara Dance",      sub:"Street dance",       img:"assets/img/covers/ANKARA-DANCE-with-title.webp",      imgClean:"assets/img/covers/ANKARA-DANCE-no-title.webp",      videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"ankara-dance-ii",   series:"street-cinema", title:"Freeform",          sub:"Movement uncut",     img:"assets/img/covers/ANKARA-DANCE-II-with-title.webp",   imgClean:"assets/img/covers/ANKARA-DANCE-II-no-title.webp",   videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"beach-party",       series:"street-cinema", title:"Beach Party",       sub:"Coastal scene",      img:"assets/img/covers/BEACH-PARTY-with-title.webp",       imgClean:"assets/img/covers/BEACH-PARTY-no-title.webp",       videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"bentley-night",     series:"street-cinema", title:"Bentley Night",     sub:"Night drive",        img:"assets/img/covers/BENTLEY-NIGHT-with-title.webp",     imgClean:"assets/img/covers/BENTLEY-NIGHT-no-title.webp",     videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"black-coupe",       series:"street-cinema", title:"Black Coupe",       sub:"Street chrome",      img:"assets/img/covers/BLACK-COUPE-with-title.webp",       imgClean:"assets/img/covers/BLACK-COUPE-no-title.webp",       videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ ROOTS & CHROME SERIES (11) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"adinkra-chrome",    series:"roots-chrome",  title:"Adinkra Chrome",    sub:"Heritage chrome",    img:"assets/img/covers/ADINKRA-CHROME-with-title.webp",    imgClean:"assets/img/covers/ADINKRA-CHROME-no-title.webp",    videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"adinkra-chrome-ii", series:"roots-chrome",  title:"Sankofa",           sub:"Symbol of return",   img:"assets/img/covers/ADINKRA-CHROME-II-with-title.webp", imgClean:"assets/img/covers/ADINKRA-CHROME-II-no-title.webp", videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"african-king",      series:"roots-chrome",  title:"African King",      sub:"Royal roots",        img:"assets/img/covers/AFRICAN-KING-with-title.webp",      imgClean:"assets/img/covers/AFRICAN-KING-no-title.webp",      videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"afronaut",          series:"roots-chrome",  title:"Afronaut",          sub:"Space Africa",       img:"assets/img/covers/AFRONAUT-with-title.webp",          imgClean:"assets/img/covers/AFRONAUT-no-title.webp",          videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"afronaut-ii",       series:"roots-chrome",  title:"Orbit",             sub:"Deep space drift",   img:"assets/img/covers/AFRONAUT-II-with-title.webp",       imgClean:"assets/img/covers/AFRONAUT-II-no-title.webp",       videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"afro-fusion",       series:"roots-chrome",  title:"Afro Fusion",       sub:"Fusion roots",       img:"assets/img/covers/AFRO-FUSION-with-title.webp",       imgClean:"assets/img/covers/AFRO-FUSION-no-title.png",        videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"lagos",             series:"roots-chrome",  title:"Lagos",             sub:"Lagos chrome",       img:"assets/img/covers/LAGOS-with-title.webp",             imgClean:"assets/img/covers/LAGOS-no-title.webp",             videos:["assets/video/covers/LAGOS-V1.mp4","assets/video/covers/LAGOS-V2.mp4"],                     price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"tribal",            series:"roots-chrome",  title:"Tribal",            sub:"Tribal chrome",      img:"assets/img/covers/TRIBAL-with-title.webp",            imgClean:"assets/img/covers/TRIBAL-no-title.webp",            videos:["assets/video/covers/TRIBAL.mp4"],                                                             price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"solo",              series:"roots-chrome",  title:"Solo",              sub:"Solo stance",        img:"assets/img/covers/SOLO-with-title.webp",              imgClean:"assets/img/covers/SOLO-no-title.webp",              videos:["assets/video/covers/SOLO.mp4"],                                                               price:35, premium:true,  auctionOnly:false, pay:"" },
    { id:"bentley-night-ii",  series:"roots-chrome",  title:"Phantom Ride",      sub:"Night chrome",       img:"assets/img/covers/BENTLEY-NIGHT-II-with-title.webp",  imgClean:"assets/img/covers/BENTLEY-NIGHT-II-no-title.webp",  videos:[],                                                                                              price:25, premium:false, auctionOnly:false, pay:"" },
    { id:"smoke-chain",       series:"roots-chrome",  title:"Smoke Chain",       sub:"Chain smoke",        img:"assets/img/covers/SMOKE-CHAIN-with-title.webp",       imgClean:"assets/img/covers/SMOKE-CHAIN-no-title.png",        videos:["assets/video/covers/SMOKE-CHAIN.mp4"],                                                        price:35, premium:true,  auctionOnly:false, pay:"" },

    /* ‚îÄ‚îÄ COMING SOON ‚Äî Batch 3: 10 Oct 2026 ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"crimson",      series:"golden-hour",  title:"Crimson",      sub:"Red chrome",      img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:25, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"ruby",         series:"golden-hour",  title:"Ruby",         sub:"Gem chrome",      img:"assets/img/gen-cover-ember.png",    imgClean:"assets/img/gen-cover-ember.png",    videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"scarlet",      series:"golden-hour",  title:"Scarlet",      sub:"Vivid red",       img:"assets/img/gen-cover-shards.png",   imgClean:"assets/img/gen-cover-shards.png",   videos:[], price:25, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },
    { id:"blood-arc",    series:"dark-matter",  title:"Blood Arc",    sub:"Deep red void",   img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-10", pay:"" },

    /* ‚îÄ‚îÄ COMING SOON ‚Äî Batch 4: 24 Oct 2026 ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"steel-rain",   series:"roots-chrome", title:"Steel Rain",   sub:"Metal fall",      img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:25, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", pay:"" },
    { id:"void-matrix",  series:"dark-matter",  title:"Void Matrix",  sub:"Digital void",    img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-10-24", pay:"" },

    /* ‚îÄ‚îÄ COMING SOON ‚Äî Batch 5: 7 Nov 2026 ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"chrome-forest", series:"roots-chrome",title:"Chrome Forest", sub:"Nature metal",   img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:25, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"jade-chrome",   series:"roots-chrome",title:"Jade Chrome",   sub:"Green metal",    img:"assets/img/gen-cover-blue.png",     imgClean:"assets/img/gen-cover-blue.png",     videos:[], price:25, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"emerald",       series:"roots-chrome",title:"Emerald",       sub:"Pure gem chrome",img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:35, premium:true,  auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"ice-fold",      series:"chrome-reign",title:"Ice Fold",      sub:"Crystal cold",   img:"assets/img/gen-cover-gunmetal.png", imgClean:"assets/img/gen-cover-gunmetal.png", videos:[], price:25, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },
    { id:"void-signal",   series:"dark-matter", title:"Void Signal",   sub:"Static dark",    img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:25, premium:false, auctionOnly:false, comingSoon:true, releaseDate:"2026-11-07", pay:"" },

    /* ‚îÄ‚îÄ AUCTION ONLY (Vault Drop exclusive ‚Äî never shown in store) ‚îÄ‚îÄ‚îÄ‚îÄ‚îÄ */
    { id:"onyx-rain",    title:"Onyx Rain",    sub:"Vault Drop exclusive", img:"assets/img/gen-cover-smoke.png",    imgClean:"assets/img/gen-cover-smoke.png",    videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"sol-chrome",   title:"Sol Chrome",   sub:"Vault Drop exclusive", img:"assets/img/gen-cover-gold.png",     imgClean:"assets/img/gen-cover-gold.png",     videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"iron-bloom",   title:"Iron Bloom",   sub:"Vault Drop exclusive", img:"assets/img/gen-cover-foundry.png",  imgClean:"assets/img/gen-cover-foundry.png",  videos:[], price:null, auctionOnly:true, pay:"" },
    { id:"midnight-arc", title:"Midnight Arc", sub:"Vault Drop exclusive", img:"assets/img/gen-cover-violet.png",   imgClean:"assets/img/gen-cover-violet.png",   videos:[], price:null, auctionOnly:true, pay:"" }
  ]
};
