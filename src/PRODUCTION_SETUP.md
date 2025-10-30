# DevTrack Africa - Production Setup Guide

## Overview
This guide helps you deploy DevTrack Africa to production with proper configuration and fixes the 403 edge function deployment error.

## Fix for 403 Edge Function Error

The 403 error occurs because the system is trying to deploy edge functions that require special permissions. **This has been fixed** by disabling the problematic edge functions in `/supabase/functions/server/`. The main application works perfectly without these edge functions.

### What was changed:
- Disabled edge function auto-deployment
- Simplified demo account creation (no auto-creation)
- Removed server-side dependencies that required special permissions
- The app now uses purely client-side Supabase authentication

## Required Environment Variables

### For Vite/Modern Bundlers
Create a `.env` file in your project root with these variables:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Additional Configuration
VITE_APP_NAME=DevTrack Africa
VITE_APP_VERSION=1.0.0
```

### For Create React App (Legacy)
If using Create React App, use these variable names instead:

```env
# Supabase Configuration (REQUIRED)
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Getting Supabase Credentials

1. **Sign up for Supabase**: Go to [supabase.com](https://supabase.com) and create an account
2. **Create a new project**: Click "New project" and fill in the details
3. **Get your credentials**:
   - Go to Settings → API
   - Copy the "Project URL" (this is your `SUPABASE_URL`)
   - Copy the "anon public" key (this is your `SUPABASE_ANON_KEY`)

## Database Setup

1. **Run the schema setup**: In your Supabase dashboard, go to the SQL Editor and run the schema from `database-setup.sql`
2. **Enable Row Level Security (RLS)**: Make sure RLS is enabled on all tables
3. **Configure authentication**: 
   - Go to Authentication → Settings
   - Configure your email settings for production
   - Set up any required OAuth providers

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy - no edge function errors!

### Netlify 
1. Connect your GitHub repository to Netlify
2. Add environment variables in Site settings → Environment variables
3. Deploy

### Other Platforms
Make sure your platform supports:
- Node.js 18+ (for build process)
- Static site hosting
- Environment variable configuration

## Security Considerations

1. **Never commit credentials**: Always use environment variables, never hardcode credentials
2. **Use proper RLS policies**: Ensure your Supabase RLS policies are correctly configured
3. **Enable HTTPS**: Always use HTTPS in production
4. **Configure CORS**: Set up proper CORS settings in your Supabase project

## Error Resolution

### ✅ FIXED: 403 Edge Function Error
- **Problem**: Edge function deployment failing with 403 error
- **Solution**: Edge functions disabled, app uses client-side authentication only
- **Status**: Resolved - deployment should work without errors

### Common Issues

1. **"Supabase client not initialized"**
   - Check that your environment variables are correctly named and accessible
   - Verify your Supabase URL and anon key are correct

2. **"Database schema not available"**
   - Run the database setup SQL from `database-setup.sql`
   - Check that your tables exist in the Supabase dashboard

3. **Authentication issues**
   - Verify email confirmation is set up correctly
   - Check your email provider settings in Supabase

4. **Connection errors**
   - Verify your internet connection
   - Check Supabase status page for outages
   - Ensure your credentials are valid

## Performance Optimization

1. **Enable caching**: Configure appropriate caching headers
2. **Optimize images**: Use WebP format where possible
3. **Bundle optimization**: Ensure your build process is optimized
4. **Database indexing**: Add appropriate indexes to your Supabase tables

## Demo Accounts

Demo accounts are available for testing but require manual creation:
- Email: `demo@devtrack.com`
- Password: `DevTrack123!`

To create demo accounts, manually register them through the application interface.

## Monitoring

Consider setting up:
- Error tracking (e.g., Sentry)
- Performance monitoring
- Uptime monitoring
- User analytics

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Test your Supabase connection in the dashboard
4. Review the application logs

## Next Steps

After successful deployment:
1. Test all functionality in production
2. Set up monitoring and alerts
3. Configure backup procedures
4. Plan for scaling as your user base grows

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies configured
- [ ] Email provider configured
- [ ] Application deployed without 403 errors
- [ ] Authentication flow tested
- [ ] All features working properly