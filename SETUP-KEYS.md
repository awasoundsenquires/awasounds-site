# Awa Sounds — Go-Live Setup (paste keys, no code)

Everything is built. To switch on accounts, the store data, the admin panel,
payments and the contact form, you just paste a few keys and run one SQL file.
All of this is safe to expose in a public static site.

## 1. Supabase (accounts, store data, admin)
1. In your **Awa Sounds** Supabase project (the one under `awasoundsenquires@gmail.com`):
   - **SQL Editor → New query →** paste all of `supabase-schema.sql` → **Run**.
   - **Project Settings → API →** copy the **Project URL** and the **anon public** key.
2. Open `assets/js/config.js` and paste them:
   ```js
   supabaseUrl:     "https://xxxx.supabase.co",
   supabaseAnonKey: "eyJ....",
   ```
3. **Make yourself admin:** sign up on the live site first (so your user exists),
   then in Supabase SQL Editor run:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
   ```
   Now `/admin.html` opens the control room for you only.
4. *(Optional, for cover uploads from the admin)* Supabase → **Storage → New bucket →**
   name it `covers`, make it **Public**. Then run the two commented storage
   policies at the bottom of `supabase-schema.sql`.

## 2. Contact / demo form
1. Get a free key at **web3forms.com** (enter `awasound.music@gmail.com` as the
   destination). 2. Paste it in `config.js`:
   ```js
   web3formsKey: "your-web3forms-key",
   ```
Demos and enquiries then land in `awasound.music@gmail.com`.

## 3. GoDaddy Pay Links (payments)
No Stripe. In **GoDaddy Payments** create a Pay Link per product, then paste the URLs:
- **Per beat:** open `/admin.html` → edit the beat → paste the MP3 / WAV / Trackout links.
- **Membership:** in `config.js` set `membershipPayLink` to your £4.99/mo link.
Any link left blank falls back to an email enquiry, so nothing breaks before they exist.

## 4. Custom domain (awasounds.com)
In **GoDaddy → Domain → DNS**:
- `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` `www` → `awasoundsenquires.github.io`
Then in the repo **Settings → Pages → Custom domain →** enter `awasounds.com` (adds HTTPS).

---
### What works before any keys
The marketing site, the beat store visuals + pricing, the license contracts, and
the "License" buttons (as email enquiries) all work immediately. Accounts, the
admin panel, likes/playlists/lyrics, and card payments switch on once the keys above
are in place.

### Admin panel — what you can edit with no code
`/admin.html` (admins only): add / edit / remove beats (title, BPM, key, tags, cover,
per-license Pay Links, show/hide), and edit any site text block tagged on a page.
