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

  const emit = () => listeners.forEach(fn => { try { fn(session, profile); } catch (e) {} });

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

    async signUp(email, password, displayName) {
      if (!client) return { error: notReady() };
      return client.auth.signUp({
        email, password,
        options: { data: { display_name: displayName || "" } }
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
      el.href = "account.html";
      el.innerHTML = `<span class="dot${API.isMember() ? " member" : ""}"></span>${escapeHtml(name)}`;
      el.title = API.isMember() ? "Insider member" : "My account";
    } else {
      el.href = "#";
      el.textContent = "Sign in";
      el.onclick = (e) => { e.preventDefault(); openModal(); };
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

    const setMode = (m) => {
      mode = m;
      tabs.forEach(t => t.classList.toggle("on", t.dataset.tab === m));
      nameField.style.display = m === "up" ? "" : "none";
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
      const res = mode === "up"
        ? await API.signUp(email, password, name)
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
