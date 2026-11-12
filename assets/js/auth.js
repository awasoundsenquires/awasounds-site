/* AWA SOUNDS — auth + account layer (client-side Supabase)
   Requires: config.js and the Supabase UMD build loaded before this file.
   Exposes window.AWAAuth for store.js / account.js. Degrades to a no-op
   (features hidden) when Supabase keys are not yet set in config.js. */
(function () {
  "use strict";
  const CFG = window.AWA || {};
  const enabled = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
  const listeners = [];
  let client = null, session = null, profile = null;

  if (enabled) {
    client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  }

  const emit = () => {
    window.AWA_SESSION = session;
    window.AWA_PROFILE = profile;
    listeners.forEach(fn => { try { fn(session, profile); } catch (e) {} });
  };

  async function loadProfile() {
    if (!client || !session) { profile = null; return; }
    const { data } = await client.from("profiles").select("*").eq("id", session.user.id).single();
    profile = data || null;
  }

  async function refresh() {
    if (!client) return;
    const { data } = await client.auth.getSession();
    session = data.session || null;
    await loadProfile();
    renderNav();
    emit();
  }

  /* ---------- Public API ---------- */
  const API = {
    enabled,
    client: () => client,
    user: () => (session ? session.user : null),
    profile: () => profile,
    isMember: () => !!(profile && profile.is_member),
    onChange: (fn) => { listeners.push(fn); if (session !== undefined) fn(session, profile); },

    async signUp(email, password, displayName, newsletter) {
      if (!client) return { error: notReady() };
      return client.auth.signUp({
        email, password,
        options: { data: { display_name: displayName || "", newsletter_optin: !!newsletter } }
      });
    },
    async signIn(email, password) {
      if (!client) return { error: notReady() };
      return client.auth.signInWithPassword({ email, password });
    },
    async signOut() {
      if (!client) return;
      await client.auth.signOut();
    },
    /* Run cb() if logged in, otherwise open the auth modal with a reason. */
    requireAuth(cb, reason) {
      if (!enabled) { alert("Accounts are launching soon."); return; }
      if (session) return cb();
      openModal(reason || "Create a free account to continue.");
    },
    openModal: (reason) => openModal(reason)
  };

  function notReady() { return { message: "Accounts are not configured yet." }; }

  /* ---------- Nav account control (injected site-wide) ---------- */
  function injectNavDD() {
    if (document.getElementById("nav-acct-css")) return;
    const s = document.createElement("style");
    s.id = "nav-acct-css";
    s.textContent = ".nav-acct-wrap{position:relative;display:inline-flex;align-items:center}.nav-acct-dd{position:absolute;top:calc(100% + 8px);right:0;min-width:152px;background:rgba(8,8,12,.97);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:5px;z-index:9999;display:none;flex-direction:column;gap:1px;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,.55)}.nav-acct-dd.open{display:flex}.nav-acct-item{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:7px;font-size:13px;color:rgba(232,232,240,.85);text-decoration:none;background:none;border:none;cursor:pointer;width:100%;text-align:left;font-family:inherit;transition:background .12s}.nav-acct-item:hover{background:rgba(255,255,255,.08);color:#fff}.nav-acct-so{color:rgba(255,100,100,.75)!important}.nav-acct-so:hover{background:rgba(255,60,60,.08)!important;color:#ff7070!important}";
    document.head.appendChild(s);
  }

  function renderNav() {
    const right = document.querySelector(".nav-right");
    if (!right) return;
    let el = right.querySelector(".nav-account");
    if (!el) {
      el = document.createElement("a");
      el.className = "nav-account";
      right.insertBefore(el, right.querySelector(".burger"));
    }
    if (session) {
      const name = (profile && profile.display_name) || session.user.email.split("@")[0];
      el.innerHTML = `<span class="dot${API.isMember() ? " member" : ""}"></span>${escapeHtml(name)}`;
      el.title = API.isMember() ? "Insider member" : "My account";
      el.href = "#";
      if (!el._ddWired) {
        el._ddWired = true;
        injectNavDD();
        const wrap = document.createElement("div");
        wrap.className = "nav-acct-wrap";
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
        const dd = document.createElement("div");
        dd.className = "nav-acct-dd";
        dd.innerHTML = '<a href="account.html#profile" class="nav-acct-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>My Studio</a><button class="nav-acct-item nav-acct-so"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign out</button>';
        wrap.appendChild(dd);
        const clickH = e => { e.preventDefault(); dd.classList.toggle("open"); };
        el._clickH = clickH;
        el.addEventListener("click", clickH);
        document.addEventListener("click", e => { if (!wrap.contains(e.target)) dd.classList.remove("open"); });
        dd.querySelector(".nav-acct-so").addEventListener("click", async () => {
          dd.classList.remove("open");
          await API.signOut();
          if (window.location.href.includes("account.html")) window.location.href = "index.html";
        });
      }
    } else {
      if (el._ddWired) {
        el._ddWired = false;
        if (el._clickH) { el.removeEventListener("click", el._clickH); el._clickH = null; }
        const wrap = right.querySelector(".nav-acct-wrap");
        if (wrap) { wrap.parentNode.insertBefore(el, wrap); wrap.remove(); }
      }
      el.href = "account.html";
      el.textContent = "My Studio";
      el.onclick = null;
    }
    // Sync mobile drawer — add Insider CTA or My Account link
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      let mobileAcct = navLinks.querySelector(".nav-mobile-account");
      if (!mobileAcct) {
        mobileAcct = document.createElement("a");
        mobileAcct.className = "nav-mobile-account";
        navLinks.appendChild(mobileAcct);
      }
      if (session) {
        mobileAcct.href = "account.html";
        mobileAcct.textContent = "My Account";
      } else {
        mobileAcct.href = "account.html";
        mobileAcct.textContent = "My Studio";
        mobileAcct.onclick = null;
      }
    }
  }

  /* ---------- Auth modal ---------- */
  let modal = null;
  function buildModal() {
    modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.innerHTML = `
      <div class="auth-card">
        <button class="auth-close" aria-label="Close">&times;</button>
        <div class="auth-brand">AWA <b>SOUNDS</b></div>
        <p class="auth-reason"></p>
        <div class="auth-tabs">
          <button data-tab="in" class="on">Sign in</button>
          <button data-tab="up">Create account</button>
        </div>
        <form class="auth-form">
          <label class="auth-name" style="display:none">Name
            <input type="text" name="name" autocomplete="name" placeholder="Your name / artist name">
          </label>
          <label>Email
            <input type="email" name="email" required autocomplete="email" placeholder="you@email.com">
          </label>
          <label>Password
            <input type="password" name="password" required minlength="6" autocomplete="current-password" placeholder="6+ characters">
          </label>
          <label class="auth-newsletter" style="display:none;flex-direction:row;align-items:flex-start;gap:8px;background:rgba(217,195,143,.07);border:1px solid rgba(217,195,143,.2);border-radius:8px;padding:10px 12px;cursor:pointer;font-size:11.5px;color:#8888aa;line-height:1.5">
            <input type="checkbox" name="newsletter" checked style="margin-top:2px;flex:0 0 auto;accent-color:#d9c38f">
            <span>Keep me updated — promo codes, beat drops, auction reminders and exclusive discounts. No spam, unsubscribe any time.</span>
          </label>
          <p class="auth-error" role="alert"></p>
          <button type="submit" class="btn btn-primary auth-submit">Sign in</button>
        </form>
        <p class="auth-foot"></p>
      </div>`;
    document.body.appendChild(modal);

    const card = modal.querySelector(".auth-card");
    const form = modal.querySelector(".auth-form");
    const nameField = modal.querySelector(".auth-name");
    const errEl = modal.querySelector(".auth-error");
    const submit = modal.querySelector(".auth-submit");
    const tabs = modal.querySelectorAll(".auth-tabs button");
    let mode = "in";

    const newsletterField = modal.querySelector(".auth-newsletter");
    const setMode = (m) => {
      mode = m;
      tabs.forEach(t => t.classList.toggle("on", t.dataset.tab === m));
      nameField.style.display = m === "up" ? "" : "none";
      newsletterField.style.display = m === "up" ? "flex" : "none";
      submit.textContent = m === "up" ? "Create account" : "Sign in";
      form.password.autocomplete = m === "up" ? "new-password" : "current-password";
      errEl.textContent = "";
    };
    tabs.forEach(t => t.addEventListener("click", () => setMode(t.dataset.tab)));

    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    modal.querySelector(".auth-close").addEventListener("click", closeModal);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      submit.disabled = true;
      const email = form.email.value.trim();
      const password = form.password.value;
      const name = form.name.value.trim();
      const newsletter = form.newsletter ? form.newsletter.checked : false;
      const res = mode === "up"
        ? await API.signUp(email, password, name, newsletter)
        : await API.signIn(email, password);
      submit.disabled = false;
      if (res.error) { errEl.textContent = res.error.message; return; }
      if (mode === "up" && res.data && !res.data.session) {
        // Email confirmation is on: no session yet.
        card.querySelector(".auth-foot").textContent = "Check your inbox to confirm your email, then sign in.";
        setMode("in");
        return;
      }
      await refresh();
      closeModal();
    });

    modal._setMode = setMode;
  }

  function openModal(reason) {
    if (!enabled) { alert("Accounts are launching soon."); return; }
    if (!modal) buildModal();
    modal.querySelector(".auth-reason").textContent = reason || "";
    modal.querySelector(".auth-foot").textContent = "";
    modal.querySelector(".auth-error").textContent = "";
    modal._setMode("in");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  window.AWAAuth = API;

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderNav();
    if (client) {
      client.auth.onAuthStateChange(() => refresh());
      refresh();
    }
  });
})();
