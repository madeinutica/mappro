// Project CRUD API using Supabase
import { supabase } from './supabaseClient';
import { getClientId } from './auth';

export async function getProjects(includeUnpublished = false, embedClientId = null) {
  const clientId = embedClientId || await getClientId();

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
  } else {
    // For regular access, show all published projects
    // This works for both authenticated and unauthenticated users
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function addProject(project) {
  const clientId = await getClientId();
  if (!clientId) throw new Error('User must be authenticated and associated with a client to add projects');

  const { data, error } = await supabase.from('projects').insert([{
    ...project,
    client_id: clientId
  }]);
  if (error) throw error;
  return data;
}

export async function updateProject(id, updates) {
  // Filter out joined fields that shouldn't be updated on the projects table
  const filteredUpdates = { ...updates };
  const joinedFields = ['reviews']; // Add other joined fields here if needed

  joinedFields.forEach(field => {
    delete filteredUpdates[field];
  });

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
  if (!clientId) throw new Error('User must be authenticated and associated with a client to upload photos');

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
