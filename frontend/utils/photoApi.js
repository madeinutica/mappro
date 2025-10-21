// Photo upload API using Supabase Storage
import { supabase } from './supabaseClient';

export async function uploadPhoto(projectId, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `projects/${projectId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  return { path: filePath };
}

export function getPhotoUrl(path) {
  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(path);

  return data.publicUrl;
}
