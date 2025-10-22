import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../../config/mapbox.config';
import { getProjects, getClientInfo } from '../utils/projectApi';

mapboxgl.accessToken = MAPBOX_TOKEN;

const MapView = ({ user }) => {
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
        const projectsData = await getProjects();
        console.log('Projects fetched:', projectsData);
        setProjects(projectsData || []);

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
  }, [user]);

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
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-75.5, 42.7],
        zoom: 7
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map');
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
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

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div class="max-w-sm"><h3 class="font-bold text-lg mb-2">${project.name || 'Unnamed Project'}</h3><p>Loading details...</p></div>`)
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
    <div className="w-full h-screen relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-lg">Loading map...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-red-600">Error: {error}</div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-screen" />

      {/* Image Modal */}
      {imageModal.isOpen && (
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
