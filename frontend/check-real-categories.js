// Check for projects with actual category data (not "null")
import { supabase } from './utils/supabaseClient.js';

async function checkRealCategories() {
  try {
    console.log('Checking for projects with real category data...');
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;

    const projectsWithCategories = data.filter(project =>
      project['category 1'] !== 'null' && project['category 1'] ||
      project['category 2'] !== 'null' && project['category 2'] ||
      project['category 3'] !== 'null' && project['category 3']
    );

    console.log(`Found ${projectsWithCategories.length} projects with category data:`);
    projectsWithCategories.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}:`);
      console.log(`  category 1: "${project['category 1']}"`);
      console.log(`  sub category 1: "${project['sub category 1']}"`);
      console.log(`  category 2: "${project['category 2']}"`);
      console.log(`  sub category 2: "${project['sub category 2']}"`);
      console.log(`  category 3: "${project['category 3']}"`);
      console.log(`  sub category 3: "${project['sub category 3']}"`);
      console.log('---');
    });

  } catch (error) {
    console.error('Database error:', error);
  }
}

checkRealCategories();