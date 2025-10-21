// Quick test to check if Supabase database has projects
const { getProjects } = require('./utils/projectApi.js');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const projects = await getProjects();
    console.log('✅ Database connection successful!');
    console.log('Projects found:', projects.length);
    console.log('Projects:', JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  }
}

testDatabase();