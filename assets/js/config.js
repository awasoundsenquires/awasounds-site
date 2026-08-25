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
  // Credit-to-GBP rate used if not set per-auction
  defaultCreditRate: 10,       // 10 credits = £1
  // Monthly free credit allocation
  monthlyFreeCredits: 20,
  // Bid fee per bid (credits burned, non-refundable)
  bidFeeCredits: 5,

  /* --- License tiers (global; same for every beat) --- */
  licenses: {
    mp3:       { name: "MP3 Lease",  price: 30,   streams: "30,000",  doc: "licenses/mp3-lease.html" },
    wav:       { name: "WAV Lease",  price: 45,   streams: "150,000", doc: "licenses/wav-lease.html" },
    trackout:  { name: "Trackout",   price: 145,  streams: "550,000", doc: "licenses/trackout-lease.html" },
    exclusive: { name: "Exclusive",  price: null, streams: "Unlimited", doc: "licenses/exclusive.html" }
  },

  /* --- Beat catalogue ---
     pay: per-tier GoDaddy Pay Link for THIS beat. Empty → Buy button emails an enquiry.
     preview: optional mp3/clip for the play button (leave "" for now). */
  beats: [
    { id:"chrome-nights",  title:"Chrome Nights",   producer:"AWA", bpm:92,  key:"Am", tags:["R&B","Trapsoul"],       cover:"assets/img/beat-chrome-nights.png",  preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"lagos-after-dark", title:"Lagos After Dark", producer:"AWA", bpm:105, key:"Fm", tags:["Afrobeats","Pop"],     cover:"assets/img/beat-lagos-after-dark.png", preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"no-cosign",      title:"No Cosign",       producer:"AWA", bpm:140, key:"Gm", tags:["Trap","Drill"],          cover:"assets/img/beat-no-cosign.png",      preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"silver-static",  title:"Silver Static",   producer:"AWA", bpm:120, key:"C",  tags:["Pop","Electronic"],      cover:"assets/img/beat-silver-static.png",  preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"ember-room",     title:"Ember Room",      producer:"AWA", bpm:84,  key:"Dm", tags:["Alt R&B","Soul"],        cover:"assets/img/beat-ember-room.png",     preview:"", pay:{ mp3:"", wav:"", trackout:"" } },
    { id:"foundry",        title:"Foundry",         producer:"AWA", bpm:128, key:"Em", tags:["Hip-Hop","Boom Bap"],    cover:"assets/img/beat-foundry.png",        preview:"", pay:{ mp3:"", wav:"", trackout:"" } }
  ],

  /* --- Cover Art catalogue ---
     videos: the two motion versions. premium covers show a members price.
     pay: GoDaddy Pay Link for this cover (empty → email enquiry). */
  covers: [
    { id:"mercury",     title:"Mercury",     sub:"Liquid chrome",  img:"assets/img/gen-cover-blue.png",     videos:["assets/img/cover-blue-1.mp4","assets/img/cover-blue-2.mp4"],        price:39, premium:false, pay:"" },
    { id:"ember-fold",  title:"Ember Fold",  sub:"Molten silver",  img:"assets/img/gen-cover-ember.png",    videos:["assets/img/cover-ember-1.mp4","assets/img/cover-ember-2.mp4"],      price:39, premium:false, pay:"" },
    { id:"violet-drift",title:"Violet Drift",sub:"Rippled chrome", img:"assets/img/gen-cover-violet.png",   videos:["assets/img/cover-violet-1.mp4","assets/img/cover-violet-2.mp4"],    price:39, premium:true,  subPrice:19, pay:"" },
    { id:"shatter",     title:"Shatter",     sub:"Steel shards",   img:"assets/img/gen-cover-shards.png",   videos:["assets/img/cover-shards-1.mp4","assets/img/cover-shards-2.mp4"],    price:39, premium:false, pay:"" },
    { id:"champagne",   title:"Champagne",   sub:"Gold chrome",    img:"assets/img/gen-cover-gold.png",     videos:["assets/img/cover-gold-1.mp4","assets/img/cover-gold-2.mp4"],        price:39, premium:false, pay:"" },
    { id:"gunmetal",    title:"Gunmetal",    sub:"Faceted metal",  img:"assets/img/gen-cover-gunmetal.png", videos:["assets/img/cover-gunmetal-1.mp4","assets/img/cover-gunmetal-2.mp4"],price:39, premium:true,  subPrice:19, pay:"" },
    { id:"chrome-smoke",title:"Chrome Smoke",sub:"Smoke & metal",  img:"assets/img/gen-cover-smoke.png",    videos:["assets/img/cover-smoke-1.mp4","assets/img/cover-smoke-2.mp4"],      price:39, premium:false, pay:"" },
    { id:"harmattan",   title:"Harmattan",   sub:"Dusty silver",   img:"assets/img/gen-cover-sand.png",     videos:["assets/img/cover-sand-1.mp4","assets/img/cover-sand-2.mp4"],        price:39, premium:false, pay:"" }
  ]
};
