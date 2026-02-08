-- Cracked Chef: Initial Schema
-- Creates dining_halls, daily_menus, ratings, and posts tables

-- ============================================================
-- TABLES
-- ============================================================

create table dining_halls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  gpa numeric(3,2) not null default 0.00,
  image_url text,
  created_at timestamptz not null default now()
);

create table daily_menus (
  id uuid primary key default gen_random_uuid(),
  dining_hall_id uuid not null references dining_halls(id) on delete cascade,
  date date not null default current_date,
  meal_period text not null check (meal_period in ('breakfast', 'lunch', 'dinner')),
  items jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (dining_hall_id, date, meal_period)
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  dining_hall_id uuid not null references dining_halls(id) on delete cascade,
  user_id uuid not null,
  score integer not null check (score >= 1 and score <= 4),
  comment text,
  created_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('recipe', 'review')),
  title text not null,
  body text not null,
  author text not null,
  dining_hall_id uuid references dining_halls(id) on delete set null,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_daily_menus_hall_date on daily_menus(dining_hall_id, date);
create index idx_ratings_hall on ratings(dining_hall_id);
create index idx_posts_type on posts(type);
create index idx_posts_created on posts(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table dining_halls enable row level security;
alter table daily_menus enable row level security;
alter table ratings enable row level security;
alter table posts enable row level security;

-- Public read access for all tables
create policy "Public read dining_halls" on dining_halls for select using (true);
create policy "Public read daily_menus" on daily_menus for select using (true);
create policy "Public read ratings" on ratings for select using (true);
create policy "Public read posts" on posts for select using (true);

-- Authenticated users can insert ratings and posts
create policy "Auth insert ratings" on ratings for insert with check (auth.uid() = user_id);
create policy "Auth insert posts" on posts for insert with check (auth.uid() is not null);

-- ============================================================
-- SEED DATA
-- ============================================================

insert into dining_halls (name, slug, gpa) values
  ('Crossroads', 'crossroads', 3.60),
  ('Cafe 3', 'cafe-3', 3.10),
  ('Clark Kerr', 'clark-kerr', 2.40),
  ('Foothill', 'foothill', 1.80);
