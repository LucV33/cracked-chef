# Cracked Chef - Reddit-Style Features Setup Guide

## ✅ Already Configured
- Supabase connection (`.env.local`)
- Database tables: `dining_halls`, `daily_menus`, `menu_items`, `ratings`, `posts`
- Daily scraper cron job

## 🔧 Setup Steps (5 minutes)

### Step 1: Run Database Migration

1. Open Supabase Dashboard: https://app.supabase.com/project/rujfhofmwabuohuafjfm
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/004_social_features.sql`
5. Paste into the SQL editor
6. Click **Run**

**This creates:**
- `profiles` table (user display names, avatars, bios)
- `comments` table (nested threading)
- `post_votes` & `comment_votes` tables
- Enhances `posts` table with new columns
- Auto-triggers for vote/comment counts
- RLS policies for security

---

### Step 2: Set Up Storage Bucket for Images

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Bucket name: `post-images`
4. **Public bucket**: ✅ Checked
5. Click **Create Bucket**
6. Click on the `post-images` bucket
7. Go to **Policies** tab
8. Add these policies:

**Upload Policy:**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');
```

**Select Policy:**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');
```

---

### Step 3: Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. **Email Auth Settings:**
   - ✅ Enable email confirmations (recommended)
   - Confirmation URL: `http://localhost:3000` (for dev)
   - After deploy: Update to your production URL

4. **Optional: Restrict to @berkeley.edu**
   - This is already enforced in the app code (`src/lib/auth-context.tsx`)
   - Supabase will accept any email, but our app rejects non-@berkeley.edu

5. **Email Templates** (optional customization):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation email if desired

---

### Step 4: Verify Setup

Run this test in Supabase SQL Editor:

```sql
-- Check if migration ran successfully
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'comments', 'post_votes', 'comment_votes');

-- Check new columns on posts
SELECT column_name FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('user_id', 'menu_item_id', 'rating', 'comment_count', 'tagged_items');

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'post-images';
```

You should see:
- ✅ 4 new tables
- ✅ 5 new columns on posts
- ✅ 1 storage bucket

---

### Step 5: Test the App

```bash
npm run dev
```

**Test the full flow:**

1. ✅ **Sign Up**: Click "Sign In" → Sign up with any `@berkeley.edu` email
   - Check your email for confirmation link
   - Confirm account

2. ✅ **Create Post**: Click "+ New Post"
   - Select "Review" or "Recipe"
   - Choose a menu item from today's menu
   - Add image (optional)
   - Submit

3. ✅ **Vote**: Upvote/downvote posts in the feed

4. ✅ **Comment**: Click a post → Add comment → Reply to comments

5. ✅ **Profile**: Click your name → View profile → Edit profile

6. ✅ **Menu Ratings**: Click a dining hall card → See ratings on menu items

---

## 🎨 Features Available After Setup

### Authentication
- Sign up/sign in with @berkeley.edu email
- Email confirmation
- Auto-created user profiles
- Session management

### Social Features
- **Posts**: Create reviews (with ratings) or recipes
- **Images**: Upload photos with posts
- **Voting**: Upvote/downvote posts and comments
- **Comments**: Nested threading (8 levels deep)
- **Sorting**: Hot (Reddit algorithm), New, Top
- **Filters**: Today / All Time

### User Profiles
- Display name, avatar, bio
- Post history
- Comment history
- Edit own profile

### Menu Enhancements
- Aggregate ratings on menu items
- Review counts
- Click items to see all reviews (coming soon)

---

## 🚀 Deploy to Production

1. **Update Supabase Auth Settings:**
   - Set production URL in confirmation emails
   - Update redirect URLs

2. **Set Vercel Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` (already set)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already set)
   - `SUPABASE_SERVICE_ROLE_KEY` (already set)
   - `CRON_SECRET` (generate random string for scraper auth)

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Add Reddit-style social features"
   git push
   ```

4. **Verify Cron Job:**
   - Go to Vercel Dashboard → Settings → Cron Jobs
   - Should see: `/api/scrape-menu` running daily at 7am PT

---

## 📝 Migration Contents Summary

The `004_social_features.sql` migration adds:

**Tables:**
- `profiles` - User display names, avatars, bios
- `comments` - Nested comments with parent_id
- `post_votes` - User votes on posts (prevents double-voting)
- `comment_votes` - User votes on comments

**Columns added to `posts`:**
- `user_id` - Link to auth.users
- `menu_item_id` - Link to menu_items (for reviews)
- `tagged_items` - JSONB array of menu item IDs (for recipes)
- `rating` - 1.0-5.0 rating (for reviews)
- `comment_count` - Denormalized count (auto-updated)

**Triggers:**
- Auto-create profile on user signup
- Auto-update vote counts when votes change
- Auto-update comment count when comments added/deleted

**Security (RLS):**
- Public read on all content
- Users can only edit own profiles/posts/comments
- Users can only see own votes

---

## 🐛 Troubleshooting

**Migration fails:**
- Some tables may already exist from previous migrations
- This is fine - the migration is idempotent
- Check Supabase logs for actual errors

**Storage upload fails:**
- Verify bucket is public
- Check RLS policies on `storage.objects`
- Ensure authenticated users can upload

**Email not sending:**
- Check Supabase Auth logs
- Verify email provider settings
- Check spam folder

**Can't sign up:**
- Verify email ends with @berkeley.edu
- Check browser console for errors
- Verify Supabase Auth is enabled

---

## 📚 Next Steps

After setup works:
1. Populate more dining hall data
2. Add more users for testing
3. Create sample posts and comments
4. Test all voting flows
5. Deploy to production

Enjoy your Reddit-style dining hall social platform! 🎉
