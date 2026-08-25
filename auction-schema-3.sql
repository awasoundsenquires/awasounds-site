-- AWA SOUNDS — Auction Room RPCs (Part 3)
-- Run AFTER auction-schema.sql (Part 1) and auction-schema-2.sql (Part 2)
-- Functions: join_auction, get_room_state, request_bidder_mode,
--            demote_to_viewer, place_bid
-- ============================================================

-- ── join_auction() ───────────────────────────────────────────
-- Called when user lands on auction room page.
-- Upserts a viewer presence row. Safe to call multiple times.
create or replace function public.join_auction(p_auction_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'reason', 'not_authenticated'); end if;

  -- Ensure auction exists and is accessible
  if not exists (select 1 from public.auctions where id = p_auction_id and status in ('live','closing','scheduled')) then
    return jsonb_build_object('ok', false, 'reason', 'auction_not_found');
  end if;

  -- Upsert presence as viewer
  insert into public.auction_presence (auction_id, user_id, mode, last_heartbeat)
  values (p_auction_id, v_uid, 'viewer', now())
  on conflict (auction_id, user_id) do update
    set last_heartbeat = now();

  return jsonb_build_object('ok', true, 'mode', 'viewer');
end;
$$;
grant execute on function public.join_auction to authenticated;

-- ── get_room_state() ─────────────────────────────────────────
-- Returns counts + the calling user's current mode.
-- Called every 8s by the front-end polling loop.
create or replace function public.get_room_state(p_auction_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_uid      uuid := auth.uid();
  v_bidders  int;
  v_viewers  int;
  v_queue    int;
  v_my_mode  text := 'viewer';
  v_my_qpos  int;
  v_cutoff   timestamptz := now() - interval '30 seconds';
begin
  -- Evict stale presence (last heartbeat > 30s ago for bidders, 90s for viewers)
  delete from public.auction_presence
  where auction_id = p_auction_id
    and (
      (mode = 'bidder' and last_heartbeat < now() - interval '35 seconds')
      or (mode = 'viewer' and last_heartbeat < now() - interval '90 seconds')
      or (mode = 'queue'  and last_heartbeat < now() - interval '90 seconds')
    );

  select count(*) into v_bidders from public.auction_presence where auction_id = p_auction_id and mode = 'bidder';
  select count(*) into v_viewers from public.auction_presence where auction_id = p_auction_id and mode = 'viewer';
  select count(*) into v_queue   from public.auction_presence where auction_id = p_auction_id and mode = 'queue';

  if v_uid is not null then
    select mode, queue_position into v_my_mode, v_my_qpos
    from public.auction_presence
    where auction_id = p_auction_id and user_id = v_uid;
  end if;

  return jsonb_build_object(
    'bidders',           v_bidders,
    'viewers',           v_viewers,
    'queue',             v_queue,
    'my_mode',           coalesce(v_my_mode, 'viewer'),
    'my_queue_position', v_my_qpos
  );
end;
$$;
grant execute on function public.get_room_state to authenticated, anon;

-- ── request_bidder_mode() ────────────────────────────────────
-- User clicks "Enter Bidder Mode".
-- Returns {ok, mode, position} — mode='bidder' | 'queue' | 'viewer'.
-- Requires minimum 10 cr balance to enter (blocks credit-empty trolls).
create or replace function public.request_bidder_mode(
  p_auction_id uuid,
  p_max_bidders int default 8
) returns jsonb language plpgsql security definer as $$
declare
  v_uid     uuid := auth.uid();
  v_bidders int;
  v_balance int;
  v_min_bal int := 10;
  v_pos     int;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;

  -- Balance gate
  select coalesce(sum(amount), 0) into v_balance
  from public.credit_ledger where user_id = v_uid;

  if v_balance < v_min_bal then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credits', 'required', v_min_bal);
  end if;

  -- Already a bidder — just refresh heartbeat
  if exists (select 1 from public.auction_presence where auction_id = p_auction_id and user_id = v_uid and mode = 'bidder') then
    update public.auction_presence set last_heartbeat = now() where auction_id = p_auction_id and user_id = v_uid;
    return jsonb_build_object('ok', true, 'mode', 'bidder');
  end if;

  select count(*) into v_bidders
  from public.auction_presence
  where auction_id = p_auction_id and mode = 'bidder';

  if v_bidders < p_max_bidders then
    -- Slot available — promote to bidder
    insert into public.auction_presence (auction_id, user_id, mode, last_heartbeat)
    values (p_auction_id, v_uid, 'bidder', now())
    on conflict (auction_id, user_id) do update
      set mode = 'bidder', last_heartbeat = now(), queue_position = null;
    return jsonb_build_object('ok', true, 'mode', 'bidder');
  else
    -- Full — add to queue
    select coalesce(max(queue_position), 0) + 1 into v_pos
    from public.auction_presence
    where auction_id = p_auction_id and mode = 'queue';

    insert into public.auction_presence (auction_id, user_id, mode, queue_position, last_heartbeat)
    values (p_auction_id, v_uid, 'queue', v_pos, now())
    on conflict (auction_id, user_id) do update
      set mode = 'queue', queue_position = v_pos, last_heartbeat = now();
    return jsonb_build_object('ok', true, 'mode', 'queue', 'position', v_pos);
  end if;
end;
$$;
grant execute on function public.request_bidder_mode to authenticated;

-- ── demote_to_viewer() ───────────────────────────────────────
-- User clicks "Return to viewer" or is auto-demoted by inactivity timer.
-- First in queue is auto-promoted.
create or replace function public.demote_to_viewer(p_auction_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_uid      uuid := auth.uid();
  v_next_uid uuid;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;

  -- Demote caller to viewer
  update public.auction_presence
  set mode = 'viewer', queue_position = null, last_heartbeat = now()
  where auction_id = p_auction_id and user_id = v_uid;

  -- Auto-promote first in queue (lowest queue_position)
  select user_id into v_next_uid
  from public.auction_presence
  where auction_id = p_auction_id and mode = 'queue'
  order by queue_position asc
  limit 1;

  if v_next_uid is not null then
    update public.auction_presence
    set mode = 'bidder', queue_position = null, last_heartbeat = now()
    where auction_id = p_auction_id and user_id = v_next_uid;
    -- Renumber remaining queue
    with ordered as (
      select user_id, row_number() over (order by queue_position asc) as new_pos
      from public.auction_presence
      where auction_id = p_auction_id and mode = 'queue'
    )
    update public.auction_presence ap
    set queue_position = o.new_pos
    from ordered o
    where ap.auction_id = p_auction_id and ap.user_id = o.user_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.demote_to_viewer to authenticated;

-- ── place_bid() ──────────────────────────────────────────────
-- Core bidding RPC — atomic, anti-snipe, idempotent per amount.
-- Returns {ok, extended, new_bid, minimum} or {error, minimum}.
-- Security notes:
--   • SECURITY DEFINER runs as owner, bypassing client RLS for write ops
--   • All invariants checked server-side; client input is untrusted
--   • bid_fee deducted unconditionally (non-refundable, discourages spam)
--   • Uses advisory lock per auction_id to prevent race conditions
create or replace function public.place_bid(
  p_auction_id uuid,
  p_bid_amount int
) returns jsonb language plpgsql security definer as $$
declare
  v_uid       uuid := auth.uid();
  v_auction   record;
  v_balance   int;
  v_bid_fee   int := 5;
  v_min_bid   int;
  v_total_cost int;
  v_extended  boolean := false;
  v_new_close timestamptz;
  v_snipe_window interval := interval '5 minutes';
  v_extend_by    interval := interval '5 minutes';
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;

  -- Advisory lock on auction row to serialize bids
  perform pg_advisory_xact_lock(hashtext(p_auction_id::text));

  -- Load auction
  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'auction_not_found'); end if;
  if v_auction.status not in ('live','closing') then
    return jsonb_build_object('ok', false, 'error', 'auction_not_live');
  end if;

  -- Verify bidder mode
  if not exists (
    select 1 from public.auction_presence
    where auction_id = p_auction_id and user_id = v_uid and mode = 'bidder'
  ) then
    return jsonb_build_object('ok', false, 'error', 'not_in_bidder_mode');
  end if;

  -- Minimum bid
  v_min_bid := coalesce(v_auction.winning_bid, v_auction.starting_bid - v_auction.bid_increment) + v_auction.bid_increment;
  if p_bid_amount < v_min_bid then
    return jsonb_build_object('ok', false, 'error', 'bid_too_low', 'minimum', v_min_bid);
  end if;

  -- Balance check (bid amount + fee)
  v_total_cost := p_bid_amount + v_bid_fee;
  select coalesce(sum(amount), 0) into v_balance from public.credit_ledger where user_id = v_uid;
  if v_balance < v_total_cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credits');
  end if;

  -- Deduct bid fee (non-refundable)
  insert into public.credit_ledger (user_id, amount, type, ref_id, note)
  values (v_uid, -v_bid_fee, 'bid_fee', p_auction_id, 'Bid fee — auction ' || left(p_auction_id::text, 8));

  -- Deduct bid amount (escrow — will be reversed if outbid later; winner pays GBP separately)
  insert into public.credit_ledger (user_id, amount, type, ref_id, note)
  values (v_uid, -p_bid_amount, 'bid_escrow', p_auction_id, 'Bid escrow — ' || p_bid_amount || ' cr');

  -- Refund previous winning bidder's escrow if outbid
  if v_auction.winner_id is not null and v_auction.winner_id <> v_uid then
    insert into public.credit_ledger (user_id, amount, type, ref_id, note)
    values (v_auction.winner_id, v_auction.winning_bid, 'bid_refund', p_auction_id, 'Outbid refund — auction ' || left(p_auction_id::text, 8));
  end if;

  -- Anti-snipe: if bid lands within 5 min of close, extend by 5 min
  if (v_auction.extended_until is not null and v_auction.extended_until < now() + v_snipe_window)
  or (v_auction.extended_until is null and v_auction.closes_at < now() + v_snipe_window) then
    v_new_close := coalesce(v_auction.extended_until, v_auction.closes_at) + v_extend_by;
    v_extended  := true;
  end if;

  -- Record bid
  insert into public.bids (auction_id, user_id, bid_amount, is_winning)
  values (p_auction_id, v_uid, p_bid_amount, true);

  -- Mark all previous bids as not winning
  update public.bids
  set is_winning = false
  where auction_id = p_auction_id and user_id <> v_uid and is_winning = true;

  -- Update auction
  update public.auctions
  set winning_bid    = p_bid_amount,
      winner_id      = v_uid,
      extended_until = case when v_extended then v_new_close else extended_until end,
      status         = case when v_extended then 'closing' else status end
  where id = p_auction_id;

  -- Heartbeat presence (bid counts as activity)
  update public.auction_presence
  set last_heartbeat = now()
  where auction_id = p_auction_id and user_id = v_uid;

  return jsonb_build_object(
    'ok',       true,
    'extended', v_extended,
    'new_bid',  p_bid_amount,
    'minimum',  p_bid_amount + v_auction.bid_increment
  );
end;
$$;
grant execute on function public.place_bid to authenticated;

-- ── bids table — ensure bid_fee column exists on auctions ────
alter table public.auctions add column if not exists bid_fee int not null default 5;
alter table public.auctions add column if not exists winner_id uuid references auth.users;
alter table public.auctions add column if not exists winning_price_gbp numeric(10,2);
alter table public.auctions add column if not exists extended_until timestamptz;
alter table public.auctions add column if not exists bid_increment int not null default 5;
alter table public.auctions add column if not exists credit_rate int not null default 10;
alter table public.auctions add column if not exists min_price_gbp numeric(10,2);

-- ── credit_balances view ──────────────────────────────────────
create or replace view public.credit_balances as
select user_id, sum(amount) as balance
from public.credit_ledger
group by user_id;

-- RLS: view inherits policies from credit_ledger
-- but we grant select to authenticated for direct queries
grant select on public.credit_balances to authenticated;

-- ── Verification ─────────────────────────────────────────────
select routine_name from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('join_auction','get_room_state','request_bidder_mode','demote_to_viewer','place_bid')
order by routine_name;
