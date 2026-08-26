/* AWA SOUNDS — Receipt FX
   showReceipt({ title, price, orderId, method }) → animated paper-print overlay
   Resolves the returned promise when user clicks "Confirm & Pay" or dismisses.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  const CSS = `
  .rfx-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:9999;display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s;pointer-events:none}
  .rfx-overlay.open{opacity:1;pointer-events:all}
  .rfx-sheet{width:320px;max-width:94vw;background:#fff;color:#111;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.6;
    padding:0 0 24px;border-radius:4px 4px 0 0;
    transform:translateY(100%);transition:transform .45s cubic-bezier(.22,1,.36,1);
    overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,.5)}
  .rfx-overlay.open .rfx-sheet{transform:translateY(0)}
  .rfx-tape{height:18px;background:repeating-linear-gradient(90deg,#f0f0f0 0,#f0f0f0 6px,#e0e0e0 6px,#e0e0e0 7px);flex-shrink:0}
  .rfx-body{padding:20px 22px 0}
  .rfx-logo{font-weight:900;font-size:14px;letter-spacing:.14em;text-align:center;padding-bottom:10px;border-bottom:1px dashed #ccc;margin-bottom:12px}
  .rfx-row{display:flex;justify-content:space-between;padding:2px 0;opacity:0;transform:translateY(4px);transition:opacity .18s,transform .18s}
  .rfx-row.show{opacity:1;transform:none}
  .rfx-row.bold{font-weight:700;font-size:13px}
  .rfx-row.total{border-top:1px solid #bbb;margin-top:6px;padding-top:8px;font-size:14px;font-weight:900}
  .rfx-divider{border:none;border-top:1px dashed #ccc;margin:10px 0;opacity:0;transition:opacity .18s}
  .rfx-divider.show{opacity:1}
  .rfx-barcode{text-align:center;margin:14px 0 0;opacity:0;transition:opacity .3s}
  .rfx-barcode.show{opacity:1}
  .rfx-barcode svg{width:180px;height:48px}
  .rfx-barcode-num{font-size:10px;letter-spacing:.04em;color:#555;margin-top:4px}
  .rfx-actions{display:flex;gap:10px;padding:18px 22px 0}
  .rfx-cancel{flex:1;background:none;border:1px solid #ccc;border-radius:6px;padding:10px;font-size:12px;font-family:'Courier New',Courier,monospace;cursor:pointer;color:#555}
  .rfx-cancel:hover{background:#f5f5f5}
  .rfx-confirm{flex:2;background:#111;color:#fff;border:none;border-radius:6px;padding:10px;font-size:12px;font-weight:700;font-family:'Courier New',Courier,monospace;cursor:pointer;letter-spacing:.04em}
  .rfx-confirm:hover{background:#222}
  .rfx-small{text-align:center;font-size:10px;color:#aaa;margin-top:12px;padding:0 22px}
  `;

  let styleEl = null;
  function injectStyle() {
    if (styleEl) return;
    styleEl = document.createElement("style");
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  function makeBarcodeLines() {
    const lines = [];
    const widths = [1,2,1,3,2,1,2,3,1,2,1,2,3,1,2,1,3,2,1,2,1,3,2,1,2,1,2,3,1,2,1,2,1,3,2,1,2,1,3,2];
    let x = 10;
    lines.push(`<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">`);
    widths.forEach((w, i) => {
      if (i % 2 === 0) lines.push(`<rect x="${x}" y="4" width="${w}" height="42" fill="#111"/>`);
      x += w + 1;
    });
    lines.push(`</svg>`);
    return lines.join('');
  }

  function genOrderId() {
    return "AWA-" + Math.floor(Math.random() * 9000 + 1000) + "-" + (Date.now() % 10000);
  }

  function showReceipt(opts) {
    injectStyle();
    const { title = "Cover Art", price = "£39", onConfirm, onCancel, memberPrice, isMember } = opts;
    const orderId = genOrderId();
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB") + " · " + now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
    const finalPrice = isMember && memberPrice ? memberPrice : price;

    const overlay = document.createElement("div");
    overlay.className = "rfx-overlay";
    overlay.innerHTML = `
      <div class="rfx-sheet">
        <div class="rfx-tape"></div>
        <div class="rfx-body">
          <div class="rfx-logo">AWA SOUNDS</div>
          <div class="rfx-row" data-delay="0"><span>Item</span><span></span></div>
          <div class="rfx-row bold" data-delay="1"><span>${title}</span><span>${finalPrice}</span></div>
          <div class="rfx-row" data-delay="2"><span>Type</span><span>Cover Art</span></div>
          <div class="rfx-row" data-delay="3"><span>Incl. 2 motion files</span><span>✓</span></div>
          <hr class="rfx-divider" data-delay="4">
          <div class="rfx-row" data-delay="5"><span>Subtotal</span><span>${finalPrice}</span></div>
          ${isMember ? `<div class="rfx-row" data-delay="5"><span>Insider discount</span><span style="color:#2a9a5c">- applied</span></div>` : ""}
          <div class="rfx-row" data-delay="6"><span>VAT (20%)</span><span>incl.</span></div>
          <div class="rfx-row total" data-delay="7"><span>TOTAL</span><span>${finalPrice}</span></div>
          <hr class="rfx-divider" data-delay="8">
          <div class="rfx-row" data-delay="9"><span>Order</span><span>${orderId}</span></div>
          <div class="rfx-row" data-delay="9"><span>Date</span><span>${dateStr}</span></div>
          <div class="rfx-row" data-delay="9"><span>Paid via</span><span>Stripe</span></div>
          <div class="rfx-barcode" data-delay="10">${makeBarcodeLines()}<div class="rfx-barcode-num">${orderId}</div></div>
        </div>
        <div class="rfx-actions">
          <button class="rfx-cancel">← Back</button>
          <button class="rfx-confirm">Confirm &amp; Pay →</button>
        </div>
        <div class="rfx-small">Secure payment via Stripe · Exclusive licence delivered by email</div>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("open"));

    overlay.querySelectorAll("[data-delay]").forEach(el => {
      const d = parseInt(el.dataset.delay, 10);
      setTimeout(() => el.classList.add("show"), 350 + d * 90);
    });

    overlay.querySelector(".rfx-confirm").addEventListener("click", () => {
      dismiss();
      if (onConfirm) onConfirm();
    });
    overlay.querySelector(".rfx-cancel").addEventListener("click", () => {
      dismiss();
      if (onCancel) onCancel();
    });
    overlay.addEventListener("click", e => { if (e.target === overlay) { dismiss(); if (onCancel) onCancel(); } });

    function dismiss() {
      overlay.style.opacity = "0";
      overlay.querySelector(".rfx-sheet").style.transform = "translateY(100%)";
      setTimeout(() => overlay.remove(), 350);
    }
  }

  window.AWAReceiptFX = { show: showReceipt };
})();
