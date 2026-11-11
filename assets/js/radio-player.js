/* Awa Sounds Radio — standalone self-injecting player
   Injects HTML + CSS on any page. Skips if #awa-radio-wrap already exists.
   localStorage persistence: saves/restores track, time, volume, genre, state. */
(function () {
'use strict';

/* ── Skip if already on page (e.g. index.html has it inline) ── */
if (document.getElementById('awa-radio-wrap')) return;

/* ══════════════════════════════════════
   CSS INJECTION
══════════════════════════════════════ */
var style = document.createElement('style');
style.textContent = `
/* ═══ Aura canvas behind panel ═══ */
#awa-aura {
  position: fixed;
  pointer-events: none;
  z-index: 9898;
  opacity: 1;
}

/* ═══ Wrapper ═══ */
#awa-radio-wrap {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9900;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#awa-radio-wrap.ar-collapsed #awa-radio {
  transform: translateY(calc(100% + 56px));
  opacity: 0;
  pointer-events: none;
}

/* ═══ Panel ═══ */
#awa-radio {
  width: 300px;
  background: rgba(10,10,12,0.88);
  border: 1px solid rgba(201,168,76,0.22);
  border-radius: 20px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(.4,0,.2,1), opacity 0.4s;
  --bass: 0;
  --energy: 0;
}
#awa-radio {
  box-shadow:
    0 12px 48px rgba(0,0,0,0.7),
    0 0 calc(8px + var(--bass) * 40px) rgba(201,168,76, calc(var(--energy) * 0.6)),
    0 0 0 1px rgba(255,255,255,0.05) inset;
}

/* ═══ Sphere canvas ═══ */
#ar-sphere-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0 8px;
  background: radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%);
}
#ar-sphere { display: block; border-radius: 50%; }

/* ═══ Genre tabs ═══ */
#ar-genres {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  gap: 0;
  padding: 0 2px;
}
#ar-genres::-webkit-scrollbar { display: none; }
.ar-gf {
  flex: 0 0 auto;
  padding: 7px 11px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
  position: relative;
  font-family: 'Space Grotesk', sans-serif;
}
.ar-gf:hover { color: rgba(255,255,255,0.65); }
.ar-gf.active { color: #c9a84c; }
.ar-gf.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 10%; right: 10%;
  height: 2px;
  background: #c9a84c;
  border-radius: 1px;
}

/* ═══ Now playing ═══ */
#ar-now-wrap {
  padding: 10px 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ar-eq {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  flex-shrink: 0;
}
.ar-eq i {
  display: block;
  width: 2.5px;
  border-radius: 1px;
  background: #c9a84c;
  animation: none;
  height: 4px;
  transition: height 0.1s;
}
.ar-playing .ar-eq i:nth-child(1) { animation: eq1 0.7s infinite alternate; }
.ar-playing .ar-eq i:nth-child(2) { animation: eq2 0.5s infinite alternate; }
.ar-playing .ar-eq i:nth-child(3) { animation: eq3 0.8s infinite alternate; }
.ar-playing .ar-eq i:nth-child(4) { animation: eq4 0.6s infinite alternate; }
@keyframes eq1 { from{height:3px} to{height:14px} }
@keyframes eq2 { from{height:6px} to{height:11px} }
@keyframes eq3 { from{height:4px} to{height:16px} }
@keyframes eq4 { from{height:8px} to{height:9px} }

#ar-now {
  font-size: 13px;
  font-weight: 700;
  color: #e8e0d0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  font-family: 'Space Grotesk', sans-serif;
  transition: opacity 0.3s;
}
#ar-now.ar-now-flash { animation: nowflash 0.35s ease; }
@keyframes nowflash { 0%{opacity:0;transform:translateY(4px)} 100%{opacity:1;transform:none} }

.ar-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 16px 0;
}
#ar-genre-pill {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(201,168,76,0.9);
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.25);
  border-radius: 10px;
  padding: 2px 7px;
  font-family: 'Space Grotesk', sans-serif;
}
#ar-bpm {
  font-size: 9px;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.06em;
  font-family: 'Space Grotesk', sans-serif;
}

/* ═══ Seek bar ═══ */
#ar-seek-wrap {
  padding: 10px 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ar-time {
  font-size: 9px;
  color: rgba(255,255,255,0.3);
  font-family: 'Space Grotesk', sans-serif;
  min-width: 26px;
}
#ar-track {
  flex: 1;
  height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}
#ar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a84c, #e8d08a);
  border-radius: 2px;
  width: 0%;
  transition: width 0.4s linear;
  pointer-events: none;
}
#ar-thumb {
  position: absolute;
  top: 50%; left: 0%;
  transform: translate(-50%, -50%);
  width: 10px; height: 10px;
  background: #c9a84c;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(201,168,76,0.8);
  pointer-events: none;
  transition: left 0.4s linear;
}

/* ═══ Controls ═══ */
#ar-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 14px;
}
.ar-ctrl {
  background: none;
  border: none;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 5px;
  transition: color 0.15s, transform 0.12s, background 0.15s;
  font-family: 'Space Grotesk', sans-serif;
}
.ar-ctrl:hover { color: #c9a84c; background: rgba(201,168,76,0.08); transform: scale(1.12); }
.ar-ctrl:active { transform: scale(0.92); }
#ar-play {
  width: 42px; height: 42px;
  border: 1.5px solid rgba(201,168,76,0.4);
  color: #d8c880;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(201,168,76,0.15);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.12s, color 0.15s;
}
.ar-playing #ar-play {
  border-color: rgba(201,168,76,0.8);
  box-shadow: 0 0 20px rgba(201,168,76,0.4);
  color: #c9a84c;
}
#ar-play:hover { border-color: rgba(201,168,76,0.9); }
.ar-play-icon, .ar-pause-icon { pointer-events: none; }

/* Volume */
.ar-vol-row { display: flex; align-items: center; gap: 5px; }
#ar-vol {
  -webkit-appearance: none;
  width: 54px; height: 2px;
  background: rgba(255,255,255,0.14);
  border-radius: 1px;
  cursor: pointer;
  outline: none;
}
#ar-vol::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px; height: 10px;
  background: #c9a84c;
  border-radius: 50%;
  cursor: pointer;
}

/* ═══ Track list ═══ */
#ar-list-wrap {
  border-top: 1px solid rgba(255,255,255,0.06);
  max-height: 148px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201,168,76,0.3) transparent;
}
#ar-list-wrap::-webkit-scrollbar { width: 3px; }
#ar-list-wrap::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }
#ar-list { padding: 4px 0; }
.ar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.15s;
  font-family: 'Space Grotesk', sans-serif;
}
.ar-item:hover { background: rgba(255,255,255,0.04); }
.ar-item.ar-active { background: rgba(201,168,76,0.08); }
.ar-item-num {
  font-size: 9px;
  color: rgba(255,255,255,0.2);
  min-width: 16px;
  text-align: right;
  font-weight: 500;
}
.ar-item.ar-active .ar-item-num { color: rgba(201,168,76,0.7); }
.ar-item-info { flex: 1; overflow: hidden; }
.ar-item-name {
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.ar-item.ar-active .ar-item-name { color: #c9a84c; }
.ar-item-sub {
  font-size: 9px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: block;
}
.ar-item-bpm {
  font-size: 9px;
  color: rgba(255,255,255,0.2);
  font-weight: 500;
  flex-shrink: 0;
}

/* ═══ Min/max button ═══ */
.ar-min-btn {
  position: absolute;
  top: 10px; right: 12px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.25);
  cursor: pointer;
  font-size: 11px;
  padding: 3px 5px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  z-index: 2;
  font-family: 'Space Grotesk', sans-serif;
}
.ar-min-btn:hover { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.07); }

/* ═══ Collapsed pill ═══ */
#ar-pill {
  display: none;
  align-items: center;
  gap: 8px;
  background: rgba(10,10,12,0.9);
  border: 1px solid rgba(201,168,76,0.3);
  border-radius: 24px;
  padding: 8px 16px;
  cursor: pointer;
  color: rgba(201,168,76,0.9);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  backdrop-filter: blur(16px);
  transition: background 0.2s, border-color 0.2s;
  margin-top: 10px;
  font-family: 'Space Grotesk', sans-serif;
}
#ar-pill:hover { background: rgba(20,20,24,0.95); border-color: rgba(201,168,76,0.6); }
.ar-collapsed #ar-pill { display: flex; }
.ar-collapsed #awa-radio { pointer-events: none; opacity: 0; transform: translateY(16px); }

@media (max-width: 480px) {
  #awa-radio-wrap { right: 10px; bottom: 14px; }
  #awa-radio { width: 272px; }
}
`;
document.head.appendChild(style);

/* ══════════════════════════════════════
   HTML INJECTION
══════════════════════════════════════ */
var aura = document.createElement('canvas');
aura.id = 'awa-aura';
aura.style.cssText = 'position:fixed;bottom:0;right:0;pointer-events:none;z-index:9898;';
document.body.appendChild(aura);

var wrap = document.createElement('div');
wrap.id = 'awa-radio-wrap';
wrap.innerHTML = `
  <div id="awa-radio">
    <button class="ar-min-btn" id="ar-min" aria-label="Minimise">─</button>
    <div id="ar-sphere-wrap">
      <canvas id="ar-sphere" width="170" height="170"></canvas>
    </div>
    <div id="ar-genres" role="tablist" aria-label="Genre filter">
      <button class="ar-gf active" data-genre="all"        role="tab" aria-selected="true">All</button>
      <button class="ar-gf" data-genre="trap"              role="tab" aria-selected="false">Trap</button>
      <button class="ar-gf" data-genre="rnb"               role="tab" aria-selected="false">R&amp;B</button>
      <button class="ar-gf" data-genre="afrobeat"          role="tab" aria-selected="false">Afrobeat</button>
      <button class="ar-gf" data-genre="house"             role="tab" aria-selected="false">House</button>
      <button class="ar-gf" data-genre="deep-house"        role="tab" aria-selected="false">Deep House</button>
      <button class="ar-gf" data-genre="amapiano"          role="tab" aria-selected="false">Amapiano</button>
      <button class="ar-gf" data-genre="uk-swing"          role="tab" aria-selected="false">UK Swing</button>
      <button class="ar-gf" data-genre="drill"             role="tab" aria-selected="false">Drill</button>
      <button class="ar-gf" data-genre="dancehall"         role="tab" aria-selected="false">Dancehall</button>
    </div>
    <div id="ar-now-wrap">
      <div class="ar-eq"><i></i><i></i><i></i><i></i></div>
      <div id="ar-now">Night Shift</div>
    </div>
    <div class="ar-meta-row">
      <span id="ar-genre-pill">Trap</span>
      <span id="ar-bpm">134 BPM</span>
    </div>
    <div id="ar-seek-wrap">
      <span class="ar-time" id="ar-elapsed">0:00</span>
      <div id="ar-track" role="slider" aria-label="Seek">
        <div id="ar-fill"></div>
        <div id="ar-thumb"></div>
      </div>
      <span class="ar-time" id="ar-dur">-:--</span>
    </div>
    <div id="ar-controls">
      <button class="ar-ctrl" id="ar-prev" aria-label="Previous">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2v12M13 3L7 8l6 5V3z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="ar-ctrl" id="ar-play" aria-label="Play / Pause">
        <svg class="ar-play-icon" width="17" height="17" viewBox="0 0 17 17" fill="currentColor"><path d="M5 3l10 5.5L5 14V3z"/></svg>
        <svg class="ar-pause-icon" width="17" height="17" viewBox="0 0 17 17" fill="currentColor" style="display:none"><rect x="3" y="2" width="4" height="13" rx="1"/><rect x="10" y="2" width="4" height="13" rx="1"/></svg>
      </button>
      <button class="ar-ctrl" id="ar-next" aria-label="Next">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 2v12M3 3l6 5-6 5V3z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="ar-vol-row">
        <button class="ar-ctrl" id="ar-mute" aria-label="Mute">
          <svg id="ar-vol-on" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5H5l3-3v10L5 9H2V5z" fill="currentColor"/><path d="M9 4a4 4 0 010 6M10.5 2a7 7 0 010 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          <svg id="ar-vol-off" width="14" height="14" viewBox="0 0 14 14" fill="none" style="display:none"><path d="M2 5H5l3-3v10L5 9H2V5z" fill="currentColor"/><path d="M9 5l4 4M13 5l-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        </button>
        <input type="range" id="ar-vol" min="0" max="1" step="0.01" value="0.8" aria-label="Volume">
      </div>
    </div>
    <div id="ar-list-wrap" role="listbox" aria-label="Track list">
      <div id="ar-list"></div>
    </div>
  </div>
  <button id="ar-pill" aria-label="Open Awa Radio">
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 6.5L4.5 3v7L1 6.5zM7 4a4 4 0 010 5M9 2a7 7 0 010 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Awa Radio
  </button>
`;
document.body.appendChild(wrap);

/* ══════════════════════════════════════
   PLAYER ENGINE
══════════════════════════════════════ */

const TRACKS = [
  // TRAP
  { id:'bb5bd5ba', name:'Night Shift',      genre:'trap',       bpm:134, label:'Trap',       url:'https://cdn.acedata2.cloud/suno/mp3/bb5bd5ba-b8a9-4a2f-b6d0-33a8616b5e4d.mp3' },
  { id:'48485fa3', name:'Chrome Dreams',    genre:'trap',       bpm:136, label:'Trap',       url:'https://cdn.acedata2.cloud/suno/mp3/48485fa3-4614-479e-8900-401ca72a75b3.mp3' },
  { id:'807b4716', name:'Ghost Lane',       genre:'trap',       bpm:134, label:'Trap',       url:'https://cdn.acedata2.cloud/suno/807b4716-59ce-42c9-83a8-bb99632b4b7e.mp3' },
  { id:'84bd09da', name:'Phantom Hour',     genre:'trap',       bpm:134, label:'Trap',       url:'https://cdn.acedata2.cloud/suno/84bd09da-bfaf-43ea-bfab-b3f8e4fa85ae.mp3' },
  // R&B
  { id:'6adacade', name:'Velvet Keys',      genre:'rnb',        bpm:90,  label:'R&B',        url:'https://cdn.acedata2.cloud/suno/mp3/6adacade-9991-40cc-a380-cd225864616a.mp3' },
  { id:'01e6528f', name:'Golden Hour',      genre:'rnb',        bpm:88,  label:'R&B',        url:'https://cdn.acedata2.cloud/suno/mp3/01e6528f-d9a3-4127-bfa5-cc4c38936749.mp3' },
  { id:'4210da76', name:'Main Character',   genre:'rnb',        bpm:98,  label:'R&B',        url:'https://cdn.acedata2.cloud/suno/4210da76-db17-481f-85d3-949abfe2e454.mp3' },
  { id:'2b310242', name:'City Code',        genre:'rnb',        bpm:98,  label:'R&B',        url:'https://cdn.acedata2.cloud/suno/2b310242-0dde-473d-a413-4f0a51d90887.mp3' },
  // AFROBEAT
  { id:'ea282291', name:'Lagos Flow',       genre:'afrobeat',   bpm:104, label:'Afrobeat',   url:'https://cdn.acedata2.cloud/suno/mp3/ea282291-1e17-446a-b9bc-95bde4cafe98.mp3' },
  { id:'c97ed842', name:'Suncoast',         genre:'afrobeat',   bpm:106, label:'Afrobeat',   url:'https://cdn.acedata2.cloud/suno/mp3/c97ed842-22ac-449b-9135-5cd598382be8.mp3' },
  { id:'469f3727', name:'River Dance',      genre:'afrobeat',   bpm:102, label:'Afrobeat',   url:'https://cdn.acedata2.cloud/suno/mp3/469f3727-1401-4524-a893-91c0fdd898e5.mp3' },
  // HOUSE
  { id:'0b4308c5', name:'Sunday Morning',   genre:'house',      bpm:123, label:'House',      url:'https://cdn.acedata2.cloud/suno/mp3/0b4308c5-5472-4603-8bb7-384457b03824.mp3' },
  { id:'efb59807', name:'Back to Basics',   genre:'house',      bpm:122, label:'House',      url:'https://cdn.acedata2.cloud/suno/mp3/efb59807-e85c-44b4-a241-3bec37e9d5d5.mp3' },
  { id:'2effa408', name:'Cloud Nine',       genre:'house',      bpm:125, label:'House',      url:'https://cdn.acedata2.cloud/suno/2effa408-2df9-43b0-b9e1-d8b4ae015043.mp3' },
  { id:'dd952c96', name:'Rise Up',          genre:'house',      bpm:126, label:'House',      url:'https://cdn.acedata2.cloud/suno/dd952c96-8952-428e-bd6e-a06eca4ebd05.mp3' },
  // DEEP HOUSE
  { id:'47dc9d72', name:'Depths',           genre:'deep-house', bpm:120, label:'Deep House', url:'https://cdn.acedata2.cloud/suno/mp3/47dc9d72-a53b-4077-8111-6fa0dad4ba19.mp3' },
  { id:'a9ea6cf0', name:'Drift',            genre:'deep-house', bpm:119, label:'Deep House', url:'https://cdn.acedata2.cloud/suno/mp3/a9ea6cf0-179a-4995-bbea-9c9535a047a1.mp3' },
  { id:'35ce46d2', name:'Midnight Velvet',  genre:'deep-house', bpm:118, label:'Deep House', url:'https://cdn.acedata2.cloud/suno/35ce46d2-c953-494f-9403-ff845c011966.mp3' },
  { id:'dfd906fe', name:'The Current',      genre:'deep-house', bpm:120, label:'Deep House', url:'https://cdn.acedata2.cloud/suno/dfd906fe-07e5-49e5-9369-12708c4d3e04.mp3' },
  // AMAPIANO
  { id:'03d7fe6d', name:'Johannesburg',     genre:'amapiano',   bpm:112, label:'Amapiano',   url:'https://cdn.acedata2.cloud/suno/03d7fe6d-9248-42e8-b053-63cd6268dfca.mp3' },
  { id:'27b56a77', name:'Jozi Nights',      genre:'amapiano',   bpm:112, label:'Amapiano',   url:'https://cdn.acedata2.cloud/suno/27b56a77-e8a4-45e4-9bef-37c813913b3b.mp3' },
  // UK SWING
  { id:'5bb9588d', name:'South Side Swing', genre:'uk-swing',   bpm:125, label:'UK Swing',   url:'https://cdn.acedata2.cloud/suno/5bb9588d-5d73-4a20-b142-8d5b45fbb176.mp3' },
  { id:'8007496c', name:'London Road',      genre:'uk-swing',   bpm:125, label:'UK Swing',   url:'https://cdn.acedata2.cloud/suno/8007496c-f25c-4f17-a3df-d2070a04c164.mp3' },
  // DRILL
  { id:'ba3cb1c0', name:'Regal',            genre:'drill',      bpm:140, label:'Drill',      url:'https://cdn.acedata2.cloud/suno/ba3cb1c0-ef9b-463c-9117-d4a0484395ee.mp3' },
  { id:'f75a27b2', name:'Block Code',       genre:'drill',      bpm:140, label:'Drill',      url:'https://cdn.acedata2.cloud/suno/f75a27b2-420a-4f3d-a2f2-5aa0ca9196c3.mp3' },
  // DANCEHALL
  { id:'51577c6e', name:'Island Heat',      genre:'dancehall',  bpm:95,  label:'Dancehall',  url:'https://cdn.acedata2.cloud/suno/51577c6e-b24a-4920-a2d2-cb07aa575116.mp3' },
  { id:'e37cb388', name:'Tropic',           genre:'dancehall',  bpm:95,  label:'Dancehall',  url:'https://cdn.acedata2.cloud/suno/e37cb388-a019-4434-bb54-526d539316f1.mp3' },
];

/* ── State ── */
let currentIdx = 0;
let isPlaying = false;
let activeGenre = 'all';
let isDragging = false;
let audioCtx = null, analyser = null, sourceNode = null;
let rafId = null;
let bassSmoothed = 0, energySmoothed = 0;

/* ── localStorage persistence keys ── */
const LS_KEY = 'awa-radio-state';

function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      idx:    currentIdx,
      time:   audio.currentTime || 0,
      vol:    audio.volume,
      genre:  activeGenre,
      playing: isPlaying
    }));
  } catch(e) {}
}

function loadState() {
  try {
    var s = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (!s) return null;
    return s;
  } catch(e) { return null; }
}

/* ── DOM ── */
const panel   = document.getElementById('awa-radio');
const minBtn  = document.getElementById('ar-min');
const pill    = document.getElementById('ar-pill');
const nowEl   = document.getElementById('ar-now');
const pillEl  = document.getElementById('ar-genre-pill');
const bpmEl   = document.getElementById('ar-bpm');
const listEl  = document.getElementById('ar-list');
const fillEl  = document.getElementById('ar-fill');
const thumbEl = document.getElementById('ar-thumb');
const trackEl = document.getElementById('ar-track');
const elapsed = document.getElementById('ar-elapsed');
const durEl   = document.getElementById('ar-dur');
const playBtn = document.getElementById('ar-play');
const prevBtn = document.getElementById('ar-prev');
const nextBtn = document.getElementById('ar-next');
const volEl   = document.getElementById('ar-vol');
const muteBtn = document.getElementById('ar-mute');
const volOnI  = document.getElementById('ar-vol-on');
const volOffI = document.getElementById('ar-vol-off');

/* ── Canvases ── */
const auraEl = document.getElementById('awa-aura');
const aCtx   = auraEl.getContext('2d');
const sphere = document.getElementById('ar-sphere');
const sCtx   = sphere.getContext('2d');

const audio = new Audio();
audio.crossOrigin = 'anonymous';
audio.volume = 0.8;
audio.preload = 'none';

/* ── Aura sizing ── */
function sizeAura() {
  const r = panel.getBoundingClientRect();
  const pad = 100;
  auraEl.width  = r.width  + pad * 2;
  auraEl.height = r.height + pad * 2;
  auraEl.style.width  = auraEl.width  + 'px';
  auraEl.style.height = auraEl.height + 'px';
  auraEl.style.right  = (24 - pad) + 'px';
  auraEl.style.bottom = (24 - pad) + 'px';
}

/* ── Web Audio ── */
function setupAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch(e) { audioCtx = null; }
}

/* ── FFT data ── */
const freqData = new Uint8Array(128);

/* ═══════════════════════════════════════
   SPHERE VISUALIZER
═══════════════════════════════════════ */
const S_W = 170, S_H = 170;
const S_CX = S_W / 2, S_CY = S_H / 2;
const SPHERE_R = 42;
const NUM_BARS = 128;
const MAX_BAR_H = 36;

function drawSphereFull(bass, energy, t) {
  sCtx.clearRect(0, 0, S_W, S_H);

  /* -- outer glow -- */
  const glowR = SPHERE_R + 12 + bass * 28;
  const outerGlow = sCtx.createRadialGradient(S_CX, S_CY, SPHERE_R * 0.5, S_CX, S_CY, glowR + 30);
  const gc = bass > 0.3 ? `${Math.round(60 + bass*140)},${Math.round(100 + bass*68)},${Math.round(180 + bass*20)}` : '201,168,76';
  outerGlow.addColorStop(0, `rgba(${gc},${(energy * 0.55 + 0.08).toFixed(2)})`);
  outerGlow.addColorStop(0.5, `rgba(${gc},${(energy * 0.2).toFixed(2)})`);
  outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.beginPath();
  sCtx.arc(S_CX, S_CY, glowR + 30, 0, Math.PI * 2);
  sCtx.fillStyle = outerGlow;
  sCtx.fill();

  /* -- frequency bars -- */
  const innerR = SPHERE_R + 1;

  if (analyser && isPlaying) {
    analyser.getByteFrequencyData(freqData);
    for (let i = 0; i < NUM_BARS; i++) {
      const angle = (i / NUM_BARS) * Math.PI * 2 - Math.PI / 2;
      const fi = Math.floor((i < NUM_BARS / 2 ? i : NUM_BARS - 1 - i) / (NUM_BARS / 2) * 64);
      const amp = freqData[fi] / 255;
      const barH = amp * MAX_BAR_H;
      if (barH < 0.5) continue;
      const x1 = S_CX + Math.cos(angle) * innerR;
      const y1 = S_CY + Math.sin(angle) * innerR;
      const x2 = S_CX + Math.cos(angle) * (innerR + barH);
      const y2 = S_CY + Math.sin(angle) * (innerR + barH);
      const mix = fi / 64;
      const cr = Math.round(201 * (1-mix) + 60 * mix);
      const cg = Math.round(168 * (1-mix) + 200 * mix);
      const cb = Math.round(76  * (1-mix) + 180 * mix);
      const alpha = amp * 0.92 + 0.08;
      sCtx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(2)})`;
      sCtx.lineWidth = i % 4 === 0 ? 2.5 : 1.4;
      sCtx.beginPath();
      sCtx.moveTo(x1, y1);
      sCtx.lineTo(x2, y2);
      sCtx.stroke();
    }
  } else {
    const breath = isPlaying
      ? 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.8))
      : 0.12 + 0.08 * Math.sin(t * 1.4);
    for (let i = 0; i < NUM_BARS; i++) {
      const angle = (i / NUM_BARS) * Math.PI * 2 - Math.PI / 2;
      const wave  = breath * (0.6 + 0.4 * Math.sin(t * 2 + i * 0.15)) * MAX_BAR_H * 0.4;
      const x1 = S_CX + Math.cos(angle) * innerR;
      const y1 = S_CY + Math.sin(angle) * innerR;
      const x2 = S_CX + Math.cos(angle) * (innerR + wave);
      const y2 = S_CY + Math.sin(angle) * (innerR + wave);
      sCtx.strokeStyle = `rgba(201,168,76,${(breath * 0.5).toFixed(2)})`;
      sCtx.lineWidth = 1.2;
      sCtx.beginPath();
      sCtx.moveTo(x1, y1);
      sCtx.lineTo(x2, y2);
      sCtx.stroke();
    }
  }

  /* -- sphere shadow -- */
  const sphereR = SPHERE_R * (1 + bass * 0.07);
  sCtx.beginPath();
  sCtx.arc(S_CX + 2, S_CY + 3, sphereR + 1, 0, Math.PI * 2);
  sCtx.fillStyle = 'rgba(0,0,0,0.3)';
  sCtx.fill();

  /* -- glass sphere body -- */
  const glassGrad = sCtx.createRadialGradient(
    S_CX - sphereR * 0.3, S_CY - sphereR * 0.3, 0,
    S_CX, S_CY, sphereR
  );
  const glassOp = 0.1 + energy * 0.08;
  glassGrad.addColorStop(0.0, `rgba(255,255,255,${(glassOp * 2.5).toFixed(2)})`);
  glassGrad.addColorStop(0.4, `rgba(180,210,255,${glassOp.toFixed(2)})`);
  glassGrad.addColorStop(1.0, `rgba(60,100,200,${(glassOp * 0.4).toFixed(2)})`);
  sCtx.beginPath();
  sCtx.arc(S_CX, S_CY, sphereR, 0, Math.PI * 2);
  sCtx.fillStyle = glassGrad;
  sCtx.fill();

  /* -- glass rim stroke -- */
  const rimA = 0.25 + energy * 0.35;
  sCtx.beginPath();
  sCtx.arc(S_CX, S_CY, sphereR, 0, Math.PI * 2);
  sCtx.strokeStyle = `rgba(255,255,255,${rimA.toFixed(2)})`;
  sCtx.lineWidth = 1.5;
  sCtx.stroke();

  /* -- specular highlight -- */
  const specGrad = sCtx.createRadialGradient(
    S_CX - sphereR * 0.28, S_CY - sphereR * 0.28, 0,
    S_CX - sphereR * 0.28, S_CY - sphereR * 0.28, sphereR * 0.5
  );
  specGrad.addColorStop(0, 'rgba(255,255,255,0.55)');
  specGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  sCtx.beginPath();
  sCtx.arc(S_CX, S_CY, sphereR, 0, Math.PI * 2);
  sCtx.fillStyle = specGrad;
  sCtx.fill();

  /* -- AWA text (beat-reactive) -- */
  const tScale = 1 + bass * 0.38;
  const tAlpha = 0.55 + energy * 0.45;
  const fSize = Math.round(SPHERE_R * 0.52 * tScale);
  sCtx.save();
  sCtx.textAlign = 'center';
  sCtx.textBaseline = 'middle';
  sCtx.font = `700 ${fSize}px 'Space Grotesk',sans-serif`;
  if (bass > 0.18) {
    sCtx.shadowColor = bass > 0.4
      ? `rgba(80,160,255,${((bass - 0.18) * 1.1).toFixed(2)})`
      : `rgba(201,168,76,${((bass - 0.18) * 0.9).toFixed(2)})`;
    sCtx.shadowBlur = 8 + bass * 18;
  }
  const tG = sCtx.createLinearGradient(S_CX - fSize, S_CY - fSize / 2, S_CX + fSize, S_CY + fSize / 2);
  if (bass > 0.3) {
    tG.addColorStop(0, `rgba(150,210,255,${tAlpha.toFixed(2)})`);
    tG.addColorStop(1, `rgba(80,160,255,${tAlpha.toFixed(2)})`);
  } else {
    tG.addColorStop(0, `rgba(255,255,255,${tAlpha.toFixed(2)})`);
    tG.addColorStop(1, `rgba(201,168,76,${tAlpha.toFixed(2)})`);
  }
  sCtx.fillStyle = tG;
  sCtx.fillText('AWA', S_CX, S_CY);
  sCtx.restore();
}

/* ═══════════════════════════════════════
   EXTERNAL AURA
═══════════════════════════════════════ */
function drawAura(bass, energy, t) {
  const W = auraEl.width, H = auraEl.height;
  aCtx.clearRect(0, 0, W, H);
  if (energy < 0.02 && !isPlaying) return;

  const cx = W / 2, cy = H / 2;
  const baseR = Math.min(W, H) * 0.38;

  for (let i = 0; i < 3; i++) {
    const phase   = t * (0.5 + i * 0.18) + i * 1.9;
    const scale   = 1 + bass * 0.45 * (1 + 0.3 * Math.sin(phase));
    const radius  = baseR * scale * (1 + i * 0.22);
    const opacity = (energy * 0.65 + 0.08) * (1 - i * 0.28) * (isPlaying ? 1 : 0.35);

    const r1g = Math.round(201 * (1 - i/3) + 60 * (i/3));
    const g1g = Math.round(168 * (1 - i/3) + 200 * (i/3));
    const b1g = Math.round(76  * (1 - i/3) + 180 * (i/3));

    const rg = aCtx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius);
    rg.addColorStop(0, `rgba(${r1g},${g1g},${b1g},${(opacity * 0.55).toFixed(3)})`);
    rg.addColorStop(0.6, `rgba(${r1g},${g1g},${b1g},${(opacity * 0.15).toFixed(3)})`);
    rg.addColorStop(1, 'rgba(0,0,0,0)');

    aCtx.beginPath();
    aCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    aCtx.fillStyle = rg;
    aCtx.fill();
  }
}

/* ═══════════════════════════════════════
   ANIMATION LOOP
═══════════════════════════════════════ */
function animLoop() {
  const t = Date.now() / 1000;
  let bass = 0, energy = 0;

  if (analyser && isPlaying) {
    analyser.getByteFrequencyData(freqData);
    let bassSum = 0, midSum = 0, highSum = 0;
    for (let i = 0; i < 4;  i++) bassSum += freqData[i];
    for (let i = 4; i < 20; i++) midSum  += freqData[i];
    for (let i = 20;i < 64; i++) highSum += freqData[i];
    bass   = bassSum  / (4   * 255);
    energy = (bass * 0.6 + (midSum/(16*255)) * 0.3 + (highSum/(44*255)) * 0.1);
  } else if (isPlaying) {
    bass   = 0.3 + 0.3 * Math.sin(t * 2.5);
    energy = 0.5 + 0.3 * Math.sin(t * 1.8);
  }

  bassSmoothed   = bassSmoothed   * 0.78 + bass   * 0.22;
  energySmoothed = energySmoothed * 0.78 + energy * 0.22;

  panel.style.setProperty('--bass',   bassSmoothed.toFixed(3));
  panel.style.setProperty('--energy', energySmoothed.toFixed(3));

  drawSphereFull(bassSmoothed, energySmoothed, t);
  drawAura(bassSmoothed, energySmoothed, t);

  rafId = requestAnimationFrame(animLoop);
}

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
function fmt(s) {
  if (!s || isNaN(s)) return '-:--';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}
function filteredTracks() {
  return activeGenre === 'all' ? TRACKS : TRACKS.filter(t => t.genre === activeGenre);
}
function findGlobalIdx(t) { return TRACKS.indexOf(t); }

/* ═══════════════════════════════════════
   TRACK LIST RENDER
═══════════════════════════════════════ */
function renderList() {
  const ft = filteredTracks();
  listEl.innerHTML = '';
  ft.forEach((t, i) => {
    const gi = findGlobalIdx(t);
    const div = document.createElement('div');
    div.className = 'ar-item' + (gi === currentIdx ? ' ar-active' : '');
    div.setAttribute('role', 'option');
    div.setAttribute('aria-selected', gi === currentIdx ? 'true' : 'false');
    div.innerHTML =
      `<span class="ar-item-num">${i+1}</span>` +
      `<div class="ar-item-info"><span class="ar-item-name">${t.name}</span><span class="ar-item-sub">${t.label}</span></div>` +
      `<span class="ar-item-bpm">${t.bpm}</span>`;
    div.addEventListener('click', () => loadTrack(gi, true));
    listEl.appendChild(div);
  });
}

/* ═══════════════════════════════════════
   LOAD & PLAY
═══════════════════════════════════════ */
function loadTrack(idx, autoplay) {
  const t = TRACKS[idx];
  if (!t) return;
  currentIdx = idx;

  nowEl.classList.remove('ar-now-flash');
  void nowEl.offsetWidth;
  nowEl.classList.add('ar-now-flash');

  nowEl.textContent  = t.name;
  pillEl.textContent = t.label;
  bpmEl.textContent  = t.bpm + ' BPM';
  fillEl.style.width  = '0%';
  thumbEl.style.left  = '0%';
  elapsed.textContent = '0:00';
  durEl.textContent   = '-:--';

  audio.src = t.url;
  audio.load();

  if (autoplay) {
    setupAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    audio.play().catch(() => {});
  }
  renderList();
}

function setPlayState(playing) {
  isPlaying = playing;
  playBtn.querySelector('.ar-play-icon').style.display  = playing ? 'none' : '';
  playBtn.querySelector('.ar-pause-icon').style.display = playing ? ''     : 'none';
  if (playing) wrap.classList.add('ar-playing');
  else         wrap.classList.remove('ar-playing');
}

/* ═══════════════════════════════════════
   PROGRESS
═══════════════════════════════════════ */
function updateProgress() {
  if (!isDragging && audio.duration) {
    const pct = audio.currentTime / audio.duration;
    fillEl.style.width  = (pct * 100).toFixed(2) + '%';
    thumbEl.style.left  = (pct * 100).toFixed(2) + '%';
    elapsed.textContent = fmt(audio.currentTime);
  }
}
function seekTo(e) {
  const r = trackEl.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  if (audio.duration) audio.currentTime = pct * audio.duration;
  fillEl.style.width = (pct * 100) + '%';
  thumbEl.style.left = (pct * 100) + '%';
}

/* ═══════════════════════════════════════
   EVENTS
═══════════════════════════════════════ */
audio.addEventListener('play',    () => setPlayState(true));
audio.addEventListener('pause',   () => setPlayState(false));
audio.addEventListener('ended',   () => {
  const ft = filteredTracks();
  const ci = ft.findIndex(t => findGlobalIdx(t) === currentIdx);
  const next = ft[(ci + 1) % ft.length];
  loadTrack(findGlobalIdx(next), true);
});
audio.addEventListener('timeupdate',     updateProgress);
audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); });
audio.addEventListener('error',          () => {
  const ft = filteredTracks();
  const ci = ft.findIndex(t => findGlobalIdx(t) === currentIdx);
  const next = ft[(ci + 1) % ft.length];
  loadTrack(findGlobalIdx(next), true);
});

playBtn.addEventListener('click', () => {
  setupAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  if (!audio.src) { loadTrack(currentIdx, true); return; }
  if (isPlaying) audio.pause();
  else audio.play().catch(() => {});
});

prevBtn.addEventListener('click', () => {
  const ft = filteredTracks();
  const ci = ft.findIndex(t => findGlobalIdx(t) === currentIdx);
  const prev = ft[ci <= 0 ? ft.length - 1 : ci - 1];
  loadTrack(findGlobalIdx(prev), true);
});

nextBtn.addEventListener('click', () => {
  const ft = filteredTracks();
  const ci = ft.findIndex(t => findGlobalIdx(t) === currentIdx);
  const next = ft[(ci + 1) % ft.length];
  loadTrack(findGlobalIdx(next), true);
});

volEl.addEventListener('input', () => { audio.volume = parseFloat(volEl.value); });

let isMuted = false;
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  volOnI.style.display  = isMuted ? 'none' : '';
  volOffI.style.display = isMuted ? ''     : 'none';
});

/* Seek drag */
trackEl.addEventListener('mousedown', e => { isDragging = true; seekTo(e); });
document.addEventListener('mousemove', e => { if (isDragging) seekTo(e); });
document.addEventListener('mouseup',   () => { isDragging = false; });
trackEl.addEventListener('touchstart', e => { isDragging = true; seekTo(e.touches[0]); }, {passive:true});
document.addEventListener('touchmove',  e => { if (isDragging) seekTo(e.touches[0]); }, {passive:true});
document.addEventListener('touchend',  () => { isDragging = false; });

/* Genre tabs */
document.getElementById('ar-genres').addEventListener('click', e => {
  const btn = e.target.closest('.ar-gf');
  if (!btn) return;
  document.querySelectorAll('.ar-gf').forEach(b => {
    b.classList.toggle('active', b === btn);
    b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
  });
  activeGenre = btn.dataset.genre;
  const ft = filteredTracks();
  const inFilter = ft.some(t => findGlobalIdx(t) === currentIdx);
  if (!inFilter && ft.length) loadTrack(findGlobalIdx(ft[0]), isPlaying);
  else renderList();
});

/* Minimise */
minBtn.addEventListener('click', () => { wrap.classList.add('ar-collapsed'); });
pill.addEventListener('click', () => {
  wrap.classList.remove('ar-collapsed');
  sizeAura();
});

/* ── Save state before navigation ── */
window.addEventListener('beforeunload', saveState);

/* ══════════════════════════════════════
   INIT — restore state or start fresh
══════════════════════════════════════ */
var saved = loadState();

if (saved) {
  /* restore genre filter */
  if (saved.genre && saved.genre !== 'all') {
    activeGenre = saved.genre;
    document.querySelectorAll('.ar-gf').forEach(b => {
      const active = b.dataset.genre === saved.genre;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  /* restore volume */
  if (typeof saved.vol === 'number') {
    audio.volume = saved.vol;
    volEl.value  = saved.vol;
  }

  /* restore track (preload only, don't autoplay — browsers block autoplay without gesture) */
  var restoreIdx = (typeof saved.idx === 'number' && saved.idx < TRACKS.length) ? saved.idx : 0;
  currentIdx = restoreIdx;
  loadTrack(restoreIdx, false);

  /* restore playhead position once metadata loads */
  if (saved.time > 0) {
    audio.addEventListener('loadedmetadata', function restoreTime() {
      try { audio.currentTime = saved.time; } catch(e) {}
      audio.removeEventListener('loadedmetadata', restoreTime);
    });
  }
} else {
  loadTrack(0, false);
}

renderList();
sizeAura();
window.addEventListener('resize', sizeAura);
animLoop();

})();
