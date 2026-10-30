-- Sabores de Chile — foundation multi-tenant schema
-- Apply in Supabase SQL Editor or as a versioned migration.
-- No production credentials or service-role keys belong in the client.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,
  phone text,
  email text,
  address text,
  city text,
  region text,
  country_code text not null default 'CL',
  currency_code text not null default 'CLP',
  timezone text not null default 'America/Santiago',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_members (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','staff','kitchen')),
  created_at timestamptz not null default now(),
  primary key (restaurant_id, user_id)
);

create or replace function public.is_restaurant_member(target_restaurant uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_members m
    where m.restaurant_id = target_restaurant
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_restaurant_role(target_restaurant uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_members m
    where m.restaurant_id = target_restaurant
      and m.user_id = (select auth.uid())
      and m.role = any(allowed_roles)
  );
$$;

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id, name),
  unique (restaurant_id, id)
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid,
  name text not null,
  description text,
  image_url text,
  price_clp integer not null check (price_clp >= 0),
  preparation_minutes integer check (preparation_minutes is null or preparation_minutes >= 0),
  is_available boolean not null default true,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, id),
  foreign key (restaurant_id, category_id)
    references public.menu_categories(restaurant_id, id) on delete restrict
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  unit text not null check (unit in ('g','kg','ml','l','unit','portion')),
  low_stock_threshold numeric(12,3) not null default 0 check (low_stock_threshold >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id, name),
  unique (restaurant_id, id)
);

create table if not exists public.menu_item_ingredients (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid not null,
  ingredient_id uuid not null,
  quantity numeric(12,3) not null check (quantity > 0),
  primary key (menu_item_id, ingredient_id),
  foreign key (restaurant_id, menu_item_id)
    references public.menu_items(restaurant_id, id) on delete cascade,
  foreign key (restaurant_id, ingredient_id)
    references public.ingredients(restaurant_id, id) on delete restrict
);

-- Append-only stock ledger. quantity_delta is positive for receipts and
-- negative for consumption, waste, or adjustments.
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  ingredient_id uuid not null,
  quantity_delta numeric(12,3) not null check (quantity_delta <> 0),
  movement_type text not null check (movement_type in ('purchase','sale','waste','adjustment','return')),
  expires_on date,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (restaurant_id, ingredient_id)
    references public.ingredients(restaurant_id, id) on delete restrict
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid,
  title text not null,
  description text,
  discount_percent numeric(5,2) check (discount_percent > 0 and discount_percent <= 100),
  promotional_price_clp integer check (promotional_price_clp is null or promotional_price_clp >= 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','active','paused','expired')),
  source text not null default 'manual' check (source in ('manual','inventory','campaign')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (restaurant_id, menu_item_id)
    references public.menu_items(restaurant_id, id) on delete restrict,
  check (ends_at is null or ends_at > starts_at),
  check (discount_percent is not null or promotional_price_clp is not null)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,
  order_number bigint generated by default as identity,
  customer_name text not null,
  customer_phone text not null,
  fulfillment_type text not null check (fulfillment_type in ('pickup','delivery','dine_in')),
  delivery_address text,
  customer_note text,
  status text not null default 'received'
    check (status in ('received','accepted','preparing','ready','out_for_delivery','completed','cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','authorized','paid','failed','refunded','cash_on_delivery')),
  subtotal_clp integer not null check (subtotal_clp >= 0),
  discount_clp integer not null default 0 check (discount_clp >= 0 and discount_clp <= subtotal_clp),
  delivery_fee_clp integer not null default 0 check (delivery_fee_clp >= 0),
  total_clp integer not null check (total_clp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, order_number),
  check (total_clp = subtotal_clp - discount_clp + delivery_fee_clp),
  check (fulfillment_type <> 'delivery' or delivery_address is not null)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,
  order_id uuid not null,
  menu_item_id uuid,
  item_name_snapshot text not null,
  unit_price_clp integer not null check (unit_price_clp >= 0),
  quantity integer not null check (quantity > 0),
  line_total_clp integer not null check (line_total_clp = unit_price_clp * quantity),
  created_at timestamptz not null default now(),
  foreign key (restaurant_id, order_id)
    references public.orders(restaurant_id, id) on delete cascade,
  foreign key (restaurant_id, menu_item_id)
    references public.menu_items(restaurant_id, id) on delete restrict
);

create index if not exists idx_restaurants_published on public.restaurants(is_published, city);
create index if not exists idx_menu_items_restaurant on public.menu_items(restaurant_id, is_published, is_available);
create index if not exists idx_inventory_restaurant_expiry on public.inventory_movements(restaurant_id, ingredient_id, expires_on);
create index if not exists idx_orders_restaurant_status on public.orders(restaurant_id, status, created_at desc);
create index if not exists idx_promotions_restaurant_window on public.promotions(restaurant_id, status, starts_at, ends_at);

drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at before update on public.restaurants
for each row execute function public.set_updated_at();
drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();
drop trigger if exists promotions_set_updated_at on public.promotions;
create trigger promotions_set_updated_at before update on public.promotions
for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.ingredients enable row level security;
alter table public.menu_item_ingredients enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.promotions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "published restaurants are public" on public.restaurants;
create policy "published restaurants are public" on public.restaurants
for select using (is_published or public.is_restaurant_member(id));
drop policy if exists "restaurant managers update restaurant" on public.restaurants;
create policy "restaurant managers update restaurant" on public.restaurants
for update using (public.has_restaurant_role(id, array['owner','manager']))
with check (public.has_restaurant_role(id, array['owner','manager']));

drop policy if exists "members read memberships" on public.restaurant_members;
create policy "members read memberships" on public.restaurant_members
for select using (user_id = (select auth.uid()) or public.is_restaurant_member(restaurant_id));

drop policy if exists "public reads published categories" on public.menu_categories;
create policy "public reads published categories" on public.menu_categories
for select using (
  is_active and exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.is_published
  )
  or public.is_restaurant_member(restaurant_id)
);

drop policy if exists "public reads published menu" on public.menu_items;
create policy "public reads published menu" on public.menu_items
for select using (
  (is_published and is_available and exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.is_published
  ))
  or public.is_restaurant_member(restaurant_id)
);

drop policy if exists "managers manage menu categories" on public.menu_categories;
create policy "managers manage menu categories" on public.menu_categories
for all using (public.has_restaurant_role(restaurant_id, array['owner','manager']))
with check (public.has_restaurant_role(restaurant_id, array['owner','manager']));
drop policy if exists "managers manage menu items" on public.menu_items;
create policy "managers manage menu items" on public.menu_items
for all using (public.has_restaurant_role(restaurant_id, array['owner','manager']))
with check (public.has_restaurant_role(restaurant_id, array['owner','manager']));

drop policy if exists "members manage ingredients" on public.ingredients;
create policy "members manage ingredients" on public.ingredients
for all using (public.has_restaurant_role(restaurant_id, array['owner','manager','staff']))
with check (public.has_restaurant_role(restaurant_id, array['owner','manager','staff']));
drop policy if exists "members manage recipes" on public.menu_item_ingredients;
create policy "members manage recipes" on public.menu_item_ingredients
for all using (public.has_restaurant_role(restaurant_id, array['owner','manager','staff']))
with check (public.has_restaurant_role(restaurant_id, array['owner','manager','staff']));
drop policy if exists "members manage inventory ledger" on public.inventory_movements;
create policy "members manage inventory ledger" on public.inventory_movements
for all using (public.has_restaurant_role(restaurant_id, array['owner','manager','staff']))
with check (public.has_restaurant_role(restaurant_id, array['owner','manager','staff']));

drop policy if exists "public reads active promotions" on public.promotions;
create policy "public reads active promotions" on public.promotions
for select using (
  status = 'active'
  and starts_at <= now()
  and (ends_at is null or ends_at > now())
  and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.is_published)
  or public.is_restaurant_member(restaurant_id)
);
drop policy if exists "managers manage promotions" on public.promotions;
create policy "managers manage promotions" on public.promotions
for all using (public.has_restaurant_role(restaurant_id, array['owner','manager']))
with check (public.has_restaurant_role(restaurant_id, array['owner','manager']));

drop policy if exists "staff read restaurant orders" on public.orders;
create policy "staff read restaurant orders" on public.orders
for select using (public.is_restaurant_member(restaurant_id));
drop policy if exists "staff update restaurant orders" on public.orders;
create policy "staff update restaurant orders" on public.orders
for update using (public.has_restaurant_role(restaurant_id, array['owner','manager','staff','kitchen']))
with check (public.has_restaurant_role(restaurant_id, array['owner','manager','staff','kitchen']));
drop policy if exists "staff read order items" on public.order_items;
create policy "staff read order items" on public.order_items
for select using (public.is_restaurant_member(restaurant_id));

-- Orders and order_items intentionally have no anonymous INSERT policy.
-- Create orders through a validated server-side Edge Function/RPC after
-- verifying prices, availability, promotions, and rate limits.
