# DevTrack Africa Database Setup Instructions

## 🚀 Quick Setup Steps

Now that you've connected to Supabase, follow these steps to set up your database:

### 1. Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Run the Database Setup Script
1. Copy the entire contents of `/database-setup.sql` from this project
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### 3. Verify Setup
After running the script, you should see:
- ✅ Tables created: `users`, `projects`, `tasks`, `posts`
- ✅ Row Level Security enabled
- ✅ Policies configured for proper access control

### 4. Test Database Connection
1. Go back to your DevTrack Africa app
2. Try creating a new project
3. The "Database setup required" error should be resolved

## 📋 What the Script Creates

### Tables:
- **users**: User profiles and authentication data
- **projects**: Project information and metadata
- **tasks**: Kanban board tasks with status tracking
- **posts**: Community feed posts and updates

### Security:
- Row Level Security (RLS) enabled on all tables
- Policies for public read access
- User-specific write permissions
- Project creator permissions for tasks

## 🔧 Troubleshooting

### If you see permission errors:
1. Make sure you're logged into Supabase with the project owner account
2. Check that RLS is properly configured
3. Verify your environment variables are correct

### If tables already exist:
The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

### Alternative Setup:
If the main script fails, there's also `/database-setup-alternative.sql` with a slightly different approach.

## 🎯 Next Steps

Once the database is set up:
1. ✅ Create your first project
2. ✅ Add tasks to the Kanban board
3. ✅ Share progress updates
4. ✅ Explore the community feed

The app is now fully functional with persistent data storage!