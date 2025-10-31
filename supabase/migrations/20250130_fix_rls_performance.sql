-- Migration: Fix RLS Performance Issues
-- Description: Optimize RLS policies by wrapping auth.uid() in subqueries
-- Date: 2025-01-30
-- Issue: Supabase Performance Advisor flagged 34 warnings about auth function re-evaluation

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);


-- ============================================================================
-- PORTFOLIOS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own portfolio" ON public.portfolios;
CREATE POLICY "Users can read own portfolio"
ON public.portfolios FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own portfolio" ON public.portfolios;
CREATE POLICY "Users can create own portfolio"
ON public.portfolios FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own portfolio" ON public.portfolios;
CREATE POLICY "Users can update own portfolio"
ON public.portfolios FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- ASSESSMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
CREATE POLICY "Users can view their own assessments"
ON public.assessments FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.assessments;
CREATE POLICY "Users can insert their own assessments"
ON public.assessments FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
CREATE POLICY "Users can update their own assessments"
ON public.assessments FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.achievements;
CREATE POLICY "Users can view their own achievements"
ON public.achievements FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;
CREATE POLICY "Users can insert their own achievements"
ON public.achievements FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- CONFIDENCE_HISTORY TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own confidence history" ON public.confidence_history;
CREATE POLICY "Users can view their own confidence history"
ON public.confidence_history FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own confidence history" ON public.confidence_history;
CREATE POLICY "Users can insert their own confidence history"
ON public.confidence_history FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- USER_TERM_VIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own term views" ON public.user_term_views;
CREATE POLICY "Users can view own term views"
ON public.user_term_views FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own term views" ON public.user_term_views;
CREATE POLICY "Users can insert own term views"
ON public.user_term_views FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- USER_LESSON_PROGRESS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can view own lesson progress"
ON public.user_lesson_progress FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can insert own lesson progress"
ON public.user_lesson_progress FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can update own lesson progress"
ON public.user_lesson_progress FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can delete own lesson progress"
ON public.user_lesson_progress FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- PAGE_VIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own page views" ON public.page_views;
CREATE POLICY "Users can view their own page views"
ON public.page_views FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own page views" ON public.page_views;
CREATE POLICY "Users can insert their own page views"
ON public.page_views FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- LESSON_SUGGESTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own lesson suggestions" ON public.lesson_suggestions;
CREATE POLICY "Users can view own lesson suggestions"
ON public.lesson_suggestions FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson suggestions" ON public.lesson_suggestions;
CREATE POLICY "Users can insert own lesson suggestions"
ON public.lesson_suggestions FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own lesson suggestions" ON public.lesson_suggestions;
CREATE POLICY "Users can update own lesson suggestions"
ON public.lesson_suggestions FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- USER_SESSIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage their own sessions"
ON public.user_sessions FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- LESSON_VIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own lesson views" ON public.lesson_views;
CREATE POLICY "Users can manage their own lesson views"
ON public.lesson_views FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- ANALYTICS_EVENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own events" ON public.analytics_events;
CREATE POLICY "Users can view their own events"
ON public.analytics_events FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own events" ON public.analytics_events;
CREATE POLICY "Users can insert their own events"
ON public.analytics_events FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- HOLDINGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own holdings" ON public.holdings;
CREATE POLICY "Users can view own holdings"
ON public.holdings FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own holdings" ON public.holdings;
CREATE POLICY "Users can insert own holdings"
ON public.holdings FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own holdings" ON public.holdings;
CREATE POLICY "Users can update own holdings"
ON public.holdings FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own holdings" ON public.holdings;
CREATE POLICY "Users can delete own holdings"
ON public.holdings FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- WATCHLIST TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
CREATE POLICY "Users can view own watchlist"
ON public.watchlist FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can add to own watchlist" ON public.watchlist;
CREATE POLICY "Users can add to own watchlist"
ON public.watchlist FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove from own watchlist" ON public.watchlist;
CREATE POLICY "Users can remove from own watchlist"
ON public.watchlist FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- MARKET_DATA_HISTORY TABLE - Fix Duplicate Policies
-- ============================================================================

-- Remove duplicate permissive policies and consolidate into one
DROP POLICY IF EXISTS "Allow select on market_data_history" ON public.market_data_history;
DROP POLICY IF EXISTS "Public can view market history" ON public.market_data_history;

-- Create single optimized policy for market data (public read access)
CREATE POLICY "Authenticated users can view market history"
ON public.market_data_history FOR SELECT
TO authenticated
USING (true);


-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this after migration to verify all policies are optimized:
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   CASE
--     WHEN qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%'
--     THEN 'NEEDS_FIX'
--     ELSE 'OK'
--   END as status
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY status DESC, tablename, policyname;
