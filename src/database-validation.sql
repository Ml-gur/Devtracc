-- DevTrack Africa - Database Validation Script
-- Run this to verify that all database components are properly set up

-- Check if all required tables exist
SELECT 'Checking table existence...' AS check_type;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
        THEN '✅ users table exists'
        ELSE '❌ users table missing'
    END AS users_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') 
        THEN '✅ projects table exists'
        ELSE '❌ projects table missing'
    END AS projects_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') 
        THEN '✅ tasks table exists'
        ELSE '❌ tasks table missing'
    END AS tasks_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') 
        THEN '✅ posts table exists'
        ELSE '❌ posts table missing'
    END AS posts_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') 
        THEN '✅ messages table exists'
        ELSE '❌ messages table missing'
    END AS messages_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') 
        THEN '✅ notifications table exists'
        ELSE '❌ notifications table missing'
    END AS notifications_table;

-- Check if all required columns exist in projects table
SELECT 'Checking projects table columns...' AS check_type;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category' AND table_schema = 'public') 
        THEN '✅ category column exists'
        ELSE '❌ category column missing'
    END AS category_column,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_public' AND table_schema = 'public') 
        THEN '✅ is_public column exists'
        ELSE '❌ is_public column missing'
    END AS is_public_column,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'progress_percentage' AND table_schema = 'public') 
        THEN '✅ progress_percentage column exists'
        ELSE '❌ progress_percentage column missing'
    END AS progress_percentage_column,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'github_url' AND table_schema = 'public') 
        THEN '✅ github_url column exists'
        ELSE '❌ github_url column missing'
    END AS github_url_column,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'images' AND table_schema = 'public') 
        THEN '✅ images column exists'
        ELSE '❌ images column missing'
    END AS images_column,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'likes' AND table_schema = 'public') 
        THEN '✅ likes column exists'
        ELSE '❌ likes column missing'
    END AS likes_column;

-- Check if triggers exist
SELECT 'Checking triggers...' AS check_type;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
        THEN '✅ Auto profile creation trigger exists'
        ELSE '❌ Auto profile creation trigger missing'
    END AS auto_profile_trigger,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_users_updated_at') 
        THEN '✅ Users update trigger exists'
        ELSE '❌ Users update trigger missing'
    END AS users_update_trigger,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_projects_updated_at') 
        THEN '✅ Projects update trigger exists'
        ELSE '❌ Projects update trigger missing'
    END AS projects_update_trigger;

-- Check if functions exist
SELECT 'Checking functions...' AS check_type;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user' AND routine_schema = 'public') 
        THEN '✅ handle_new_user function exists'
        ELSE '❌ handle_new_user function missing'
    END AS handle_new_user_function,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_profile' AND routine_schema = 'public') 
        THEN '✅ get_user_profile function exists'
        ELSE '❌ get_user_profile function missing'
    END AS get_user_profile_function,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_user_profile' AND routine_schema = 'public') 
        THEN '✅ update_user_profile function exists'
        ELSE '❌ update_user_profile function missing'
    END AS update_user_profile_function,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_project' AND routine_schema = 'public') 
        THEN '✅ create_project function exists'
        ELSE '❌ create_project function missing'
    END AS create_project_function;

-- Check if RLS is enabled
SELECT 'Checking Row Level Security...' AS check_type;

SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS enabled'
        ELSE '❌ RLS disabled'
    END AS rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'projects', 'tasks', 'posts', 'comments', 'likes', 'messages', 'notifications')
ORDER BY tablename;

-- Check if policies exist
SELECT 'Checking RLS Policies...' AS check_type;

SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'SELECT' THEN '👁️ SELECT'
        WHEN cmd = 'INSERT' THEN '➕ INSERT'
        WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
        WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
        WHEN cmd = 'ALL' THEN '🔓 ALL'
        ELSE cmd
    END AS operation
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'projects', 'tasks', 'posts', 'comments', 'likes', 'messages', 'notifications')
ORDER BY tablename, operation;

-- Check indexes
SELECT 'Checking indexes...' AS check_type;

SELECT 
    tablename,
    indexname,
    '✅ Index exists' AS status
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('users', 'projects', 'tasks', 'posts', 'comments', 'messages', 'notifications')
ORDER BY tablename, indexname;

-- Final validation summary
SELECT 'Database Validation Summary' AS summary;

WITH validation_counts AS (
    SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'projects', 'tasks', 'posts', 'comments', 'likes', 'messages', 'notifications', 'collaborations', 'project_likes', 'project_comments')) AS table_count,
        (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%devtrack%' OR trigger_name IN ('on_auth_user_created', 'update_users_updated_at', 'update_projects_updated_at')) AS trigger_count,
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('handle_new_user', 'get_user_profile', 'update_user_profile', 'create_project')) AS function_count,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS policy_count
)
SELECT 
    CASE 
        WHEN table_count >= 8 THEN '✅ All essential tables present (' || table_count || ' tables)'
        ELSE '❌ Missing tables (' || table_count || ' of 8+ expected)'
    END AS tables_status,
    CASE 
        WHEN trigger_count >= 2 THEN '✅ Essential triggers present (' || trigger_count || ' triggers)'
        ELSE '❌ Missing triggers (' || trigger_count || ' triggers)'
    END AS triggers_status,
    CASE 
        WHEN function_count >= 3 THEN '✅ Essential functions present (' || function_count || ' functions)'
        ELSE '❌ Missing functions (' || function_count || ' functions)'
    END AS functions_status,
    CASE 
        WHEN policy_count >= 10 THEN '✅ RLS policies configured (' || policy_count || ' policies)'
        ELSE '❌ Insufficient RLS policies (' || policy_count || ' policies)'
    END AS policies_status
FROM validation_counts;

-- Show current table sizes (data validation) - only for existing tables
SELECT 'Current data summary...' AS check_type;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'users' THEN (SELECT COUNT(*) FROM public.users)
        WHEN table_name = 'projects' THEN (SELECT COUNT(*) FROM public.projects)
        WHEN table_name = 'tasks' THEN (SELECT COUNT(*) FROM public.tasks)
        WHEN table_name = 'posts' THEN (SELECT COUNT(*) FROM public.posts)
        WHEN table_name = 'messages' THEN (SELECT COUNT(*) FROM public.messages)
        WHEN table_name = 'notifications' THEN (SELECT COUNT(*) FROM public.notifications)
        ELSE 0
    END AS record_count,
    CASE 
        WHEN table_name = 'users' THEN '👥 User profiles'
        WHEN table_name = 'projects' THEN '🚀 Projects'
        WHEN table_name = 'tasks' THEN '✅ Tasks'
        WHEN table_name = 'posts' THEN '📝 Community posts'
        WHEN table_name = 'messages' THEN '💬 Messages'
        WHEN table_name = 'notifications' THEN '🔔 Notifications'
        ELSE 'Unknown'
    END AS description
FROM (
    SELECT table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'projects', 'tasks', 'posts', 'messages', 'notifications')
) existing_tables
ORDER BY table_name;

SELECT '🎉 DevTrack Africa database validation complete!' AS final_status;