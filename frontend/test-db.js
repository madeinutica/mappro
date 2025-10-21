// Quick test to check if Supabase database has projects
import { getProjects } from './utils/projectApi.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const projects = await getProjects();
    console.log('Projects found:', projects.length);
    console.log('Projects:', projects);
  } catch (error) {
    console.error('Database error:', error);
  }
}

testDatabase();