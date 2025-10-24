const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fvrueabzpinhlzyrnhne.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w'
);

async function checkCategoriesWithData() {
  console.log('Checking for projects with actual category data...');

  // Get all projects
  const { data, error } = await supabase
    .from('projects')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total projects: ${data.length}`);

  // Find projects with category data
  const projectsWithCategories = data.filter(project => {
    return Object.keys(project).some(key => {
      if (key.includes('category') || key.includes('Category')) {
        const value = project[key];
        return value && value !== 'null' && value !== '';
      }
      return false;
    });
  });

  console.log(`\nProjects with category data: ${projectsWithCategories.length}`);

  if (projectsWithCategories.length > 0) {
    projectsWithCategories.forEach((project, i) => {
      console.log(`\nProject ${i+1}: ${project.name} (ID: ${project.id})`);
      console.log('Categories:');
      Object.keys(project).forEach(key => {
        if ((key.includes('category') || key.includes('Category')) && project[key]) {
          const value = project[key];
          if (value && value !== 'null' && value !== '') {
            console.log(`  ${key}: ${value}`);
          }
        }
      });
    });
  } else {
    console.log('No projects found with category data.');
  }

  // Show all available category field names
  console.log('\nAll category field names in database:');
  const allFields = new Set();
  data.forEach(project => {
    Object.keys(project).forEach(key => {
      if (key.includes('category') || key.includes('Category')) {
        allFields.add(key);
      }
    });
  });

  Array.from(allFields).sort().forEach(field => {
    console.log(`- ${field}`);
  });
}

checkCategoriesWithData();