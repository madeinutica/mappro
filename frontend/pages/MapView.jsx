import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../config/mapbox.config';
import { getProjects, getClientInfo } from '../utils/projectApi';

console.log('MAPBOX_TOKEN:', MAPBOX_TOKEN);
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapView = ({ user, embedMode = false, embedParams = {} }) => {
  console.log('MapView component rendering...');
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [projects, setProjects] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching projects...');
        const projectsData = await getProjects(false, embedParams.clientId);
        console.log('Projects fetched:', projectsData);
        
        // Filter projects based on embed parameters
        let filteredProjects = projectsData || [];
        if (embedParams.projectId) {
          filteredProjects = filteredProjects.filter(p => p.id === embedParams.projectId);
        }
        if (embedParams.clientId) {
          filteredProjects = filteredProjects.filter(p => p.client_id === embedParams.clientId);
        }
        if (embedParams.filter) {
          // Add filtering logic based on filter parameter if needed
          // For now, just filter by published status
          filteredProjects = filteredProjects.filter(p => p.is_published);
        }
        
        setProjects(filteredProjects);

        if (user) {
          try {
            const clientData = await getClientInfo();
            setClientInfo(clientData);
          } catch (clientErr) {
            console.warn('Failed to fetch client info:', clientErr);
            // Don't set error for client info failure, it's not critical
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, embedParams]);

  useEffect(() => {
    console.log('Map effect triggered:', { loading, error, projectsLength: projects.length });
    if (loading || error || !projects.length) {
      console.log('Skipping map initialization:', { loading, error, hasProjects: projects.length > 0 });
      return;
    }
    if (map.current) return;

    console.log('Initializing map with projects:', projects);
    console.log('Map container:', mapContainer.current);

    try {
      console.log('Creating map with container:', mapContainer.current);
      console.log('Container dimensions:', mapContainer.current?.offsetWidth, mapContainer.current?.offsetHeight);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-75.5, 42.7],
        zoom: 7
      });

      console.log('Map created:', map.current);

      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map: ' + (e.error?.message || 'Unknown error'));
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map: ' + err.message);
      return;
    }

    projects.forEach(project => {
      try {
        console.log('Adding marker for project:', project.name, project.lat, project.lng, typeof project.lat, typeof project.lng);
        if (!project.lng || !project.lat) {
          console.warn('Project missing coordinates:', project);
          return;
        }

        // Ensure coordinates are numbers
        const lat = parseFloat(project.lat);
        const lng = parseFloat(project.lng);

        if (isNaN(lat) || isNaN(lng)) {
          console.error('Invalid coordinates for project:', project.name, project.lat, project.lng);
          return;
        }

        console.log('Creating marker at:', lng, lat);

        // Create a red marker using a custom element
        const el = document.createElement('div');
        el.style.background = '#d32f2f';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
        el.style.border = '2px solid #fff';
        el.style.cursor = 'pointer';

        // Build popup content with project details
        const categoryInfo = [];
        const subCategoryInfo = [];
        
        // Check capitalized category fields (which contain the actual data)
        if (project['Category 1'] && project['Category 1'] !== 'null' && project['Category 1'] !== '') {
          categoryInfo.push(project['Category 1']);
        }
        if (project['Category 2'] && project['Category 2'] !== 'null' && project['Category 2'] !== '') {
          categoryInfo.push(project['Category 2']);
        }
        if (project['Category 3'] && project['Category 3'] !== 'null' && project['Category 3'] !== '') {
          categoryInfo.push(project['Category 3']);
        }
        if (project['Category 4'] && project['Category 4'] !== 'null' && project['Category 4'] !== '') {
          categoryInfo.push(project['Category 4']);
        }
        if (project['Category 5'] && project['Category 5'] !== 'null' && project['Category 5'] !== '') {
          categoryInfo.push(project['Category 5']);
        }
        if (project['Category 6'] && project['Category 6'] !== 'null' && project['Category 6'] !== '') {
          categoryInfo.push(project['Category 6']);
        }
        if (project['Category 7'] && project['Category 7'] !== 'null' && project['Category 7'] !== '') {
          categoryInfo.push(project['Category 7']);
        }

        // Check sub-categories
        if (project['Sub Category 1'] && project['Sub Category 1'] !== 'null' && project['Sub Category 1'] !== '') {
          subCategoryInfo.push(project['Sub Category 1']);
        }
        if (project['Sub Category 2'] && project['Sub Category 2'] !== 'null' && project['Sub Category 2'] !== '') {
          subCategoryInfo.push(project['Sub Category 2']);
        }
        if (project['Sub Category 3'] && project['Sub Category 3'] !== 'null' && project['Sub Category 3'] !== '') {
          subCategoryInfo.push(project['Sub Category 3']);
        }

        // Check for photos
        const hasBeforePhoto = project.before_photo && project.before_photo !== 'null' && project.before_photo !== '';
        const hasAfterPhoto = project.after_photo && project.after_photo !== 'null' && project.after_photo !== '';

        const popupContent = `
          <div class="max-w-sm">
            <h3 class="font-bold text-lg mb-2">${project.name || 'Unnamed Project'}</h3>
            ${project.description ? `<p class="mb-2">${project.description}</p>` : ''}
            ${categoryInfo.length > 0 ? `<p class="text-sm text-gray-600"><strong>Categories:</strong> ${categoryInfo.join(', ')}</p>` : ''}
            ${subCategoryInfo.length > 0 ? `<p class="text-sm text-gray-600"><strong>Details:</strong> ${subCategoryInfo.join(', ')}</p>` : ''}
            ${(hasBeforePhoto || hasAfterPhoto) ? `
              <div class="mt-3 flex gap-2">
                ${hasBeforePhoto ? `<img src="${project.before_photo}" alt="Before" class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-gray-300 hover:border-blue-500" onclick="window.openImageModal('${project.before_photo}', 'Before - ${project.name}')" />` : ''}
                ${hasAfterPhoto ? `<img src="${project.after_photo}" alt="After" class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-gray-300 hover:border-blue-500" onclick="window.openImageModal('${project.after_photo}', 'After - ${project.name}')" />` : ''}
              </div>
            ` : ''}
            ${project.street || project.city || project.state ? `<p class="text-sm text-gray-600 mt-1">${[project.street, project.city, project.state].filter(Boolean).join(', ')}</p>` : ''}
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(popupContent)
          )
          .addTo(map.current);
      } catch (err) {
        console.error('Error creating marker for project:', project, err);
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [projects, loading, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Error loading projects: {error}</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${embedMode ? 'h-screen' : 'h-screen relative'}`}>
      {!embedMode && loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-lg">Loading map...</div>
        </div>
      )}
      {!embedMode && error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-red-600">Error: {error}</div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-screen" style={{ minHeight: '400px' }} />

      {/* Image Modal - only show in non-embed mode */}
      {!embedMode && imageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setImageModal({ isOpen: false, src: '', alt: '' })}>
          <div className="relative max-w-4xl max-h-screen p-4">
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
              onClick={() => setImageModal({ isOpen: false, src: '', alt: '' })}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
