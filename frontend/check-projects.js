// Check all projects in database
import { supabase } from './utils/supabaseClient.js';

async function checkAllProjects() {
  try {
    console.log('Checking all projects in database...');
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;

    console.log(`Total projects found: ${data.length}`);
    data.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} - client_id: ${project.client_id} - published: ${project.is_published}`);
    });

    // Check for projects without client_id
    const unassociated = data.filter(p => !p.client_id);
    if (unassociated.length > 0) {
      console.log(`\nFound ${unassociated.length} projects without client association:`);
      unassociated.forEach(p => console.log(`- ${p.name} (${p.id})`));
    } else {
      console.log('\nAll projects are associated with clients.');
    }

  } catch (error) {
    console.error('Database error:', error);
  }
}

checkAllProjects();