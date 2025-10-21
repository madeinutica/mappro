// Test the publish functionality
import { updateProject, getProjects } from './utils/projectApi.js';

async function testPublish() {
  try {
    console.log('🧪 Testing publish functionality...');

    // Get current projects
    const projects = await getProjects();
    console.log('📊 Current projects:', projects.length);

    if (projects.length === 0) {
      console.log('⚠️ No projects found. Please run the seed data first.');
      return;
    }

    // Test updating the first project
    const testProject = projects[0];
    console.log('🔄 Testing update on project:', testProject.name);

    const originalName = testProject.name;
    const testName = `${originalName} (TEST)`;

    // Update the project
    await updateProject(testProject.id, { name: testName });
    console.log('✅ Update successful');

    // Verify the update
    const updatedProjects = await getProjects();
    const updatedProject = updatedProjects.find(p => p.id === testProject.id);

    if (updatedProject.name === testName) {
      console.log('✅ Verification successful - project name updated');

      // Restore original name
      await updateProject(testProject.id, { name: originalName });
      console.log('🔄 Restored original name');

      console.log('🎉 Publish functionality test PASSED!');
    } else {
      console.log('❌ Verification failed - project name not updated');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPublish();