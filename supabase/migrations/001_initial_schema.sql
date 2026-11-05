-- ============================================================
-- Fuselage Mods — Initial Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── Profiles (extends auth.users) ───────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  display_name text,
  handle      text unique,   -- public page: /users/<handle> (buyers) — sellers use sellers.handle
  bio         text,
  location    text,
  avatar_url  text,
  role        text default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at  timestamptz default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Sellers ──────────────────────────────────────────────────
create table public.sellers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references public.profiles on delete cascade,
  handle        text unique not null,
  display_name  text not null,
  bio           text,
  location      text,
  instagram     text,
  tiktok        text,
  verified      boolean default false,
  pro           boolean default false,
  pro_expires_at timestamptz,
  total_sales   integer default 0,
  rating        numeric(3,2),
  joined_year   integer default extract(year from now())::integer,
  specialties   text[],
  bg_gradient   text[2],
  created_at    timestamptz default now()
);

-- ── Reels ────────────────────────────────────────────────────
-- Two kinds of post:
--   seller   — a seller posting their own work (author is the seller's user)
--   customer — a buyer showing off a mod; must tag the seller who fitted it.
--              Showcase only: no price. Goes live immediately; the tagged seller
--              can remove the tag via remove_tag(), which raises a tag dispute.
create table public.reels (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles on delete cascade,
  kind            text not null default 'seller' check (kind in ('seller', 'customer')),
  seller_id       uuid references public.sellers on delete cascade,  -- seller post: owner; customer post: who fitted it
  tag_status      text not null default 'tagged' check (tag_status in ('tagged', 'removed')),
  title           text not null,
  description     text,
  category        text not null,
  modification    text,
  price           numeric(10,2),
  currency        text default 'AED',
  price_type      text default 'fixed' check (price_type in ('fixed', 'negotiable', 'contact')),
  tags            text[],
  compatible_bikes text[],  -- bikes the mod fits
  variations      text[],   -- free-text list of possible variations
  listing_id      uuid references public.reels on delete set null,  -- customer post → seller listing it came from
  video_url       text,   -- uploaded video file (Cloudflare R2)
  thumbnail_url   text,   -- poster frame (Cloudflare R2)
  bg_gradient     text[2],
  status          text default 'active' check (status in ('active', 'sold', 'hidden')),
  view_count      integer default 0,
  created_at      timestamptz default now(),
  -- Customer posts never carry a price and must tag a seller
  constraint customer_posts_are_showcases check (kind = 'seller' or price is null),
  constraint posts_tag_a_seller check (seller_id is not null),
  constraint only_customer_posts_link_a_listing check (kind = 'customer' or listing_id is null)
);

-- ── Tag disputes (seller removed a customer tag) ────────────
create table public.tag_disputes (
  id          uuid primary key default gen_random_uuid(),
  reel_id     uuid not null references public.reels on delete cascade,
  seller_id   uuid not null references public.sellers on delete cascade,
  reason      text not null check (reason in ('fake', 'damaging')),
  note        text,
  status      text not null default 'open' check (status in ('open', 'upheld', 'dismissed')),
  created_at  timestamptz default now()
);

-- Seller removes their tag from a customer post → tag hidden + dispute opened.
-- security definer: RLS can't limit sellers to editing only tag_status on others' posts.
create or replace function public.remove_tag(p_reel_id uuid, p_reason text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_seller uuid;
begin
  select r.seller_id into v_seller
  from public.reels r
  join public.sellers s on s.id = r.seller_id
  where r.id = p_reel_id and r.kind = 'customer' and r.tag_status = 'tagged' and s.user_id = auth.uid();

  if v_seller is null then
    raise exception 'Not a customer post tagging you';
  end if;

  update public.reels set tag_status = 'removed' where id = p_reel_id;
  insert into public.tag_disputes (reel_id, seller_id, reason, note)
  values (p_reel_id, v_seller, p_reason, p_note);
end;
$$;

-- Authors can edit their posts, but not who/what they tag or the tag state:
-- otherwise a buyer could re-add a removed tag or swap in another seller.
-- remove_tag() runs as the function owner, so it passes this check.
create or replace function public.lock_reel_identity()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and (
       new.author_id  is distinct from old.author_id
    or new.kind       is distinct from old.kind
    or new.seller_id  is distinct from old.seller_id
    or new.tag_status is distinct from old.tag_status
    or new.listing_id is distinct from old.listing_id
  ) then
    raise exception 'author, kind, tagged seller, linked listing and tag status cannot be changed';
  end if;
  return new;
end;
$$;

create trigger reels_lock_identity
  before update on public.reels
  for each row execute function public.lock_reel_identity();

-- "Tags" = our version of followers: live customer posts still tagging the seller
create view public.seller_tags with (security_invoker = true) as
  select seller_id, count(*)::integer as tags
  from public.reels
  where kind = 'customer' and tag_status = 'tagged' and status = 'active'
  group by seller_id;

-- ── Saves (wishlist) ─────────────────────────────────────────
create table public.saves (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles on delete cascade,
  reel_id    uuid references public.reels on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, reel_id)
);

-- ── Follows ──────────────────────────────────────────────────
create table public.follows (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles on delete cascade,
  seller_id  uuid references public.sellers on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, seller_id)
);

-- ── Inquiries (buyer contacts seller) ───────────────────────
create table public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  reel_id    uuid references public.reels on delete cascade,
  buyer_id   uuid references public.profiles on delete cascade,
  seller_id  uuid references public.sellers on delete cascade,
  message    text,
  status     text default 'open' check (status in ('open', 'responded', 'closed')),
  created_at timestamptz default now()
);

-- ── Messages (within an inquiry thread) ─────────────────────
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  inquiry_id  uuid references public.inquiries on delete cascade,
  sender_id   uuid references public.profiles on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles  enable row level security;
alter table public.sellers   enable row level security;
alter table public.reels     enable row level security;
alter table public.saves     enable row level security;
alter table public.follows   enable row level security;
alter table public.inquiries enable row level security;
alter table public.messages  enable row level security;
alter table public.tag_disputes enable row level security;

-- Profiles
create policy "Profiles are publicly readable"      on public.profiles for select using (true);
create policy "Users can insert own profile"         on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"         on public.profiles for update using (auth.uid() = id);

-- Sellers
create policy "Sellers are publicly readable"        on public.sellers for select using (true);
create policy "Authenticated users can create seller" on public.sellers for insert with check (auth.uid() = user_id);
create policy "Sellers can update own record"        on public.sellers for update using (auth.uid() = user_id);

-- Reels
create policy "Active reels are publicly readable"   on public.reels for select using (status = 'active');
create policy "Authors can read own reels"           on public.reels for select using (auth.uid() = author_id);
create policy "Users can post reels"                 on public.reels for insert with check (
  auth.uid() = author_id
  and (
    -- seller posts: only as yourself
    (kind = 'seller' and seller_id in (select id from public.sellers where user_id = auth.uid()))
    -- customer posts: tag another seller, start tagged
    or (kind = 'customer' and tag_status = 'tagged'
        and seller_id not in (select id from public.sellers where user_id = auth.uid()))
  )
);
create policy "Authors can update own reels"         on public.reels for update using (auth.uid() = author_id)
  with check (auth.uid() = author_id);
create policy "Authors can delete own reels"         on public.reels for delete using (auth.uid() = author_id);

-- Tag disputes (created only via remove_tag(); admins resolve)
create policy "Sellers can view own disputes"        on public.tag_disputes for select using (
  seller_id in (select id from public.sellers where user_id = auth.uid())
);
create policy "Admins can view disputes"             on public.tag_disputes for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can resolve disputes"          on public.tag_disputes for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Saves
create policy "Users can view own saves"             on public.saves for select using (auth.uid() = user_id);
create policy "Users can manage own saves"           on public.saves for insert with check (auth.uid() = user_id);
create policy "Users can delete own saves"           on public.saves for delete using (auth.uid() = user_id);

-- Follows
create policy "Follows are publicly readable"        on public.follows for select using (true);
create policy "Users can manage own follows"         on public.follows for all using (auth.uid() = user_id);

-- Inquiries
create policy "Buyer can view own inquiries"         on public.inquiries for select using (auth.uid() = buyer_id);
create policy "Seller can view own inquiries"        on public.inquiries for select using (
  seller_id in (select id from public.sellers where user_id = auth.uid())
);
create policy "Buyers can create inquiries"          on public.inquiries for insert with check (auth.uid() = buyer_id);

-- Messages
create policy "Participants can view messages"       on public.messages for select using (
  inquiry_id in (
    select id from public.inquiries
    where buyer_id = auth.uid()
       or seller_id in (select id from public.sellers where user_id = auth.uid())
  )
);
create policy "Participants can send messages"       on public.messages for insert with check (
  auth.uid() = sender_id
  and inquiry_id in (
    select id from public.inquiries
    where buyer_id = auth.uid()
       or seller_id in (select id from public.sellers where user_id = auth.uid())
  )
);
