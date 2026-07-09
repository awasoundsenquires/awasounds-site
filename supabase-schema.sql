-- ============================================================
-- AWA SOUNDS — Supabase schema
-- Run this once in your Awa Sounds project:
--   Supabase dashboard → SQL Editor → New query → paste → Run.
-- Everything is protected by Row Level Security so it is safe to
-- talk to from the public static site with the anon key.
-- ============================================================

-- 1) PROFILES ---------------------------------------------------
-- One row per user, auto-created on signup. Holds display name,
-- membership flag, and the writing space the profile page uses.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_member    boolean not null default false,   -- flipped true after £4.99 membership payment
  member_since timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by owner" on public.profiles;
create policy "profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles are editable by owner" on public.profiles;
create policy "profiles are editable by owner"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles are insertable by owner" on public.profiles;
create policy "profiles are insertable by owner"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) LIKES ------------------------------------------------------
-- A user "saving" a beat. beat_id matches the id in config.js.
create table if not exists public.likes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  beat_id    text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, beat_id)
);

alter table public.likes enable row level security;

drop policy if exists "likes are private to owner" on public.likes;
create policy "likes are private to owner"
  on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) PLAYLISTS + ITEMS -----------------------------------------
create table if not exists public.playlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_items (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  beat_id     text not null,
  added_at    timestamptz not null default now(),
  primary key (playlist_id, beat_id)
);

alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;

drop policy if exists "playlists are private to owner" on public.playlists;
create policy "playlists are private to owner"
  on public.playlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "playlist items follow playlist owner" on public.playlist_items;
create policy "playlist items follow playlist owner"
  on public.playlist_items for all
  using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()));

-- 4) LYRICS -----------------------------------------------------
-- The writing space on a user's profile. One or many drafts each.
create table if not exists public.lyrics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default 'Untitled',
  body       text not null default '',
  beat_id    text,                                   -- optional: written to a beat
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.lyrics enable row level security;

drop policy if exists "lyrics are private to owner" on public.lyrics;
create policy "lyrics are private to owner"
  on public.lyrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5) ADMIN FLAG ------------------------------------------------
-- Mark yourself admin once (after you have signed up):
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 6) BEATS (no-code editable via the admin panel) --------------
-- The public store reads from here; admins add/edit/delete rows.
create table if not exists public.beats (
  id          text primary key,               -- slug, e.g. 'chrome-nights'
  title       text not null,
  producer    text not null default 'AWA',
  bpm         int,
  music_key   text,
  tags        text[] not null default '{}',
  cover_url   text,
  preview_url text,
  pay_mp3     text,
  pay_wav     text,
  pay_trackout text,
  sort        int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.beats enable row level security;

drop policy if exists "beats are public to read" on public.beats;
create policy "beats are public to read"
  on public.beats for select using (active = true or public.is_admin());

drop policy if exists "beats are admin-writable" on public.beats;
create policy "beats are admin-writable"
  on public.beats for all using (public.is_admin()) with check (public.is_admin());

-- 7) SITE CONTENT (no-code editable text blocks) ---------------
-- Any element with data-cms="key" on the site shows this value.
create table if not exists public.site_content (
  key        text primary key,               -- e.g. 'home.hero.title'
  value      text not null default '',
  label      text,                            -- friendly name shown in the admin
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "content is public to read" on public.site_content;
create policy "content is public to read"
  on public.site_content for select using (true);

drop policy if exists "content is admin-writable" on public.site_content;
create policy "content is admin-writable"
  on public.site_content for all using (public.is_admin()) with check (public.is_admin());

-- 8) COVER STORAGE (optional) ----------------------------------
-- In the dashboard: Storage → New bucket → name "covers" → Public.
-- Then admins can upload cover images from the admin panel.
-- Public read + admin write policy for that bucket:
--   (run after creating the bucket)
-- create policy "covers public read" on storage.objects for select using (bucket_id = 'covers');
-- create policy "covers admin write" on storage.objects for insert to authenticated
--   with check (bucket_id = 'covers' and public.is_admin());

-- 9) SEED BEATS (optional starter rows matching the code catalogue)
insert into public.beats (id,title,producer,bpm,music_key,tags,cover_url,sort) values
  ('chrome-nights','Chrome Nights','AWA',92,'Am','{R&B,Trapsoul}','assets/img/beat-chrome-nights.png',1),
  ('lagos-after-dark','Lagos After Dark','AWA',105,'Fm','{Afrobeats,Pop}','assets/img/beat-lagos-after-dark.png',2),
  ('no-cosign','No Cosign','AWA',140,'Gm','{Trap,Drill}','assets/img/beat-no-cosign.png',3),
  ('silver-static','Silver Static','AWA',120,'C','{Pop,Electronic}','assets/img/beat-silver-static.png',4),
  ('ember-room','Ember Room','AWA',84,'Dm','{Alt R&B,Soul}','assets/img/beat-ember-room.png',5),
  ('foundry','Foundry','AWA',128,'Em','{Hip-Hop,Boom Bap}','assets/img/beat-foundry.png',6)
on conflict (id) do nothing;

-- ============================================================
-- NOTE ON MEMBERSHIP FULFILMENT
-- GoDaddy Pay Links cannot call Supabase directly. After a member
-- pays the £4.99 link, flip their flag once (SQL Editor):
--   update public.profiles set is_member = true, member_since = now()
--   where id = (select id from auth.users where email = 'buyer@email.com');
-- (Later this can be automated with a webhook / edge function.)
-- ============================================================
