-- ============================================================
-- Fuselage — 002: lock privileged columns
-- Run in Supabase SQL Editor after 001.
--
-- Row-level security decides WHICH ROWS a user may write, not which columns.
-- Without this, a signed-in user could make themselves an admin, and a seller
-- could self-verify or set their own rating/sales. Supabase grants the API roles
-- full table privileges by default, so we revoke those and grant back only the
-- columns users are meant to edit. Privileged fields are set by the database.
-- ============================================================

-- ── Profiles: created by the sign-up trigger; users edit only their public fields
revoke insert, update on public.profiles from anon, authenticated;
grant update (display_name, handle, bio, location, avatar_url) on public.profiles to authenticated;

-- ── Sellers: no self-verification, pro status, sales or rating; handle fixed after creation
revoke insert, update on public.sellers from anon, authenticated;
grant insert (user_id, handle, display_name, bio, location, instagram, tiktok, specialties, bg_gradient)
  on public.sellers to authenticated;
grant update (display_name, bio, location, instagram, tiktok, specialties, bg_gradient)
  on public.sellers to authenticated;

-- ── Reels: no setting view counts or tag state directly (tag state goes through remove_tag())
revoke insert, update on public.reels from anon, authenticated;
grant insert (author_id, kind, seller_id, listing_id, title, description, category, modification,
              price, currency, price_type, tags, compatible_bikes, variations,
              video_url, thumbnail_url, bg_gradient, status)
  on public.reels to authenticated;
grant update (title, description, category, modification, price, currency, price_type, tags,
              compatible_bikes, variations, video_url, thumbnail_url, bg_gradient, status)
  on public.reels to authenticated;

-- ── Becoming a seller switches the profile's role (users can't set role themselves)
create or replace function public.mark_profile_seller()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set role = 'seller' where id = new.user_id and role = 'buyer';
  return new;
end;
$$;

create trigger on_seller_created
  after insert on public.sellers
  for each row execute function public.mark_profile_seller();
