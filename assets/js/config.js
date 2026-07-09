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
  web3formsKey: "",      // free key from https://web3forms.com → sends to awasound.music@gmail.com
  enquiryEmail: "awasound.music@gmail.com",

  /* --- Membership --- */
  membershipPayLink: "", // GoDaddy Pay Link for the £4.99/mo Insider membership
  membershipPrice: 4.99,
  memberDiscount: 0.15,  // 15% off every service + cover art for members

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
  ]
};
