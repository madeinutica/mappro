// Project CRUD API using Supabase
import { supabase } from './supabaseClient';

// Get client ID using Supabase auth or fallback to demo client
export async function getClientId() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // For demo purposes, return the New York Sash client ID
      console.log('No authenticated user, using demo client ID');
      return '550e8400-e29b-41d4-a716-446655440000';
    }

    // Query clients table using the user's ID
    const { data: client, error } = await supabase
      .from('clients')
      .select('id')
      .eq('firebase_uid', user.id) // Assuming firebase_uid stores the Supabase user ID
      .single();

    if (error || !client) {
      console.warn('User not associated with any client, using demo client:', error?.message);
      return '550e8400-e29b-41d4-a716-446655440000';
    }

    return client.id;
  } catch (error) {
    console.error('Error getting client ID, using demo client:', error);
    return '550e8400-e29b-41d4-a716-446655440000';
  }
}

export async function getProjects(includeUnpublished = false, embedClientId = null, authClientId = null) {
  let clientId = embedClientId || authClientId;

  if (!clientId && !embedClientId) {
    // Try to get client ID from Supabase auth as fallback
    clientId = await getClientId();
  }

  console.log('getProjects called with:', { includeUnpublished, embedClientId, authClientId, resolvedClientId: clientId });

  let query = supabase.from('projects').select(`
    *,
    reviews (*)
  `);

  if (embedClientId) {
    // For embed mode with specific client, show their projects
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    query = query.eq('client_id', embedClientId);
    console.log('Using embedClientId filter:', embedClientId);
  } else if (clientId) {
    // Authenticated user with client ID - show all their projects
    query = query.eq('client_id', clientId);
    console.log('Using authClientId filter:', clientId);
  } else {
    // Unauthenticated user - show only published projects
    query = query.eq('is_published', true);
    console.log('No client filter - showing only published projects');
  }

  const { data, error } = await query;
  if (error) throw error;
  console.log('getProjects returning:', data?.length || 0, 'projects');
  return data;
}

export async function addProject(project, clientId) {
  if (!clientId) {
    // Try to get client ID from auth context or use demo client
    clientId = await getClientId();
    if (!clientId) throw new Error('Unable to determine client ID');
  }

  console.log('addProject called with clientId:', clientId, 'project:', project);

  const { data, error } = await supabase.from('projects').insert([{
    ...project,
    client_id: clientId
  }]);
  if (error) throw error;
  console.log('addProject inserted data:', data);
  return data;
}

export async function updateProject(id, updates) {
  // Filter out joined fields that shouldn't be updated on the projects table
  const filteredUpdates = { ...updates };
  const joinedFields = ['reviews']; // Add other joined fields here if needed

  joinedFields.forEach(field => {
    delete filteredUpdates[field];
  });

  // Always ensure client_id is present for RLS
  if (!filteredUpdates.client_id) {
    const clientId = await getClientId();
    if (clientId) filteredUpdates.client_id = clientId;
  }

  try {
    const { data, error } = await supabase.from('projects').update(filteredUpdates).eq('id', id);
    if (error) throw error;
    return data;
  } catch (error) {
    // If it fails due to schema cache issues with quoted columns,
    // try using raw SQL as a fallback
    if (error.message.includes('schema cache') || error.message.includes('column')) {
      console.warn('Standard update failed, trying raw SQL fallback:', error.message);

      // Build dynamic SQL for columns with spaces
      const setParts = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(filteredUpdates)) {
        if (key.includes(' ')) {
          // Quote columns with spaces
          setParts.push(`"${key}" = $${paramIndex}`);
        } else {
          setParts.push(`${key} = $${paramIndex}`);
        }
        values.push(value);
        paramIndex++;
      }

      // Note: This requires the SQL to be executed differently. For now, re-throw the error
      // In a production app, you might want to create a Supabase Edge Function for this
      throw new Error(`Database schema issue: ${error.message}. Please ensure the update-address-schema.sql has been run in your Supabase database.`);
    } else {
      throw error;
    }
  }
}

export async function deleteProject(id) {
  const { data, error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  return data;
}

export async function getClientInfo() {
  const clientId = await getClientId();
  if (!clientId) return null;

  const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single();
  if (error) throw error;
  return data;
}

export async function getReviews(projectId) {
  const { data, error } = await supabase.from('reviews').select('*').eq('project_id', projectId);
  if (error) throw error;
  return data;
}

export async function addReview(review) {
  const { data, error } = await supabase.from('reviews').insert([review]);
  if (error) throw error;
  return data;
}

export async function updateReview(id, updates) {
  const { data, error } = await supabase.from('reviews').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}

export async function deleteReview(id) {
  const { data, error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
  return data;
}

// File upload functions
export async function uploadPhoto(file, projectId, type) {
  const clientId = await getClientId();
  if (!clientId) throw new Error('Unable to determine client ID for photo upload');

  // Create a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${projectId}_${type}_${Date.now()}.${fileExt}`;
  const filePath = `projects/${clientId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('photos')
    .upload(filePath, file);

  if (error) throw error;

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deletePhoto(url) {
  // Extract the file path from the URL
  const urlParts = url.split('/');
  const filePath = urlParts.slice(-3).join('/'); // Get the last 3 parts: clientId/filename

  const { error } = await supabase.storage
    .from('photos')
    .remove([filePath]);

  if (error) throw error;
}
