-- ============================================================
-- AWA SOUNDS — Vault Drop Auction Schema
-- Run this in Supabase SQL Editor (once, after existing schema)
-- ============================================================

-- Credit ledger: tracks every credit movement (earned, purchased, bid-spent)
create table if not exists public.credit_ledger (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  amount        integer not null,          -- positive = credit, negative = debit
  type          text not null,             -- 'monthly_grant' | 'purchase' | 'bid_fee' | 'refund' | 'admin'
  ref_id        uuid,                      -- bid_id or purchase_id that caused this
  note          text,
  created_at    timestamptz default now()
);
alter table public.credit_ledger enable row level security;
-- Users see only their own ledger
create policy "own ledger" on public.credit_ledger for select using (auth.uid() = user_id);
-- Only DB functions/admin can insert
create policy "admin insert ledger" on public.credit_ledger for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- View: current balance per user (sum of ledger)
create or replace view public.credit_balances as
  select user_id, coalesce(sum(amount), 0)::integer as balance
  from public.credit_ledger
  group by user_id;

-- Auctions table
create table if not exists public.auctions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  item_type     text not null,             -- 'beat' | 'cover_art' | 'cover_art_video'
  item_ref      text,                      -- slug or beat id from config
  image_url     text,
  preview_url   text,                      -- audio preview for beats
  licence_type  text,                      -- 'mp3' | 'wav' | 'trackout' | 'exclusive' | 'cover_art' | 'cover_art_video'
  starting_bid  integer not null default 50,   -- in Credits
  bid_increment integer not null default 5,    -- minimum raise per bid (Credits)
  bid_fee       integer not null default 5,    -- Credits burned per bid (non-refundable)
  credit_rate   numeric(10,4) not null,        -- Credits per £1 GBP (e.g. 10 = 10cr = £1)
  opens_at      timestamptz not null,
  closes_at     timestamptz not null,
  extended_until timestamptz,              -- set when anti-snipe fires
  status        text not null default 'scheduled',  -- 'scheduled'|'live'|'closing'|'closed'|'cancelled'
  winner_id     uuid references auth.users(id),
  winning_bid   integer,                   -- Credits
  winning_price_gbp numeric(10,2),         -- GBP amount winner must pay
  payment_due_at timestamptz,
  payment_completed_at timestamptz,
  file_delivered_at timestamptz,
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.auctions enable row level security;
-- Public can read live/closed auctions
create policy "public read auctions" on public.auctions for select using (status in ('live','closing','closed'));
-- Admin full access
create policy "admin all auctions" on public.auctions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Bids table
create table if not exists public.bids (
  id            uuid primary key default gen_random_uuid(),
  auction_id    uuid not null references public.auctions(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  bid_amount    integer not null,          -- Credits (the stated bid, not including fee)
  bid_fee_paid  integer not null default 5,
  is_winning    boolean not null default false,
  created_at    timestamptz default now()
);
alter table public.bids enable row level security;
-- Everyone can read bids (public bid history)
create policy "public read bids" on public.bids for select using (true);
-- Authenticated users can insert their own bids
create policy "auth insert bid" on public.bids for insert with check (auth.uid() = user_id);
-- Only DB functions update winning flag
create policy "admin update bids" on public.bids for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Credit purchases log
create table if not exists public.credit_purchases (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  credits       integer not null,
  amount_gbp    numeric(10,2) not null,
  payment_ref   text,                      -- GoDaddy/Stripe payment reference
  status        text default 'pending',    -- 'pending'|'completed'|'refunded'
  created_at    timestamptz default now()
);
alter table public.credit_purchases enable row level security;
create policy "own purchases" on public.credit_purchases for select using (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: place_bid
-- Validates balance, deducts credits, inserts bid, updates
-- auction leading bid, fires anti-snipe extension if needed.
-- Call from client: select * from place_bid(auction_id, bid_amount)
-- ============================================================
create or replace function public.place_bid(
  p_auction_id  uuid,
  p_bid_amount  integer
) returns jsonb language plpgsql security definer as $$
declare
  v_user_id     uuid := auth.uid();
  v_auction     record;
  v_balance     integer;
  v_top_bid     integer;
  v_total_cost  integer;
  v_bid_id      uuid;
  v_new_close   timestamptz;
  v_snipe_window interval := '5 minutes';
begin
  -- Auth check
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Lock auction row
  select * into v_auction from public.auctions
  where id = p_auction_id for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'auction_not_found');
  end if;

  if v_auction.status not in ('live', 'closing') then
    return jsonb_build_object('ok', false, 'error', 'auction_not_live');
  end if;

  -- Timer check (use extended_until if set)
  if coalesce(v_auction.extended_until, v_auction.closes_at) < now() then
    return jsonb_build_object('ok', false, 'error', 'auction_ended');
  end if;

  -- Minimum bid check
  select coalesce(max(bid_amount), v_auction.starting_bid - v_auction.bid_increment)
  into v_top_bid from public.bids where auction_id = p_auction_id;

  if p_bid_amount < v_top_bid + v_auction.bid_increment then
    return jsonb_build_object('ok', false, 'error', 'bid_too_low',
      'minimum', v_top_bid + v_auction.bid_increment);
  end if;

  -- Balance check (bid_amount + bid_fee)
  v_total_cost := p_bid_amount + v_auction.bid_fee;
  select coalesce(balance, 0) into v_balance from public.credit_balances where user_id = v_user_id;

  if v_balance < v_total_cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credits',
      'required', v_total_cost, 'balance', v_balance);
  end if;

  -- Deduct credits
  insert into public.credit_ledger (user_id, amount, type, note)
  values (v_user_id, -v_total_cost, 'bid_fee',
    'Bid ' || p_bid_amount || ' cr + ' || v_auction.bid_fee || ' cr fee on auction ' || p_auction_id);

  -- Mark previous winning bid as not winning
  update public.bids set is_winning = false where auction_id = p_auction_id and is_winning = true;

  -- Insert new bid
  insert into public.bids (auction_id, user_id, bid_amount, bid_fee_paid, is_winning)
  values (p_auction_id, v_user_id, p_bid_amount, v_auction.bid_fee, true)
  returning id into v_bid_id;

  -- Anti-snipe: if bid placed within 5 min of close, extend by 5 min
  v_new_close := coalesce(v_auction.extended_until, v_auction.closes_at);
  if v_new_close - now() < v_snipe_window then
    v_new_close := now() + v_snipe_window;
    update public.auctions set extended_until = v_new_close, status = 'closing'
    where id = p_auction_id;
  end if;

  -- Update auction with current winner
  update public.auctions set
    winner_id = v_user_id,
    winning_bid = p_bid_amount,
    winning_price_gbp = round((p_bid_amount / v_auction.credit_rate)::numeric, 2)
  where id = p_auction_id;

  return jsonb_build_object(
    'ok', true,
    'bid_id', v_bid_id,
    'bid_amount', p_bid_amount,
    'new_close', v_new_close,
    'extended', v_new_close <> coalesce(v_auction.extended_until, v_auction.closes_at)
  );
end;
$$;

-- ============================================================
-- FUNCTION: grant_monthly_credits
-- Run via cron on the 1st of each month.
-- Grants 20 free credits to every active user.
-- ============================================================
create or replace function public.grant_monthly_credits() returns void language plpgsql security definer as $$
begin
  insert into public.credit_ledger (user_id, amount, type, note)
  select id, 20, 'monthly_grant', 'Monthly free AWA Credits — ' || to_char(now(), 'Mon YYYY')
  from auth.users
  where email_confirmed_at is not null;
end;
$$;

-- ============================================================
-- FUNCTION: close_auction
-- Called by admin or cron when timer expires.
-- Finalises winner, sets payment deadline.
-- ============================================================
create or replace function public.close_auction(p_auction_id uuid) returns jsonb language plpgsql security definer as $$
declare
  v_auction record;
begin
  select * into v_auction from public.auctions where id = p_auction_id;

  if not found or v_auction.status in ('closed', 'cancelled') then
    return jsonb_build_object('ok', false, 'error', 'already_finalised');
  end if;

  update public.auctions set
    status = 'closed',
    payment_due_at = now() + interval '48 hours'
  where id = p_auction_id;

  return jsonb_build_object('ok', true, 'winner_id', v_auction.winner_id,
    'winning_bid', v_auction.winning_bid, 'winning_price_gbp', v_auction.winning_price_gbp);
end;
$$;

-- Index for fast bid lookups
create index if not exists bids_auction_id_idx on public.bids(auction_id);
create index if not exists bids_user_id_idx on public.bids(user_id);
create index if not exists credit_ledger_user_id_idx on public.credit_ledger(user_id);

-- Enable Realtime on bids and auctions (run in Supabase dashboard > Database > Replication)
-- alter publication supabase_realtime add table public.bids;
-- alter publication supabase_realtime add table public.auctions;
