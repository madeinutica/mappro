import React, { useState, useEffect, useRef } from 'react';
import { getProjects, updateProject, deleteProject, uploadPhoto, deletePhoto, addProject, getReviews, addReview, updateReview, deleteReview, getClientInfo } from '../utils/projectApi';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Admin = ({ onMap }) => {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'edit' or 'embed' or 'modal-builder'
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
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, text: '' });
  const [savingReview, setSavingReview] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState(1);
  const [embedMarkerColor, setEmbedMarkerColor] = useState('#2563eb');
  const [embedMarkerStyle, setEmbedMarkerStyle] = useState('circle');
  const [modalConfig, setModalConfig] = useState({
    cta: {
      message: 'Thinking about a similar project?',
      buttonText: 'Get a Free Quote',
      buttonColor: '#2563eb',
      buttonUrl: null
    },
    showReviews: true,
    showCategories: true,
    showSubCategories: true,
    showProductDetails: true,
    showCustomFields: true,
    showLocation: true,
    showCTA: true,
    customFields: []
  });
  const [savingModalConfig, setSavingModalConfig] = useState(false);
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

  // Load reviews when project is selected
  useEffect(() => {
    const loadReviews = async () => {
      if (selected) {
        try {
          const projectReviews = await getReviews(selected);
          setReviews(projectReviews || []);
        } catch (error) {
          console.error('Error loading reviews:', error);
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
    };
    loadReviews();
  }, [selected]);

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
    
    // Determine how many category fields should be visible based on existing data
    let maxVisible = 1;
    for (let i = 1; i <= 7; i++) {
      if (cleanedProject[`Category ${i}`] || cleanedProject[`Sub Category ${i}`]) {
        maxVisible = i;
      }
    }
    setVisibleCategories(maxVisible);
  };

  const handleBackToDashboard = () => {
    setSelected(null);
    setView('dashboard');
    setFormData({});
    setVisibleCategories(1);
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

  const handleAddReview = async () => {
    if (!selected || !newReview.author.trim() || !newReview.text.trim()) return;

    // Check if review already exists
    if (reviews.length > 0) {
      alert('A review already exists for this project. Please edit the existing review instead.');
      return;
    }

    setSavingReview(true);
    try {
      const reviewData = {
        project_id: selected,
        author: newReview.author.trim(),
        rating: parseInt(newReview.rating),
        text: newReview.text.trim()
      };

      await addReview(reviewData);
      
      // Refresh reviews
      const updatedReviews = await getReviews(selected);
      setReviews(updatedReviews || []);
      
      // Reset form
      setNewReview({ author: '', rating: 5, text: '' });
      
      alert('Review added successfully!');
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Error adding review: ' + error.message);
    } finally {
      setSavingReview(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    setSavingReview(true);
    try {
      const updates = {
        author: editingReview.author.trim(),
        rating: parseInt(editingReview.rating),
        text: editingReview.text.trim()
      };

      await updateReview(editingReview.id, updates);
      
      // Refresh reviews
      const updatedReviews = await getReviews(selected);
      setReviews(updatedReviews || []);
      
      // Exit edit mode
      setEditingReview(null);
      
      alert('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error updating review: ' + error.message);
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId);
      
      // Refresh reviews
      const updatedReviews = await getReviews(selected);
      setReviews(updatedReviews || []);
      
      alert('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review: ' + error.message);
    }
  };

  const startEditingReview = (review) => {
    setEditingReview({ ...review });
  };

  const cancelEditingReview = () => {
    setEditingReview(null);
  };

  // Load modal configuration
  const loadModalConfig = async () => {
    try {
      const clientInfo = await getClientInfo();
      if (clientInfo?.modal_config) {
        setModalConfig(clientInfo.modal_config);
      }
    } catch (error) {
      console.error('Error loading modal config:', error);
    }
  };

  // Save modal configuration
  const saveModalConfig = async () => {
    setSavingModalConfig(true);
    try {
      // Update client with new modal config
      const { data, error } = await supabase
        .from('clients')
        .update({ modal_config: modalConfig })
        .eq('id', clientId);

      if (error) throw error;
      alert('Modal configuration saved successfully!');
    } catch (error) {
      console.error('Error saving modal config:', error);
      alert('Error saving modal configuration: ' + error.message);
    } finally {
      setSavingModalConfig(false);
    }
  };

  // Update modal config
  const updateModalConfig = (key, value) => {
    setModalConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update CTA config
  const updateCTAConfig = (key, value) => {
    setModalConfig(prev => ({
      ...prev,
      cta: {
        ...prev.cta,
        [key]: value
      }
    }));
  };

  // Add custom field
  const addCustomField = () => {
    setModalConfig(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        { type: 'text', label: '', value: '' }
      ]
    }));
  };

  // Update custom field
  const updateCustomField = (index, field, value) => {
    setModalConfig(prev => ({
      ...prev,
      customFields: prev.customFields.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Remove custom field
  const removeCustomField = (index) => {
    setModalConfig(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  // Calculate dashboard stats
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.is_published).length;
  const unpublishedProjects = totalProjects - publishedProjects;
  const newestProject = projects.length > 0 ? projects.reduce((newest, project) => 
    !newest || new Date(project.created_at || 0) > new Date(newest.created_at || 0) ? project : newest
  ) : null;

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
                <label className="block text-sm font-medium text-neutral-dark mb-1">Details</label>
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
      <div className="bg-blue-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Mapro Admin</h1>
        <p className="text-blue-100">Manage your interactive map projects and embed codes</p>
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
                onClick={() => onMap(embedMarkerColor, embedMarkerStyle)}
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
                onClick={() => {
                  setView('modal-builder');
                  loadModalConfig();
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'modal-builder'
                    ? 'bg-green-100 text-green-700'
                    : 'hover:bg-green-50 text-gray-700'
                }`}
              >
                🎨 Modal Builder
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
                    {clientId && (
                      <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-center gap-4">
                        <span className="font-semibold text-yellow-700">Client ID:</span>
                        <span className="font-mono text-yellow-900 select-all">{clientId}</span>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Embed URL:</label>
                      <code className="block bg-neutral-cream p-3 rounded border text-sm break-all">
                        {`${window.location.origin}?embed=true&client=${clientId || 'YOUR_CLIENT_ID'}&markerColor=${encodeURIComponent(embedMarkerColor)}&markerStyle=${embedMarkerStyle}`}
                      </code>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">HTML Embed Code:</label>
                        <button
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => navigator.clipboard.writeText(`<iframe src="${window.location.origin}?embed=true&client=${clientId || 'YOUR_CLIENT_ID'}&markerColor=${encodeURIComponent(embedMarkerColor)}&markerStyle=${embedMarkerStyle}" width="100%" height="600" frameborder="0"></iframe>`)}
                        >
                          Copy Code
                        </button>
                      </div>
                      <code className="block bg-neutral-cream p-3 rounded border text-sm break-all">
                        {`<iframe src="${window.location.origin}?embed=true&client=${clientId || 'YOUR_CLIENT_ID'}&markerColor=${encodeURIComponent(embedMarkerColor)}&markerStyle=${embedMarkerStyle}" width="100%" height="600" frameborder="0"></iframe>`}
                      </code>
                    </div>

                    {/* Customization Controls */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Map Customization</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Marker Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Marker Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={embedMarkerColor}
                              onChange={(e) => setEmbedMarkerColor(e.target.value)}
                              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={embedMarkerColor}
                              onChange={(e) => setEmbedMarkerColor(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                              placeholder="#2563eb"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Choose the color for map markers</p>
                        </div>

                        {/* Marker Style */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Marker Style</label>
                          <select
                            value={embedMarkerStyle}
                            onChange={(e) => setEmbedMarkerStyle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="circle">Circle</option>
                            <option value="square">Square</option>
                            <option value="triangle">Triangle</option>
                            <option value="diamond">Diamond</option>
                            <option value="pin">Location Pin</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Select the shape of map markers</p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">Marker:</div>
                          <div 
                            className="w-6 h-6 border-2 border-white shadow-sm"
                            style={{
                              backgroundColor: embedMarkerColor,
                              borderRadius: embedMarkerStyle === 'circle' ? '50%' : 
                                          embedMarkerStyle === 'square' ? '0' : 
                                          embedMarkerStyle === 'triangle' ? '0' : 
                                          embedMarkerStyle === 'diamond' ? '0' :
                                          embedMarkerStyle === 'pin' ? '50% 50% 50% 50% / 60% 60% 40% 40%' : '50%',
                              clipPath: embedMarkerStyle === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                                       embedMarkerStyle === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                                       embedMarkerStyle === 'pin' ? 'polygon(50% 0%, 85% 35%, 70% 65%, 50% 100%, 30% 65%, 15% 35%)' : 'none'
                            }}
                          ></div>
                          <div className="text-sm text-gray-600">
                            {embedMarkerStyle === 'circle' ? 'Circle' :
                             embedMarkerStyle === 'square' ? 'Square' :
                             embedMarkerStyle === 'triangle' ? 'Triangle' :
                             embedMarkerStyle === 'diamond' ? 'Diamond' :
                             embedMarkerStyle === 'pin' ? 'Location Pin' : 'Unknown'} • {embedMarkerColor}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Customization Options:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <code>width</code> and <code>height</code>: Adjust iframe dimensions</li>
                        <li>• <code>project=PROJECT_ID</code>: Show only a specific project</li>
                        <li>• <code>filter=published</code>: Only show published projects (default)</li>
                        <li>• <code>markerColor=HEX_COLOR</code>: Set marker color (e.g., #2563eb)</li>
                        <li>• <code>markerStyle=STYLE</code>: Set marker style (circle, square, triangle, diamond)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : view === 'modal-builder' ? (
              <div className="bg-neutral-cream rounded-xl shadow p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleBackToDashboard}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ← Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-green-700">Modal Builder</h2>
                  </div>
                  <button
                    onClick={saveModalConfig}
                    disabled={savingModalConfig}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingModalConfig ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Visibility</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showReviews"
                              checked={modalConfig.showReviews}
                              onChange={(e) => updateModalConfig('showReviews', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showReviews" className="ml-2 block text-sm text-gray-900">
                              Show Reviews
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showCategories"
                              checked={modalConfig.showCategories}
                              onChange={(e) => updateModalConfig('showCategories', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showCategories" className="ml-2 block text-sm text-gray-900">
                              Show Categories
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showSubCategories"
                              checked={modalConfig.showSubCategories}
                              onChange={(e) => updateModalConfig('showSubCategories', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showSubCategories" className="ml-2 block text-sm text-gray-900">
                              Show Sub-Categories
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showProductDetails"
                              checked={modalConfig.showProductDetails}
                              onChange={(e) => updateModalConfig('showProductDetails', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showProductDetails" className="ml-2 block text-sm text-gray-900">
                              Show Product Details
                            </label>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showCustomFields"
                              checked={modalConfig.showCustomFields !== false}
                              onChange={(e) => updateModalConfig('showCustomFields', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showCustomFields" className="ml-2 block text-sm text-gray-900">
                              Show Custom Fields
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showLocation"
                              checked={modalConfig.showLocation !== false}
                              onChange={(e) => updateModalConfig('showLocation', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showLocation" className="ml-2 block text-sm text-gray-900">
                              Show Location (City, State, ZIP)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="showCTA"
                              checked={modalConfig.showCTA !== false}
                              onChange={(e) => updateModalConfig('showCTA', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showCTA" className="ml-2 block text-sm text-gray-900">
                              Show Call-to-Action Button
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Custom Fields</h3>
                      <button
                        onClick={addCustomField}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Field
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      {modalConfig.customFields.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No custom fields added yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {modalConfig.customFields.map((field, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                  <select
                                    value={field.type}
                                    onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                  >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="url">URL</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                                    placeholder="Field label"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                  <input
                                    type={field.type}
                                    value={field.value}
                                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                                    placeholder="Field value"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end mt-3">
                                <button
                                  onClick={() => removeCustomField(index)}
                                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Call-to-Action (CTA)</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA Message</label>
                        <input
                          type="text"
                          value={modalConfig.cta.message}
                          onChange={(e) => updateCTAConfig('message', e.target.value)}
                          placeholder="Thinking about a similar project?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                        <input
                          type="text"
                          value={modalConfig.cta.buttonText}
                          onChange={(e) => updateCTAConfig('buttonText', e.target.value)}
                          placeholder="Get a Free Quote"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={modalConfig.cta.buttonColor}
                            onChange={(e) => updateCTAConfig('buttonColor', e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={modalConfig.cta.buttonColor}
                            onChange={(e) => updateCTAConfig('buttonColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                            placeholder="#2563eb"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Button URL (Optional)</label>
                        <input
                          type="url"
                          value={modalConfig.cta.buttonUrl || ''}
                          onChange={(e) => updateCTAConfig('buttonUrl', e.target.value)}
                          placeholder="https://example.com/quote"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="max-w-xs bg-neutral-cream p-2 rounded-lg shadow-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 leading-tight">Sample Project</h3>
                        
                        {modalConfig.showLocation && (
                          <div className="text-sm text-gray-600 mb-2">Sample City, NY</div>
                        )}
                        
                        {modalConfig.showReviews && (
                          <div className="mb-2">
                            <div className="flex items-center mb-1">
                              {[...Array(5)].map((_, starIndex) => (
                                <svg key={starIndex} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-gray-700 italic mb-1">"Great work!"</p>
                          </div>
                        )}
                        
                        {modalConfig.showCategories && (
                          <div className="mb-1 flex flex-wrap gap-1">
                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">Doors & Windows</span>
                          </div>
                        )}
                        
                        {modalConfig.showSubCategories && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">Windows</span>
                          </div>
                        )}
                        
                        {modalConfig.showProductDetails && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">Product Details</div>
                            <div className="text-sm text-gray-600">Sample product description</div>
                          </div>
                        )}

                        {modalConfig.showCustomFields && modalConfig.customFields.map((field, index) => (
                          <div key={index} className="mb-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">{field.label}</div>
                            <div className="text-sm text-gray-600">{field.value}</div>
                          </div>
                        ))}
                        
                        {modalConfig.showCTA && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">{modalConfig.cta.message}</p>
                            <button 
                              className="w-full py-2 px-3 text-white text-sm font-medium rounded transition-colors"
                              style={{ backgroundColor: modalConfig.cta.buttonColor }}
                            >
                              {modalConfig.cta.buttonText}
                            </button>
                          </div>
                        )}
                      </div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                      {visibleCategories < 7 && (
                        <button
                          onClick={() => setVisibleCategories(prev => Math.min(prev + 1, 7))}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Category
                        </button>
                      )}
                    </div>
                    
                    {/* Render visible category sets */}
                    {Array.from({ length: visibleCategories }, (_, index) => {
                      const categoryNum = index + 1;
                      return (
                        <div key={categoryNum} className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category {categoryNum}</label>
                            <input
                              type="text"
                              value={formData[`Category ${categoryNum}`] || ''}
                              onChange={(e) => handleInputChange(`Category ${categoryNum}`, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category {categoryNum}</label>
                            <input
                              type="text"
                              value={formData[`Sub Category ${categoryNum}`] || ''}
                              onChange={(e) => handleInputChange(`Sub Category ${categoryNum}`, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })}
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

                  {/* Reviews */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800">Review</h3>
                    
                    {/* Existing Review */}
                    {reviews.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-gray-700">Current Review</h4>
                        {reviews.slice(0, 1).map(review => (
                          <div key={review.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            {editingReview?.id === review.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                    <input
                                      type="text"
                                      value={editingReview.author}
                                      onChange={(e) => setEditingReview(prev => ({ ...prev, author: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <select
                                      value={editingReview.rating}
                                      onChange={(e) => setEditingReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {[1, 2, 3, 4, 5].map(rating => (
                                        <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                                  <textarea
                                    value={editingReview.text}
                                    onChange={(e) => setEditingReview(prev => ({ ...prev, text: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleUpdateReview}
                                    disabled={savingReview}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {savingReview ? 'Saving...' : 'Save Changes'}
                                  </button>
                                  <button
                                    onClick={cancelEditingReview}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Author: {review.author}</span>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => startEditingReview(review)}
                                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview(review.id)}
                                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <p className="text-gray-700 italic">"{review.text}"</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Add New Review */
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-gray-700">Add Review</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                            <input
                              type="text"
                              value={newReview.author}
                              onChange={(e) => setNewReview(prev => ({ ...prev, author: e.target.value }))}
                              placeholder="Customer name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <select
                              value={newReview.rating}
                              onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {[1, 2, 3, 4, 5].map(rating => (
                                <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                          <textarea
                            value={newReview.text}
                            onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                            placeholder="Write the review text here..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={handleAddReview}
                          disabled={savingReview || !newReview.author.trim() || !newReview.text.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingReview ? 'Adding...' : 'Add Review'}
                        </button>
                      </div>
                    )}
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

