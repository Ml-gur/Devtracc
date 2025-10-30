# DevTrack Africa Testing Guide

## 🚀 How to Test Your DevTrack Application

Since I cannot perform interactive browser testing, this guide provides you with **automated testing tools** and **manual testing instructions** to verify all functionality.

## 🧪 Automated Testing Suite

I've created a comprehensive automated testing suite that you can run directly in your application:

### Access the Testing Dashboard

1. **Login to DevTrack** with any account
2. **Navigate to the Testing tab** in the sidebar (new tab with test tube icon)
3. **Click "Run Full Test Suite"** to execute all tests
4. **Review results** in the detailed dashboard

### Quick Tests Available

- **Database Connection Test** - Verifies Supabase connectivity
- **Authentication Test** - Checks current user session
- **Projects Test** - Validates project CRUD operations
- **Posts Test** - Verifies community posting functionality

## 🔧 Manual Testing with Browser Console

Copy and paste these commands into your browser's developer console (F12):

### Test Database Connection
```javascript
// Test if database is accessible
const testDB = async () => {
  const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
  console.log('Database Test:', error ? 'FAILED' : 'PASSED', { data, error });
  return !error;
};
testDB();
```

### Test Current User Authentication
```javascript
// Check authentication state
const testAuth = async () => {
  const { data, error } = await supabase.auth.getUser();
  console.log('Auth Test:', error ? 'FAILED' : 'PASSED');
  console.log('Current User:', data.user?.email || 'None');
  return { data, error };
};
testAuth();
```

### Test Project Creation
```javascript
// Test project functionality
const testProjects = async () => {
  const { data, error } = await supabase.from('projects').select('*').limit(5);
  console.log('Projects Test:', error ? 'FAILED' : 'PASSED');
  console.log(`Found ${data?.length || 0} projects`);
  if (error) console.error('Project Error:', error);
  return { data, error };
};
testProjects();
```

### Test Community Posts
```javascript
// Test community posting
const testPosts = async () => {
  const { data, error } = await supabase.from('posts').select('*, author:users(full_name)').limit(5);
  console.log('Posts Test:', error ? 'FAILED' : 'PASSED');
  console.log(`Found ${data?.length || 0} posts`);
  if (error) console.error('Posts Error:', error);
  return { data, error };
};
testPosts();
```

### Test All Tables
```javascript
// Check all required tables exist
const testAllTables = async () => {
  const tables = ['users', 'projects', 'tasks', 'posts'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact' });
      results[table] = error ? 'MISSING/ERROR' : 'EXISTS';
      if (error) console.error(`${table} error:`, error);
    } catch (e) {
      results[table] = 'FAILED';
    }
  }
  
  console.table(results);
  return results;
};
testAllTables();
```

## 📋 Pre-Testing Checklist

### 1. Database Setup Verification

**Check if your Supabase database is properly configured:**

1. **Login to Supabase Dashboard**
2. **Go to Table Editor**
3. **Verify these tables exist:**
   - `users` - User profiles
   - `projects` - User projects  
   - `tasks` - Project tasks
   - `posts` - Community posts
   - `messages` - Chat messages (optional)

4. **If tables are missing, run the setup SQL:**
   - Go to **SQL Editor** in Supabase
   - Copy and paste from either:
     - `/database-setup.sql` (uses creator_id)
     - `/database-setup-alternative.sql` (uses user_id)

### 2. Authentication Configuration

**Ensure auth is properly configured:**

1. **In Supabase → Authentication → Settings:**
   - Disable "Enable email confirmations" for testing
   - Or set up a test email service
   - Verify Site URL matches your domain

2. **Test demo accounts work:**
   - Email: `demo@devtrack.com`
   - Password: `Demo123!`

### 3. Browser Environment

**Prepare your testing environment:**

1. **Clear browser cache and localStorage**
2. **Open Developer Tools (F12)**
3. **Monitor Console tab for errors**
4. **Monitor Network tab for failed requests**

## 🧪 Systematic Testing Protocol

### Phase 1: Infrastructure Tests
1. **Run database connection test in console**
2. **Verify all tables exist**
3. **Check RLS policies (should see data or proper auth errors)**

### Phase 2: Authentication Flow
1. **Register new test account**
2. **Verify registration success/email confirmation**
3. **Login with test account**
4. **Check session persistence (refresh page)**

### Phase 3: Core Functionality
1. **Profile Management**
   - View profile
   - Edit profile information
   - Verify changes save

2. **Project Management**
   - Create new project
   - View project in list
   - Edit project details
   - Add tasks to project

3. **Task Management**
   - Create tasks in project
   - Move tasks between columns (drag/drop)
   - Mark tasks complete
   - Verify status updates

4. **Community Features**
   - Create progress post
   - View community feed
   - Verify posts appear for all users

### Phase 4: Data Persistence
1. **Logout and login again**
2. **Verify all data still exists**
3. **Test with multiple browser tabs**
4. **Check real-time updates**

## 🚨 Common Issues and Solutions

### "Cannot coerce the result to a single JSON object"
**Cause:** Database query returning 0 rows when expecting 1
**Solution:** Run automated testing suite to identify which table is empty

### "Column 'creator_id' does not exist"
**Cause:** Database uses 'user_id' instead of 'creator_id'
**Solution:** Run `database-setup-alternative.sql` instead

### "Email not confirmed" 
**Cause:** Email confirmation enabled in Supabase
**Solution:** Disable email confirmations in Supabase auth settings

### "Table does not exist"
**Cause:** Database setup not complete
**Solution:** Run database setup SQL scripts in Supabase

### Console errors with Supabase
**Cause:** Invalid project URL or API keys
**Solution:** Check environment variables and Supabase configuration

## 📊 Success Criteria

**Your application is fully functional when:**

✅ All automated tests pass (green status)
✅ No console errors during normal usage
✅ All CRUD operations work (Create, Read, Update, Delete)
✅ Real-time features work (messaging, notifications)
✅ Cross-user functionality works (posts visible between users)
✅ Data persists across login/logout cycles
✅ Mobile responsiveness works properly

## 🎯 Quick Verification Commands

**Run all these in your browser console for immediate verification:**

```javascript
// Complete system check
const quickSystemCheck = async () => {
  console.log('🚀 DevTrack System Check');
  console.log('========================');
  
  // 1. Auth check
  const auth = await supabase.auth.getUser();
  console.log('1. Auth:', auth.error ? '❌ FAILED' : '✅ PASSED');
  
  // 2. Database check
  const db = await supabase.from('users').select('count', { count: 'exact' });
  console.log('2. Database:', db.error ? '❌ FAILED' : '✅ PASSED');
  
  // 3. Tables check
  const tables = ['users', 'projects', 'tasks', 'posts'];
  for (let table of tables) {
    const test = await supabase.from(table).select('count', { count: 'exact' });
    console.log(`3. Table ${table}:`, test.error ? '❌ MISSING' : '✅ EXISTS');
  }
  
  console.log('========================');
  console.log('Check complete! Any ❌ items need attention.');
};

quickSystemCheck();
```

## 🔧 Debugging Failed Tests

**When tests fail:**

1. **Check the exact error message** in console output
2. **Look for patterns** in the error (table missing, column error, auth error)
3. **Verify Supabase configuration** matches your environment
4. **Check the testing dashboard** for detailed error information
5. **Run individual quick tests** to isolate the problem
6. **Review the database setup** if multiple tests fail

## 📞 Support

If you encounter issues during testing:

1. **Check the automated test results** for specific error messages
2. **Review console logs** for JavaScript errors
3. **Verify Supabase project settings** match requirements
4. **Run the provided console commands** to diagnose issues
5. **Check database table structure** matches expected schema

The automated testing suite will provide detailed feedback on exactly what's working and what needs attention.