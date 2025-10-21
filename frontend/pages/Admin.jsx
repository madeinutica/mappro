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

  // Helper function to format address from separate fields
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

      // Clear success message when user uploads photos
      if (successMessage) setSuccessMessage('');

      // Mark as having unsaved changes
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!selected || !hasUnsavedChanges) {
      console.log('handlePublish: No selected project or no unsaved changes');
      return;
    }

    console.log('handlePublish: Starting publish for project', selected);

    try {
      setSaving(true);
      setError(null);

      const currentProject = projects.find(p => p.id === selected);
      if (!currentProject) {
        console.log('handlePublish: Current project not found');
        return;
      }

      // Get only the changed fields - more robust comparison
      const changes = {};
      Object.keys(currentProject).forEach(key => {
        // Skip joined fields that aren't actual columns in the projects table
        if (key === 'reviews' || key === 'photos') {
          return;
        }

        const currentValue = currentProject[key];
        const originalValue = originalProject[key];

        // Handle different data types properly
        if (key === 'lat' || key === 'lng') {
          // Convert to numbers for comparison
          const currentNum = parseFloat(currentValue);
          const originalNum = parseFloat(originalValue);
          if (!isNaN(currentNum) && !isNaN(originalNum) && currentNum !== originalNum) {
            changes[key] = currentNum;
          }
        } else if (currentValue !== originalValue) {
          changes[key] = currentValue;
        }
      });

      // Remove id and timestamps from changes
      delete changes.id;
      delete changes.created_at;
      delete changes.updated_at;

      console.log('handlePublish: Original project:', originalProject);
      console.log('handlePublish: Current project:', currentProject);
      console.log('handlePublish: Changes to save:', changes);

      if (Object.keys(changes).length > 0) {
        await updateProject(selected, changes);
        console.log('handlePublish: Update successful, refetching projects...');

        // Refetch projects to ensure UI consistency
        await fetchProjects();

        setHasUnsavedChanges(false);
        setSuccessMessage('Changes published successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
        console.log('handlePublish: Publish completed successfully');
      } else {
        console.log('handlePublish: No changes to save');
      }
    } catch (err) {
      console.error('handlePublish: Error publishing changes:', err);
      setError(`Failed to publish changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selected);

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const searchableFields = [
      project.name,
      project.customer,
      project.description,
      project['category 1'],
      project['category 2'],
      project['category 3'],
      project.street,
      project.city,
      project.state,
      project.zip,
      project.address,
      project.project_type
    ];

    return searchableFields.some(field =>
      field && field.toString().toLowerCase().includes(searchLower)
    );
  });

  // Clear selection if selected project is filtered out
  useEffect(() => {
    if (selected && !filteredProjects.find(p => p.id === selected)) {
      setSelected(null);
      setOriginalProject(null);
      setHasUnsavedChanges(false);
      setSuccessMessage('');
    }
  }, [filteredProjects, selected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-lg">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-red-600">Error: {error}</div>
            <button
              onClick={fetchProjects}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
          <p className="text-gray-600">Manage your solar installation projects</p>
          <div className="flex items-center gap-4 mt-4">
            {saving && <div className="text-blue-600">Publishing...</div>}
            {successMessage && (
              <div className="text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {successMessage}
              </div>
            )}
            {hasUnsavedChanges && !saving && !successMessage && (
              <div className="text-orange-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Unsaved changes
              </div>
            )}
            {!hasUnsavedChanges && !saving && !successMessage && selected && (
              <div className="text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                All changes saved
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects</h2>

              {/* Search Field */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <div className="text-sm text-gray-500 mt-1">
                    {filteredProjects.length} of {projects.length} projects
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selected === p.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-gray-50 border border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">{formatAddress(p)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {selected && selectedProject && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        console.log('Test button clicked');
                        try {
                          const testUpdate = { name: selectedProject.name + ' (TEST)' };
                          console.log('Testing update with:', testUpdate);
                          await updateProject(selected, testUpdate);
                          console.log('Test update successful');
                          alert('Test update successful! Check console for details.');
                        } catch (err) {
                          console.error('Test update failed:', err);
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        name="name"
                        value={selectedProject.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            name="category 1"
                            placeholder="Category 1"
                            value={selectedProject['category 1'] || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            name="sub category 1"
                            placeholder="Sub Category 1"
                            value={selectedProject['sub category 1'] || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            name="category 2"
                            placeholder="Category 2"
                            value={selectedProject['category 2'] || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            name="sub category 2"
                            placeholder="Sub Category 2"
                            value={selectedProject['sub category 2'] || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            name="category 3"
                            placeholder="Category 3"
                            value={selectedProject['category 3'] || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            name="sub category 3"
                            placeholder="Sub Category 3"
                            value={selectedProject['sub category 3'] || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="street"
                          placeholder="Street Address"
                          value={selectedProject.street || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={selectedProject.city || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={selectedProject.state || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          name="zip"
                          placeholder="ZIP Code"
                          value={selectedProject.zip || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location & Photos */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          name="lat"
                          value={selectedProject.lat}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          name="lng"
                          value={selectedProject.lng}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={selectedProject.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Photo Uploads */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Before Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePhotoUpload(e, 'before_photo')}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedProject.before_photo && (
                          <img src={selectedProject.before_photo} alt="Before" className="mt-2 w-full h-24 object-cover rounded-md border" />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">After Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePhotoUpload(e, 'after_photo')}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                        {selectedProject.after_photo && (
                          <img src={selectedProject.after_photo} alt="After" className="mt-2 w-full h-24 object-cover rounded-md border" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reviews</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    {selectedProject.reviews && selectedProject.reviews.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProject.reviews.map((review) => (
                          <div key={review.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{review.author}</span>
                                <span className="text-yellow-500">
                                  {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                                </span>
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this review?')) {
                                    try {
                                      await deleteReview(review.id);
                                      await fetchProjects(); // Refresh the projects list
                                      setSuccessMessage('Review deleted successfully!');
                                      setTimeout(() => setSuccessMessage(''), 3000);
                                    } catch (err) {
                                      setError(`Failed to delete review: ${err.message}`);
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                            <p className="text-gray-700 text-sm">{review.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No reviews yet for this project.</p>
                    )}

                    {/* Add Review Form */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-3">Add New Review</h4>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target);
                          const newReview = {
                            project_id: selected,
                            author: formData.get('author'),
                            rating: parseInt(formData.get('rating')),
                            text: formData.get('text'),
                          };

                          try {
                            await addReview(newReview);
                            await fetchProjects(); // Refresh the projects list
                            e.target.reset();
                            setSuccessMessage('Review added successfully!');
                            setTimeout(() => setSuccessMessage(''), 3000);
                          } catch (err) {
                            setError(`Failed to add review: ${err.message}`);
                          }
                        }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="author"
                            placeholder="Reviewer name"
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            name="rating"
                            required
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select rating</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                          </select>
                        </div>
                        <textarea
                          name="text"
                          placeholder="Review text"
                          required
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add Review
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedProject, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
