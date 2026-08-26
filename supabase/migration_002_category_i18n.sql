-- Adds category / specialty item / Thai description to restaurants,
-- and lets a restaurant owner update those fields on their own restaurant
-- (previously restaurants were admin-write-only).
-- Run this once in the Supabase SQL editor, after schema.sql.

alter table public.restaurants
  add column if not exists category text,
  add column if not exists specialty_item text,
  add column if not exists description_th text;

create policy "restaurants_update_owner_own_restaurant"
  on public.restaurants for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
