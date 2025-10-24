import React, { useState, useEffect } from 'react';
import { getProjects, updateProject, uploadPhoto, deletePhoto } from '../utils/projectApi';

const Admin = () => {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const handleSelectProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelected(projectId);
    // Convert "null" strings to actual null/empty values for better UX
    const cleanedProject = { ...project };
    Object.keys(cleanedProject).forEach(key => {
      if (cleanedProject[key] === 'null') {
        cleanedProject[key] = '';
      }
    });
    setFormData(cleanedProject || {});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selected) return;
    
    setSaving(true);
    try {
      await updateProject(selected, formData);
      // Refresh projects list
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file, type) => {
    if (!file || !selected) return;

    const isBefore = type === 'before';
    const setUploading = isBefore ? setUploadingBefore : setUploadingAfter;

    setUploading(true);
    try {
      // Delete existing photo if it exists
      const existingUrl = formData[isBefore ? 'before_photo' : 'after_photo'];
      if (existingUrl) {
        try {
          await deletePhoto(existingUrl);
        } catch (deleteError) {
          console.warn('Could not delete existing photo:', deleteError);
        }
      }

      // Upload new photo
      const photoUrl = await uploadPhoto(file, selected, type);
      
      // Update form data with new URL
      handleInputChange(isBefore ? 'before_photo' : 'after_photo', photoUrl);
      
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} photo uploaded successfully!`);
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      alert(`Error uploading ${type} photo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8">
        <div className="flex gap-8">
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
                      onClick={() => handleSelectProject(project.id)}
                    >
                      {project.name}
                    </button>
                  </li>
                ))}
            </ul>
          </aside>
          <main className="flex-1">
            {selected && (
              <div className="bg-white rounded-xl shadow p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-700">Edit Project</h2>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Location</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lat || ''}
                          onChange={(e) => handleInputChange('lat', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.lng || ''}
                          onChange={(e) => handleInputChange('lng', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                      <input
                        type="text"
                        value={formData.street || ''}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={formData.state || ''}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                        <input
                          type="text"
                          value={formData.zip || ''}
                          onChange={(e) => handleInputChange('zip', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                    
                    {/* Category Set 1 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category 1</label>
                        <input
                          type="text"
                          value={formData['Category 1'] || ''}
                          onChange={(e) => handleInputChange('Category 1', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category 1</label>
                        <input
                          type="text"
                          value={formData['Sub Category 1'] || ''}
                          onChange={(e) => handleInputChange('Sub Category 1', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category Set 2 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category 2</label>
                        <input
                          type="text"
                          value={formData['Category 2'] || ''}
                          onChange={(e) => handleInputChange('Category 2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category 2</label>
                        <input
                          type="text"
                          value={formData['Sub Category 2'] || ''}
                          onChange={(e) => handleInputChange('Sub Category 2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category Set 3 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category 3</label>
                        <input
                          type="text"
                          value={formData['Category 3'] || ''}
                          onChange={(e) => handleInputChange('Category 3', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category 3</label>
                        <input
                          type="text"
                          value={formData['Sub Category 3'] || ''}
                          onChange={(e) => handleInputChange('Sub Category 3', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category Set 4 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category 4</label>
                        <input
                          type="text"
                          value={formData['Category 4'] || ''}
                          onChange={(e) => handleInputChange('Category 4', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category 4</label>
                        <input
                          type="text"
                          value={formData['Sub Category 4'] || ''}
                          onChange={(e) => handleInputChange('Sub Category 4', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category Set 5 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category 5</label>
                        <input
                          type="text"
                          value={formData['Category 5'] || ''}
                          onChange={(e) => handleInputChange('Category 5', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category 5</label>
                        <input
                          type="text"
                          value={formData['Sub Category 5'] || ''}
                          onChange={(e) => handleInputChange('Sub Category 5', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category Set 6 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category 6</label>
                        <input
                          type="text"
                          value={formData['Category 6'] || ''}
                          onChange={(e) => handleInputChange('Category 6', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category 6</label>
                        <input
                          type="text"
                          value={formData['Sub Category 6'] || ''}
                          onChange={(e) => handleInputChange('Sub Category 6', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category Set 7 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category 7</label>
                        <input
                          type="text"
                          value={formData['Category 7'] || ''}
                          onChange={(e) => handleInputChange('Category 7', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category 7</label>
                        <input
                          type="text"
                          value={formData['Sub Category 7'] || ''}
                          onChange={(e) => handleInputChange('Sub Category 7', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Lowercase versions for backward compatibility */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Legacy Fields (if used)</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">category 1</label>
                          <input
                            type="text"
                            value={formData['category 1'] || ''}
                            onChange={(e) => handleInputChange('category 1', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">sub category 1</label>
                          <input
                            type="text"
                            value={formData['sub category 1'] || ''}
                            onChange={(e) => handleInputChange('sub category 1', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">category 2</label>
                          <input
                            type="text"
                            value={formData['category 2'] || ''}
                            onChange={(e) => handleInputChange('category 2', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">sub category 2</label>
                          <input
                            type="text"
                            value={formData['sub category 2'] || ''}
                            onChange={(e) => handleInputChange('sub category 2', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">category 3</label>
                          <input
                            type="text"
                            value={formData['category 3'] || ''}
                            onChange={(e) => handleInputChange('category 3', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">sub category 3</label>
                          <input
                            type="text"
                            value={formData['sub category 3'] || ''}
                            onChange={(e) => handleInputChange('sub category 3', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Photos</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Before Photo</label>
                      {formData.before_photo && (
                        <div className="mb-2">
                          <img 
                            src={formData.before_photo} 
                            alt="Before" 
                            className="w-32 h-32 object-cover rounded-md border"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handlePhotoUpload(file, 'before');
                        }}
                        disabled={uploadingBefore}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploadingBefore && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">After Photo</label>
                      {formData.after_photo && (
                        <div className="mb-2">
                          <img 
                            src={formData.after_photo} 
                            alt="After" 
                            className="w-32 h-32 object-cover rounded-md border"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handlePhotoUpload(file, 'after');
                        }}
                        disabled={uploadingAfter}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploadingAfter && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_published"
                        checked={formData.is_published || false}
                        onChange={(e) => handleInputChange('is_published', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                        Published
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;

