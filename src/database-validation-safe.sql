-- DevTrack Africa - Safe Database Validation Script
-- This script safely checks database components without failing if tables don't exist

-- Check if all required tables exist
SELECT 'DATABASE VALIDATION REPORT FOR DEVTRACK AFRICA' AS report_header;
SELECT '======================================================' AS separator;

SELECT 'TABLE EXISTENCE CHECK' AS check_section;

SELECT 
    'users' AS table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
        THEN 'User profiles and authentication data'
        ELSE 'REQUIRED: Run database-complete-fix.sql'
    END AS description

UNION ALL

SELECT 
    'projects' AS table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') 
        THEN 'Project management data'
        ELSE 'REQUIRED: Run database-complete-fix.sql'
    END AS description

UNION ALL

SELECT 
    'tasks' AS table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') 
        THEN 'Task and Kanban board data'
        ELSE 'REQUIRED: Run database-complete-fix.sql'
    END AS description

UNION ALL

SELECT 
    'posts' AS table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') 
        THEN 'Community posts and updates'
        ELSE 'REQUIRED: Run database-complete-fix.sql'
    END AS description

UNION ALL

SELECT 
    'messages' AS table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') 
        THEN 'Direct and project messaging'
        ELSE 'REQUIRED: Run database-complete-fix.sql'
    END AS description

UNION ALL

SELECT 
    'notifications' AS table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') 
        THEN 'User notifications and alerts'
        ELSE 'REQUIRED: Run database-complete-fix.sql'
    END AS description

ORDER BY table_name;

SELECT '======================================================' AS separator;
SELECT 'CRITICAL COLUMNS CHECK (Projects Table)' AS check_section;

-- Check if critical columns exist in projects table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
        RAISE NOTICE 'Projects table exists - checking columns...';
    ELSE
        RAISE NOTICE 'Projects table does not exist - skipping column check';
    END IF;
END $$;

SELECT 
    column_name,
    CASE 
        WHEN column_name IN ('category', 'is_public', 'progress_percentage', 'github_url', 'images', 'likes')
        THEN '✅ CRITICAL COLUMN'
        ELSE '📋 Standard column'
    END AS importance,
    data_type,
    CASE 
        WHEN is_nullable = 'YES' THEN 'Nullable'
        ELSE 'Required'
    END AS constraints
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public'
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public')
ORDER BY 
    CASE WHEN column_name IN ('category', 'is_public', 'progress_percentage', 'github_url', 'images', 'likes') THEN 1 ELSE 2 END,
    column_name;

SELECT '======================================================' AS separator;
SELECT 'TRIGGERS AND FUNCTIONS CHECK' AS check_section;

-- Check if auto-profile creation trigger exists
SELECT 
    'Auto Profile Creation' AS component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
        THEN '✅ TRIGGER ACTIVE'
        ELSE '❌ TRIGGER MISSING'
    END AS trigger_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user' AND routine_schema = 'public') 
        THEN '✅ FUNCTION EXISTS'
        ELSE '❌ FUNCTION MISSING'
    END AS function_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
        AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user' AND routine_schema = 'public')
        THEN 'Users will be automatically created when they sign up'
        ELSE 'CRITICAL: Auto profile creation not working!'
    END AS description;

SELECT '======================================================' AS separator;
SELECT 'ROW LEVEL SECURITY CHECK' AS check_section;

-- Check RLS status for critical tables
SELECT 
    tablename AS table_name,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END AS rls_status,
    CASE 
        WHEN rowsecurity = true THEN 'Data is properly secured'
        ELSE 'SECURITY RISK: Enable RLS for data protection'
    END AS security_note
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'projects', 'tasks', 'posts', 'messages', 'notifications')
ORDER BY tablename;

SELECT '======================================================' AS separator;
SELECT 'DATA SUMMARY (Existing Tables Only)' AS check_section;

-- Safe data count for existing tables
WITH table_counts AS (
    SELECT 
        t.table_name,
        CASE t.table_name
            WHEN 'users' THEN COALESCE((SELECT COUNT(*) FROM public.users), 0)
            WHEN 'projects' THEN COALESCE((SELECT COUNT(*) FROM public.projects), 0)
            WHEN 'tasks' THEN COALESCE((SELECT COUNT(*) FROM public.tasks), 0)
            WHEN 'posts' THEN COALESCE((SELECT COUNT(*) FROM public.posts), 0)
            WHEN 'messages' THEN COALESCE((SELECT COUNT(*) FROM public.messages), 0)
            WHEN 'notifications' THEN COALESCE((SELECT COUNT(*) FROM public.notifications), 0)
            ELSE 0
        END AS record_count,
        CASE t.table_name
            WHEN 'users' THEN '👥 User profiles'
            WHEN 'projects' THEN '🚀 Projects'
            WHEN 'tasks' THEN '✅ Tasks'
            WHEN 'posts' THEN '📝 Community posts'
            WHEN 'messages' THEN '💬 Messages'
            WHEN 'notifications' THEN '🔔 Notifications'
            ELSE 'Other'
        END AS description
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
    AND t.table_name IN ('users', 'projects', 'tasks', 'posts', 'messages', 'notifications')
)
SELECT 
    table_name,
    record_count,
    description,
    CASE 
        WHEN record_count = 0 THEN 'Empty table (ready for data)'
        WHEN record_count < 10 THEN 'Few records (development/testing)'
        WHEN record_count < 100 THEN 'Moderate usage'
        ELSE 'Active usage'
    END AS usage_level
FROM table_counts
ORDER BY table_name;

SELECT '======================================================' AS separator;
SELECT 'VALIDATION SUMMARY' AS check_section;

-- Overall validation summary
WITH validation_summary AS (
    SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'projects', 'tasks', 'posts', 'messages', 'notifications')) AS existing_tables,
        6 AS required_tables,
        (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') AS critical_triggers,
        1 AS required_triggers,
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('users', 'projects', 'tasks', 'posts', 'messages', 'notifications')) AS secured_tables
)
SELECT 
    CASE 
        WHEN existing_tables = required_tables THEN '✅ ALL TABLES PRESENT'
        WHEN existing_tables >= 4 THEN '⚠️ MOST TABLES PRESENT'
        WHEN existing_tables >= 2 THEN '❌ SOME TABLES MISSING'
        ELSE '🚨 CRITICAL: MOST TABLES MISSING'
    END AS table_status,
    
    CASE 
        WHEN critical_triggers = required_triggers THEN '✅ AUTO-PROFILE WORKING'
        ELSE '❌ AUTO-PROFILE BROKEN'
    END AS profile_creation_status,
    
    CASE 
        WHEN secured_tables >= 4 THEN '✅ SECURITY CONFIGURED'
        WHEN secured_tables >= 2 THEN '⚠️ PARTIAL SECURITY'
        ELSE '🚨 SECURITY NOT CONFIGURED'
    END AS security_status,
    
    existing_tables || '/' || required_tables AS table_ratio,
    secured_tables || '/' || existing_tables AS security_ratio
FROM validation_summary;

SELECT '======================================================' AS separator;

-- Final recommendation
WITH validation_check AS (
    SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'projects', 'tasks', 'posts', 'messages', 'notifications')) AS existing_tables,
        (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') AS auto_profile_triggers
)
SELECT 
    CASE 
        WHEN existing_tables >= 6 AND auto_profile_triggers >= 1 THEN 
            '🎉 DATABASE IS READY! DevTrack Africa can run with full functionality.'
        WHEN existing_tables >= 4 THEN 
            '⚠️ PARTIAL SETUP: Run /database-complete-fix.sql to complete setup.'
        WHEN existing_tables >= 2 THEN 
            '❌ INCOMPLETE SETUP: Run /database-complete-fix.sql to add missing tables.'
        ELSE 
            '🚨 NO SETUP: Run /database-complete-fix.sql to create all required tables.'
    END AS final_recommendation,
    
    CASE 
        WHEN existing_tables < 6 THEN 'Copy and paste the entire content of /database-complete-fix.sql into your Supabase SQL Editor and run it.'
        WHEN auto_profile_triggers < 1 THEN 'Auto-profile creation is not working. Re-run /database-complete-fix.sql to fix triggers.'
        ELSE 'Your database is properly configured for DevTrack Africa!'
    END AS next_steps
FROM validation_check;

SELECT '🔍 DevTrack Africa Database Validation Complete!' AS validation_complete;