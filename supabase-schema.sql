-- ============================================================================
-- Anthony's Restaurant & Lounge â€” multi-tenant schema + seed
-- SeJo Labs prototype (anthonys-on-grand)
--
-- HOW TO RUN
--   1. Create a Supabase project (https://supabase.com/dashboard).
--   2. SQL Editor -> paste this whole file -> Run.
--   3. Copy Project URL + anon (publishable) key into the app's .env.local:
--        NEXT_PUBLIC_SUPABASE_URL=...
--        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
--   4. Create the admin user (Authentication -> Users -> Add user):
--        admin@kcanthonysongrand.com  (password in ADMIN_CREDENTIALS.md)
--
-- Designed multi-tenant from day one: a tenant = a row in `restaurants`, and
-- every menu_item / order is scoped by restaurant_id. The same codebase can
-- power Niecie's, Italian Sausage Co., etc. by adding rows here.
-- All money is stored in integer cents.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table if not exists public.restaurants (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  tagline       text,
  brand_palette jsonb not null default '{}'::jsonb,
  logo_url      text,
  address       text,
  phone         text,
  founded_year  int,
  created_at    timestamptz not null default now()
);

create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  slug          text not null,
  category      text not null,
  name          text not null,
  description   text,
  price_cents   int  not null check (price_cents >= 0),
  image_url     text,
  tags          text[] not null default '{}',
  modifiers     jsonb  not null default '[]'::jsonb,
  allows_special_requests boolean not null default false,
  is_available  boolean not null default true,
  featured      boolean not null default false,
  sort_order    int    not null default 0,
  created_at    timestamptz not null default now(),
  unique (restaurant_id, slug)
);
create index if not exists menu_items_restaurant_idx
  on public.menu_items (restaurant_id, category, sort_order);

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  restaurant_id       uuid not null references public.restaurants(id) on delete cascade,
  short_code          text not null,
  status              text not null default 'received'
                        check (status in ('received','preparing','ready','completed')),
  source              text not null default 'online'
                        check (source in ('online','phone')),
  customer_first_name text not null,
  customer_last_name  text not null,
  email               text not null,
  phone               text not null,
  items_json          jsonb not null default '[]'::jsonb,
  subtotal_cents      int not null default 0,
  tax_cents           int not null default 0,
  tip_cents           int not null default 0,
  total_cents         int not null default 0,
  notes               text,
  order_type          text not null default 'pickup'
                        check (order_type in ('pickup','delivery')),
  delivery_address    text,
  pickup_time         text,
  payment_method      text not null default 'paid-online'
                        check (payment_method in ('card-on-pickup','cash-on-pickup','paid-online')),
  created_at          timestamptz not null default now()
);
create index if not exists orders_restaurant_idx
  on public.orders (restaurant_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Row Level Security
--   * anyone (anon) may read restaurants + AVAILABLE menu items
--   * anyone may place an order (insert)
--   * only authenticated staff may read/update orders & update menu items
-- ----------------------------------------------------------------------------
alter table public.restaurants enable row level security;
alter table public.menu_items  enable row level security;
alter table public.orders      enable row level security;

drop policy if exists "public read restaurants" on public.restaurants;
create policy "public read restaurants" on public.restaurants
  for select using (true);

drop policy if exists "public read available menu" on public.menu_items;
create policy "public read available menu" on public.menu_items
  for select using (is_available = true);

drop policy if exists "staff read all menu" on public.menu_items;
create policy "staff read all menu" on public.menu_items
  for select to authenticated using (true);

drop policy if exists "staff update menu" on public.menu_items;
create policy "staff update menu" on public.menu_items
  for update to authenticated using (true) with check (true);

drop policy if exists "anyone place order" on public.orders;
create policy "anyone place order" on public.orders
  for insert with check (true);

drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders
  for select to authenticated using (true);

drop policy if exists "staff update orders" on public.orders;
create policy "staff update orders" on public.orders
  for update to authenticated using (true) with check (true);

-- Realtime for the KDS.
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.menu_items;

-- ----------------------------------------------------------------------------
-- Seed: tenant
-- ----------------------------------------------------------------------------
insert into public.restaurants (id, slug, name, tagline, brand_palette, address, phone, founded_year)
values (
  '11111111-1111-1111-1111-111111111111',
  'anthonys-on-grand',
  'Anthony''s Restaurant & Lounge',
  'Italian Jewel on Grand Avenue',
  '{"crimson":"#8B1A1A","crimsonDeep":"#5C1212","gold":"#C9A24B","goldLight":"#E3C77A","cream":"#F6EEE1","espresso":"#221610"}'::jsonb,
  '701 Grand Blvd., Kansas City, MO 64106',
  '(816) 221-4088',
  1978
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Seed: menu_items — full dinner menu with modifiers
-- Confirmed add-ons from kcanthonysongrand.com (scraped 2026-06-10):
--   Meatball/Sausage/Meat Sauce for sugo pastas; Chicken for Jerri Jean pastas;
--   Chicken/Shrimp for Pasta Angela.
-- Industry-standard additions: Extra Parmesan, GF Pasta, prep flags.
-- ----------------------------------------------------------------------------
insert into public.menu_items
  (restaurant_id, slug, category, name, description, price_cents, image_url, tags, modifiers, allows_special_requests, featured, sort_order)
values
-- Appetizers
('11111111-1111-1111-1111-111111111111','jazz','Appetizers','Jazz','Fresh garlic, Romano cheese and herbs in olive oil. Great for dipping.',800,null,'{vegetarian}','[]'::jsonb,false,false,1),
('11111111-1111-1111-1111-111111111111','cheese-and-olives','Appetizers','Cheese & Olives','Aged provolone served with our marinated olive salad.',1400,null,'{vegetarian}','[]'::jsonb,false,false,2),
('11111111-1111-1111-1111-111111111111','pickled-peppers-olives','Appetizers','Pickled Peppers & Olives','Sweet and spicy.',1100,null,'{vegan}','[]'::jsonb,false,false,3),
('11111111-1111-1111-1111-111111111111','antipasto','Appetizers','Antipasto','Pickled peppers, Italian olives, aged provolone and smoked ham.',1800,'/images/menu/antipasto.jpg','{}','[]'::jsonb,false,false,4),
('11111111-1111-1111-1111-111111111111','fried-provolone','Appetizers','Fried Provolone','Hand-cut triangles covered in seasoned bread crumbs. Served with sugo.',1400,null,'{vegetarian}','[{"id":"side-marinara","name":"Side of Marinara","priceCents":300,"category":"add-on"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,5),
('11111111-1111-1111-1111-111111111111','toasted-ravioli','Appetizers','Toasted Ravioli','Filled with ricotta cheese and deep-fried in seasoned bread crumbs. Served with sugo.',1400,null,'{vegetarian}','[{"id":"side-marinara","name":"Side of Marinara","priceCents":300,"category":"add-on"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,6),
('11111111-1111-1111-1111-111111111111','fried-calamari','Appetizers','Fried Calamari','Served with sugo and home-made mogu, a olive oil, garlic and lemon sauce.',1700,null,'{}','[{"id":"side-marinara","name":"Side of Marinara","priceCents":300,"category":"add-on"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,7),
('11111111-1111-1111-1111-111111111111','stuffed-artichoke','Appetizers','Stuffed Artichoke','A fresh baked artichoke baked with bread crumbs, topped with butter and garlic.',1700,null,'{vegetarian}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,8),
('11111111-1111-1111-1111-111111111111','italian-broccoli','Appetizers','Italian Broccoli','Fresh broccoli sauteed with garlic, olive oil and spices.',1200,null,'{vegan}','[]'::jsonb,false,false,9),
-- Soup & Salad
('11111111-1111-1111-1111-111111111111','todays-soup','Soup & Salad','Today''s Soup','Made fresh daily. Served with bread and butter.',650,null,'{}','[]'::jsonb,true,false,1),
('11111111-1111-1111-1111-111111111111','house-salad','Soup & Salad','House Salad','Choice of house Italian or Ranch dressing. Served with bread and butter.',650,'/images/menu/house-salad.jpg','{vegetarian}','[{"id":"dressing-side","name":"Dressing on the Side","priceCents":0,"category":"preparation"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"side-bread","name":"Side of Italian Bread","priceCents":300,"category":"add-on"}]'::jsonb,true,false,2),
-- Pasta — sugo-based (meatball/sausage/meat sauce confirmed on site)
('11111111-1111-1111-1111-111111111111','linguini-with-sugo','Pasta','Linguini with Sugo','Linguine tossed in and topped with our homemade sugo.',1600,null,'{vegan}','[{"id":"add-meatball","name":"Add Meatball","priceCents":450,"category":"add-on"},{"id":"add-sausage","name":"Add Sausage","priceCents":500,"category":"add-on"},{"id":"add-meat-sauce","name":"Add Meat Sauce","priceCents":450,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,1),
('11111111-1111-1111-1111-111111111111','lasagna','Pasta','Lasagna','Layered with sugo, Parmesan and Ricotta.',1900,'/images/menu/lasagna.jpg','{vegetarian}','[{"id":"add-meatball","name":"Add Meatball","priceCents":450,"category":"add-on"},{"id":"add-sausage","name":"Add Sausage","priceCents":500,"category":"add-on"},{"id":"add-meat-sauce","name":"Add Meat Sauce","priceCents":450,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,2),
('11111111-1111-1111-1111-111111111111','ravioli','Pasta','Ravioli','Filled with ricotta.',1800,null,'{vegetarian}','[{"id":"add-meatball","name":"Add Meatball","priceCents":450,"category":"add-on"},{"id":"add-sausage","name":"Add Sausage","priceCents":500,"category":"add-on"},{"id":"add-meat-sauce","name":"Add Meat Sauce","priceCents":450,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,3),
-- Pasta — protein (meatball/sausage/chicken confirmed on site for Jerri Jean)
('11111111-1111-1111-1111-111111111111','ravioli-jerri-jean','Pasta','Ravioli Jerri Jean','Onions and tomatoes marinated in our house zugo pureed then sauteed with fresh garlic, olive oil, butter and a pinch of red pepper over our ricotta filled ravioli.',2200,'/images/menu/ravioli-jerri-jean.jpg','{vegetarian}','[{"id":"add-meatball","name":"Add Meatball","priceCents":450,"category":"add-on"},{"id":"add-sausage","name":"Add Sausage","priceCents":500,"category":"add-on"},{"id":"add-chicken","name":"Add Chicken","priceCents":650,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,4),
('11111111-1111-1111-1111-111111111111','pasta-aglio-e-olio','Pasta','Pasta Aglio E Olio','Linguini sauteed with olive oil, garlic, butter and spices.',1900,null,'{vegetarian}','[{"id":"add-chicken","name":"Add Chicken","priceCents":650,"category":"add-on"},{"id":"add-shrimp","name":"Add Shrimp","priceCents":750,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,5),
-- Pasta Angela (chicken/shrimp confirmed on site)
('11111111-1111-1111-1111-111111111111','pasta-angela','Pasta','Pasta Angela','Linguine pasta sautéed in a Parmesan cheese, butter and garlic cream sauce.',2000,null,'{vegetarian}','[{"id":"add-chicken","name":"Add Chicken","priceCents":650,"category":"add-on"},{"id":"add-shrimp","name":"Add Shrimp","priceCents":750,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,6),
('11111111-1111-1111-1111-111111111111','pasta-con-fungi-piselli','Pasta','Pasta con Fungi Piselli','Linguini topped with peas and mushrooms, sauteed in sugo.',2000,'/images/menu/pasta-fungi-piselli.jpg','{vegan}','[{"id":"add-chicken","name":"Add Chicken","priceCents":650,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,7),
('11111111-1111-1111-1111-111111111111','linguine-with-clam-sauce','Pasta','Linguine with Clam Sauce','Chopped clams sauteed in olive oil, butter and garlic.',2200,'/images/menu/linguine-clam.jpg','{}','[{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,8),
('11111111-1111-1111-1111-111111111111','pasta-con-broccoli','Pasta','Pasta con Broccoli','Our home-made red cream sauce with broccoli, fresh mushrooms, garlic, and a pinch of red pepper served with penne pasta.',2400,'/images/menu/pasta-con-broccoli.jpg','{vegetarian}','[{"id":"add-chicken","name":"Add Chicken","priceCents":650,"category":"add-on"},{"id":"add-shrimp","name":"Add Shrimp","priceCents":750,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,9),
-- Pasta Jerri Jean (meatball/sausage/chicken confirmed on site)
('11111111-1111-1111-1111-111111111111','pasta-jerri-jean','Pasta','Pasta Jerri Jean','Onions and tomatoes marinated in our house zugo pureed then sauteed with fresh garlic, olive oil, butter and a pinch of red pepper over pasta.',2000,'/images/menu/pasta-jerri-jean.jpg','{vegetarian}','[{"id":"add-meatball","name":"Add Meatball","priceCents":450,"category":"add-on"},{"id":"add-sausage","name":"Add Sausage","priceCents":500,"category":"add-on"},{"id":"add-chicken","name":"Add Chicken","priceCents":650,"category":"add-on"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,true,10),
('11111111-1111-1111-1111-111111111111','pasta-puttanesca','Pasta','Pasta Puttanesca','Shrimp, calamari, chopped clams, mushrooms, and crushed tomatoes sauteed with fresh garlic, butter and a pinch of red pepper poured over linguini pasta.',2900,'/images/menu/pasta-puttanesca.jpg','{}','[{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,11),
('11111111-1111-1111-1111-111111111111','pasta-marinara','Pasta','Pasta Marinara','Linguini sauteed with fresh tomatoes, white wine, garlic, onions and Italian herbs & spices.',2000,null,'{vegan}','[{"id":"add-chicken","name":"Add Chicken","priceCents":650,"category":"add-on"},{"id":"add-shrimp","name":"Add Shrimp","priceCents":750,"category":"add-on"},{"id":"add-meatball","name":"Add Meatball","priceCents":450,"category":"add-on"},{"id":"no-onions","name":"No Onions","priceCents":0,"category":"preparation"},{"id":"extra-parmesan","name":"Extra Parmesan","priceCents":200,"category":"add-on"},{"id":"gf-pasta","name":"Gluten-Free Pasta","priceCents":300,"category":"substitution"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"}]'::jsonb,true,false,12),
-- Specialties
('11111111-1111-1111-1111-111111111111','eggplant-parmesan','Specialties','Eggplant Parmesan','Breaded slices of fresh eggplant topped with sugo, grated Parmesan and melted mozzarella.',1950,null,'{vegetarian}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"},{"id":"side-marinara","name":"Side of Marinara","priceCents":300,"category":"add-on"}]'::jsonb,true,false,1),
('11111111-1111-1111-1111-111111111111','chicken-parmesan','Specialties','Chicken Parmesan','Breaded chicken breast topped with sugo, grated Parmesan and melted mozzarella.',2150,null,'{}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"},{"id":"side-marinara","name":"Side of Marinara","priceCents":300,"category":"add-on"}]'::jsonb,true,false,2),
('11111111-1111-1111-1111-111111111111','veal-parmesan','Specialties','Veal Parmesan','Breaded veal topped with sugo, grated Parmesan and melted mozzarella.',2450,null,'{}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"},{"id":"side-marinara","name":"Side of Marinara","priceCents":300,"category":"add-on"}]'::jsonb,true,false,3),
('11111111-1111-1111-1111-111111111111','chicken-broccoli','Specialties','Chicken Broccoli','Breaded chicken breast topped with broccoli and fresh mushrooms, served in a white wine, butter and garlic sauce.',2250,null,'{}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"}]'::jsonb,true,false,4),
('11111111-1111-1111-1111-111111111111','chicken-spiedini','Specialties','Chicken Spiedini','Four large pieces of chicken breast tenders coated in our seasoned breadcrumbs, rolled and deep-fried on a skewer, then cooked in our garlic-lemon and olive oil sauce.',2550,'/images/menu/chicken-spiedini.jpg','{}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"}]'::jsonb,true,true,5),
('11111111-1111-1111-1111-111111111111','pollo-parmesan','Specialties','Pollo Parmesan','Breaded chicken breast topped with melted mozzarella, sugo and parmesan cheese.',2150,null,'{}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"},{"id":"side-marinara","name":"Side of Marinara","priceCents":300,"category":"add-on"}]'::jsonb,true,false,6),
('11111111-1111-1111-1111-111111111111','chicken-lemonata','Specialties','Chicken Lemonata','Two grilled chicken breasts, topped with a white wine, lemon and butter sauce.',2650,'/images/menu/chicken-lemonata.jpg','{}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"}]'::jsonb,true,false,7),
('11111111-1111-1111-1111-111111111111','scampi-spino','Specialties','Scampi Spino','Eight shrimp lightly breaded and broiled, served in a garlic, butter and lemon sauce.',2750,null,'{}','[{"id":"extra-sauce","name":"Extra Sauce","priceCents":0,"category":"preparation"},{"id":"light-sauce","name":"Light Sauce","priceCents":0,"category":"preparation"},{"id":"sauce-on-side","name":"Sauce on the Side","priceCents":0,"category":"preparation"},{"id":"well-done","name":"Well Done","priceCents":0,"category":"preparation"}]'::jsonb,true,false,8),
-- Desserts (no modifiers)
('11111111-1111-1111-1111-111111111111','cheesecake','Desserts','Cheesecake','Homemade cheesecake cups.',750,null,'{vegetarian}','[]'::jsonb,false,false,1),
('11111111-1111-1111-1111-111111111111','tiramisu','Desserts','Tiramisu','Lady fingers dipped in coffee, layered with a whipped mix of cocoa, Mascarpone cheese and sugar.',750,'/images/menu/tiramisu.jpg','{vegetarian}','[]'::jsonb,false,true,2),
('11111111-1111-1111-1111-111111111111','cannoli','Desserts','Cannoli (2)','Ricotta cheese mixed with chocolate, whipped cream, almonds, vanilla and powdered sugar, then stuffed into two homemade cannoli shells.',750,null,'{vegetarian}','[]'::jsonb,false,false,3),
('11111111-1111-1111-1111-111111111111','four-layer','Desserts','Four Layer','Homemade pecan crust, sweetened cream cheese, chocolate pudding and whipped cream.',750,null,'{vegetarian}','[]'::jsonb,false,false,4),
('11111111-1111-1111-1111-111111111111','spumoni-ice-cream','Desserts','Spumoni Ice Cream','Spumoni ice cream topped with our homemade rum sauce.',650,null,'{vegetarian}','[]'::jsonb,false,false,5)
on conflict (restaurant_id, slug) do nothing;
