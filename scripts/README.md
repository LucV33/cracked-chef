# Database Population Script

## Problem
Your menu items are showing "0.0" ratings because they're not connected to reviews. This script fixes that by:

1. Creating `item_master` records for all your scraped menu items
2. Linking your `menu_items` to `item_master` via `item_master_id`
3. Creating sample reviews for each item (so ratings appear immediately)

## Prerequisites

1. **Run the database migration first:**
   ```bash
   # In your Supabase dashboard, run the SQL from:
   supabase/migrations/005_canonical_items.sql
   ```

2. **Make sure you have Supabase credentials in `.env.local`:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   # OR for admin access:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Usage

Run the population script:

```bash
npm run populate-db
```

This will:
- ✅ Scan all your existing menu items
- ✅ Create `item_master` records for unique items
- ✅ Link all `menu_items` to their `item_master` records
- ✅ Generate 1-3 realistic reviews per item (0.0-4.0 GPA scale)

## What Happens

### Before:
```
Menu Item: "Chicken Tenders Fried (HS) Halal"
item_master_id: null
Rating: 0.0 (no reviews)
```

### After:
```
Menu Item: "Chicken Tenders Fried (HS) Halal"
item_master_id: "uuid-123"
Rating: 2.8 (3 reviews)

Reviews:
- "Chicken Tenders are decent" - 3.0/4.0
- "Fried chicken is okay" - 2.5/4.0
- "Tenders need improvement" - 2.9/4.0
```

## After Running

1. **Refresh your app** - ratings will now appear on all menu items!
2. **Check the feed** - you'll see generated reviews
3. **Click menu items** - they'll show detailed reviews on item detail pages

## Future Updates

Once this script runs, new menu items from scraping will need to be linked to `item_master`. You can either:
- Run this script again after scraping new menus
- Implement automatic linking in your scraper
- Manually create `item_master` records for new items

## Troubleshooting

**Script fails with "Missing Supabase credentials":**
- Make sure `.env.local` has your Supabase URL and keys

**Items still showing 0.0:**
- Verify the migration ran successfully in Supabase dashboard
- Check that `item_master` table exists
- Re-run the script

**Reviews not appearing:**
- The script creates reviews with random authors
- Make sure the `posts` table allows insertions
- Check Supabase logs for any RLS policy issues

## Manual Alternative

If you prefer to test with mock data instead:
1. Don't run this script
2. Make sure Supabase env vars are NOT set (or comment them out)
3. The app will use mock data with pre-populated reviews
