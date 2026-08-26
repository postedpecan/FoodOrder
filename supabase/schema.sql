-- Multi-Vendor Food Ordering Prototype — Supabase schema + RLS
-- Run this once in the Supabase SQL editor for a fresh project.

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'owner', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. restaurants
-- ============================================================
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  description_th text,
  category text,
  specialty_item text,
  owner_id uuid references public.profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;

-- ============================================================
-- 3. menu_items
-- ============================================================
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items enable row level security;

-- ============================================================
-- 4. orders
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  restaurant_id uuid not null references public.restaurants(id),
  status text not null default 'pending'
    check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- ============================================================
-- 5. order_items
-- ============================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  item_price numeric(10,2) not null check (item_price >= 0),
  quantity int not null check (quantity > 0)
);

alter table public.order_items enable row level security;

-- ============================================================
-- Helper functions (security definer avoids RLS recursion)
-- ============================================================
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create function public.is_owner_of_restaurant(target_restaurant_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.restaurants
    where id = target_restaurant_id and owner_id = auth.uid()
  );
$$;

-- ============================================================
-- RLS policies: profiles
-- ============================================================
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_non_role_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin() or (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()))
  );

-- ============================================================
-- RLS policies: restaurants
-- ============================================================
create policy "restaurants_select_active_or_admin_or_owner"
  on public.restaurants for select
  using (is_active = true or public.is_admin() or owner_id = auth.uid());

create policy "restaurants_insert_admin_only"
  on public.restaurants for insert
  with check (public.is_admin());

create policy "restaurants_update_admin_only"
  on public.restaurants for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "restaurants_update_owner_own_restaurant"
  on public.restaurants for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "restaurants_delete_admin_only"
  on public.restaurants for delete
  using (public.is_admin());

-- ============================================================
-- RLS policies: menu_items
-- ============================================================
create policy "menu_items_select_active_restaurant_or_owner_or_admin"
  on public.menu_items for select
  using (
    public.is_admin()
    or public.is_owner_of_restaurant(restaurant_id)
    or exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.is_active = true
    )
  );

create policy "menu_items_insert_owner_or_admin"
  on public.menu_items for insert
  with check (public.is_admin() or public.is_owner_of_restaurant(restaurant_id));

create policy "menu_items_update_owner_or_admin"
  on public.menu_items for update
  using (public.is_admin() or public.is_owner_of_restaurant(restaurant_id))
  with check (public.is_admin() or public.is_owner_of_restaurant(restaurant_id));

create policy "menu_items_delete_owner_or_admin"
  on public.menu_items for delete
  using (public.is_admin() or public.is_owner_of_restaurant(restaurant_id));

-- ============================================================
-- RLS policies: orders
-- ============================================================
create policy "orders_select_own_or_owner_or_admin"
  on public.orders for select
  using (
    customer_id = auth.uid()
    or public.is_owner_of_restaurant(restaurant_id)
    or public.is_admin()
  );

create policy "orders_insert_own_as_customer"
  on public.orders for insert
  with check (customer_id = auth.uid());

create policy "orders_update_owner_or_admin"
  on public.orders for update
  using (public.is_owner_of_restaurant(restaurant_id) or public.is_admin())
  with check (public.is_owner_of_restaurant(restaurant_id) or public.is_admin());

-- ============================================================
-- RLS policies: order_items
-- ============================================================
create policy "order_items_select_via_parent_order"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid() or public.is_owner_of_restaurant(o.restaurant_id))
    )
  );

create policy "order_items_insert_via_own_order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );
