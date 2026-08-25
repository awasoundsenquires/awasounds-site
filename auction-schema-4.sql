-- AWA SOUNDS — Auction Schema Part 4
-- Vault Drop session model:
--   • Each auction session has 10-15 products queued in order.
--   • Each product gets exactly 5 minutes of live bidding.
--   • Anti-snipe: if a bid lands within 60 seconds of close, extend by 90 seconds (max one extension per product).
--   • After time expires (or admin advances), the next queued product goes live automatically.
-- ============================================================

-- ── auction_queue table ──────────────────────────────────────
-- Links a session (auction row) to an ordered list of products.
-- Each row is one item up for bid during the session.
create table if not exists public.auction_queue (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.auctions(id) on delete cascade,
  position       int  not null,          -- 1-based display order
  title          text not null,
  item_type      text not null default 'cover_art',
  item_code      text,
  image_url      text,
  starting_bid   int  not null default 50,
  bid_increment  int  not null default 5,
  reserve_cr     int,                    -- hidden reserve (optional)
  -- Runtime state
  status         text not null default 'queued',  -- queued | live | sold | passed
  opens_at       timestamptz,            -- set when product goes live
  closes_at      timestamptz,            -- opens_at + 5 minutes
  extended_until timestamptz,            -- set if anti-snipe triggers
  winning_bid    int,
  winner_id      uuid references auth.users,
  -- Audit
  created_at     timestamptz default now(),
  unique (session_id, position)
);

-- RLS
alter table public.auction_queue enable row level security;
do $$ begin
  begin
    create policy "auction_queue_public_read" on public.auction_queue
      for select using (true);
  exception when duplicate_object then null; end;
  begin
    create policy "auction_queue_owner_write" on public.auction_queue
      for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end;
end $$;

grant select on public.auction_queue to authenticated, anon;

-- ── auctions table additions ─────────────────────────────────
-- Track which queue position is currently live
alter table public.auctions add column if not exists current_position int default 0;
alter table public.auctions add column if not exists total_products   int default 0;
-- Session type flag
alter table public.auctions add column if not exists session_mode     text default 'single';
-- 'single' = original single-item auction
-- 'queue'  = 5-min product-queue session (this schema)

-- ── bids table — add queue_item_id column ───────────────────
alter table public.bids add column if not exists queue_item_id uuid references public.auction_queue(id);

-- ── update place_bid for 5-min anti-snipe ────────────────────
-- Replaces the Part 3 function entirely.
-- Anti-snipe: 60s window → 90s extension (one extension per item max).
create or replace function public.place_bid(
  p_auction_id   uuid,
  p_bid_amount   int,
  p_queue_item_id uuid default null   -- required for queue-mode sessions
) returns jsonb language plpgsql security definer as $$
declare
  v_uid          uuid := auth.uid();
  v_auction      record;
  v_item         record;
  v_balance      int;
  v_bid_fee      int := 5;
  v_min_bid      int;
  v_total_cost   int;
  v_extended     boolean := false;
  v_new_close    timestamptz;
  v_snipe_win    interval := interval '60 seconds';   -- 60s snipe window (fits 5-min auction)
  v_extend_by    interval := interval '90 seconds';   -- extend by 90s max once
  v_closes       timestamptz;
  v_target_item  uuid;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Advisory lock per auction to serialise concurrent bids
  perform pg_advisory_xact_lock(hashtext(p_auction_id::text));

  -- Load auction
  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'auction_not_found');
  end if;
  if v_auction.status not in ('live','closing') then
    return jsonb_build_object('ok', false, 'error', 'auction_not_live');
  end if;

  -- Bidder-mode check
  if not exists (
    select 1 from public.auction_presence
    where auction_id = p_auction_id and user_id = v_uid and mode = 'bidder'
  ) then
    return jsonb_build_object('ok', false, 'error', 'not_in_bidder_mode');
  end if;

  -- ── Queue mode: operate on the specific queue item ──
  if v_auction.session_mode = 'queue' then
    if p_queue_item_id is null then
      return jsonb_build_object('ok', false, 'error', 'queue_item_required');
    end if;
    select * into v_item from public.auction_queue
      where id = p_queue_item_id and session_id = p_auction_id and status = 'live'
      for update;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'item_not_live');
    end if;
    -- Time check on the item
    v_closes := coalesce(v_item.extended_until, v_item.closes_at);
    if now() >= v_closes then
      return jsonb_build_object('ok', false, 'error', 'item_expired');
    end if;
    v_min_bid := coalesce(v_item.winning_bid, v_item.starting_bid - v_item.bid_increment) + v_item.bid_increment;
    if p_bid_amount < v_min_bid then
      return jsonb_build_object('ok', false, 'error', 'bid_too_low', 'minimum', v_min_bid);
    end if;
    -- Anti-snipe (only if not already extended)
    if v_item.extended_until is null and v_closes < now() + v_snipe_win then
      v_new_close := v_closes + v_extend_by;
      v_extended  := true;
    end if;
    v_target_item := p_queue_item_id;
  else
    -- ── Single mode: original logic ──
    v_closes := coalesce(v_auction.extended_until, v_auction.closes_at);
    if now() >= v_closes then
      return jsonb_build_object('ok', false, 'error', 'auction_expired');
    end if;
    v_min_bid := coalesce(v_auction.winning_bid, v_auction.starting_bid - v_auction.bid_increment) + v_auction.bid_increment;
    if p_bid_amount < v_min_bid then
      return jsonb_build_object('ok', false, 'error', 'bid_too_low', 'minimum', v_min_bid);
    end if;
    -- Anti-snipe
    if v_auction.extended_until is null and v_closes < now() + v_snipe_win then
      v_new_close := v_closes + v_extend_by;
      v_extended  := true;
    end if;
    v_target_item := null;
  end if;

  -- Balance check
  v_total_cost := p_bid_amount + v_bid_fee;
  select coalesce(sum(amount), 0) into v_balance from public.credit_ledger where user_id = v_uid;
  if v_balance < v_total_cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credits');
  end if;

  -- Deduct bid fee (non-refundable)
  insert into public.credit_ledger (user_id, amount, type, ref_id, note)
  values (v_uid, -v_bid_fee, 'bid_fee', p_auction_id,
          'Bid fee — ' || coalesce(p_queue_item_id::text, p_auction_id::text));

  -- Deduct escrow
  insert into public.credit_ledger (user_id, amount, type, ref_id, note)
  values (v_uid, -p_bid_amount, 'bid_escrow', p_auction_id,
          'Bid escrow — ' || p_bid_amount || ' cr');

  -- Refund previous winner's escrow
  if v_auction.session_mode = 'queue' then
    if v_item.winner_id is not null and v_item.winner_id <> v_uid then
      insert into public.credit_ledger (user_id, amount, type, ref_id, note)
      values (v_item.winner_id, v_item.winning_bid, 'bid_refund', p_auction_id, 'Outbid refund');
    end if;
  else
    if v_auction.winner_id is not null and v_auction.winner_id <> v_uid then
      insert into public.credit_ledger (user_id, amount, type, ref_id, note)
      values (v_auction.winner_id, v_auction.winning_bid, 'bid_refund', p_auction_id, 'Outbid refund');
    end if;
  end if;

  -- Record bid
  insert into public.bids (auction_id, user_id, bid_amount, is_winning, queue_item_id)
  values (p_auction_id, v_uid, p_bid_amount, true, v_target_item);

  -- Mark old winning bid as not winning
  update public.bids
  set is_winning = false
  where auction_id = p_auction_id
    and coalesce(queue_item_id::text,'') = coalesce(v_target_item::text,'')
    and user_id <> v_uid and is_winning = true;

  -- Update state
  if v_auction.session_mode = 'queue' then
    update public.auction_queue
    set winning_bid    = p_bid_amount,
        winner_id      = v_uid,
        extended_until = case when v_extended then v_new_close else extended_until end
    where id = p_queue_item_id;
  else
    update public.auctions
    set winning_bid    = p_bid_amount,
        winner_id      = v_uid,
        extended_until = case when v_extended then v_new_close else extended_until end,
        status         = case when v_extended then 'closing' else status end
    where id = p_auction_id;
  end if;

  -- Heartbeat presence
  update public.auction_presence
  set last_heartbeat = now()
  where auction_id = p_auction_id and user_id = v_uid;

  return jsonb_build_object(
    'ok',       true,
    'extended', v_extended,
    'new_bid',  p_bid_amount,
    'minimum',  p_bid_amount + coalesce(v_item.bid_increment, v_auction.bid_increment, 5),
    'new_close', case when v_extended then v_new_close else null end
  );
end;
$$;
grant execute on function public.place_bid to authenticated;

-- ── advance_product() ────────────────────────────────────────
-- Marks the current live item as sold/passed and opens the next queued item.
-- Called server-side via a pg_cron job every 30 seconds (or triggered by Realtime).
-- Also callable from admin panel via service role.
-- Returns: {ok, next_position, next_item_id} or {ok:false, reason:'session_complete'}
create or replace function public.advance_product(p_session_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_current   record;
  v_next      record;
  v_closes    timestamptz;
begin
  -- Lock the session row
  perform pg_advisory_xact_lock(hashtext(p_session_id::text));

  -- Find the current live item
  select * into v_current
  from public.auction_queue
  where session_id = p_session_id and status = 'live'
  limit 1;

  if found then
    v_closes := coalesce(v_current.extended_until, v_current.closes_at);
    if now() < v_closes then
      -- Still live — do nothing
      return jsonb_build_object('ok', false, 'reason', 'still_live',
        'seconds_remaining', extract(epoch from (v_closes - now()))::int);
    end if;
    -- Mark it sold or passed
    update public.auction_queue
    set status = case when winning_bid is not null then 'sold' else 'passed' end
    where id = v_current.id;
  end if;

  -- Find next queued item
  select * into v_next
  from public.auction_queue
  where session_id = p_session_id and status = 'queued'
  order by position asc
  limit 1;

  if not found then
    -- All items done — close the session
    update public.auctions
    set status = 'closed'
    where id = p_session_id;
    return jsonb_build_object('ok', true, 'reason', 'session_complete');
  end if;

  -- Open the next item: 5-minute window
  update public.auction_queue
  set status    = 'live',
      opens_at  = now(),
      closes_at = now() + interval '5 minutes'
  where id = v_next.id
  returning * into v_next;

  -- Update session pointer
  update public.auctions
  set current_position = v_next.position,
      status           = 'live'
  where id = p_session_id;

  return jsonb_build_object(
    'ok',           true,
    'next_position', v_next.position,
    'next_item_id',  v_next.id,
    'closes_at',     v_next.closes_at
  );
end;
$$;
grant execute on function public.advance_product to authenticated;  -- service role only in practice; front-end uses RPC via authed session

-- ── get_session_queue() ──────────────────────────────────────
-- Returns all queue items for a session with live item first.
-- Used by the front-end every 6s (or on Realtime update) to render the product rail.
create or replace function public.get_session_queue(p_session_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_items jsonb;
begin
  select jsonb_agg(row_to_json(q) order by q.position)
  into v_items
  from public.auction_queue q
  where q.session_id = p_session_id;
  return coalesce(v_items, '[]'::jsonb);
end;
$$;
grant execute on function public.get_session_queue to authenticated, anon;

-- ── pg_cron: check every 30 seconds for expired products ─────
-- Requires pg_cron extension (available on Supabase Pro / Team plans).
-- On Free tier, the client calls advance_product() when it detects expiry.
-- Uncomment if pg_cron is available:
--
-- select cron.schedule(
--   'vault-advance-products',
--   '30 seconds',
--   $$
--     select public.advance_product(id)
--     from public.auctions
--     where status = 'live' and session_mode = 'queue';
--   $$
-- );

-- ── Verification ─────────────────────────────────────────────
select routine_name from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('place_bid','advance_product','get_session_queue')
order by routine_name;
