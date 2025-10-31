# Supabase Migrations

This directory contains SQL migration files for the InvestEase database.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to: SQL Editor
3. Copy the contents of the migration file
4. Paste and run in the SQL Editor
5. Verify in Performance Advisor that warnings are resolved

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref fhgtzkcbbrekprmakssb

# Run migration
supabase db push
```

## Migration Files

### 20250130_fix_rls_performance.sql
**Purpose:** Fix 34 RLS performance warnings from Supabase Performance Advisor

**Changes:**
- Optimizes all RLS policies by wrapping `auth.uid()` in subqueries
- Fixes duplicate policies on `market_data_history` table
- No security changes - same logic, just optimized execution

**Affected Tables:**
- profiles, portfolios, assessments, transactions
- achievements, confidence_history, user_term_views
- user_lesson_progress, page_views, lesson_suggestions
- user_sessions, lesson_views, analytics_events
- holdings, watchlist, market_data_history

**Performance Impact:**
- Prevents re-evaluation of auth functions for each row
- Reduces query execution time on user-scoped data
- Resolves all 34 RLS warnings

### 20250130_optimize_indexes.sql
**Purpose:** Optimize database indexes based on Performance Advisor suggestions

**Changes:**
- Adds missing index on `portfolios.user_id` foreign key
- Removes 24 unused indexes that add unnecessary overhead
- Indexes can be recreated later if needed for new features

**Performance Impact:**
- Foreign key queries on portfolios will be faster
- Reduces index maintenance overhead on INSERT/UPDATE/DELETE
- Frees up storage space
- Resolves all index-related warnings

### 20250130_fix_security_issues.sql
**Purpose:** Fix critical security vulnerabilities flagged by Security Advisor

**Changes:**
- Removes SECURITY DEFINER from 8 views (bypasses RLS)
- Fixes `user_activity_summary` to not expose `auth.users` data
- Sets `search_path` on `update_updated_at_column` function
- All views now properly enforce RLS policies

**Security Impact:**
- Views no longer bypass Row Level Security
- User email data from auth.users is no longer exposed
- Prevents search_path attacks on trigger function
- Resolves 9 critical security errors

**Manual Action Required:**
The "leaked password protection" warning must be enabled in Supabase Dashboard:
1. Go to: Authentication → Policies → Password Strength
2. Enable: "Check password against HaveIBeenPwned"

## Verification

After running the migration, verify policies are optimized:

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

All policies should show status = 'OK'.

Check Performance Advisor to confirm warnings are resolved.
