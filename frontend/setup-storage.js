// Setup script for Supabase storage bucket
// Run this in the Supabase SQL editor or as a migration

// Create the photos storage bucket
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need the service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    // Create the photos bucket
    const { data, error } = await supabase.storage.createBucket('photos', {
      public: true, // Make it public so we can access photos via URL
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760, // 10MB limit
    });

    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Photos bucket created successfully:', data);
    }

    // Set up RLS policies for the bucket
    const { error: policyError } = await supabase.rpc('setup_photos_bucket_policies');

    if (policyError) {
      console.error('Error setting up policies:', policyError);
    } else {
      console.log('Bucket policies set up successfully');
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupStorage();