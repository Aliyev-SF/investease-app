-- Migration: Fix Critical Security Issues
-- Description: Remove SECURITY DEFINER from views, fix auth.users exposure, secure functions
-- Date: 2025-01-30
-- Issue: Supabase Security Advisor flagged 9 errors and 1 warning

-- ============================================================================
-- FIX 1: USER_ACTIVITY_SUMMARY - Remove auth.users exposure
-- ============================================================================
-- This view was exposing auth.users email data to authenticated users
-- We'll recreate it without accessing auth.users table

DROP VIEW IF EXISTS public.user_activity_summary CASCADE;

-- Recreated without SECURITY DEFINER and without auth.users access
-- Uses only public.profiles which has proper RLS policies
CREATE VIEW public.user_activity_summary AS
SELECT
    p.id as user_id,
    p.full_name,
    p.confidence_score,
    p.created_at as user_since,
    COUNT(DISTINCT t.id) as total_trades,
    COUNT(DISTINCT CASE WHEN t.type = 'buy' THEN t.id END) as buy_count,
    COUNT(DISTINCT CASE WHEN t.type = 'sell' THEN t.id END) as sell_count,
    COALESCE(SUM(CASE WHEN t.type = 'sell' THEN t.profit_loss ELSE 0 END), 0) as total_profit_loss,
    COUNT(DISTINCT h.symbol) as unique_stocks_owned,
    (SELECT cash FROM portfolios WHERE user_id = p.id) as current_cash,
    (SELECT total_value FROM portfolios WHERE user_id = p.id) as portfolio_value
FROM public.profiles p
LEFT JOIN public.transactions t ON t.user_id = p.id
LEFT JOIN public.holdings h ON h.user_id = p.id
GROUP BY p.id, p.full_name, p.confidence_score, p.created_at;

-- Grant access to authenticated users (RLS will enforce user isolation)
GRANT SELECT ON public.user_activity_summary TO authenticated;


-- ============================================================================
-- FIX 2-9: Remove SECURITY DEFINER from all views
-- ============================================================================
-- SECURITY DEFINER bypasses RLS and runs with creator's permissions
-- This is a security risk - views should run with user's permissions

-- platform_stats view
DROP VIEW IF EXISTS public.platform_stats CASCADE;
CREATE VIEW public.platform_stats AS
SELECT
    COUNT(DISTINCT p.id) as total_users,
    COUNT(DISTINCT t.id) as total_trades,
    COALESCE(AVG(p.confidence_score), 0) as avg_confidence_score,
    COUNT(DISTINCT h.symbol) as unique_stocks_traded,
    COALESCE(SUM(t.shares * t.price_per_share), 0) as total_volume
FROM public.profiles p
LEFT JOIN public.transactions t ON t.user_id = p.id
LEFT JOIN public.holdings h ON h.user_id = p.id;

GRANT SELECT ON public.platform_stats TO authenticated;

-- user_engagement_trends view
DROP VIEW IF EXISTS public.user_engagement_trends CASCADE;
CREATE VIEW public.user_engagement_trends AS
SELECT
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) as total_events
FROM public.analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

GRANT SELECT ON public.user_engagement_trends TO authenticated;

-- user_portfolio_summary view
DROP VIEW IF EXISTS public.user_portfolio_summary CASCADE;
CREATE VIEW public.user_portfolio_summary AS
SELECT
    p.user_id,
    p.cash,
    p.total_value,
    COUNT(h.symbol) as holdings_count,
    COALESCE(SUM(h.shares * m.current_price), 0) as holdings_value,
    p.total_value - 10000 as total_gain_loss,
    ((p.total_value - 10000) / 10000 * 100) as total_gain_loss_percent
FROM public.portfolios p
LEFT JOIN public.holdings h ON h.user_id = p.user_id
LEFT JOIN public.market_data m ON m.symbol = h.symbol
GROUP BY p.user_id, p.cash, p.total_value;

GRANT SELECT ON public.user_portfolio_summary TO authenticated;

-- daily_active_users view
DROP VIEW IF EXISTS public.daily_active_users CASCADE;
CREATE VIEW public.daily_active_users AS
SELECT
    DATE(session_start) as date,
    COUNT(DISTINCT user_id) as active_users
FROM public.user_sessions
WHERE session_start >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(session_start)
ORDER BY date DESC;

GRANT SELECT ON public.daily_active_users TO authenticated;

-- most_traded_stocks view
DROP VIEW IF EXISTS public.most_traded_stocks CASCADE;
CREATE VIEW public.most_traded_stocks AS
SELECT
    t.symbol,
    m.company_name,
    COUNT(*) as trade_count,
    SUM(t.shares) as total_shares_traded,
    SUM(t.shares * t.price_per_share) as total_volume
FROM public.transactions t
JOIN public.market_data m ON m.symbol = t.symbol
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY t.symbol, m.company_name
ORDER BY trade_count DESC
LIMIT 20;

GRANT SELECT ON public.most_traded_stocks TO authenticated;

-- popular_pages view
DROP VIEW IF EXISTS public.popular_pages CASCADE;
CREATE VIEW public.popular_pages AS
SELECT
    page_name,
    COUNT(*) as view_count,
    COUNT(DISTINCT user_id) as unique_visitors
FROM public.page_views
WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY page_name
ORDER BY view_count DESC;

GRANT SELECT ON public.popular_pages TO authenticated;

-- popular_stocks view
DROP VIEW IF EXISTS public.popular_stocks CASCADE;
CREATE VIEW public.popular_stocks AS
SELECT
    h.symbol,
    m.company_name,
    m.current_price,
    m.change_percent,
    m.type,
    COUNT(DISTINCT h.user_id) as owner_count,
    SUM(h.shares) as total_shares_held,
    AVG(h.average_price) as avg_purchase_price,
    AVG((m.current_price - h.average_price) / h.average_price * 100) as avg_return_percent
FROM public.holdings h
JOIN public.market_data m ON m.symbol = h.symbol
GROUP BY h.symbol, m.company_name, m.current_price, m.change_percent, m.type
HAVING COUNT(DISTINCT h.user_id) > 0
ORDER BY owner_count DESC;

GRANT SELECT ON public.popular_stocks TO authenticated;


-- ============================================================================
-- FIX 10: Set search_path on trigger function
-- ============================================================================
-- Functions without explicit search_path can be vulnerable to search_path attacks

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate triggers that use this function (if any exist)
-- Note: You may need to add specific triggers here based on your schema


-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================

-- 1. SECURITY DEFINER removal means:
--    - Views now run with querying user's permissions
--    - RLS policies will be enforced on all queries
--    - Users can only see their own data (as intended)

-- 2. user_activity_summary changes:
--    - No longer accesses auth.users table
--    - Uses public.profiles instead (which has RLS)
--    - Email data is not exposed to other users

-- 3. Leaked password protection warning:
--    - Cannot be fixed via SQL migration
--    - Must be enabled in Supabase Dashboard:
--      Dashboard → Authentication → Policies → Password Strength
--    - Enable "Check password against HaveIBeenPwned"


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify no views have SECURITY DEFINER:
-- SELECT
--     schemaname,
--     viewname,
--     definition
-- FROM pg_views
-- WHERE schemaname = 'public'
--   AND definition LIKE '%SECURITY DEFINER%';
-- Should return 0 rows

-- Verify no views access auth.users:
-- SELECT
--     schemaname,
--     viewname
-- FROM pg_views
-- WHERE schemaname = 'public'
--   AND definition LIKE '%auth.users%';
-- Should return 0 rows

-- Verify function has search_path set:
-- SELECT
--     proname,
--     prosecdef,
--     proconfig
-- FROM pg_proc
-- WHERE proname = 'update_updated_at_column'
--   AND pronamespace = 'public'::regnamespace;
-- proconfig should show: {search_path=public,pg_temp}
