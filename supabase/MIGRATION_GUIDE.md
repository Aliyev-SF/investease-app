# Supabase Migration Guide

## Overview

Three migration files have been created to fix all Supabase Advisor warnings and errors. Run them in this specific order.

## Migration Order (IMPORTANT!)

### 1. Performance: RLS Policies (34 warnings)
**File:** `20250130_fix_rls_performance.sql`
**Run First** - Fixes slow RLS policy execution

### 2. Performance: Indexes (25 issues)
**File:** `20250130_optimize_indexes.sql`
**Run Second** - Optimizes database indexes

### 3. Security: Critical Fixes (9 errors)
**File:** `20250130_fix_security_issues.sql`
**Run Third** - Fixes security vulnerabilities

## How to Run Migrations

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/fhgtzkcbbrekprmakssb

### Step 2: Navigate to SQL Editor
Dashboard → SQL Editor (left sidebar)

### Step 3: Run Each Migration File
For each file in order:

1. Open the migration file in your code editor
2. Copy the entire contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Verify it completes successfully (check for errors)
6. Move to next file

### Step 4: Manual Configuration
After running all migrations, enable leaked password protection:

1. Go to: Authentication → Policies → Password Strength
2. Enable: "Check password against HaveIBeenPwned"

## What Each Migration Does

### Migration 1: fix_rls_performance.sql

**Problem:** RLS policies using `auth.uid()` directly get re-evaluated for every row, causing slow queries.

**Solution:** Wraps `auth.uid()` in subqueries: `(select auth.uid())`

**Impact:**
- ✅ Faster queries on user-scoped data
- ✅ No security changes - same logic, optimized
- ✅ Fixes duplicate policies on market_data_history

**Affected Tables:** 16 tables with 34 policies

### Migration 2: optimize_indexes.sql

**Problem:** Missing index on foreign key + 24 unused indexes adding overhead.

**Solution:**
- Adds `idx_portfolios_user_id` index
- Removes 24 indexes that were never used

**Impact:**
- ✅ Faster foreign key queries on portfolios
- ✅ Less overhead on INSERT/UPDATE/DELETE
- ✅ Frees up storage space

**Note:** Removed indexes can be recreated later if needed for new features.

### Migration 3: fix_security_issues.sql

**Problem:** CRITICAL security vulnerabilities:
- Views using SECURITY DEFINER bypass RLS
- user_activity_summary exposes auth.users email data
- Function vulnerable to search_path attacks

**Solution:**
- Removes SECURITY DEFINER from all 8 views
- Recreates user_activity_summary without auth.users access
- Sets search_path on update_updated_at_column function

**Impact:**
- ✅ Views now enforce RLS policies
- ✅ User emails no longer exposed
- ✅ Protected against search_path attacks
- ✅ Maintains all functionality

**Affected Views:**
- user_activity_summary (fixed auth.users exposure)
- platform_stats
- user_engagement_trends
- user_portfolio_summary
- daily_active_users
- most_traded_stocks
- popular_pages
- popular_stocks

## Verification After Migration

### Check RLS Policies
Run this in SQL Editor:
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  CASE
    WHEN qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%'
    THEN 'NEEDS_FIX'
    ELSE 'OK'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY status DESC, tablename, policyname;
```
All should show status = 'OK'.

### Check Views Don't Use SECURITY DEFINER
```sql
SELECT
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
  AND definition LIKE '%SECURITY DEFINER%';
```
Should return 0 rows.

### Check Views Don't Access auth.users
```sql
SELECT
    schemaname,
    viewname
FROM pg_views
WHERE schemaname = 'public'
  AND definition LIKE '%auth.users%';
```
Should return 0 rows.

### Check Portfolios Index Exists
```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'portfolios'
  AND indexname = 'idx_portfolios_user_id';
```
Should return 1 row.

### Check Performance Advisor
1. Go to: Database → Performance Advisor
2. Verify:
   - 0 RLS warnings
   - 0 Index warnings
   - 0 Security errors

### Check Security Advisor
1. Go to: Database → Security Advisor
2. Should only show 1 warning: "Leaked Password Protection Disabled"
3. Enable it manually (see Step 4 above)

## Expected Results

### Before Migrations
- ❌ 34 RLS performance warnings
- ❌ 1 missing index error
- ❌ 24 unused index warnings
- ❌ 9 critical security errors
- ❌ 1 function security warning
- ❌ 1 leaked password warning

### After Migrations + Manual Config
- ✅ 0 RLS warnings
- ✅ 0 Index issues
- ✅ 0 Security errors
- ✅ 0 Warnings

## Rollback Plan

If something goes wrong, you can rollback:

### To rollback Migration 3 (Security):
Views will need to be manually restored from backup. Contact me if needed.

### To rollback Migration 2 (Indexes):
```sql
-- Recreate any needed indexes
CREATE INDEX idx_holdings_user_id ON public.holdings(user_id);
-- etc...
```

### To rollback Migration 1 (RLS):
Not recommended - old policies were slower. Contact me if absolutely needed.

## Common Issues

### Issue: "policy already exists"
**Solution:** The DROP POLICY IF EXISTS should handle this. If not, manually drop the policy first.

### Issue: "view depends on view"
**Solution:** Migration uses CASCADE to handle dependencies automatically.

### Issue: "permission denied"
**Solution:** Make sure you're running as database owner/postgres role.

## Support

If you encounter any issues:
1. Check the error message carefully
2. Verify you ran migrations in correct order
3. Check that previous migrations completed successfully
4. Share error messages with me for help

## Testing Checklist

After running all migrations, test these features:

- [ ] Login and view your portfolio
- [ ] Buy a stock
- [ ] Sell a stock
- [ ] View stock details page
- [ ] Add/remove from watchlist
- [ ] View Market page
- [ ] View Holdings tab
- [ ] View Transactions tab
- [ ] Check confidence score updates
- [ ] Verify other users can't see your data

All functionality should work exactly as before, just faster and more secure.
