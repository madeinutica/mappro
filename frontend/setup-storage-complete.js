// Comprehensive Supabase Storage Setup for Photos
// Run this script to set up the photos storage bucket and policies

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Get this from: https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🚀 Setting up Supabase storage for photos...');

  try {
    // Step 1: Create the photos bucket
    console.log('📦 Creating photos bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('photos', {
      public: true, // Make it public so we can access photos via URL
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760, // 10MB limit
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Photos bucket already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Photos bucket created successfully');
    }

    // Step 2: Set up RLS policies using SQL
    console.log('🔒 Setting up storage policies...');

    const policiesSQL = `
      -- Enable RLS on storage.objects if not already enabled
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can upload photos to their client folder" ON storage.objects;
      DROP POLICY IF EXISTS "Users can view photos from their client folder" ON storage.objects;
      DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete photos from their client folder" ON storage.objects;

      -- Allow authenticated users to upload photos to their client's folder
      CREATE POLICY "Users can upload photos to their client folder" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'client_id')
      );

      -- Allow users to view photos from their client's folder
      CREATE POLICY "Users can view photos from their client folder" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'client_id')
      );

      -- Allow public access to view photos (for the map display)
      CREATE POLICY "Public can view photos" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'photos'
      );

      -- Allow users to delete photos from their client's folder
      CREATE POLICY "Users can delete photos from their client folder" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'client_id')
      );
    `;

    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: policiesSQL });

    if (sqlError) {
      console.error('❌ Error setting up policies via RPC. You may need to run the SQL manually.');
      console.log('Copy and run this SQL in your Supabase SQL Editor:');
      console.log(policiesSQL);
      return;
    }

    console.log('✅ Storage policies set up successfully');

    // Step 3: Test the setup
    console.log('🧪 Testing storage setup...');

    // Try to list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      const photosBucket = buckets.find(b => b.name === 'photos');
      if (photosBucket) {
        console.log('✅ Photos bucket is accessible');
        console.log(`📊 Bucket details: ${photosBucket.public ? 'Public' : 'Private'}, Max size: ${photosBucket.file_size_limit / 1024 / 1024}MB`);
      } else {
        console.error('❌ Photos bucket not found');
      }
    }

    console.log('\n🎉 Supabase storage setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test photo upload in the admin panel');
    console.log('2. Verify photos display correctly in map popups');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n🔧 Manual setup instructions:');
    console.log('1. Go to https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/storage');
    console.log('2. Create a new bucket called "photos"');
    console.log('3. Make it public');
    console.log('4. Go to SQL Editor and run the policies from setup-storage.sql');
  }
}

// Alternative: If RPC doesn't work, provide manual instructions
async function manualSetupInstructions() {
  console.log('\n📋 Manual Setup Instructions:');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/storage');
  console.log('2. Click "Create bucket"');
  console.log('3. Name it "photos"');
  console.log('4. Make it public');
  console.log('5. Go to SQL Editor and run the contents of setup-storage.sql');
  console.log('6. Test photo upload in the admin panel');
}

setupStorage().catch(manualSetupInstructions);