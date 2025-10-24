// Update all projects to be associated with New York Sash and mark them as published
import { supabase } from './utils/supabaseClient.js';

async function updateProjects() {
  try {
    console.log('Updating all projects to be associated with New York Sash client...');

    // First, ensure the New York Sash client exists
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', '550e8400-e29b-41d4-a716-446655440000')
      .single();

    if (clientCheckError && clientCheckError.code !== 'PGRST116') {
      throw clientCheckError;
    }

    if (!existingClient) {
      console.log('Creating New York Sash client...');
      const { error: insertError } = await supabase
        .from('clients')
        .insert([{
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'New York Sash',
          domain: 'nysash.com',
          primary_color: '#3B82F6'
        }]);

      if (insertError) throw insertError;
      console.log('New York Sash client created successfully');
    } else {
      console.log('New York Sash client already exists');
    }

    // Update all projects to be associated with New York Sash
    console.log('Associating all projects with New York Sash client...');
    const { data: updateData, error: updateError } = await supabase
      .from('projects')
      .update({ client_id: '550e8400-e29b-41d4-a716-446655440000' })
      .is('client_id', null);

    if (updateError) throw updateError;
    console.log('Projects association updated');

    // Mark all projects as published so they display publicly
    console.log('Marking all projects as published...');
    const { data: publishData, error: publishError } = await supabase
      .from('projects')
      .update({ is_published: true })
      .eq('is_published', false);

    if (publishError) throw publishError;
    console.log('All projects marked as published');

    console.log('All operations completed successfully!');

  } catch (error) {
    console.error('Error updating projects:', error);
  }
}

updateProjects();