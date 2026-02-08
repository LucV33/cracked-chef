/**
 * Data Population Script: Connect Menu Items to Item Master
 *
 * This script:
 * 1. Finds all unique menu items from your scraped data
 * 2. Creates item_master records for each unique item
 * 3. Links menu_items to item_master via item_master_id
 * 4. Creates sample reviews for each item (so ratings appear)
 *
 * Run with: npm run populate-db
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Normalize item name for matching (lowercase, remove special chars)
function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

// Extract category from station/context
function extractCategory(station: string, itemName: string): string {
  const name = itemName.toLowerCase();

  if (name.includes('soup') || name.includes('broth')) return 'Soup';
  if (name.includes('salad')) return 'Salad';
  if (name.includes('pizza')) return 'Pizza';
  if (name.includes('pasta') || name.includes('macaroni')) return 'Pasta';
  if (name.includes('egg') || name.includes('scramble')) return 'Breakfast';
  if (name.includes('pancake') || name.includes('waffle')) return 'Breakfast';
  if (name.includes('sausage') || name.includes('bacon')) return 'Breakfast';
  if (name.includes('brownie') || name.includes('cookie') || name.includes('cake')) return 'Dessert';
  if (name.includes('rice') || name.includes('potato') || name.includes('fries')) return 'Side';
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) return 'Entree';
  if (name.includes('tofu') || name.includes('veggie') || name.includes('vegan')) return 'Entree';

  return 'Entree';
}

// Generate realistic student review
function generateReview(itemName: string, rating: number): { title: string; body: string } {
  const reviews = {
    high: [
      { title: `${itemName} is amazing!`, body: `This is one of the best items on campus. Perfectly cooked, great flavor, definitely worth getting. Solid ${rating.toFixed(1)} GPA dish.` },
      { title: `Love the ${itemName}`, body: `I come back for this every week. Never disappoints. The quality is consistently high. Highly recommend!` },
      { title: `${itemName} never misses`, body: `This is my go-to item. Always fresh, always delicious. The dining hall really nails this one.` },
    ],
    medium: [
      { title: `${itemName} is decent`, body: `Pretty good, nothing special but gets the job done. Solid option when you need a quick meal.` },
      { title: `${itemName} is okay`, body: `It's alright. Sometimes better than others, depends on when you go. Worth trying once.` },
      { title: `Mixed feelings about ${itemName}`, body: `Can be good when fresh, but quality varies. Hit or miss depending on timing.` },
    ],
    low: [
      { title: `${itemName} needs improvement`, body: `Not great. The execution is lacking. Dining hall should work on this recipe. Skip if you can.` },
      { title: `Disappointed by ${itemName}`, body: `Expected better. Quality is inconsistent and flavor is bland. There are better options.` },
      { title: `${itemName} is mid at best`, body: `Below average. Not worth the meal swipe. I'd recommend getting something else instead.` },
    ],
  };

  if (rating >= 3.5) return reviews.high[Math.floor(Math.random() * reviews.high.length)];
  if (rating >= 2.5) return reviews.medium[Math.floor(Math.random() * reviews.medium.length)];
  return reviews.low[Math.floor(Math.random() * reviews.low.length)];
}

async function main() {
  console.log('🚀 Starting item_master population...\n');

  // Step 1: Get all unique menu items from scraped data
  console.log('📊 Step 1: Fetching unique menu items...');
  const { data: menuItems, error: fetchError } = await supabase
    .from('menu_items')
    .select('item_name, station, dietary_tags, dining_hall_id')
    .order('item_name');

  if (fetchError) {
    console.error('❌ Error fetching menu items:', fetchError);
    process.exit(1);
  }

  // Group by normalized name to find unique items
  const uniqueItems = new Map<string, {
    canonical_name: string;
    category: string;
    dietary_tags: string[];
    dining_hall_id: string;
    occurrences: number;
  }>();

  for (const item of menuItems || []) {
    const normalized = normalizeItemName(item.item_name);

    if (!uniqueItems.has(normalized)) {
      uniqueItems.set(normalized, {
        canonical_name: item.item_name,
        category: extractCategory(item.station || '', item.item_name),
        dietary_tags: item.dietary_tags || [],
        dining_hall_id: item.dining_hall_id,
        occurrences: 1,
      });
    } else {
      const existing = uniqueItems.get(normalized)!;
      existing.occurrences++;
      // Merge dietary tags
      existing.dietary_tags = [...new Set([...existing.dietary_tags, ...(item.dietary_tags || [])])];
    }
  }

  console.log(`✅ Found ${uniqueItems.size} unique items\n`);

  // Step 2: Create item_master records
  console.log('📝 Step 2: Creating item_master records...');

  const itemMasterRecords = Array.from(uniqueItems.entries()).map(([normalized, data]) => ({
    canonical_name: data.canonical_name,
    normalized_name: normalized,
    category: data.category,
    dietary_tags: data.dietary_tags,
  }));

  const { data: createdItems, error: createError } = await supabase
    .from('item_master')
    .upsert(itemMasterRecords, {
      onConflict: 'canonical_name',
      ignoreDuplicates: false
    })
    .select();

  if (createError) {
    console.error('❌ Error creating item_master records:', createError);
    process.exit(1);
  }

  console.log(`✅ Created ${createdItems?.length || 0} item_master records\n`);

  // Step 3: Link menu_items to item_master
  console.log('🔗 Step 3: Linking menu_items to item_master...');

  for (const masterItem of createdItems || []) {
    // Update all menu_items with this normalized name
    const { error: updateError } = await supabase
      .from('menu_items')
      .update({ item_master_id: masterItem.id })
      .ilike('item_name', `%${masterItem.canonical_name}%`);

    if (updateError) {
      console.warn(`⚠️  Warning: Could not link ${masterItem.canonical_name}:`, updateError.message);
    }
  }

  console.log('✅ Linked menu items to item_master\n');

  // Step 4: Create sample reviews for each item
  console.log('💬 Step 4: Creating sample reviews...');

  const reviewsToCreate = [];
  const authors = ['foodie_bear', 'hungry_student', 'dining_critic', 'meal_reviewer', 'campus_eater'];

  for (const masterItem of createdItems || []) {
    const itemData = uniqueItems.get(normalizeItemName(masterItem.canonical_name))!;

    // Generate 1-3 reviews per item
    const numReviews = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numReviews; i++) {
      // Generate rating (0.0-4.0 scale)
      const baseRating = Math.random() * 4;
      const rating = Math.round(baseRating * 10) / 10; // Round to 1 decimal

      const { title, body } = generateReview(masterItem.canonical_name, rating);
      const author = authors[Math.floor(Math.random() * authors.length)];

      reviewsToCreate.push({
        type: 'review',
        title,
        body,
        author,
        dining_hall_id: itemData.dining_hall_id,
        item_master_id: masterItem.id,
        rating,
        upvotes: Math.floor(Math.random() * 50) + 5,
        downvotes: Math.floor(Math.random() * 10),
        comment_count: 0,
      });
    }
  }

  const { error: reviewError } = await supabase
    .from('posts')
    .insert(reviewsToCreate);

  if (reviewError) {
    console.error('❌ Error creating reviews:', reviewError);
    // Don't exit - the connection is still made even if reviews fail
  } else {
    console.log(`✅ Created ${reviewsToCreate.length} sample reviews\n`);
  }

  // Step 5: Verify results
  console.log('🔍 Step 5: Verifying results...');

  const { count: linkedCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .not('item_master_id', 'is', null);

  const { count: reviewCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'review')
    .not('item_master_id', 'is', null);

  console.log(`✅ ${linkedCount || 0} menu items linked to item_master`);
  console.log(`✅ ${reviewCount || 0} reviews connected to items\n`);

  console.log('🎉 Done! Refresh your app to see ratings appear on menu items.');
}

main().catch(console.error);
