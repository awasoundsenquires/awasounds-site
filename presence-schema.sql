-- ============================================================
-- AWA SOUNDS — Auction Presence & Bidder Slot System
-- Run this AFTER auction-schema.sql
-- ============================================================

-- 1. Presence table (one row per user per auction)
create table if not exists public.auction_presence (
  auction_id        uuid not null references public.auctions(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  mode              text not null default 'viewer',     -- 'bidder' | 'viewer' | 'queue'
  queue_position    integer,
  last_heartbeat    timestamptz default now(),
  joined_at         timestamptz default now(),
  bumped_at         timestamptz,
  primary key (auction_id, user_id)
);
alter table public.auction_presence enable row level security;
drop policy if exists "read presence" on public.auction_presence;
create policy "read presence" on public.auction_presence for select using (true);
drop policy if exists "own presence" on public.auction_presence for all;
create policy "own presence" on public.auction_presence for all using (auth.uid() = user_id);

-- 2. Room state view — counts per auction
create or replace view public.auction_room_state as
  select
    auction_id,
    count(*) filter (where mode = 'bidder')  as bidder_count,
    count(*) filter (where mode = 'viewer')  as viewer_count,
    count(*) filter (where mode = 'queue')   as queue_count,
    count(*)                                  as total_count
  from public.auction_presence
  where last_heartbeat > now() - interval '90 seconds'
  group by auction_id;

-- 3. join_auction() — enter as viewer (upsert presence row)
create or replace function public.join_auction(p_auction_id uuid)
returns jsonb language plpgsql security definer as $$
declare v_uid uuid := auth.uid(); begin
  if v_uid is null then return jsonb_build_object('ok',false,'error','not_authenticated'); end if;
  insert into public.auction_presence (auction_id, user_id, mode, last_heartbeat, joined_at)
  values (p_auction_id, v_uid, 'viewer', now(), now())
  on conflict (auction_id, user_id) do update set last_heartbeat = now();
  return jsonb_build_object('ok',true,'mode','viewer');
end; $$;

-- 4. request_bidder_mode() — try to claim a bidder slot
create or replace function public.request_bidder_mode(p_auction_id uuid, p_max_bidders integer default 8)
returns jsonb language plpgsql security definer as $$
declare
  v_uid          uuid := auth.uid();
  v_bidder_count integer;
  v_queue_pos    integer;
  v_balance      integer;
  v_auction      record;
begin
  if v_uid is null then return jsonb_build_object('ok',false,'error','not_authenticated'); end if;
  -- Check auction is live
  select * into v_auction from public.auctions where id = p_auction_id;
  if v_auction.status not in ('live','closing') then
    return jsonb_build_object('ok',false,'error','auction_not_live');
  end if;
  -- Check balance (must have at least starting_bid + bid_fee)
  select coalesce(balance,0) into v_balance from public.credit_balances where user_id = v_uid;
  if v_balance < v_auction.starting_bid + v_auction.bid_fee then
    return jsonb_build_object('ok',false,'error','insufficient_credits',
      'required', v_auction.starting_bid + v_auction.bid_fee, 'balance', v_balance);
  end if;
  -- Purge stale bidders (heartbeat > 70s old)
  update public.auction_presence
  set mode = 'viewer', bumped_at = now()
  where auction_id = p_auction_id and mode = 'bidder'
    and last_heartbeat < now() - interval '70 seconds';
  -- Promote stale queue members to bidder if slot opened
  select count(*) into v_bidder_count
  from public.auction_presence
  where auction_id = p_auction_id and mode = 'bidder'
    and last_heartbeat > now() - interval '70 seconds';
  -- Try to claim slot
  if v_bidder_count < p_max_bidders then
    insert into public.auction_presence (auction_id, user_id, mode, last_heartbeat, joined_at)
    values (p_auction_id, v_uid, 'bidder', now(), now())
    on conflict (auction_id, user_id) do update set mode = 'bidder', last_heartbeat = now(), bumped_at = null;
    return jsonb_build_object('ok',true,'mode','bidder','bidders',v_bidder_count+1,'max',p_max_bidders);
  end if;
  -- No slot — join queue
  select coalesce(max(queue_position),0)+1 into v_queue_pos
  from public.auction_presence where auction_id = p_auction_id and mode = 'queue';
  insert into public.auction_presence (auction_id, user_id, mode, queue_position, last_heartbeat, joined_at)
  values (p_auction_id, v_uid, 'queue', v_queue_pos, now(), now())
  on conflict (auction_id, user_id) do update
    set mode = 'queue', queue_position = v_queue_pos, last_heartbeat = now();
  return jsonb_build_object('ok',false,'mode','queue','position',v_queue_pos,'bidders',v_bidder_count,'max',p_max_bidders);
end; $$;

-- 5. heartbeat_presence() — called every 20s by active clients
create or replace function public.heartbeat_presence(p_auction_id uuid)
returns void language plpgsql security definer as $$
declare v_uid uuid := auth.uid(); begin
  if v_uid is null then return; end if;
  update public.auction_presence set last_heartbeat = now()
  where auction_id = p_auction_id and user_id = v_uid;
end; $$;

-- 6. demote_to_viewer() — user clicks "Return to viewer" or inactivity timer fires
create or replace function public.demote_to_viewer(p_auction_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_uid      uuid := auth.uid();
  v_next_uid uuid;
begin
  if v_uid is null then return jsonb_build_object('ok',false); end if;
  update public.auction_presence set mode = 'viewer', bumped_at = now()
  where auction_id = p_auction_id and user_id = v_uid;
  -- Auto-promote next in queue
  select user_id into v_next_uid from public.auction_presence
  where auction_id = p_auction_id and mode = 'queue'
    and last_heartbeat > now() - interval '90 seconds'
  order by queue_position asc limit 1;
  if v_next_uid is not null then
    update public.auction_presence set mode = 'bidder', queue_position = null
    where auction_id = p_auction_id and user_id = v_next_uid;
  end if;
  return jsonb_build_object('ok',true,'promoted',v_next_uid is not null);
end; $$;

-- 7. get_room_state() — lightweight snapshot for the UI
create or replace function public.get_room_state(p_auction_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_bidders  integer;
  v_viewers  integer;
  v_queue    integer;
  v_my_mode  text;
  v_my_queue integer;
  v_uid      uuid := auth.uid();
begin
  select count(*) into v_bidders from public.auction_presence
  where auction_id = p_auction_id and mode = 'bidder' and last_heartbeat > now() - interval '70 seconds';
  select count(*) into v_viewers from public.auction_presence
  where auction_id = p_auction_id and mode = 'viewer' and last_heartbeat > now() - interval '90 seconds';
  select count(*) into v_queue from public.auction_presence
  where auction_id = p_auction_id and mode = 'queue' and last_heartbeat > now() - interval '90 seconds';
  if v_uid is not null then
    select mode, queue_position into v_my_mode, v_my_queue
    from public.auction_presence where auction_id = p_auction_id and user_id = v_uid;
  end if;
  return jsonb_build_object(
    'bidders', v_bidders, 'viewers', v_viewers, 'queue', v_queue,
    'my_mode', v_my_mode, 'my_queue_position', v_my_queue
  );
end; $$;

-- 8. Updated place_bid — rejects bids from non-bidder mode users
-- (replace the function from auction-schema.sql)
create or replace function public.place_bid(p_auction_id uuid, p_bid_amount integer)
returns jsonb language plpgsql security definer as $$
declare
  v_user_id     uuid := auth.uid();
  v_auction     record;
  v_balance     integer;
  v_top_bid     integer;
  v_total_cost  integer;
  v_bid_id      uuid;
  v_new_close   timestamptz;
  v_snipe       interval := '5 minutes';
  v_reserve_met boolean;
  v_my_mode     text;
begin
  if v_user_id is null then return jsonb_build_object('ok',false,'error','not_authenticated'); end if;
  -- Check user is in bidder mode
  select mode into v_my_mode from public.auction_presence
  where auction_id = p_auction_id and user_id = v_user_id;
  if v_my_mode is distinct from 'bidder' then
    return jsonb_build_object('ok',false,'error','not_in_bidder_mode');
  end if;
  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then return jsonb_build_object('ok',false,'error','auction_not_found'); end if;
  if v_auction.status not in ('live','closing') then return jsonb_build_object('ok',false,'error','auction_not_live'); end if;
  if coalesce(v_auction.extended_until, v_auction.closes_at) < now() then return jsonb_build_object('ok',false,'error','auction_ended'); end if;
  select coalesce(max(bid_amount), v_auction.starting_bid - v_auction.bid_increment) into v_top_bid from public.bids where auction_id = p_auction_id;
  if p_bid_amount < v_top_bid + v_auction.bid_increment then
    return jsonb_build_object('ok',false,'error','bid_too_low','minimum',v_top_bid + v_auction.bid_increment);
  end if;
  v_total_cost := p_bid_amount + v_auction.bid_fee;
  select coalesce(balance,0) into v_balance from public.credit_balances where user_id = v_user_id;
  if v_balance < v_total_cost then
    return jsonb_build_object('ok',false,'error','insufficient_credits','required',v_total_cost,'balance',v_balance);
  end if;
  insert into public.credit_ledger (user_id, amount, type, note)
  values (v_user_id, -v_total_cost, 'bid_fee', 'Bid '||p_bid_amount||' cr + '||v_auction.bid_fee||' cr fee');
  update public.bids set is_winning = false where auction_id = p_auction_id and is_winning = true;
  insert into public.bids (auction_id, user_id, bid_amount, bid_fee_paid, is_winning)
  values (p_auction_id, v_user_id, p_bid_amount, v_auction.bid_fee, true) returning id into v_bid_id;
  v_reserve_met := v_auction.min_price_gbp is null or (p_bid_amount / v_auction.credit_rate) >= v_auction.min_price_gbp;
  -- Update heartbeat on bid (counts as activity)
  update public.auction_presence set last_heartbeat = now()
  where auction_id = p_auction_id and user_id = v_user_id;
  -- Anti-snipe
  v_new_close := coalesce(v_auction.extended_until, v_auction.closes_at);
  if v_new_close - now() < v_snipe then
    v_new_close := now() + v_snipe;
    update public.auctions set extended_until = v_new_close, status = 'closing' where id = p_auction_id;
  end if;
  update public.auctions set
    winner_id = v_user_id, winning_bid = p_bid_amount,
    winning_price_gbp = round((p_bid_amount / v_auction.credit_rate)::numeric, 2),
    reserve_met = v_reserve_met
  where id = p_auction_id;
  return jsonb_build_object('ok',true,'bid_id',v_bid_id,'bid_amount',p_bid_amount,'new_close',v_new_close,
    'extended', v_new_close <> coalesce(v_auction.extended_until, v_auction.closes_at),
    'reserve_met', v_reserve_met);
end; $$;

-- Enable Realtime on presence table
alter publication supabase_realtime add table public.auction_presence;
