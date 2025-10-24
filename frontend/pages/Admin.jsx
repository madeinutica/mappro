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
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'edit'

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const handleSelectProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelected(projectId);
    setView('edit');
    // Convert "null" strings to actual null/empty values for better UX
    const cleanedProject = { ...project };
    Object.keys(cleanedProject).forEach(key => {
      if (cleanedProject[key] === 'null') {
        cleanedProject[key] = '';
      }
    });
    setFormData(cleanedProject || {});
  };

  const handleBackToDashboard = () => {
    setSelected(null);
    setView('dashboard');
    setFormData({});
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

  // Calculate dashboard stats
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.is_published).length;
  const unpublishedProjects = totalProjects - publishedProjects;
  const newestProject = projects.length > 0 ? projects.reduce((newest, project) => 
    !newest || new Date(project.created_at || 0) > new Date(newest.created_at || 0) ? project : newest
  ) : null;

  // Generate embed code
  const embedCode = `<iframe src="${window.location.origin}" width="100%" height="600" frameborder="0"></iframe>`;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Mapro Admin</h1>
        <p className="text-blue-100">Manage your interactive map projects and embed codes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{publishedProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{unpublishedProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Newest Project */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Project</h2>
          {newestProject ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{newestProject.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${newestProject.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {newestProject.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{newestProject.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {newestProject.created_at ? new Date(newestProject.created_at).toLocaleDateString() : 'Recently'}
              </div>
              <button
                onClick={() => handleSelectProject(newestProject.id)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Project
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No projects yet</p>
          )}
        </div>

        {/* Embed Code */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Embed Code</h2>
          <p className="text-sm text-gray-600 mb-4">Use this code to embed your interactive map on any website:</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <code className="text-sm text-gray-800 break-all">{embedCode}</code>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(embedCode)}
            className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Copy Embed Code
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm font-medium text-gray-900">Add New Project</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-900">Bulk Import</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8">
        <div className="flex gap-8">
          <aside className="w-64 bg-white rounded-xl shadow p-6 sticky top-8 h-fit self-start">
            <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Panel</h1>
            
            {/* Navigation */}
            <nav className="space-y-2 mb-6">
              <button
                onClick={handleBackToDashboard}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'dashboard' && !selected
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                📊 Dashboard
              </button>
            </nav>

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
            {view === 'dashboard' && !selected ? renderDashboard() : (
              <div className="bg-white rounded-xl shadow p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleBackToDashboard}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ← Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-blue-700">Edit Project</h2>
                  </div>
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

