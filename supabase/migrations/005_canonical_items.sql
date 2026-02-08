-- Migration: Canonical Items and Menu Enhancements
-- This migration introduces item_master for persistent item ratings,
-- dining hall hours, rating scale change (1.0-5.0 → 0.0-4.0), and helper functions

-- ============================================================================
-- 1. Create item_master table for canonical menu items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.item_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL UNIQUE,
  normalized_name TEXT NOT NULL, -- for fuzzy matching (lowercase, no spaces)
  category TEXT, -- e.g., "Entree", "Side", "Dessert"
  dietary_tags JSONB DEFAULT '[]'::jsonb, -- e.g., ["vegan", "halal", "gluten-free"]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_item_master_normalized ON public.item_master(normalized_name);
CREATE INDEX idx_item_master_category ON public.item_master(category);

-- ============================================================================
-- 2. Add item_master_id to menu_items table
-- ============================================================================
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS item_master_id UUID REFERENCES public.item_master(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_menu_items_item_master ON public.menu_items(item_master_id);

-- ============================================================================
-- 3. Remove is_star column from menu_items (replaced by top-rated logic)
-- ============================================================================
ALTER TABLE public.menu_items
DROP COLUMN IF EXISTS is_star;

-- ============================================================================
-- 4. Create dining_hall_hours table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dining_hall_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dining_hall_id UUID NOT NULL REFERENCES public.dining_halls(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_period TEXT NOT NULL, -- e.g., "Breakfast", "Lunch", "Dinner", "Brunch"
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dining_hall_id, date, meal_period)
);

CREATE INDEX idx_dining_hall_hours_lookup ON public.dining_hall_hours(dining_hall_id, date);

-- ============================================================================
-- 5. Update posts table for new rating scale and item references
-- ============================================================================

-- Add item_master_id column to posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS item_master_id UUID REFERENCES public.item_master(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_posts_item_master ON public.posts(item_master_id);

-- Migrate existing ratings from 1.0-5.0 scale to 0.0-4.0 scale
-- Formula: new_rating = (old_rating - 1.0) * (4.0 / 4.0) = old_rating - 1.0
UPDATE public.posts
SET rating = CASE
  WHEN rating IS NOT NULL AND rating >= 1.0 AND rating <= 5.0
  THEN rating - 1.0
  ELSE rating
END
WHERE rating IS NOT NULL;

-- Add constraint for new rating scale (0.0 to 4.0)
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_rating_check;

ALTER TABLE public.posts
ADD CONSTRAINT posts_rating_check CHECK (rating IS NULL OR (rating >= 0.0 AND rating <= 4.0));

-- ============================================================================
-- 6. Function: Calculate dynamic hall GPA from item ratings
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_hall_gpa(
  p_hall_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC(3, 2) AS $$
DECLARE
  v_avg_rating NUMERIC(3, 2);
BEGIN
  -- Calculate average rating for all items on today's menu at this hall
  SELECT COALESCE(AVG(p.rating), 0.0)::NUMERIC(3, 2)
  INTO v_avg_rating
  FROM public.posts p
  INNER JOIN public.menu_items mi ON p.item_master_id = mi.item_master_id
  WHERE mi.dining_hall_id = p_hall_id
    AND mi.date = p_date
    AND p.rating IS NOT NULL
    AND p.type = 'review';

  RETURN v_avg_rating;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 7. Function: Get top-rated items for a dining hall on a given date
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_top_rated_items(
  p_hall_id UUID,
  p_date DATE DEFAULT CURRENT_DATE,
  p_limit INTEGER DEFAULT 2
)
RETURNS TABLE (
  item_master_id UUID,
  canonical_name TEXT,
  category TEXT,
  dietary_tags JSONB,
  avg_rating NUMERIC(3, 2),
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    im.id as item_master_id,
    im.canonical_name,
    im.category,
    im.dietary_tags,
    COALESCE(AVG(p.rating), 0.0)::NUMERIC(3, 2) as avg_rating,
    COUNT(p.id) FILTER (WHERE p.rating IS NOT NULL) as review_count
  FROM public.menu_items mi
  INNER JOIN public.item_master im ON mi.item_master_id = im.id
  LEFT JOIN public.posts p ON p.item_master_id = im.id AND p.type = 'review'
  WHERE mi.dining_hall_id = p_hall_id
    AND mi.date = p_date
  GROUP BY im.id, im.canonical_name, im.category, im.dietary_tags
  ORDER BY avg_rating DESC, review_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 8. Function: Get menu items with ratings for a dining hall
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_menu_with_ratings(
  p_hall_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  menu_item_id UUID,
  item_master_id UUID,
  canonical_name TEXT,
  category TEXT,
  meal_period TEXT,
  dietary_tags JSONB,
  avg_rating NUMERIC(3, 2),
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mi.id as menu_item_id,
    im.id as item_master_id,
    im.canonical_name,
    im.category,
    mi.meal_period,
    im.dietary_tags,
    COALESCE(AVG(p.rating), 0.0)::NUMERIC(3, 2) as avg_rating,
    COUNT(p.id) FILTER (WHERE p.rating IS NOT NULL) as review_count
  FROM public.menu_items mi
  INNER JOIN public.item_master im ON mi.item_master_id = im.id
  LEFT JOIN public.posts p ON p.item_master_id = im.id AND p.type = 'review'
  WHERE mi.dining_hall_id = p_hall_id
    AND mi.date = p_date
  GROUP BY mi.id, im.id, im.canonical_name, im.category, mi.meal_period, im.dietary_tags
  ORDER BY mi.meal_period, im.category;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 9. RLS Policies for new tables
-- ============================================================================

-- item_master: readable by all, writable by authenticated users
ALTER TABLE public.item_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_master_select" ON public.item_master
  FOR SELECT USING (true);

CREATE POLICY "item_master_insert" ON public.item_master
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "item_master_update" ON public.item_master
  FOR UPDATE USING (auth.role() = 'authenticated');

-- dining_hall_hours: readable by all, writable by authenticated users
ALTER TABLE public.dining_hall_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dining_hall_hours_select" ON public.dining_hall_hours
  FOR SELECT USING (true);

CREATE POLICY "dining_hall_hours_insert" ON public.dining_hall_hours
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "dining_hall_hours_update" ON public.dining_hall_hours
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 10. Helper function: Normalize item name for fuzzy matching
-- ============================================================================
CREATE OR REPLACE FUNCTION public.normalize_item_name(item_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Lowercase, remove extra spaces, remove special chars
  RETURN LOWER(REGEXP_REPLACE(TRIM(item_name), '[^a-z0-9]+', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 11. Trigger: Auto-update normalized_name on item_master insert/update
-- ============================================================================
CREATE OR REPLACE FUNCTION public.auto_normalize_item_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_name := public.normalize_item_name(NEW.canonical_name);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_normalize_item_name ON public.item_master;

CREATE TRIGGER trigger_normalize_item_name
  BEFORE INSERT OR UPDATE OF canonical_name ON public.item_master
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_normalize_item_name();

-- ============================================================================
-- 12. Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.item_master IS 'Canonical menu items that persist across daily menu changes';
COMMENT ON TABLE public.dining_hall_hours IS 'Operating hours for dining halls by date and meal period';
COMMENT ON FUNCTION public.calculate_hall_gpa IS 'Calculates average GPA rating for a dining hall on a specific date';
COMMENT ON FUNCTION public.get_top_rated_items IS 'Returns top N highest-rated items for a dining hall on a specific date';
COMMENT ON FUNCTION public.get_menu_with_ratings IS 'Returns full menu with ratings for a dining hall on a specific date';
