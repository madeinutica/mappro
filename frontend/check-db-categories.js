const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fvrueabzpinhlzyrnhne.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w'
);

async function checkCategories() {
  console.log('Checking projects with category data...');

  // Get all projects
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} projects. Checking category fields...`);

  // Check what category fields exist
  const categoryFields = new Set();
  data.forEach(project => {
    Object.keys(project).forEach(key => {
      if (key.includes('category') || key.includes('Category')) {
        categoryFields.add(key);
      }
    });
  });

  console.log('\nCategory fields found in database:');
  Array.from(categoryFields).sort().forEach(field => {
    console.log(`- ${field}`);
  });

  console.log('\nSample project data:');
  data.slice(0, 3).forEach((project, i) => {
    console.log(`\nProject ${i+1}: ${project.name}`);
    console.log('Categories:');
    Object.keys(project).forEach(key => {
      if ((key.includes('category') || key.includes('Category')) && project[key]) {
        console.log(`  ${key}: ${project[key]}`);
      }
    });
  });
}

checkCategories();