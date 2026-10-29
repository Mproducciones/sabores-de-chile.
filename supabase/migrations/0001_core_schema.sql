-- Sabores de Chile — core multi-tenant schema for Supabase/PostgreSQL
-- Apply in a new Supabase project after reviewing the deployment checklist.
create extension if not exists pgcrypto;

create type public.restaurant_role as enum ('owner','manager','cashier','waiter','kitchen','inventory');
create type public.order_status as enum ('draft','placed','accepted','preparing','ready','served','cancelled');
create type public.order_channel as enum ('qr','staff','counter','platform');
create type public.payment_status as enum ('unpaid','pending','paid','refunded','void');
create type public.stock_movement_type as enum ('purchase','sale','waste','adjustment','transfer_in','transfer_out','recipe_consumption','return');

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text,
  timezone text not null default 'America/Santiago',
  currency char(3) not null default 'CLP',
  settings jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_members (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.restaurant_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (restaurant_id,user_id)
);

create table public.dining_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_code text not null,
  label text not null,
  capacity integer not null default 2 check (capacity > 0),
  qr_token uuid not null default gen_random_uuid(),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id,table_code),
  unique (qr_token)
);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  unique (restaurant_id,name),
  unique (restaurant_id,id)
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid,
  name text not null,
  description text not null default '',
  price_clp integer not null check (price_clp >= 0),
  image_url text,
  model_3d_url text,
  ar_enabled boolean not null default false,
  available boolean not null default true,
  prep_station text,
  allergens text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id,id),
  foreign key (restaurant_id,category_id) references public.menu_categories(restaurant_id,id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,
  table_id uuid references public.dining_tables(id) on delete set null,
  order_number bigint generated always as identity,
  channel public.order_channel not null,
  status public.order_status not null default 'placed',
  payment_status public.payment_status not null default 'unpaid',
  customer_name text,
  customer_phone text,
  notes text,
  subtotal_clp integer not null default 0 check (subtotal_clp >= 0),
  discount_clp integer not null default 0 check (discount_clp >= 0),
  total_clp integer not null default 0 check (total_clp >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  served_at timestamptz,
  cancelled_at timestamptz,
  unique (restaurant_id,order_number)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid not null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name_snapshot text not null,
  unit_price_clp integer not null check (unit_price_clp >= 0),
  quantity integer not null check (quantity > 0),
  line_total_clp integer not null check (line_total_clp >= 0),
  notes text,
  created_at timestamptz not null default now(),
  foreign key (restaurant_id,order_id) references public.orders(restaurant_id,id) on delete cascade
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sku text,
  unit text not null default 'unidad',
  current_quantity numeric(14,3) not null default 0,
  minimum_quantity numeric(14,3) not null default 0,
  target_quantity numeric(14,3),
  average_cost_clp integer not null default 0 check (average_cost_clp >= 0),
  track_expiry boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id,name),
  unique (restaurant_id,sku),
  unique (restaurant_id,id)
);

create table public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  inventory_item_id uuid not null,
  lot_code text,
  quantity_received numeric(14,3) not null check (quantity_received >= 0),
  quantity_remaining numeric(14,3) not null check (quantity_remaining >= 0),
  received_at timestamptz not null default now(),
  best_before date,
  ripeness text check (ripeness is null or ripeness in ('unripe','ready','ripe','overripe')),
  freshness_score smallint check (freshness_score is null or freshness_score between 0 and 100),
  unit_cost_clp integer not null default 0 check (unit_cost_clp >= 0),
  notes text,
  created_at timestamptz not null default now(),
  foreign key (restaurant_id,inventory_item_id) references public.inventory_items(restaurant_id,id) on delete cascade
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid not null,
  version integer not null default 1,
  active boolean not null default true,
  yield_quantity numeric(12,3) not null default 1 check (yield_quantity > 0),
  created_at timestamptz not null default now(),
  unique (restaurant_id,menu_item_id,version),
  foreign key (restaurant_id,menu_item_id) references public.menu_items(restaurant_id,id) on delete cascade
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  inventory_item_id uuid not null,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null,
  foreign key (restaurant_id,inventory_item_id) references public.inventory_items(restaurant_id,id) on delete restrict
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete cascade,
  name text not null,
  description text not null default '',
  discount_percent numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 100),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  trigger_reason text not null default 'manual' check (trigger_reason in ('manual','expiry','ripeness','excess_stock','low_demand')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (menu_item_id is not null or inventory_item_id is not null),
  check (ends_at is null or ends_at > starts_at)
);

create table public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  opened_by uuid references auth.users(id) on delete set null,
  closed_by uuid references auth.users(id) on delete set null,
  opening_cash_clp integer not null default 0 check (opening_cash_clp >= 0),
  expected_cash_clp integer,
  counted_cash_clp integer,
  difference_clp integer,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text,
  check (closed_at is null or closed_at >= opened_at)
);

create table public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  cash_session_id uuid not null references public.cash_sessions(id) on delete cascade,
  movement_type text not null check (movement_type in ('sale','expense','withdrawal','deposit','refund')),
  amount_clp integer not null check (amount_clp > 0),
  description text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  inventory_item_id uuid not null,
  lot_id uuid references public.inventory_lots(id) on delete set null,
  movement_type public.stock_movement_type not null,
  quantity_delta numeric(14,3) not null check (quantity_delta <> 0),
  unit_cost_clp integer not null default 0 check (unit_cost_clp >= 0),
  reason text,
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (restaurant_id,inventory_item_id) references public.inventory_items(restaurant_id,id) on delete cascade
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index orders_restaurant_status_created_idx on public.orders(restaurant_id,status,created_at desc);
create index order_items_order_idx on public.order_items(restaurant_id,order_id);
create index inventory_lots_expiry_idx on public.inventory_lots(restaurant_id,best_before) where quantity_remaining > 0;
create index stock_movements_item_created_idx on public.stock_movements(restaurant_id,inventory_item_id,created_at desc);
create index promotions_active_window_idx on public.promotions(restaurant_id,active,starts_at,ends_at);
create index audit_log_restaurant_created_idx on public.audit_log(restaurant_id,created_at desc);

create or replace function public.is_restaurant_member(target_restaurant uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_members m
    where m.restaurant_id = target_restaurant
      and m.user_id = auth.uid()
      and m.active = true
  );
$$;

create or replace function public.has_restaurant_role(target_restaurant uuid, allowed public.restaurant_role[])
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_members m
    where m.restaurant_id = target_restaurant
      and m.user_id = auth.uid()
      and m.active = true
      and m.role = any(allowed)
  );
$$;

alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.dining_tables enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_lots enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.promotions enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.cash_movements enable row level security;
alter table public.stock_movements enable row level security;
alter table public.audit_log enable row level security;

create policy "members read their restaurants" on public.restaurants for select to authenticated using (public.is_restaurant_member(id));
create policy "owners and managers update restaurant" on public.restaurants for update to authenticated using (public.has_restaurant_role(id,array['owner','manager']::public.restaurant_role[])) with check (public.has_restaurant_role(id,array['owner','manager']::public.restaurant_role[]));
create policy "members read memberships" on public.restaurant_members for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "owners manage memberships" on public.restaurant_members for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner']::public.restaurant_role[]));

create policy "members read tables" on public.dining_tables for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "managers manage tables" on public.dining_tables for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','waiter']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','waiter']::public.restaurant_role[]));
create policy "members read categories" on public.menu_categories for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "managers manage categories" on public.menu_categories for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager']::public.restaurant_role[]));
create policy "members read menu" on public.menu_items for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "managers manage menu" on public.menu_items for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager']::public.restaurant_role[]));

create policy "members read orders" on public.orders for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "staff create orders" on public.orders for insert to authenticated with check (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier','waiter']::public.restaurant_role[]));
create policy "staff update orders" on public.orders for update to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier','waiter','kitchen']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier','waiter','kitchen']::public.restaurant_role[]));
create policy "members read order items" on public.order_items for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "staff manage order items" on public.order_items for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier','waiter','kitchen']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier','waiter','kitchen']::public.restaurant_role[]));

create policy "members read inventory" on public.inventory_items for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "inventory roles manage inventory" on public.inventory_items for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[]));
create policy "members read lots" on public.inventory_lots for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "inventory roles manage lots" on public.inventory_lots for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[]));
create policy "members read recipes" on public.recipes for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "managers manage recipes" on public.recipes for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[]));
create policy "members read recipe ingredients" on public.recipe_ingredients for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "managers manage recipe ingredients" on public.recipe_ingredients for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[]));

create policy "members read promotions" on public.promotions for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "managers manage promotions" on public.promotions for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[]));
create policy "cash staff read sessions" on public.cash_sessions for select to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier']::public.restaurant_role[]));
create policy "cash staff manage sessions" on public.cash_sessions for all to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier']::public.restaurant_role[])) with check (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier']::public.restaurant_role[]));
create policy "cash staff read movements" on public.cash_movements for select to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier']::public.restaurant_role[]));
create policy "cash staff create movements" on public.cash_movements for insert to authenticated with check (public.has_restaurant_role(restaurant_id,array['owner','manager','cashier']::public.restaurant_role[]));
create policy "members read stock movements" on public.stock_movements for select to authenticated using (public.is_restaurant_member(restaurant_id));
create policy "inventory roles create stock movements" on public.stock_movements for insert to authenticated with check (public.has_restaurant_role(restaurant_id,array['owner','manager','inventory']::public.restaurant_role[]));
create policy "managers read audit log" on public.audit_log for select to authenticated using (public.has_restaurant_role(restaurant_id,array['owner','manager']::public.restaurant_role[]));
create policy "members insert audit log" on public.audit_log for insert to authenticated with check (public.is_restaurant_member(restaurant_id));

-- Public QR ordering should be mediated by a server-side Edge Function that validates qr_token,
-- menu availability, prices and stock. Do not grant anonymous direct writes to orders.
