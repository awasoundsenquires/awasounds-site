# AWA Sounds Site â Workflow & Deployment Rules

## NON-NEGOTIABLE Rules (never skip)

### 1. NEVER use git push via Bash
All deployments go through the **Chrome extension only** â use the GitHub UI edit pencil.
Do NOT use GitHub MCP for `awasoundsenquires`. Chrome extension ONLY.

### 2. ALWAYS consult Mind before deploying
Present all planned changes to Mind for strategic approval and direction.
Mind reviews â gives direction on quality/brand â Words (Claude) executes after approval.
Never deploy without Mind's green light.

### 3. Update this workflow.md at the end of every phase
Document what changed, what's pending, and current file status.

---

## Encoding Rules (critical for GitHub Pages)

All multi-byte Unicode chars in JS/HTML **must** be encoded before upload via clipboard:

| Context | Method | Example |
|---------|--------|---------|
| JS innerHTML | HTML entities | `&#xB7;` for `Â·` |
| JS textContent | JS unicode escape | `Â·` for `Â·` |
| HTML attributes/text | HTML entities | `&middot;` for `Â·` |

**Common entities:**
- `Â·` middle dot â `&middot;` / `&#xB7;`
- `â` em dash â `&mdash;`
- `â` en dash â `&ndash;`
- `Â©` copyright â `&copy;`
- `Ã` multiply â `&#xD7;`
- `âº` play arrow â `&#x25BA;`
- `â¡` bolt â `&#x26A1;`
- `â` diamond â `&#x25C8;`

UTF-8 BOM at file start must be removed before deployment.

---

## Deployment Checklist

Before every deployment:
1. [ ] Mind has approved the changes
2. [ ] All Unicode chars replaced with HTML entities / JS escapes
3. [ ] No BOM in HTML files
4. [ ] Preview Pack buttons present on all 6 cover packs
5. [ ] Nav white block fix confirmed (`.nav-mobile-account` hidden on desktop)
6. [ ] File opened in Chrome extension edit pencil (not git push)

---

## Phase Status â as of 2026-10-04

### Phase: Badge Count Fixes + Full Site Audit (DEPLOYED 2026-10-04)

**Files deployed:**
- `cover-store.html` â Badge counts fixed: tribe "13 covers" â "11 covers &#xB7; 22 pairs", afro-japan "9 covers" â "8 covers &#xB7; 16 pairs", bathroom-love "8 covers" â "8 covers &#xB7; 16 pairs" â commit bd13732 â
- `assets/js/config.js` â Subtitle fixes: tribe "13 covers" â "11 covers", afro-japan "9 covers" â "8 covers" â commit 4f2bc23 â

**Site audit (2026-10-04):** All pages visual â
- Home (index.html): Gold CTA, 3-act cinematic scroll, glass pills â
- Beat Store (beat-store.html): CTAs correct â
- Contact (contact.html): Form fields, Send Submission button â
- Roster (roster.html): 6 artist cards, "This could be you" CTA â

### Phase: Preview Pack Fix + Cinematic Redesign (MIND APPROVED)

**Files deployed this session:**
- `assets/js/config.js` â Added 3 missing album packs (tribe-vol1, afro-japan-vol2, bathroom-love-vol3) to `albumPacks` array â deployed â (workflow #247)
- `assets/css/style.css` â CTA gold override (`.sw-btn--primary` white-on-white fix) â deployed â
- `assets/js/home-cinema.js` â Full 3-act cinematic redesign (Identity/Conflict/Invitation) with local video assets â deployed â (user confirmed)

**Root causes fixed:**
- Preview Pack buttons silently failing â `openPackViewer()` early-exits if pack ID not in `CFG.albumPacks`; 3 legacy packs were missing from live config.js
- White CTA button â `--sw-ink` resolves to near-white for light accents; overridden with gold `!important`

### Phase: Encoding + Visual Fixes + Awa Glass System (MIND APPROVED)

**Files deployed this session:**
- `assets/js/covers.js` â Full encoding restoration + entity fixes + code updates â commit `ab11987` â
- `assets/js/store.js` â All 8 `Â·` â `&#xB7;` â deployed â
- `cover-store.html` â BOM removed, en-dash/copyright fixed, Preview Pack buttons on all 6 packs â deployed â
- `assets/css/style.css` â 474 Mojibake fixes + desktop nav-hide media query + **Awa Glass System** (nav glass upgrade, cover card gradient overlay, `.pack-view-btn` glass pill) â deployed â
- `assets/js/main.js` â 3 bug fixes (`py`â`px`, missing `>` in `<small`, backspaceâ`"`) â deployed â
- `assets/js/cinematic-engine.js` â Glass pills for `.sw-copy__tags li` (blur/border/shadow, gold hover) â deployed â
- `assets/js/home-cinema.js` â Tags copy â `['Beats', 'Cover Art', 'Releases', 'Insider']` â deployed â

### Awa Glass System (Mind-Approved 2026-10-04):
- **Nav**: Enhanced `.nav.scrolled` with deeper blur, gold bottom shadow, inset top highlight
- **Cover/Beat/Pack cards**: Dark-to-transparent gradient overlay appears on hover (`.store-card .art::after`, `.bcard-art::after`, `.pack-img-wrap::after`)
- **Preview Pack button** (`.pack-view-btn`): Liquid glass pill â dark frosted bg, gold border, blur, gold hover state
- **Scroll-cinema tags** (`.sw-copy__tags li`): Glass pill treatment in `cinematic-engine.js`
- Tags copy simplified: `['Beats', 'Cover Art', 'Releases', 'Insider']`

**Files already deployed (previous sessions):**
- `assets/js/signal.js` â `&#x26A1;` entity fix (commit `dfd5339`)
- `assets/js/account.js` â double IIFE removed, encoding fixed (commit `bf428c0`)

### Phase: Video Swap + Pack Viewer Dual-Image Toggle (MIND APPROVED â 2026-10-04)

**Files deployed (2026-10-04):**
- `assets/js/home-cinema.js` â ACT 2 video swapped: `studio-ambiance.mp4` â `portrait-sable.mp4` â commit 33451a4 â
- `assets/js/covers.js` â Pack viewer upgraded: WITH TITLE / CLEAN toggle pills added; each card renders both `img` (titled) and `imgClean` (no title) versions; CLEAN hidden by default, toggle switches all cards â commit 3c7de49 â

**Note on scroll-driven video:** `cinematic-engine.js` already implements scroll-driven video scrubbing via `raf()` â `video.currentTime = scrollProgress * duration`. This is confirmed live â videos seek based on scroll position, not looping. No engine change needed.

**Deploy method:** Chrome extension only â awasoundsenquires/awasounds-site master

### Phase: Home Page Revision â Section by Section (MIND APPROVED â 2026-10-05)

**All 9 changes approved by Mind (Mode C audit). Deployed 2026-10-05:**

**Files deployed:**
- `assets/js/home-cinema.js` â Reduced 3-act structure to single section; video changed to `studio-ambiance.mp4`; `tags` array removed; only "Submit Your Demo" + "Explore the Label" CTAs remain; `nav: false` set. Deployed via PR #1 merge â commit `628f9cc` â
- `index.html` â SVS `.svs-label` font-size 11px â 15px; color rgba(200,168,75,.6) â .85; added nav dot/counter suppression (`.sw-route`, `.sw-copy__num`); added liquid glass CSS on `.sw-copy` + reduced overlay on `.sw-copylayer::before`; added logo fix (`aspect-ratio: auto`, `overflow: visible`, `max-height: none`); swapped SVS labels (Premium Artwork after #releases, Visual Identity after #store-teaser) â commit `08edd32` â

**Changes logged:**
- Hero: single scroll video (studio-ambiance.mp4), no 3-act structure â
- Nav dots: suppressed globally via CSS â
- Tags removed: only 2 CTAs in hero â
- Logo: overflow visible, no aspect-ratio constraint â
- SVS text: 30% bigger (11px â 15px), more opaque gold (.85) â
- SVS label swap: "Premium Artwork Â· Sold Once Â· Retired Forever" before Cover Art Store; "Visual Identity Â· Cover Art Â· Your Sound Made Visible" after Cover Art Store â
- Liquid glass: backdrop-filter blur(18px), reduced copylayer overlay â

**Note:** `studio-ambiance.mp4` is placeholder for original void/darkness zoom video (CloudFront source unavailable). Flag for future replacement when original restored.

### Phase: Hero Video Reversal + Logo Fix (DEPLOYED 2026-10-05)

**Files deployed:**
- `assets/js/cinematic-engine.js` â Added `reverse` flag support: `reverse:s.reverse||false` on segment build, reversed `currentTime = (1-clamp)*dur` in `raf()`, reversed copy opacity `smooth((pr-0.6)/0.4)` for `seg.reverse` sections â commit `cdd273d` â
- `assets/js/home-cinema.js` â Added `reverse: true` to `awa-identity` section â commit `1d3d112` â
- `index.html` â Removed `#home-world video { transform: scaleX(-1); }` (engine now handles reversal); added `.split-media--logo .logo-reveal-img { object-fit: contain !important; filter: none !important; }` (higher specificity than `.split-media img` rule in style.css) â commit `ca2acbd` â

**Changes verified live:**
- Hero starts on RIGHT side of mixer (SSL faders, VU meters) â reversed start position â
- Camera pans LEFT as user scrolls down â
- Text "Independent. Cinematic. Permanent." appears at end of scroll â
- Logo (logo-3d-chrome.png) fully visible, no side cropping â full chrome triangle + "AWA SOUNDS" text â

**Root cause of logo bug (LOCKED â do not regress):**
- `.split-media img { object-fit: cover }` in `style.css` has specificity (0,1,1)
- `.logo-reveal-img { object-fit: contain }` has specificity (0,1,0) â lower, gets overridden
- Fix: `.split-media--logo .logo-reveal-img` has specificity (0,2,0) + `!important` wins

**Video reversal mechanism (LOCKED):**
- Engine: `s.reverse ? (1 - clamp(s.cur,0.001,1)) * dur : clamp(s.cur,0,0.999) * dur` in `raf()`
- Config: `reverse: true` in home-cinema.js section â passed as `seg.reverse` in cinematic-engine.js
- Do NOT use CSS `scaleX(-1)` â that only mirrors the first frame, does not reverse temporal playback

### Pending (BACKLOG):
- Add dedicated Insider/membership CTA to desktop nav (currently only "Submit Demo" + auth.js sign-in link) â Mind flagged as a missed conversion point
- Gallery/roster/releases image lazy-load: change `loading="lazy"` to `loading="eager"` for first N images (LCP issue)
- Add minimal footer to all main pages
- Check other pages for "Become an Insider" white block (beat-store.html, etc. â same CSS fix covers all pages via style.css)

---

## Blueprint Action Items (from AwaSounds Cult OS Blueprint v1.1 â Mind, 2026-10-05)

These are extracted from the Higgsfield AI session blueprint. All changes need Mind approval + Q&A before deployment.

### CREDIBILITY LEAKS (HIGH PRIORITY â fix this week)

1. ~~**Placeholder phone number in footers**~~ â **DONE (2026-10-13).** Removed `+44 (0) 000 000 000` from all 6 pages (cover-store, about, releases, studio, gallery, roster). Footer now shows email + United Kingdom + Submit a Demo only.
2. **Email â Gmail address** â `awasoundsenquires@gmail.com` is currently used site-wide. Branded email (`@awasounds.com`) is a future upgrade. **DEFERRED** â keep Gmail until site is fully live and products are deployed. Do not change now.
3. ~~**Broken Cover Store markup**~~ â **DONE (2026-10-13, commit 751fc12).** Removed: (a) `#cover-intro-seq` section â 761px black void caused by video with opacity:0 and no driving JS; (b) orphan CIS CSS block (~2KB of dead rules); (c) `roulette.css` link and `roulette.js` script â loaded but no HTML container to mount on. Cover store now goes straight from hero â member banner â cover grid.
4. **Reframe Nova Vale / K'ayo / SABLE on roster** â DEFERRED intentionally. Real AI artists are in production and will replace this section when ready. Keep current placeholder roster as-is until new artists are fully built and approved. Do not remove or alter these entries until new roster is ready to go live.

### TYPOGRAPHY + AESTHETICS (from Layer 6 â Aesthetics)

5. **Three-tier type system â DEPLOYED â (Cormorant Garamond â Mind's Pick)**
   - **Decision:** Cormorant Garamond italic (user reviewed A/B/C options live; chose Option A â Mind's recommendation)
   - `.display` (h1 hero headlines) â Cormorant Garamond 400 italic, `clamp(48px,7.5vw,90px)`, `line-height:1.1` â deployed in `assets/css/style.css`
   - `.section-title` (h2 section headings) â Cormorant Garamond italic, `clamp(30px,5vw,60px)`, `line-height:1.08` â deployed in `assets/css/style.css`
   - Body text â Inter (already set via `--ff-body`)
   - Everything else (nav, buttons, eyebrows, labels, artist names, prices) â Space Grotesk stays
   - **White-to-gold gradient** on `.display.chrome` and `.section-title.chrome` only â `linear-gradient(180deg,#ffffff 0%,#f3e8c8 40%,#d9c38f 75%,#b9975a 100%)` â Mind approved (Mode C / Aesthetics audit 2026-10-13)
   - Drop-shadow changed from blue-tinted to warm gold: `drop-shadow(0 2px 24px rgba(217,195,143,.18))`
   - **Per-line gradient tiling** â `background-size:100% 1lh;background-repeat:repeat-y;` added to `.display.chrome,.section-title.chrome` so every line of multi-line headings gets equal white-top-to-gold-bottom balance â Mind approved
   - **Commits:** `41bc751` (Cormorant switch from Playfair), `bc72a5d` (gradient + line-height fix), latest (per-line gradient tiling 2026-10-13)
   - **ROLLBACK to Playfair:** Change @import to `family=Playfair+Display:wght@400;700`, change `.display` to `font-family:'Playfair Display'` + `font-weight:700` + `line-height:1.05` + `letter-spacing:-.015em`, remove `font-style:italic`; same on `.section-title`; remove `.display.chrome,.section-title.chrome` override block

6. **White block breaking dark section rhythm** â there's at least one white/light background block interrupting the obsidian dark theme. Identify and fix.

7. **Token update** â Blueprint specifies slightly different palette tokens than currently coded:
   - Current: `--gold:#d9c38f`
   - Blueprint spec: Gold `#D4AF37` Â· highlight `#F0C75E`
   - Current: `--bg:#050506`
   - Blueprint spec: Obsidian `#0A0A0B` Â· Deep surface `#141416`
   - Needs Mind approval before changing global tokens â could affect all pages

### OFFER / PRICING COPY (from Layer 3 â Offer Map)

8. **Insider membership price / reframe** â blueprint flags: "Â£4.99 is priced to be ignored. Raise to Â£9.99 or reframe as access, not discount." Any Insider pricing shown on site needs updating if price changes. Needs user decision first.
9. **Beat prices** â blueprint confirms: MP3 lease Â£30, WAV + video rights Â£45. Verify these match what's currently live in beat-store.html.
10. **Cover art prices** â Â£15âÂ£50 single, Â£225âÂ£275 album collections. Verify live prices match.
11. **Studio prices** â Record Â£40/hr, Production Â£60/hr, Mix Â£150/song, Master Â£50/song. Verify if studio page exists and matches.

### ROSTER PAGE (from Layer 5 â Protagonists)

12. **Oscar is the only live artist** â one track on Spotify. The roster page should reflect this clearly. Other slots should be "coming soon" or blank, not showing characters as if they're active.
13. **"This could be you" CTA** â already exists per previous audit. Confirm it's prominent and connects to the label's recruitment pitch ("signing includes your Awa Character").

### AUDIOFUSION / WAX â MONITOR (do not integrate yet)
- WAX (audiofusion.com/wax) is a DAW plugin, not a website embed. No public SDK or API exists yet.
- Currently: macOS-only beta, 0 community reviews, just launched May 2026.
- **Revisit when:** they ship a web embed, iframe, or JavaScript API. Right fit for producer audience but wrong tool type right now.
- Not worth integrating at current stage. Keep watching.

### AWA CHARACTER â NEW FEATURE (from Artifact #4 + Layer 5)

14. **Awa Character â roster page** â blueprint describes: premium collectible figurine per artist, mouse-reactive on the roster page (follow, hover, proximity reactions), 2D sprite animation with mouse-tracking JS (NO 3D pipeline). Oscar's character is first. Reads as vinyl art toy, NOT cute chibi.
   - This is a NEW feature requiring: character artwork (Alice/Higgsfield), then JS implementation
   - Needs Q&A: does the Oscar character artwork already exist? What format?

### CONFLICT / LANGUAGE (from Layer 7)

15. ~~**"The Enemy" framing missing from site**~~ â **DEPLOYED â (2026-10-13).** Conflict language added to `about.html` lede: *"The industry built a machine that needs you dependent. We built the opposite â you get the room, the strategy, and the masters. Dangerous by design."* Commit: `about.html` lede commit 2026-10-13.

### PRACTICES / RITUALS (from Layer 3 â Practices)

16. **Room Sessions** â "every Tuesday, work-in-progress goes public." Needs a section or page for this. Could be a blog-style log or a dedicated section on the roster/about page.
17. **First Listen** â members hear the record 48 hours early. This is the Insider membership's core reason to exist. Make sure this is clearly communicated on the Insider signup page/section.
18. **Public Split** â every release publishes its revenue splits. Consider adding this to release pages or a dedicated transparency section.
19. **Drop Friday** â every Friday something lands. Consider adding a "What's dropping this Friday" element to the homepage or nav.

### VAULT / CREDITS (from Layer 4 â Artifacts)

20. **Awa Standard Stamp** â a numbered stamp on every beat and cover sold: "Awa Standard No. 0042." Consider adding this as a visual element to beat/cover product cards.
21. ~~**Vault 1-of-1**~~ â **DEPLOYED â (2026-10-13).** "Retired Forever" callout block added to `cover-store.html` above the filter tabs: "Sold once. Â· Retired forever." displayed as an inline gold-gradient bordered doctrine block (`.vault-doctrine` CSS class). Commit: `feat: vault doctrine callout + Inner Circle nav on cover store` (4225b54).

### NAVIGATION / CONVERSION

22. ~~**Insider membership CTA in nav**~~ â **DEPLOYED â (2026-10-13).** `<a href="contact.html" class="btn btn-ghost btn-inner nav-cta">Join the Inner Circle</a>` added to every public page nav before "Submit Demo". CSS `.btn-inner` class (gold ghost button, 13px) added to `style.css`. Hidden on mobile via `.nav-cta{display:none}` at â¤720px. Deployed to: about, cover-store, index, roster, releases, beat-store, gallery, contact, studio (9 pages total). Commits: 2026-10-13.

---

### Q&A Needed Before Deploying Blueprint Items

The following need answers before we can deploy â will tackle one at a time in UI-style Q&A:

**Q1 (ACTIVE):** The blueprint flags a placeholder phone number in footers across 7 pages. Do you have a real phone number to use, or should we remove phone numbers entirely from all pages?

**Suggestions:**
- A) Remove all phone numbers â keep only email + social links in footer
- B) Use a virtual UK number (e.g. via Vonage/Twilio) â needs setup outside this session
- C) Keep a placeholder but make it visually distinct (e.g. "By appointment only â contact via form")
- D) Replace with WhatsApp link only (no visible number)

---

## Tech Stack Reference

- **Deployment:** GitHub Pages, `awasoundsenquires/awasounds-site`, master branch â awasounds.com
- **Auth:** Supabase project `rhiwtvdtbdudgtdqgjkc`, global `AWAAuth` (exposes `isMember()`, `user()`)
- **CSS design tokens:** `--bg:#050506`, `--gold:#d9c38f`, `--ff-display:"Space Grotesk"`, `--ff-body:"Inter"`, `--panel:#111318`
- **Nav mobile account element:** `.nav-mobile-account` injected by `auth.js` into `.nav-links`
- **Reveal animation:** `data-reveal` + IntersectionObserver â use `read_page` not screenshots to verify content

---

## Team Roles

- **Mind** â brand culture strategist. Reviews all work before deployment. Strategic direction.
- **Words (Claude)** â executes after Mind approves.
