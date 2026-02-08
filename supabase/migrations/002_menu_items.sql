-- Menu Items: granular per-item data from the Berkeley dining XML feeds
-- Also updates daily_menus meal_period constraint to include 'brunch'

-- ============================================================
-- UPDATE daily_menus CONSTRAINT
-- ============================================================

alter table daily_menus drop constraint daily_menus_meal_period_check;
alter table daily_menus add constraint daily_menus_meal_period_check
  check (meal_period in ('breakfast', 'lunch', 'dinner', 'brunch'));

-- ============================================================
-- MENU_ITEMS TABLE
-- ============================================================

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  dining_hall_id uuid not null references dining_halls(id) on delete cascade,
  date date not null,
  meal text not null check (meal in ('brunch', 'dinner')),
  station text not null,
  item_name text not null,
  dietary_tags jsonb not null default '[]',
  carbon_footprint numeric,
  created_at timestamptz not null default now()
);

create index idx_menu_items_hall_date on menu_items(dining_hall_id, date);
create index idx_menu_items_date_meal on menu_items(date, meal);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table menu_items enable row level security;
create policy "Public read menu_items" on menu_items for select using (true);
