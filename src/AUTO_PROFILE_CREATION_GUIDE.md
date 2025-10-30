# DevTrack Africa - Automatic Profile Creation Guide

This guide explains how the automatic profile creation system works in DevTrack Africa and how to verify it's set up correctly.

## How It Works

When a user signs up through Supabase Auth, the following happens automatically:

1. **User Registration**: User creates account with email, password, and metadata (name, country, phone)
2. **Auth Record Created**: Supabase creates a record in `auth.users` table
3. **Trigger Fires**: The `on_auth_user_created` trigger automatically fires
4. **Profile Created**: The `handle_new_user()` function creates a profile in `public.users` table
5. **Data Mapped**: Registration data is automatically mapped to the profile fields

## Database Components

### Tables
- `auth.users` - Supabase authentication table (managed by Supabase)
- `public.users` - User profiles table (managed by our app)

### Functions
- `handle_new_user()` - Creates user profile from auth metadata
- `handle_updated_at()` - Updates timestamps when records change

### Triggers
- `on_auth_user_created` - Fires when new user signs up
- `update_users_updated_at` - Updates timestamp on profile changes

## Setup Verification

### 1. Run the Database Setup Script
Copy and paste the complete SQL script from the Database Setup Helper into your Supabase SQL Editor.

### 2. Test the Setup
1. Go to the Database Setup Helper
2. Click on the "Profile Tester" tab
3. Run the database tests to verify all components are working

### 3. Manual Verification
You can manually verify the setup by:

```sql
-- Check if users table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Check if trigger function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 4. Test with New User
1. Create a test user account
2. Check if profile was automatically created:

```sql
-- Replace 'user-id-here' with actual user ID
SELECT * FROM public.users WHERE id = 'user-id-here';
```

## Data Mapping

| Auth Metadata | Profile Field | Description |
|---------------|---------------|-------------|
| `email` | `email` | User's email address |
| `raw_user_meta_data.full_name` | `full_name` | User's full name |
| `raw_user_meta_data.country` | `country` | User's country |
| `raw_user_meta_data.phone` | `phone` | User's phone number |
| `id` | `id` | User's unique identifier |
| `created_at` | `created_at` | Account creation timestamp |

## Troubleshooting

### Profile Not Created for Existing Users
If you signed up before setting up the database, your profile won't exist. The auto-creation only works for new signups after the database setup is complete.

**Solution**: Manually create your profile or re-register with a new account.

### Trigger Not Firing
Check if the trigger and function exist:

```sql
-- Check trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check function exists  
SELECT * FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### Permission Issues
Ensure the function has proper security:

```sql
-- The function should be SECURITY DEFINER
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### Missing User Data
If profile exists but data is missing, check the auth metadata:

```sql
-- Check auth user metadata
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = 'user-id-here';
```

## Row Level Security

The users table has RLS policies that:
- Allow all users to view public profiles
- Allow users to update their own profiles  
- Allow users to insert their own profiles
- Automatic profile creation bypasses RLS using SECURITY DEFINER

## Testing Checklist

- [ ] Database connection working
- [ ] Users table exists
- [ ] `handle_new_user` function exists
- [ ] `on_auth_user_created` trigger exists
- [ ] Current user has profile record
- [ ] Profile data matches auth metadata
- [ ] New user registration creates profile automatically

## Support

If you're having issues with automatic profile creation:

1. Run the Database Setup Helper tests
2. Check the browser console for errors
3. Verify your Supabase configuration
4. Ensure you have proper database permissions
5. Try creating a new test account to verify the trigger works

The system is designed to be robust and work even when the database isn't available, creating local profiles from auth metadata as a fallback.