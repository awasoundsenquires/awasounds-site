-- ============================================================
-- AWA SOUNDS — Engagement Layer Schema
-- Roulette spins, promo codes, album packs, streaks, referrals
-- Run AFTER auction-schema.sql and presence-schema.sql
-- ============================================================

-- 1. Spin history (welcome + earned spins)
create table if not exists public.spin_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  spin_type   text not null default 'welcome',  -- 'welcome' | 'earned' | 'referral'
  prize_type  text not null,  -- 'credits' | 'discount_pct' | 'two_for_one' | 'free_edit' | 'album_discount'
  prize_value text,           -- credits amount, discount %, etc.
  prize_label text,
  claimed_at  timestamptz default now()
);
alter table public.spin_history enable row level security;
create policy "own spins" on public.spin_history for select using (auth.uid() = user_id);
create policy "admin spins" on public.spin_history for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- 2. Promo codes
create table if not exists public.promo_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  type         text not null, -- 'percentage_off' | 'credits_bonus' | 'two_for_one' | 'album_discount' | 'free_edit'
  value        numeric,       -- pct or credits amount
  description  text,
  valid_from   timestamptz default now(),
  valid_until  timestamptz,
  max_uses     integer,
  uses_count   integer default 0,
  is_active    boolean default true,
  created_at   timestamptz default now()
);
alter table public.promo_codes enable row level security;
create policy "public read active promos" on public.promo_codes for select using (is_active = true);
create policy "admin manage promos" on public.promo_codes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- 3. User promo redemptions
create table if not exists public.promo_redemptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  promo_id    uuid not null references public.promo_codes(id),
  redeemed_at timestamptz default now(),
  unique (user_id, promo_id)
);
alter table public.promo_redemptions enable row level security;
create policy "own redemptions" on public.promo_redemptions for select using (auth.uid() = user_id);
create policy "auth insert redemption" on public.promo_redemptions for insert with check (auth.uid() = user_id);

-- 4. Login streaks
create table if not exists public.login_streaks (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  current_streak  integer default 1,
  longest_streak  integer default 1,
  last_login_date date default current_date,
  total_logins    integer default 1,
  updated_at      timestamptz default now()
);
alter table public.login_streaks enable row level security;
create policy "own streak" on public.login_streaks for all using (auth.uid() = user_id);

-- 5. Referrals
create table if not exists public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references auth.users(id) on delete cascade,
  referred_id   uuid references auth.users(id),
  referral_code text not null unique,
  status        text not null default 'pending',  -- 'pending' | 'converted' | 'rewarded'
  converted_at  timestamptz,
  rewarded_at   timestamptz,
  created_at    timestamptz default now()
);
alter table public.referrals enable row level security;
create policy "own referrals" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "auth insert referral" on public.referrals for insert with check (auth.uid() = referrer_id);

-- 6. Album pack purchases
create table if not exists public.pack_purchases (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id),
  pack_id    text not null,
  pack_title text,
  amount_gbp numeric(10,2),
  payment_ref text,
  status     text default 'pending',
  created_at timestamptz default now()
);
alter table public.pack_purchases enable row level security;
create policy "own pack purchases" on public.pack_purchases for select using (auth.uid() = user_id);

-- 7. Profile additions
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='welcome_spin_claimed') then
    alter table public.profiles add column welcome_spin_claimed boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='extra_spins') then
    alter table public.profiles add column extra_spins integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='referral_code') then
    alter table public.profiles add column referral_code text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='referred_by') then
    alter table public.profiles add column referred_by uuid;
  end if;
end $$;

-- 8. claim_spin() — awards prize and marks spin used
create or replace function public.claim_spin(
  p_spin_type   text,
  p_prize_type  text,
  p_prize_value text,
  p_prize_label text
) returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_credits integer;
begin
  if v_uid is null then return jsonb_build_object('ok',false,'error','not_authenticated'); end if;
  -- Check allowed to spin
  if p_spin_type = 'welcome' then
    if (select welcome_spin_claimed from public.profiles where id = v_uid) then
      return jsonb_build_object('ok',false,'error','already_claimed');
    end if;
    update public.profiles set welcome_spin_claimed = true where id = v_uid;
  elsif p_spin_type = 'earned' then
    if (select coalesce(extra_spins,0) from public.profiles where id = v_uid) < 1 then
      return jsonb_build_object('ok',false,'error','no_spins');
    end if;
    update public.profiles set extra_spins = extra_spins - 1 where id = v_uid;
  end if;
  -- Record spin
  insert into public.spin_history (user_id, spin_type, prize_type, prize_value, prize_label)
  values (v_uid, p_spin_type, p_prize_type, p_prize_value, p_prize_label);
  -- Award credits immediately if credit prize
  if p_prize_type = 'credits' then
    v_credits := p_prize_value::integer;
    insert into public.credit_ledger (user_id, amount, type, note)
    values (v_uid, v_credits, 'roulette_prize', 'Roulette prize: ' || p_prize_label);
  end if;
  return jsonb_build_object('ok',true,'prize_type',p_prize_type,'prize_value',p_prize_value,'credits_awarded',v_credits);
end; $$;

-- 9. record_login_streak() — call on each sign-in
create or replace function public.record_login_streak() returns jsonb language plpgsql security definer as $$
declare
  v_uid       uuid := auth.uid();
  v_today     date := current_date;
  v_rec       record;
  v_bonus     integer := 0;
  v_new_streak integer;
begin
  if v_uid is null then return jsonb_build_object('ok',false); end if;
  select * into v_rec from public.login_streaks where user_id = v_uid;
  if not found then
    insert into public.login_streaks (user_id) values (v_uid);
    return jsonb_build_object('ok',true,'streak',1,'bonus_credits',0);
  end if;
  if v_rec.last_login_date = v_today then
    return jsonb_build_object('ok',true,'streak',v_rec.current_streak,'bonus_credits',0,'already_logged',true);
  end if;
  if v_rec.last_login_date = v_today - 1 then
    v_new_streak := v_rec.current_streak + 1;
  else
    v_new_streak := 1;
  end if;
  -- Streak milestones: 5 days = +10 cr, 10 days = +25 cr, 30 days = +50 cr
  if v_new_streak = 5  then v_bonus := 10; end if;
  if v_new_streak = 10 then v_bonus := 25; end if;
  if v_new_streak = 30 then v_bonus := 50; end if;
  -- Every 7th consecutive day = +5 cr
  if v_new_streak > 1 and v_new_streak % 7 = 0 and v_bonus = 0 then v_bonus := 5; end if;
  update public.login_streaks set
    current_streak = v_new_streak,
    longest_streak = greatest(longest_streak, v_new_streak),
    last_login_date = v_today,
    total_logins = total_logins + 1,
    updated_at = now()
  where user_id = v_uid;
  if v_bonus > 0 then
    insert into public.credit_ledger (user_id, amount, type, note)
    values (v_uid, v_bonus, 'streak_bonus', 'Day ' || v_new_streak || ' streak bonus');
  end if;
  return jsonb_build_object('ok',true,'streak',v_new_streak,'bonus_credits',v_bonus);
end; $$;

-- 10. validate_promo() — check if a promo code is valid for this user
create or replace function public.validate_promo(p_code text) returns jsonb language plpgsql security definer as $$
declare
  v_uid  uuid := auth.uid();
  v_promo record;
  v_used boolean;
begin
  select * into v_promo from public.promo_codes where upper(code) = upper(p_code) and is_active = true;
  if not found then return jsonb_build_object('ok',false,'error','invalid_code'); end if;
  if v_promo.valid_until is not null and v_promo.valid_until < now() then
    return jsonb_build_object('ok',false,'error','expired'); end if;
  if v_promo.valid_from > now() then
    return jsonb_build_object('ok',false,'error','not_yet_active'); end if;
  if v_promo.max_uses is not null and v_promo.uses_count >= v_promo.max_uses then
    return jsonb_build_object('ok',false,'error','used_up'); end if;
  if v_uid is not null then
    select true into v_used from public.promo_redemptions where user_id = v_uid and promo_id = v_promo.id;
    if v_used then return jsonb_build_object('ok',false,'error','already_used'); end if;
  end if;
  return jsonb_build_object('ok',true,'type',v_promo.type,'value',v_promo.value,'description',v_promo.description,'promo_id',v_promo.id);
end; $$;

-- 11. redeem_promo() — mark promo as used, award credits if applicable
create or replace function public.redeem_promo(p_promo_id uuid) returns jsonb language plpgsql security definer as $$
declare
  v_uid   uuid := auth.uid();
  v_promo record;
begin
  if v_uid is null then return jsonb_build_object('ok',false,'error','not_authenticated'); end if;
  select * into v_promo from public.promo_codes where id = p_promo_id and is_active = true;
  if not found then return jsonb_build_object('ok',false,'error','invalid'); end if;
  insert into public.promo_redemptions (user_id, promo_id) values (v_uid, p_promo_id)
  on conflict do nothing;
  update public.promo_codes set uses_count = uses_count + 1 where id = p_promo_id;
  if v_promo.type = 'credits_bonus' then
    insert into public.credit_ledger (user_id, amount, type, note)
    values (v_uid, v_promo.value::integer, 'promo_code', 'Promo: ' || v_promo.description);
  end if;
  return jsonb_build_object('ok',true,'type',v_promo.type,'value',v_promo.value);
end; $$;

-- 12. Seed launch promo codes
insert into public.promo_codes (code, type, value, description, valid_until, max_uses) values
  ('WELCOME15',  'percentage_off',  15,  '15% off your first purchase',          now() + interval '90 days', 500),
  ('AWALAUNCH',  'credits_bonus',   50,  '50 bonus AWA Credits — launch gift',   now() + interval '30 days', 100),
  ('PACKDEAL',   'album_discount',  20,  '20% off any Album Pack',               now() + interval '60 days', 200),
  ('2FOR1COVER', 'two_for_one',     null,'Buy one cover, get one free',          now() + interval '14 days', 50)
on conflict (code) do nothing;

-- Indexes
create index if not exists spin_history_user_idx on public.spin_history(user_id);
create index if not exists promo_codes_code_idx  on public.promo_codes(upper(code));
create index if not exists referrals_code_idx    on public.referrals(referral_code);
