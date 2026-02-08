-- Social Features: Users, Comments, Votes, Profiles
-- Extends existing schema with Reddit-style social features

-- ============================================================
-- USER PROFILES
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- COMMENTS (nested threading)
-- ============================================================

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- VOTES (for posts and comments)
-- ============================================================

create table post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_type integer not null check (vote_type in (-1, 1)), -- -1 = downvote, 1 = upvote
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_type integer not null check (vote_type in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

-- ============================================================
-- UPDATE EXISTING TABLES
-- ============================================================

-- Add user_id to posts (migrate from text author)
alter table posts add column user_id uuid references auth.users(id) on delete set null;
alter table posts add column menu_item_id uuid references menu_items(id) on delete set null;
alter table posts add column tagged_items jsonb default '[]'; -- for recipes
alter table posts add column rating numeric(2,1) check (rating >= 1.0 and rating <= 5.0); -- for reviews

-- Add comment count to posts (denormalized for performance)
alter table posts add column comment_count integer not null default 0;

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_comments_post on comments(post_id, created_at desc);
create index idx_comments_parent on comments(parent_id);
create index idx_comments_user on comments(user_id);
create index idx_post_votes_post on post_votes(post_id);
create index idx_post_votes_user on post_votes(user_id);
create index idx_comment_votes_comment on comment_votes(comment_id);
create index idx_comment_votes_user on comment_votes(user_id);
create index idx_posts_user on posts(user_id, created_at desc);
create index idx_posts_menu_item on posts(menu_item_id);
create index idx_posts_hot on posts((upvotes - downvotes) desc, created_at desc); -- hot ranking

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table comments enable row level security;
alter table post_votes enable row level security;
alter table comment_votes enable row level security;

-- Profiles: public read, users can update own
create policy "Public read profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Comments: public read, auth insert/update/delete own
create policy "Public read comments" on comments for select using (true);
create policy "Auth insert comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users update own comments" on comments for update using (auth.uid() = user_id);
create policy "Users delete own comments" on comments for delete using (auth.uid() = user_id);

-- Votes: users can read own votes, insert/update/delete own
create policy "Users read own post votes" on post_votes for select using (auth.uid() = user_id);
create policy "Auth insert post votes" on post_votes for insert with check (auth.uid() = user_id);
create policy "Users update own post votes" on post_votes for update using (auth.uid() = user_id);
create policy "Users delete own post votes" on post_votes for delete using (auth.uid() = user_id);

create policy "Users read own comment votes" on comment_votes for select using (auth.uid() = user_id);
create policy "Auth insert comment votes" on comment_votes for insert with check (auth.uid() = user_id);
create policy "Users update own comment votes" on comment_votes for update using (auth.uid() = user_id);
create policy "Users delete own comment votes" on comment_votes for delete using (auth.uid() = user_id);

-- Update posts policies for user_id
create policy "Auth users update own posts" on posts for update using (auth.uid() = user_id);
create policy "Auth users delete own posts" on posts for delete using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update comment_count on posts when comments added/deleted
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set comment_count = comment_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_post_comment_count
after insert or delete on comments
for each row execute function update_post_comment_count();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- Update vote counts when votes change
create or replace function update_post_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.vote_type = 1 then
      update posts set upvotes = upvotes + 1 where id = NEW.post_id;
    else
      update posts set downvotes = downvotes + 1 where id = NEW.post_id;
    end if;
  elsif TG_OP = 'UPDATE' and NEW.vote_type != OLD.vote_type then
    if NEW.vote_type = 1 then
      update posts set upvotes = upvotes + 1, downvotes = downvotes - 1 where id = NEW.post_id;
    else
      update posts set upvotes = upvotes - 1, downvotes = downvotes + 1 where id = NEW.post_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote_type = 1 then
      update posts set upvotes = upvotes - 1 where id = OLD.post_id;
    else
      update posts set downvotes = downvotes - 1 where id = OLD.post_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_post_vote_counts
after insert or update or delete on post_votes
for each row execute function update_post_vote_counts();

create or replace function update_comment_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.vote_type = 1 then
      update comments set upvotes = upvotes + 1 where id = NEW.comment_id;
    else
      update comments set downvotes = downvotes + 1 where id = NEW.comment_id;
    end if;
  elsif TG_OP = 'UPDATE' and NEW.vote_type != OLD.vote_type then
    if NEW.vote_type = 1 then
      update comments set upvotes = upvotes + 1, downvotes = downvotes - 1 where id = NEW.comment_id;
    else
      update comments set upvotes = upvotes - 1, downvotes = downvotes + 1 where id = NEW.comment_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote_type = 1 then
      update comments set upvotes = upvotes - 1 where id = OLD.comment_id;
    else
      update comments set downvotes = downvotes - 1 where id = OLD.comment_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_comment_vote_counts
after insert or update or delete on comment_votes
for each row execute function update_comment_vote_counts();
