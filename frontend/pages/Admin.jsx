import React, { useState, useEffect } from 'react';
import { getProjects, updateProject, addReview, deleteReview } from '../utils/projectApi';

const Admin = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalProject, setOriginalProject] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // ...existing code...

  const formatAddress = (project) => {
    const parts = [];
    if (project.street) parts.push(project.street);
    if (project.city) parts.push(project.city);
    if (project.state) parts.push(project.state);
    if (project.zip) parts.push(project.zip);
    return parts.length > 0 ? parts.join(', ') : (project.address || 'No address');
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      return data; // Return the data for use in other functions
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
      throw err; // Re-throw so calling functions can handle it
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    console.log('handleSelect: Selecting project', id);
    setSelected(id);
    const project = projects.find(p => p.id === id);
    if (project) {
      setOriginalProject({ ...project });
      console.log('handleSelect: Set original project:', project);
    } else {
      setOriginalProject(null);
      console.log('handleSelect: Project not found');
    }
    setHasUnsavedChanges(false);
    setSuccessMessage(''); // Clear any success messages
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === 'lat' || name === 'lng' ? parseFloat(value) : value;

    // Update local state immediately for UI responsiveness
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selected ? { ...p, [name]: updatedValue } : p
      )
    );

    // Clear success message when user starts editing
    if (successMessage) setSuccessMessage('');

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
  };

  // Handle before/after photo upload (as data URL for demo)
  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // For now, convert to data URL. In production, you'd upload to Supabase Storage
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selected ? { ...p, [type]: dataUrl } : p
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      const selectedProject = projects.find(p => p.id === selected);
      if (!selectedProject) return;
      await updateProject(selected, selectedProject);
      setHasUnsavedChanges(false);
      setSuccessMessage('Project updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to update project: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Main render
  return (
    <div className="admin-page bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-xl shadow p-6 sticky top-8 h-fit self-start">
            <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Panel</h1>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <ul className="space-y-2">
              {projects
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(project => (
                  <li key={project.id}>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                        selected === project.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-blue-50 text-gray-700'
                      }`}
                      onClick={() => handleSelect(project.id)}
                    >
                      {project.name}
                    </button>
                  </li>
                ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {selected ? (
              (() => {
                const selectedProject = projects.find(p => p.id === selected);
                if (!selectedProject) return <div className="text-gray-500">Project not found.</div>;
                return (
                  <div className="bg-white rounded-xl shadow p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-blue-700">Edit Project</h2>
                      {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                          {successMessage}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const testUpdate = { name: selectedProject.name + ' (TEST)' };
                              await updateProject(selected, testUpdate);
                              alert('Test update successful! Check console for details.');
                            } catch (err) {
                              alert('Test update failed: ' + err.message);
                            }
                          }}
                          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                        >
                          Test Update
                        </button>
                        <button
                          onClick={handlePublish}
                          disabled={!hasUnsavedChanges || saving}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            hasUnsavedChanges && !saving
                              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title={hasUnsavedChanges ? 'Click to save your changes' : 'No changes to save'}
                        >
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Publishing...
                            </span>
                          ) : (
                            'Publish Changes'
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Basic Info */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                          <input
                            type="text"
                            name="name"
                            value={selectedProject.name || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            name="description"
                            value={selectedProject.description || ''}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category 1</label>
                            <input
                              type="text"
                              name="category 1"
                              value={selectedProject['category 1'] || ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category 1</label>
                            <input
                              type="text"
                              name="sub category 1"
                              value={selectedProject['sub category 1'] || ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location & Photos */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              name="lat"
                              value={selectedProject.lat || ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              name="lng"
                              value={selectedProject.lng || ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                          <input
                            type="text"
                            name="street"
                            value={selectedProject.street || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              name="city"
                              value={selectedProject.city || ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <input
                              type="text"
                              name="state"
                              value={selectedProject.state || ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP</label>
                            <input
                              type="text"
                              name="zip"
                              value={selectedProject.zip || ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Before Photo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, 'before_photo')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {selectedProject.before_photo && (
                            <img src={selectedProject.before_photo} alt="Before" className="mt-2 w-32 h-32 object-cover rounded" />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">After Photo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, 'after_photo')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {selectedProject.after_photo && (
                            <img src={selectedProject.after_photo} alt="After" className="mt-2 w-32 h-32 object-cover rounded" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-12">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Reviews</h3>
                      {selectedProject.reviews && selectedProject.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {selectedProject.reviews.map(review => (
                            <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{review.author}</span>
                                <div className="flex items-center">
                                  <span className="text-yellow-500 mr-2">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                                  </span>
                                  <button
                                    onClick={() => deleteReview(review.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-700">{review.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No reviews yet.</p>
                      )}
                    </div>

                    {/* Preview */}
                    <div className="mt-12">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Map Preview</h3>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Address:</strong> {formatAddress(selectedProject)}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Coordinates:</strong> {selectedProject.lat}, {selectedProject.lng}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Description:</strong> {selectedProject.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}



export default Admin;
