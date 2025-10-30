# Database Setup Guide

This guide explains how to set up the Supabase database for the Mapro project.

## Database Schema

The database consists of three main tables:

### 1. `projects` table
- Stores project information including location, customer details, and photos
- Fields: id, name, description, lat, lng, customer, project_type, address, before_photo, after_photo, timestamps

### 2. `reviews` table
- Stores customer reviews for projects
- Fields: id, project_id (foreign key), author, rating, text, created_at

### 3. `photos` table
- Stores additional photos for projects
- Fields: id, project_id (foreign key), url, type, created_at

## Setup Instructions

### 1. Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and log into your account
2. Select your project (fvrueabzpinhlzyrnhne)

### 2. Run Schema Migration

1. In the Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create the tables, indexes, and policies

### 3. Apply Development Policies

1. In the SQL Editor, copy and paste the contents of `dev-policies.sql`
2. Click "Run" to apply development policies for demo clients

### 4. Seed the Database (Optional)

1. In the SQL Editor, copy and paste the contents of `supabase-seed.sql`
2. Click "Run" to populate the database with sample data

### 5. Verify Setup

1. Go to the Table Editor in Supabase dashboard
2. Check that the following tables exist:
   - `projects`
   - `reviews`
   - `photos`
3. Verify that the sample data was inserted (if you ran the seed script)

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Public read access is allowed for the map functionality
- Write operations require authentication
- Consider implementing proper authentication for admin operations

## Next Steps

After setting up the database:

1. Update the frontend API functions in `utils/projectApi.js` and `utils/photoApi.js` to use Supabase instead of dummy data
2. Test the CRUD operations in the admin panel
3. Implement proper authentication for admin users
4. Set up file storage for photos if needed

## API Functions to Update

You'll need to update these files to use Supabase queries instead of dummy data:

- `frontend/utils/projectApi.js` - Project CRUD operations
- `frontend/utils/photoApi.js` - Photo upload/download
- `frontend/pages/MapView.jsx` - Fetch projects from database
- `frontend/pages/Admin.jsx` - Admin CRUD operations