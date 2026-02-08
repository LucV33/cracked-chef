# ⚡ Quick Start - Get Running in 2 Minutes

## Copy-Paste Setup (30 seconds per step)

### Step 1: Run Database Migration

```bash
# Open migration file
open supabase/migrations/004_social_features.sql
```

Then:
1. Copy **ALL** the SQL (CMD+A, CMD+C)
2. Open: https://app.supabase.com/project/rujfhofmwabuohuafjfm/sql/new
3. Paste the SQL
4. Click **RUN**
5. Wait for "Success"

---

### Step 2: Create Storage Bucket

1. Open: https://app.supabase.com/project/rujfhofmwabuohuafjfm/storage/buckets
2. Click **New Bucket**
3. Name: `post-images`
4. Check ✅ **Public bucket**
5. Click **Create**

Then add policies:
1. Click `post-images` → **Policies** tab
2. Click **New Policy** → paste this:

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');
```

3. Click **New Policy** again → paste this:

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');
```

---

### Step 3: Verify Auth is Enabled

1. Open: https://app.supabase.com/project/rujfhofmwabuohuafjfm/auth/providers
2. Confirm **Email** provider shows as "Enabled" (should already be)

---

### Step 4: Start the App!

```bash
npm run dev
```

Open: http://localhost:3000

---

## 🎯 Test the Features

### Create an Account
1. Click **Sign In**
2. Click **Sign up**
3. Email: `your-name@berkeley.edu` (must end with @berkeley.edu)
4. Password: anything (min 6 chars)
5. Check your email and click confirmation link

### Create a Post
1. Click **+ New Post**
2. Select **Review** tab
3. Choose a menu item
4. Rate it with the slider
5. Add optional image
6. Write your review
7. Click **Post**

### Vote & Comment
1. Upvote/downvote posts with ▲ ▼
2. Click a post to see full details
3. Add a comment
4. Reply to comments
5. Sort comments by Top/New/Controversial

### Explore Menu
1. Click any dining hall card (Crossroads, Cafe 3, etc.)
2. See full menu organized by meal and station
3. Notice ★ ratings next to items that have been reviewed
4. See "Now Serving" badge for current meal

### Profile
1. Click your name in header
2. Click **My Profile**
3. See your posts and comments
4. Click **Edit Profile** to update

---

## ✅ Everything Working?

You should have:
- ✅ User authentication (@berkeley.edu only)
- ✅ Create posts (reviews with ratings, recipes)
- ✅ Upload images
- ✅ Upvote/downvote
- ✅ Nested comments
- ✅ Hot/New/Top sorting
- ✅ Today/All Time filters
- ✅ User profiles
- ✅ Aggregate ratings on menu items
- ✅ Dark mode support

---

## 🐛 Issues?

**Can't create post?**
- Ensure migration ran (Step 1)
- Check browser console for errors

**Image upload fails?**
- Verify storage bucket "post-images" exists
- Check bucket is marked as PUBLIC
- Verify both policies were added

**Can't sign up?**
- Email must end with `@berkeley.edu`
- Check Supabase Auth logs

**Migration errors?**
- If you see "already exists" errors, that's OK
- Tables may have been created from previous work
- Verify tables exist in Supabase Table Editor

---

## 📚 Full Documentation

See `SETUP.md` for detailed explanations and troubleshooting.

Enjoy! 🎉
