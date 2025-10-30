# DevTrack Africa - Complete Database Setup Guide

This guide ensures your Supabase database is properly configured with all necessary tables, triggers, policies, and functions for the DevTrack Africa platform.

## 🚀 Quick Setup (Recommended)

### Option 1: Quick Setup (Easiest) ⭐
For most users, this is the fastest way to get started:

1. **Run the quick setup script:**
   ```sql
   -- Copy and paste the entire content of /database-setup-quick.sql into your Supabase SQL Editor
   -- This includes all essential components for DevTrack Africa
   ```

2. **Validate the setup:**
   ```sql
   -- Copy and paste the entire content of /database-validation-safe.sql to verify everything works
   -- This safe version won't fail if tables don't exist yet
   ```

### Option 2: Complete Fresh Setup
If you want the most comprehensive setup with all advanced features:

1. **Run the complete fix script:**
   ```sql
   -- Copy and paste the entire content of /database-complete-fix.sql into your Supabase SQL Editor
   ```

2. **Validate the setup:**
   ```sql
   -- Copy and paste the entire content of /database-validation-safe.sql to verify everything works
   ```

### Option 3: Incremental Update
If you have an existing database and want to add missing components:

1. **Run the migration fix:**
   ```sql
   -- Copy and paste the content of /database-migration-fix.sql
   ```

2. **Then run the complete fix for any remaining components:**
   ```sql
   -- Copy and paste the content of /database-complete-fix.sql
   ```

## 📋 What Gets Set Up

### Tables Created/Updated:
- ✅ **users** - User profiles with automatic creation from auth
- ✅ **projects** - Project management with all required columns
- ✅ **tasks** - Task management with Kanban board support
- ✅ **collaborations** - Project sharing and collaboration
- ✅ **posts** - Community posts and updates
- ✅ **comments** - Comments on posts
- ✅ **project_comments** - Comments on projects
- ✅ **likes** - Likes for posts and comments
- ✅ **project_likes** - Likes for projects
- ✅ **messages** - Direct and project messaging
- ✅ **notifications** - User notifications

### Key Features:
- 🔐 **Automatic Profile Creation** - Users get profiles created automatically when they sign up
- 🛡️ **Row Level Security** - Comprehensive RLS policies for data security
- 🔄 **Auto-Timestamps** - Automatic updated_at tracking
- 📈 **Performance Indexes** - Optimized database queries
- 🎯 **Data Integrity** - Foreign key constraints and checks

### Functions Available:
- `get_user_profile(uuid)` - Fetch user profile data
- `update_user_profile(...)` - Update user profile
- `create_project(...)` - Create new projects
- `handle_new_user()` - Automatic profile creation trigger

## 🔧 Manual Setup Steps

### Step 1: Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 2: Create Tables
Run the table creation section from `database-complete-fix.sql`

### Step 3: Set Up Triggers
```sql
-- The auto-profile creation trigger is crucial
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: Configure RLS
Enable Row Level Security and create policies for all tables.

### Step 5: Grant Permissions
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

## 🧪 Testing the Setup

### 1. Run Validation Script
Execute `/database-validation.sql` to check if everything is properly set up.

### 2. Test Auto Profile Creation
1. Create a test user account through your app
2. Check if the user profile was automatically created in the `users` table
3. Verify the trigger is working correctly

### 3. Test RLS Policies
1. Try accessing data as different users
2. Verify users can only see/edit their own data
3. Test public project visibility

## 🔍 Troubleshooting

### Common Issues:

#### "Could not find column" errors
- **Solution:** Run `/database-migration-fix.sql` to add missing columns

#### Auto profile creation not working
- **Solution:** Check if the trigger exists:
  ```sql
  SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
  ```

#### RLS blocking legitimate access
- **Solution:** Review policies in `/database-complete-fix.sql` and ensure they match your needs

#### Missing functions
- **Solution:** Run the functions section from `/database-complete-fix.sql`

### Verification Queries:

#### Check table existence:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

#### Check column existence for projects:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' AND table_schema = 'public'
ORDER BY ordinal_position;
```

#### Check triggers:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

## 🎯 Key Features Enabled

### Automatic User Management
- New users automatically get profiles created
- User metadata is extracted and stored
- No manual profile setup required

### Project Management
- Full CRUD operations for projects
- Project categories and visibility settings
- Collaboration and sharing features
- Progress tracking and analytics

### Community Features
- Posts and comments system
- Like/unlike functionality
- Social interactions
- Public project showcasing

### Messaging System
- Direct messages between users
- Project-based messaging
- Read status tracking
- Real-time capabilities ready

### Security
- Row Level Security on all tables
- User isolation and data protection
- Secure function execution
- Proper permission management

## 🚨 Important Notes

1. **Backup First**: Always backup your database before running migration scripts
2. **Test Environment**: Test these scripts in a development environment first
3. **Incremental Updates**: You can run the complete fix script multiple times safely
4. **Validation**: Always run the validation script after setup
5. **Monitor Performance**: Watch for slow queries and optimize indexes as needed

## 📞 Support

If you encounter issues:
1. Run the validation script to identify specific problems
2. Check the Supabase logs for detailed error messages
3. Verify your Supabase project permissions
4. Ensure your database has sufficient resources

---

**🎉 Success!** Once setup is complete, your DevTrack Africa platform will have:
- ✅ Automatic user profile creation
- ✅ Complete project management system
- ✅ Community and social features
- ✅ Secure messaging system
- ✅ Real-time capabilities
- ✅ Robust data security

Your database is now production-ready for the DevTrack Africa platform!