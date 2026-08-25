-- AWA SOUNDS — Schema Part 2
-- Run this AFTER auction-schema.sql
-- Tables: spin_claims, promo_codes, login_streaks, referrals, auction_presence
-- Functions: claim_spin(), validate_promo(), record_login_streak(), heartbeat_presence()
-- ============================================================

-- ── spin_claims ──────────────────────────────────────────────
create table if not exists public.spin_claims (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  spin_type     text not null,          -- 'welcome' | 'referral_bonus' | 'milestone'
  prize_type    text not null,          -- 'credits' | 'discount_pct' | 'two_for_one' | 'free_edit' | 'album_discount'
  prize_value   text,                   -- numeric string or null
  prize_label   text,
  created_at    timestamptz not null default now()
);
alter table public.spin_claims enable row level security;
create policy "Users see own spins" on public.spin_claims for select using (auth.uid() = user_id);
create policy "Claim via rpc only" on public.spin_claims for insert with check (false);

-- ── promo_codes ──────────────────────────────────────────────
create table if not exists public.promo_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  promo_type    text not null,          -- 'two_for_one' | 'bundle' | 'pct_off' | 'free_edit' | 'credits'
  value         text,                   -- e.g. "20" for 20% off, or credit amount
  max_uses      int,                    -- null = unlimited
  used_count    int not null default 0,
  active        boolean not null default true,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);
alter table public.promo_codes enable row level security;
create policy "Anyone can read active codes (via rpc)" on public.promo_codes for select using (false);

-- ── login_streaks ─────────────────────────────────────────────
create table if not exists public.login_streaks (
  user_id       uuid primary key references auth.users on delete cascade,
  streak        int not null default 0,
  last_login    date,
  total_logins  int not null default 0,
  updated_at    timestamptz not null default now()
);
alter table public.login_streaks enable row level security;
create policy "Users see own streak" on public.login_streaks for select using (auth.uid() = user_id);
create policy "Streak via rpc only" on public.login_streaks for insert with check (false);
create policy "Streak update via rpc only" on public.login_streaks for update using (false);

-- ── referrals ─────────────────────────────────────────────────
create table if not exists public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references auth.users on delete cascade,
  referred_id   uuid not null references auth.users on delete cascade,
  credited      boolean not null default false,  -- true once both got their 25 cr
  created_at    timestamptz not null default now(),
  unique (referrer_id, referred_id)
);
alter table public.referrals enable row level security;
create policy "Users see own referrals" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "Referral via rpc only" on public.referrals for insert with check (false);

-- ── auction_presence ──────────────────────────────────────────
create table if not exists public.auction_presence (
  id              uuid primary key default gen_random_uuid(),
  auction_id      uuid not null references public.auctions on delete cascade,
  user_id         uuid not null references auth.users on delete cascade,
  mode            text not null default 'viewer' check (mode in ('bidder','viewer')),
  last_heartbeat  timestamptz not null default now(),
  queue_position  int,
  joined_at       timestamptz not null default now(),
  unique (auction_id, user_id)
);
alter table public.auction_presence enable row level security;
create policy "Bidders see room presence" on public.auction_presence for select using (true);
create policy "Users manage own presence" on public.auction_presence for all using (auth.uid() = user_id);

create index if not exists idx_presence_auction on public.auction_presence (auction_id, mode);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- ── claim_spin() ─────────────────────────────────────────────
-- Called by client after wheel stops.  Awards credits if prize_type = 'credits'.
-- p_spin_type: 'welcome' — checks welcome_spin_claimed on profiles.
create or replace function public.claim_spin(
  p_spin_type   text,
  p_prize_type  text,
  p_prize_value text,
  p_prize_label text
) returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_already boolean;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  -- Idempotency gate for welcome spin
  if p_spin_type = 'welcome' then
    select welcome_spin_claimed into v_already from public.profiles where id = v_uid;
    if v_already then return jsonb_build_object('ok', false, 'reason', 'already_claimed'); end if;
    update public.profiles set welcome_spin_claimed = true where id = v_uid;
  end if;

  -- Record the spin
  insert into public.spin_claims (user_id, spin_type, prize_type, prize_value, prize_label)
  values (v_uid, p_spin_type, p_prize_type, p_prize_value, p_prize_label);

  -- Award credits if applicable
  if p_prize_type = 'credits' and p_prize_value is not null then
    insert into public.credit_ledger (user_id, amount, type, note)
    values (v_uid, p_prize_value::int, 'spin_prize', 'Roulette win: ' || p_prize_label);
  end if;

  return jsonb_build_object('ok', true, 'prize_type', p_prize_type, 'prize_value', p_prize_value);
end;
$$;

-- ── validate_promo() ─────────────────────────────────────────
-- Returns promo details if valid (active, not expired, not exhausted).
create or replace function public.validate_promo(p_code text)
returns jsonb language plpgsql security definer as $$
declare
  v_promo record;
begin
  select * into v_promo from public.promo_codes
  where lower(code) = lower(p_code) and active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or used_count < max_uses);

  if not found then
    return jsonb_build_object('valid', false, 'reason', 'Code not found, expired, or used up.');
  end if;

  return jsonb_build_object(
    'valid',      true,
    'code',       v_promo.code,
    'promo_type', v_promo.promo_type,
    'value',      v_promo.value
  );
end;
$$;

-- ── record_login_streak() ────────────────────────────────────
-- Call once per session start. Returns current streak + any bonus credits earned.
create or replace function public.record_login_streak()
returns jsonb language plpgsql security definer as $$
declare
  v_uid       uuid := auth.uid();
  v_today     date := current_date;
  v_rec       record;
  v_new_streak int;
  v_bonus     int := 0;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select * into v_rec from public.login_streaks where user_id = v_uid;

  if not found then
    -- First ever login
    insert into public.login_streaks (user_id, streak, last_login, total_logins)
    values (v_uid, 1, v_today, 1);
    v_new_streak := 1;
  elsif v_rec.last_login = v_today then
    -- Already recorded today
    return jsonb_build_object('streak', v_rec.streak, 'bonus_credits', 0);
  elsif v_rec.last_login = v_today - 1 then
    -- Consecutive day
    v_new_streak := v_rec.streak + 1;
    update public.login_streaks set streak = v_new_streak, last_login = v_today, total_logins = total_logins + 1, updated_at = now() where user_id = v_uid;
  else
    -- Streak broken
    v_new_streak := 1;
    update public.login_streaks set streak = 1, last_login = v_today, total_logins = total_logins + 1, updated_at = now() where user_id = v_uid;
  end if;

  -- Milestone bonuses (match config.js streakMilestones)
  v_bonus := case v_new_streak
    when 5  then 10
    when 7  then 5
    when 10 then 25
    when 14 then 10
    when 21 then 15
    when 30 then 50
    else 0
  end;

  if v_bonus > 0 then
    insert into public.credit_ledger (user_id, amount, type, note)
    values (v_uid, v_bonus, 'streak_bonus', v_new_streak || '-day streak reward');
  end if;

  return jsonb_build_object('streak', v_new_streak, 'bonus_credits', v_bonus);
end;
$$;

-- ── heartbeat_presence() ─────────────────────────────────────
-- Client pings every 20s while in a room.  Upserts presence row.
create or replace function public.heartbeat_presence(
  p_auction_id uuid,
  p_mode       text default 'viewer'
) returns jsonb language plpgsql security definer as $$
declare
  v_uid    uuid := auth.uid();
  v_bidder_count int;
  v_cfg    record;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select count(*) into v_bidder_count
  from public.auction_presence
  where auction_id = p_auction_id and mode = 'bidder';

  -- Attempt to upgrade to bidder: check slot availability
  if p_mode = 'bidder' then
    -- Check existing presence
    if exists (select 1 from public.auction_presence where auction_id = p_auction_id and user_id = v_uid and mode = 'bidder') then
      -- Already a bidder — just refresh heartbeat
      update public.auction_presence set last_heartbeat = now() where auction_id = p_auction_id and user_id = v_uid;
      return jsonb_build_object('mode', 'bidder', 'slots_left', greatest(0, 8 - v_bidder_count));
    end if;
    if v_bidder_count >= 8 then
      -- No slots — fall back to viewer
      p_mode := 'viewer';
    end if;
  end if;

  insert into public.auction_presence (auction_id, user_id, mode, last_heartbeat)
  values (p_auction_id, v_uid, p_mode, now())
  on conflict (auction_id, user_id) do update
    set mode = p_mode, last_heartbeat = now();

  return jsonb_build_object('mode', p_mode, 'slots_left', greatest(0, 8 - v_bidder_count));
end;
$$;

-- ── Promo codes — seed defaults ───────────────────────────────
insert into public.promo_codes (code, promo_type, value, max_uses, active) values
  ('2FOR1COVER', 'two_for_one', null,  100, true),
  ('BUNDLE20',   'pct_off',    '20',  500, true),
  ('INSIDER10',  'pct_off',    '10', 1000, true),
  ('FREEEDIT',   'free_edit',  null,   50, true)
on conflict (code) do nothing;

-- ── Add welcome_spin_claimed to profiles if missing ───────────
alter table public.profiles add column if not exists welcome_spin_claimed boolean not null default false;
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists email text;

-- Grant execute on new functions
grant execute on function public.claim_spin to authenticated;
grant execute on function public.validate_promo to authenticated, anon;
grant execute on function public.record_login_streak to authenticated;
grant execute on function public.heartbeat_presence to authenticated;

-- ── Verification ─────────────────────────────────────────────
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('spin_claims','promo_codes','login_streaks','referrals','auction_presence')
order by table_name;
