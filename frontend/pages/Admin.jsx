import React, { useState, useEffect, useRef } from 'react';
import { getProjects, updateProject, deleteProject, uploadPhoto, deletePhoto, addProject } from '../utils/projectApi';
import { useAuth } from '../contexts/AuthContext';

const Admin = ({ onMap }) => {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'edit' or 'embed'
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'published', 'unpublished'
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    customer: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    'Category 1': '',
    'Sub Category 1': '',
    'Category 2': '',
    'Sub Category 2': '',
    'Category 3': '',
    'Sub Category 3': '',
    'Category 4': '',
    'Sub Category 4': '',
    'Category 5': '',
    'Sub Category 5': '',
    'Category 6': '',
    'Sub Category 6': '',
    'Category 7': '',
    'Sub Category 7': '',
    is_published: false
  });
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const beforeInputRef = useRef();
  const afterInputRef = useRef();
  const [adding, setAdding] = useState(false);
  const [addStatus, setAddStatus] = useState(''); // 'creating', 'uploading', 'complete', 'error'
  const [formErrors, setFormErrors] = useState({});
  const handleAddInputChange = (field, value) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBeforePhotoChange = (e) => {
    setBeforePhoto(e.target.files[0] || null);
  };
  const handleAfterPhotoChange = (e) => {
    setAfterPhoto(e.target.files[0] || null);
  };

  const validateAddForm = () => {
    const errors = {};

    // Required fields
    if (!addForm.name?.trim()) {
      errors.name = 'Customer name is required';
    }

    // Coordinate validation
    const lat = parseFloat(addForm.lat);
    const lng = parseFloat(addForm.lng);

    if (!addForm.lat || isNaN(lat)) {
      errors.lat = 'Valid latitude is required';
    } else if (lat < -90 || lat > 90) {
      errors.lat = 'Latitude must be between -90 and 90';
    }

    if (!addForm.lng || isNaN(lng)) {
      errors.lng = 'Valid longitude is required';
    } else if (lng < -180 || lng > 180) {
      errors.lng = 'Longitude must be between -180 and 180';
    }

    // Optional but validated fields
    if (addForm.street && addForm.street.length > 100) {
      errors.street = 'Street address must be less than 100 characters';
    }

    if (addForm.city && addForm.city.length > 50) {
      errors.city = 'City must be less than 50 characters';
    }

    if (addForm.state && addForm.state.length > 2) {
      errors.state = 'State should be 2 characters (e.g., NY)';
    }

    if (addForm.zip && !/^\d{5}(-\d{4})?$/.test(addForm.zip)) {
      errors.zip = 'ZIP code should be 5 digits or 5-4 format';
    }

    return errors;
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateAddForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    setAdding(true);
    setFormErrors({});
    setAddStatus('creating');
    
    try {
      // Add project first (without before/after photo fields)
      const { before_photo, after_photo, ...projectData } = addForm;
      console.log('Adding project with clientId:', clientId, 'projectData:', projectData);
      
      setAddStatus('Creating project...');
      const newProjectArr = await addProject(projectData, clientId);
      const newProject = Array.isArray(newProjectArr) ? newProjectArr[0] : newProjectArr;
      console.log('New project created:', newProject);
      
      // Upload before/after photos if present
      if (newProject?.id) {
        let beforeUrl = '';
        let afterUrl = '';
        
        if (beforePhoto) {
          setAddStatus('Uploading before photo...');
          beforeUrl = await uploadPhoto(newProject.id, beforePhoto, 'before');
        }
        
        if (afterPhoto) {
          setAddStatus('Uploading after photo...');
          afterUrl = await uploadPhoto(newProject.id, afterPhoto, 'after');
        }
        
        // Update project with photo URLs if needed
        if (beforeUrl || afterUrl) {
          setAddStatus('Finalizing project...');
          await updateProject(newProject.id, {
            before_photo: beforeUrl,
            after_photo: afterUrl
          });
        }
      }
      
      setAddStatus('complete');
      
      // Refresh projects list immediately
      const updatedProjects = await getProjects(false, null, clientId);
      console.log('After adding project, refreshed projects:', updatedProjects?.length || 0, 'projects');
      setProjects(updatedProjects);
      
      // Small delay to show completion message
      setTimeout(() => {
        setShowAddModal(false);
        setAddStatus('');
        setAddForm({ name: '', description: '', lat: '', lng: '', customer: '', street: '', city: '', state: '', zip: '', 'Category 1': '', 'Sub Category 1': '', 'Category 2': '', 'Sub Category 2': '', 'Category 3': '', 'Sub Category 3': '', 'Category 4': '', 'Sub Category 4': '', 'Category 5': '', 'Sub Category 5': '', 'Category 6': '', 'Sub Category 6': '', 'Category 7': '', 'Sub Category 7': '', is_published: false });
        setBeforePhoto(null);
        setAfterPhoto(null);
        if (beforeInputRef.current) beforeInputRef.current.value = '';
        if (afterInputRef.current) afterInputRef.current.value = '';
        
        alert('Project added successfully!');
      }, 500);
      
    } catch (error) {
      console.error('Error adding project:', error);
      setAddStatus('error');
      alert('Error adding project: ' + error.message);
      
      // Reset status after showing error
      setTimeout(() => setAddStatus(''), 2000);
    } finally {
      setAdding(false);
    }
  };
  const { signOut, client } = useAuth();
  const clientId = client?.clients?.id || client?.id;

  console.log('Admin component render - client:', client, 'clientId:', clientId);

  useEffect(() => {
    console.log('useEffect triggered with clientId:', clientId);
    const loadProjects = async () => {
      try {
        console.log('Loading projects for clientId:', clientId);
        const projects = await getProjects(false, null, clientId);
        console.log('Loaded projects:', projects?.length || 0, 'projects');
        if (projects && projects.length > 0) {
          console.log('First project sample:', projects[0]);
        }
        setProjects(projects);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };
    if (clientId) {
      console.log('clientId is defined, calling loadProjects');
      loadProjects();
    } else {
      console.log('clientId is undefined, skipping project load');
    }
  }, [clientId]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = !searchTerm || (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'published' && p.is_published) || 
        (filterStatus === 'unpublished' && !p.is_published);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleFilterToggle = (status) => {
    if (filterStatus === status) {
      setFilterStatus('all');
    } else {
      setFilterStatus(status);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
      // Ensure client_id is always included
      const updatedFormData = { ...formData, client_id: clientId };
      await updateProject(selected, updatedFormData);
      // Refresh projects list
      const updatedProjects = await getProjects(false, null, clientId);
      setProjects(updatedProjects);
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    const project = projects.find(p => p.id === selected);
    const confirmed = window.confirm(
      `Are you sure you want to delete the project "${project?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteProject(selected);
      // Refresh projects list
      const updatedProjects = await getProjects(false, null, clientId);
      setProjects(updatedProjects);
      // Go back to dashboard
      handleBackToDashboard();
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project: ' + error.message);
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
  const embedCode = `<iframe src="${window.location.origin}?embed=true&filter=published" width="100%" height="600" frameborder="0"></iframe>`;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-neutral-light rounded-xl shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-neutral-dark hover:text-primary text-2xl" onClick={() => setShowAddModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Add New Project</h2>
            
            {/* Status Indicator */}
            {addStatus && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
                addStatus === 'error' 
                  ? 'bg-red-50 border border-red-200' 
                  : addStatus === 'complete'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                {addStatus === 'error' ? (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : addStatus === 'complete' ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className={`text-sm font-medium ${
                  addStatus === 'error' ? 'text-red-700' : 
                  addStatus === 'complete' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {addStatus === 'creating' ? 'Creating project...' :
                   addStatus === 'complete' ? 'Project created successfully!' :
                   addStatus === 'error' ? 'Failed to create project' :
                   addStatus}
                </span>
              </div>
            )}
            
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Customer Name</label>
                <input type="text" value={addForm.name} onChange={e => handleAddInputChange('name', e.target.value)} required className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-accent focus:ring-primary'}`} />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Description</label>
                <textarea value={addForm.description} onChange={e => handleAddInputChange('description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Latitude</label>
                  <input type="number" step="any" value={addForm.lat} onChange={e => handleAddInputChange('lat', e.target.value)} required className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.lat ? 'border-red-500 focus:ring-red-500' : 'border-accent focus:ring-primary'}`} />
                  {formErrors.lat && <p className="text-red-500 text-xs mt-1">{formErrors.lat}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Longitude</label>
                  <input type="number" step="any" value={addForm.lng} onChange={e => handleAddInputChange('lng', e.target.value)} required className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.lng ? 'border-red-500 focus:ring-red-500' : 'border-accent focus:ring-primary'}`} />
                  {formErrors.lng && <p className="text-red-500 text-xs mt-1">{formErrors.lng}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Street</label>
                <input type="text" value={addForm.street} onChange={e => handleAddInputChange('street', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.street ? 'border-red-500 focus:ring-red-500' : 'border-accent focus:ring-primary'}`} placeholder="40 Old Boorne Drive" />
                {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">City</label>
                  <input type="text" value={addForm.city} onChange={e => handleAddInputChange('city', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-accent focus:ring-primary'}`} placeholder="Clinton" />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">State</label>
                  <input type="text" value={addForm.state} onChange={e => handleAddInputChange('state', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-accent focus:ring-primary'}`} placeholder="NY" />
                  {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">ZIP</label>
                  <input type="text" value={addForm.zip} onChange={e => handleAddInputChange('zip', e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.zip ? 'border-red-500 focus:ring-red-500' : 'border-accent focus:ring-primary'}`} placeholder="13323" />
                  {formErrors.zip && <p className="text-red-500 text-xs mt-1">{formErrors.zip}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-dark">Categories</h3>
                
                {/* Category Set 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Category 1</label>
                    <input type="text" value={addForm['Category 1']} onChange={e => handleAddInputChange('Category 1', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Doors & Windows" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category 1</label>
                    <input type="text" value={addForm['Sub Category 1']} onChange={e => handleAddInputChange('Sub Category 1', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Windows" />
                  </div>
                </div>

                {/* Category Set 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Category 2</label>
                    <input type="text" value={addForm['Category 2']} onChange={e => handleAddInputChange('Category 2', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category 2</label>
                    <input type="text" value={addForm['Sub Category 2']} onChange={e => handleAddInputChange('Sub Category 2', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Category Set 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Category 3</label>
                    <input type="text" value={addForm['Category 3']} onChange={e => handleAddInputChange('Category 3', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category 3</label>
                    <input type="text" value={addForm['Sub Category 3']} onChange={e => handleAddInputChange('Sub Category 3', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Category Set 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Category 4</label>
                    <input type="text" value={addForm['Category 4']} onChange={e => handleAddInputChange('Category 4', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category 4</label>
                    <input type="text" value={addForm['Sub Category 4']} onChange={e => handleAddInputChange('Sub Category 4', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Category Set 5 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Category 5</label>
                    <input type="text" value={addForm['Category 5']} onChange={e => handleAddInputChange('Category 5', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category 5</label>
                    <input type="text" value={addForm['Sub Category 5']} onChange={e => handleAddInputChange('Sub Category 5', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Category Set 6 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Category 6</label>
                    <input type="text" value={addForm['Category 6']} onChange={e => handleAddInputChange('Category 6', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category 6</label>
                    <input type="text" value={addForm['Sub Category 6']} onChange={e => handleAddInputChange('Sub Category 6', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Category Set 7 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Category 7</label>
                    <input type="text" value={addForm['Category 7']} onChange={e => handleAddInputChange('Category 7', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category 7</label>
                    <input type="text" value={addForm['Sub Category 7']} onChange={e => handleAddInputChange('Sub Category 7', e.target.value)} className="w-full px-3 py-2 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Before Photo</label>
                  <input type="file" accept="image/*" onChange={handleBeforePhotoChange} ref={beforeInputRef} className="block w-full text-sm text-neutral-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-primary hover:file:bg-primary/10" />
                  {beforePhoto && <div className="mt-1 text-xs text-gray-500">{beforePhoto.name}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">After Photo</label>
                  <input type="file" accept="image/*" onChange={handleAfterPhotoChange} ref={afterInputRef} className="block w-full text-sm text-neutral-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-primary hover:file:bg-primary/10" />
                  {afterPhoto && <div className="mt-1 text-xs text-gray-500">{afterPhoto.name}</div>}
                </div>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="is_published" checked={addForm.is_published} onChange={e => handleAddInputChange('is_published', e.target.checked)} className="mr-2 accent-primary" />
                <label htmlFor="is_published" className="text-sm text-neutral-dark">Published</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-accent text-neutral-dark rounded-lg hover:bg-primary/10" disabled={adding}>Cancel</button>
                <button type="submit" disabled={adding || addStatus === 'complete'} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {adding && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {adding ? (addStatus || 'Adding...') : addStatus === 'complete' ? 'Added!' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Mapro Admin</h1>
        <p className="text-accent">Manage your interactive map projects and embed codes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-light rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-accent rounded-lg">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-dark/80">Total Projects</p>
              <p className="text-2xl font-bold text-neutral-dark">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-light rounded-xl shadow p-6 cursor-pointer hover:bg-neutral-light/80 transition-colors" onClick={() => handleFilterToggle('published')}>
          <div className="flex items-center">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-dark/80">Published</p>
              <p className="text-2xl font-bold text-neutral-dark">{publishedProjects}</p>
              {filterStatus === 'published' && (
                <p className="text-xs text-secondary font-medium mt-1">Filtered</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-neutral-light rounded-xl shadow p-6 cursor-pointer hover:bg-neutral-light/80 transition-colors" onClick={() => handleFilterToggle('unpublished')}>
          <div className="flex items-center">
            <div className="p-3 bg-accent/60 rounded-lg">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-dark/80">Draft</p>
              <p className="text-2xl font-bold text-neutral-dark">{unpublishedProjects}</p>
              {filterStatus === 'unpublished' && (
                <p className="text-xs text-accent font-medium mt-1">Filtered</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Newest Project */}
        <div className="bg-neutral-cream rounded-xl shadow p-6">
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
        <div className="bg-neutral-cream rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Embed Code</h2>
          <p className="text-sm text-gray-600 mb-4">Use this code to embed your published projects map on any website:</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <code className="text-sm text-gray-800 break-all">{embedCode}</code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(embedCode)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Copy Embed Code
            </button>
            <button
              onClick={() => window.open(`${window.location.origin}?embed=true&filter=published`, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-cream rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="p-4 border-2 border-dashed border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-blue-700 font-semibold flex flex-col items-center justify-center"
            onClick={() => setShowAddModal(true)}
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Project
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
          <aside className="w-64 bg-neutral-cream rounded-xl shadow p-6 sticky top-8 h-fit self-start">
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
              <button
                onClick={onMap}
                className="w-full text-left px-4 py-2 rounded-lg font-medium transition-colors hover:bg-green-50 text-gray-700"
              >
                🗺️ View Map
              </button>
              <button
                onClick={() => setView('embed')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'embed'
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-purple-50 text-gray-700'
                }`}
              >
                📤 Embed Code
              </button>
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 rounded-lg font-medium transition-colors hover:bg-red-50 text-gray-700"
              >
                🚪 Logout
              </button>
            </nav>

            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Filter Status Indicator */}
            {filterStatus !== 'all' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    Showing {filterStatus === 'published' ? 'Published' : 'Draft'} projects only
                  </span>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Show All
                  </button>
                </div>
              </div>
            )}
            <ul className="space-y-2">
              {currentProjects.map(project => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2 text-center">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
                </div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </aside>
          <main className="flex-1">
            {view === 'dashboard' && !selected ? renderDashboard() : view === 'embed' ? (
              <div className="bg-neutral-cream rounded-xl shadow p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleBackToDashboard}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ← Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-purple-700">Embed Code Generator</h2>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Embed Code</h3>
                    <p className="text-gray-600 mb-4">
                      Use the code below to embed your map on external websites. Only published projects will be shown.
                    </p>
                    {/* Client ID Display in Embed Tab */}
                    {client?.id && (
                      <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-center gap-4">
                        <span className="font-semibold text-yellow-700">Client ID:</span>
                        <span className="font-mono text-yellow-900 select-all">{client.id}</span>
                        <button
                          className="ml-2 px-2 py-1 text-xs bg-yellow-200 rounded hover:bg-yellow-300 text-yellow-900"
                          onClick={() => navigator.clipboard.writeText(client.id)}
                        >
                          Copy
                        </button>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Embed URL:</label>
                      <code className="block bg-neutral-cream p-3 rounded border text-sm break-all">
                        {`${window.location.origin}?embed=true&client=${client?.id || 'YOUR_CLIENT_ID'}`}
                      </code>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">HTML Embed Code:</label>
                      <code className="block bg-neutral-cream p-3 rounded border text-sm break-all">
                        {`<iframe src="${window.location.origin}?embed=true&client=${client?.id || 'YOUR_CLIENT_ID'}" width="100%" height="600" frameborder="0"></iframe>`}
                      </code>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Customization Options:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <code>width</code> and <code>height</code>: Adjust iframe dimensions</li>
                        <li>• <code>project=PROJECT_ID</code>: Show only a specific project</li>
                        <li>• <code>filter=published</code>: Only show published projects (default)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-cream rounded-xl shadow p-8">
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
                  {/* Project ID Display */}
                  {formData?.id && (
                    <div className="flex items-center gap-2 bg-blue-50 border-l-4 border-blue-400 px-3 py-1 rounded">
                      <span className="font-semibold text-blue-700">Project ID:</span>
                      <span className="font-mono text-blue-900 select-all">{formData.id}</span>
                      <button
                        className="ml-1 px-2 py-0.5 text-xs bg-blue-200 rounded hover:bg-blue-300 text-blue-900"
                        onClick={() => navigator.clipboard.writeText(formData.id)}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete Project
                    </button>
                  </div>
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

