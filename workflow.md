# AWA Sounds Site — Workflow & Deployment Rules

## NON-NEGOTIABLE Rules (never skip)

### 1. NEVER use git push via Bash
All deployments go through the **Chrome extension only** — use the GitHub UI edit pencil.
Do NOT use GitHub MCP for `awasoundsenquires`. Chrome extension ONLY.

### 2. ALWAYS consult Mind before deploying
Present all planned changes to Mind for strategic approval and direction.
Mind reviews → gives direction on quality/brand → Words (Claude) executes after approval.
Never deploy without Mind's green light.

### 3. Update this workflow.md at the end of every phase
Document what changed, what's pending, and current file status.

---

## Encoding Rules (critical for GitHub Pages)

All multi-byte Unicode chars in JS/HTML **must** be encoded before upload via clipboard:

| Context | Method | Example |
|---------|--------|---------|
| JS innerHTML | HTML entities | `&#xB7;` for `·` |
| JS textContent | JS unicode escape | `·` for `·` |
| HTML attributes/text | HTML entities | `&middot;` for `·` |

**Common entities:**
- `·` middle dot → `&middot;` / `&#xB7;`
- `—` em dash → `&mdash;`
- `–` en dash → `&ndash;`
- `©` copyright → `&copy;`
- `×` multiply → `&#xD7;`
- `►` play arrow → `&#x25BA;`
- `⚡` bolt → `&#x26A1;`
- `◈` diamond → `&#x25C8;`

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

## Phase Status — as of 2026-10-04

### Phase: Badge Count Fixes + Full Site Audit (DEPLOYED 2026-10-04)

**Files deployed:**
- `cover-store.html` — Badge counts fixed: tribe "13 covers" → "11 covers &#xB7; 22 pairs", afro-japan "9 covers" → "8 covers &#xB7; 16 pairs", bathroom-love "8 covers" → "8 covers &#xB7; 16 pairs" — commit bd13732 ✓
- `assets/js/config.js` — Subtitle fixes: tribe "13 covers" → "11 covers", afro-japan "9 covers" → "8 covers" — commit 4f2bc23 ✓

**Site audit (2026-10-04):** All pages visual ✓
- Home (index.html): Gold CTA, 3-act cinematic scroll, glass pills ✓
- Beat Store (beat-store.html): CTAs correct ✓
- Contact (contact.html): Form fields, Send Submission button ✓
- Roster (roster.html): 6 artist cards, "This could be you" CTA ✓

### Phase: Preview Pack Fix + Cinematic Redesign (MIND APPROVED)

**Files deployed this session:**
- `assets/js/config.js` — Added 3 missing album packs (tribe-vol1, afro-japan-vol2, bathroom-love-vol3) to `albumPacks` array — deployed ✓
- `assets/css/style.css` — CTA gold override (`.sw-btn--primary` white-on-white fix) — deployed ✓
- `assets/js/home-cinema.js` — Full 3-act cinematic redesign (Identity/Conflict/Invitation) with local video assets — deployed ✓

**Root causes fixed:**
- Preview Pack buttons silently failing → `openPackViewer()` early-exits if pack ID not in `CFG.albumPacks`; 3 legacy packs were missing from live config.js
- White CTA button → `--sw-ink` resolves to near-white for light accents; overridden with gold `!important`

### Phase: Encoding + Visual Fixes + Awa Glass System (MIND APPROVED)

**Files deployed this session:**
- `assets/js/covers.js` — Full encoding restoration + entity fixes + code updates — commit `ab11987` ✓
- `assets/js/store.js` — All 8 `·` → `&#xB7;` — deployed ✓
- `cover-store.html` — BOM removed, en-dash/copyright fixed, Preview Pack buttons on all 6 packs — deployed ✓
- `assets/css/style.css` — 474 Mojibake fixes + desktop nav-hide media query + **Awa Glass System** (nav glass upgrade, cover card gradient overlay, `.pack-view-btn` glass pill) — deployed ✓
- `assets/js/main.js` — 3 bug fixes (`py`→`px`, missing `>` in `<small`, backspace→`"`) — deployed ✓
- `assets/js/cinematic-engine.js` — Glass pills for `.sw-copy__tags li` (blur/border/shadow, gold hover) — deployed ✓
- `assets/js/home-cinema.js` — Tags copy → `['Beats', 'Cover Art', 'Releases', 'Insider']` — deployed ✓

### Awa Glass System (Mind-Approved 2026-10-04):
- **Nav**: Enhanced `.nav.scrolled` with deeper blur, gold bottom shadow, inset top highlight
- **Cover/Beat/Pack cards**: Dark-to-transparent gradient overlay appears on hover (`.store-card .art::after`, `.bcard-art::after`, `.pack-img-wrap::after`)
- **Preview Pack button** (`.pack-view-btn`): Liquid glass pill — dark frosted bg, gold border, blur, gold hover state
- **Scroll-cinema tags** (`.sw-copy__tags li`): Glass pill treatment in `cinematic-engine.js`
- Tags copy simplified: `['Beats', 'Cover Art', 'Releases', 'Insider']`

**Files already deployed (previous sessions):**
- `assets/js/signal.js` — `&#x26A1;` entity fix (commit `dfd5339`)
- `assets/js/account.js` — double IIFE removed, encoding fixed (commit `bf428c0`)

### Phase: Video Swap + Pack Viewer Dual-Image Toggle (MIND APPROVED — 2026-10-04)

**Files deployed (2026-10-04):**
- `assets/js/home-cinema.js` — ACT 2 video swapped: `studio-ambiance.mp4` → `portrait-sable.mp4` — commit 33451a4 ✓
- `assets/js/covers.js` — Pack viewer upgraded: WITH TITLE / CLEAN toggle pills added; each card renders both `img` (titled) and `imgClean` (no title) versions; CLEAN hidden by default, toggle switches all cards — commit 3c7de49 ✓

**Note on scroll-driven video:** `cinematic-engine.js` already implements scroll-driven video scrubbing via `raf()` → `video.currentTime = scrollProgress * duration`. This is confirmed live — videos seek based on scroll position, not looping. No engine change needed.

**Deploy method:** Chrome extension only — awasoundsenquires/awasounds-site master

### Pending (BACKLOG):
- Add dedicated Insider/membership CTA to desktop nav (currently only "Submit Demo" + auth.js sign-in link) — Mind flagged as a missed conversion point
- Gallery/roster/releases image lazy-load: change `loading="lazy"` to `loading="eager"` for first N images (LCP issue)
- Add minimal footer to all main pages
- Check other pages for "Become an Insider" white block (beat-store.html, etc. — same CSS fix covers all pages via style.css)

---

## Tech Stack Reference

- **Deployment:** GitHub Pages, `awasoundsenquires/awasounds-site`, master branch → awasounds.com
- **Auth:** Supabase project `rhiwtvdtbdudgtdqgjkc`, global `AWAAuth` (exposes `isMember()`, `user()`)
- **CSS design tokens:** `--bg:#050506`, `--gold:#d9c38f`, `--ff-display:"Space Grotesk"`, `--ff-body:"Inter"`, `--panel:#111318`
- **Nav mobile account element:** `.nav-mobile-account` injected by `auth.js` into `.nav-links`
- **Reveal animation:** `data-reveal` + IntersectionObserver — use `read_page` not screenshots to verify content

---

## Team Roles

- **Mind** — brand culture strategist. Reviews all work before deployment. Strategic direction.
- **Words (Claude)** — executes after Mind approves.
