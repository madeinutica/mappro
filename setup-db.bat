@echo off
echo 🚀 Setting up Mapro Database
echo ==============================
echo.
echo 📋 Prerequisites:
echo 1. Supabase project created at https://supabase.com
echo 2. Supabase URL and anon key configured in supabaseClient.js
echo.
echo 📝 Steps to complete:
echo 1. Go to your Supabase dashboard
echo 2. Navigate to SQL Editor
echo 3. Copy and paste the contents of supabase-schema.sql
echo 4. Click 'Run' to create tables
echo 5. Copy and paste the contents of dev-policies.sql
echo 6. Click 'Run' to apply development policies
echo 7. (Optional) Run supabase-seed.sql to add sample data
echo.
echo 📁 Files created:
echo - supabase-schema.sql: Database schema and policies
echo - dev-policies.sql: Development policies for demo clients
echo - supabase-seed.sql: Sample data for testing
echo - DATABASE_SETUP.md: Detailed setup instructions
echo.
echo ✅ Database setup files are ready!
echo 📖 Check DATABASE_SETUP.md for detailed instructions
echo.
pause