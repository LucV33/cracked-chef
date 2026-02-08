# Deployment Guide - Cracked Chef

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account with Cracked Chef repository
- Vercel account (free tier works)
- Supabase project with credentials

### Step 1: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository: `LucV33/cracked-chef`
4. Vercel will auto-detect Next.js configuration

### Step 2: Configure Environment Variables

In Vercel project settings, add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rujfhofmwabuohuafjfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_DB_PASSWORD=your_db_password_here
```

**Get these from:**
- Supabase Dashboard → Settings → API
- Copy the values from your local `.env.local`

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://cracked-chef.vercel.app`

### Step 4: Set Up Database (One-Time)

Once deployed, run these commands locally to populate your production database:

```bash
# 1. Run database migration
npm run migrate

# 2. Populate with items and reviews
npm run populate-db
```

This will:
- Create all necessary database tables
- Link 426+ menu items to canonical items
- Generate 474+ realistic student reviews
- Set up operating hours

### Step 5: Verify Deployment

Visit your Vercel URL and check:
- ✅ Home page loads with dining halls
- ✅ Click a dining hall → menu shows with ratings
- ✅ Click a menu item → detail page with reviews
- ✅ Feed shows all reviews
- ✅ Ratings appear as X.X/4.0 (not 5.0)

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 🛠️ Environment Variables Explained

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public key (safe to expose)
- **SUPABASE_SERVICE_ROLE_KEY**: Admin key (never expose in client)
- **SUPABASE_DB_PASSWORD**: Direct database access (for migrations)

## 📊 Database Schema

The app requires these tables:
- `dining_halls` - Dining hall information
- `item_master` - Canonical menu items
- `menu_items` - Daily menu entries
- `dining_hall_hours` - Operating hours
- `posts` - Reviews and recipes
- `profiles` - User profiles
- `post_votes` - Vote tracking

All created by the migration script.

## 🔒 Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use service role key** only in server/scripts, never in client
3. **Enable RLS policies** in Supabase for production
4. **Rotate keys** if accidentally exposed

## 🐛 Troubleshooting

**Build fails on Vercel:**
- Check environment variables are set correctly
- Verify Supabase credentials work

**Menu items show 0.0 ratings:**
- Run `npm run populate-db` to connect items and reviews
- Verify migration ran successfully in Supabase

**"Table not found" errors:**
- Run `npm run migrate` first
- Check Supabase dashboard → SQL Editor for tables

**Reviews not showing:**
- Clear browser cache
- Check Network tab for API errors
- Verify `item_master_id` links exist

## 📈 Monitoring

- **Vercel Dashboard**: Build logs, runtime logs, analytics
- **Supabase Dashboard**: Database queries, API usage
- **Error Tracking**: Check Vercel Function logs

## 🎯 Performance

- Static pages: `/` (home)
- Dynamic pages: `/item/[id]`, `/post/[id]`, `/profile/[id]`
- API routes: `/api/scrape-menu`

All optimized with Next.js 16 + Turbopack.

## 📞 Support

For issues or questions:
1. Check GitHub Issues
2. Review Vercel deployment logs
3. Verify Supabase connection

---

**Your app is now live and ready for students to rate dining hall food! 🍽️**
