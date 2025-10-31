-- Migration: Optimize Database Indexes
-- Description: Add missing foreign key index and remove unused indexes
-- Date: 2025-01-30
-- Issue: Supabase Performance Advisor flagged 1 missing index and 24 unused indexes

-- ============================================================================
-- ADD MISSING FOREIGN KEY INDEX
-- ============================================================================

-- portfolios.user_id foreign key needs an index for optimal query performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);


-- ============================================================================
-- REMOVE UNUSED INDEXES
-- ============================================================================
-- These indexes have never been used and add unnecessary overhead.
-- If you later need them, you can always recreate them.

-- page_views table
DROP INDEX IF EXISTS public.idx_page_views_page_name;
DROP INDEX IF EXISTS public.idx_page_views_session_id;

-- user_sessions table
DROP INDEX IF EXISTS public.idx_user_sessions_session_start;

-- user_term_views table
DROP INDEX IF EXISTS public.idx_user_term_views_user;
DROP INDEX IF EXISTS public.idx_user_term_views_term;

-- lessons table
DROP INDEX IF EXISTS public.idx_lessons_category;

-- glossary_terms table
DROP INDEX IF EXISTS public.idx_glossary_category;

-- user_lesson_progress table
DROP INDEX IF EXISTS public.idx_user_lesson_progress_slug;

-- lesson_views table
DROP INDEX IF EXISTS public.idx_lesson_views_user_id;
DROP INDEX IF EXISTS public.idx_lesson_views_lesson_slug;
DROP INDEX IF EXISTS public.idx_lesson_views_started_at;

-- lesson_suggestions table
DROP INDEX IF EXISTS public.idx_lesson_suggestions_shown_at;

-- analytics_events table
DROP INDEX IF EXISTS public.idx_analytics_events_user_id;
DROP INDEX IF EXISTS public.idx_analytics_events_event_type;
DROP INDEX IF EXISTS public.idx_analytics_events_occurred_at;

-- confidence_history table
DROP INDEX IF EXISTS public.confidence_history_recorded_at_idx;

-- profiles table
DROP INDEX IF EXISTS public.idx_profiles_confidence_score;

-- market_data table
DROP INDEX IF EXISTS public.idx_market_data_type;
DROP INDEX IF EXISTS public.idx_market_data_active;
DROP INDEX IF EXISTS public.idx_market_data_last_updated;
DROP INDEX IF EXISTS public.idx_market_data_sector;

-- holdings table
DROP INDEX IF EXISTS public.idx_holdings_user_id;

-- watchlist table
DROP INDEX IF EXISTS public.idx_watchlist_symbol;


-- ============================================================================
-- NOTES ON REMOVED INDEXES
-- ============================================================================

-- Why these indexes were likely unused:
-- 1. RLS policies filter by user_id, which has its own index via FK
-- 2. Most queries are simple lookups by primary key
-- 3. Some indexes were created for future features not yet implemented
-- 4. Aggregated data comes from materialized views, not direct table scans

-- If you add features that query by these columns, recreate the index:
-- Example: CREATE INDEX idx_market_data_sector ON public.market_data(sector);


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that portfolios foreign key now has an index:
-- SELECT
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename = 'portfolios'
--   AND indexname = 'idx_portfolios_user_id';

-- Verify unused indexes are removed:
-- SELECT
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as times_used
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
--   AND idx_scan = 0
-- ORDER BY relname, indexrelname;
