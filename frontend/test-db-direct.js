// Test database connection directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  try {
    console.log('🔍 Testing Supabase database connection...');
    console.log('📍 Supabase URL:', supabaseUrl);

    // Test connection by fetching projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Database error:', error.message);
      return;
    }

    console.log('✅ Database connection successful!');
    console.log('📊 Projects found:', projects.length);

    if (projects.length > 0) {
      console.log('🏗️ Sample projects:');
      projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.name} (${project.project_type})`);
        console.log(`     📍 Location: ${project.lat}, ${project.lng}`);
        console.log(`     👤 Customer: ${project.customer}`);
      });
    } else {
      console.log('⚠️ No projects found in database. You may need to run the seed data.');
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testDatabase();