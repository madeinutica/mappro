// Update all projects to be associated with a client and mark them as published
import { supabase } from './utils/supabaseClient.js';

async function updateProjectsForClient(clientId, clientName, clientDomain, clientColor) {
  try {
    console.log(`Updating all projects to be associated with ${clientName} client...`);

    // First, ensure the client exists
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientCheckError && clientCheckError.code !== 'PGRST116') {
      throw clientCheckError;
    }

    if (!existingClient) {
      console.log(`Creating ${clientName} client...`);
      const { error: insertError } = await supabase
        .from('clients')
        .insert([{
          id: clientId,
          name: clientName,
          domain: clientDomain,
          primary_color: clientColor
        }]);

      if (insertError) throw insertError;
      console.log(`${clientName} client created successfully`);
    } else {
      console.log(`${clientName} client already exists`);
    }

    // Update all projects to be associated with the client
    console.log(`Associating all projects with ${clientName} client...`);
    const { data: updateData, error: updateError } = await supabase
      .from('projects')
      .update({ client_id: clientId })
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

// Example usage - replace with actual client values
const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000'; // Replace with actual client ID
const CLIENT_NAME = 'Example Client'; // Replace with actual client name
const CLIENT_DOMAIN = 'example.com'; // Replace with actual client domain
const CLIENT_COLOR = '#3B82F6'; // Replace with actual client color

updateProjectsForClient(CLIENT_ID, CLIENT_NAME, CLIENT_DOMAIN, CLIENT_COLOR);