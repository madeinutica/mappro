// Test database connection directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w';

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