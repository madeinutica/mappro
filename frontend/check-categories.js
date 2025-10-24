// Check category fields in database
import { supabase } from './utils/supabaseClient.js';

async function checkCategories() {
  try {
    console.log('Checking category fields in first 10 projects...');
    const { data, error } = await supabase.from('projects').select('*').limit(10);
    if (error) throw error;

    data.forEach((project, index) => {
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

checkCategories();