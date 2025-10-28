import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../../config/mapbox.config';

mapboxgl.accessToken = MAPBOX_TOKEN;

// Mock demo data
const mockProjects = [
  {
    id: 1,
    name: "Downtown Office Renovation",
    description: "Complete interior renovation of a 50,000 sq ft office building",
    lat: 40.7589,
    lng: -73.9851,
    street: "123 Business Ave",
    city: "New York",
    state: "NY",
    "Category 1": "Commercial",
    "Sub Category 1": "Office Building",
    "Category 2": "Renovation",
    "Sub Category 2": "Interior",
    before_photo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    after_photo: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400",
    is_published: true
  },
  {
    id: 2,
    name: "Residential Kitchen Remodel",
    description: "Modern kitchen renovation with custom cabinetry",
    lat: 40.7505,
    lng: -73.9934,
    street: "456 Home St",
    city: "New York",
    state: "NY",
    "Category 1": "Residential",
    "Sub Category 1": "Kitchen",
    "Category 2": "Remodel",
    "Sub Category 2": "Custom Cabinets",
    before_photo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    after_photo: "https://images.unsplash.com/photo-1556909020-f6e7ad7d3136?w=400",
    is_published: true
  },
  {
    id: 3,
    name: "Warehouse Conversion",
    description: "Industrial warehouse converted to modern loft apartments",
    lat: 40.7282,
    lng: -74.0078,
    street: "789 Industrial Blvd",
    city: "Brooklyn",
    state: "NY",
    "Category 1": "Commercial",
    "Sub Category 1": "Warehouse",
    "Category 2": "Conversion",
    "Sub Category 2": "Residential",
    before_photo: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400",
    after_photo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    is_published: true
  },
  {
    id: 4,
    name: "Historic Building Restoration",
    description: "Restoration of 19th-century brownstone facade",
    lat: 40.7831,
    lng: -73.9712,
    street: "321 Heritage Ln",
    city: "Manhattan",
    state: "NY",
    "Category 1": "Historic",
    "Sub Category 1": "Brownstone",
    "Category 2": "Restoration",
    "Sub Category 2": "Facade",
    before_photo: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400",
    after_photo: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400",
    is_published: true
  },
  {
    id: 5,
    name: "Modern Bathroom Renovation",
    description: "Luxury spa-like bathroom with marble finishes",
    lat: 40.7614,
    lng: -73.9776,
    street: "654 Luxury Ave",
    city: "New York",
    state: "NY",
    "Category 1": "Residential",
    "Sub Category 1": "Bathroom",
    "Category 2": "Luxury",
    "Sub Category 2": "Marble Finishes",
    before_photo: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400",
    after_photo: "https://images.unsplash.com/photo-1552321554-5fefe8bfe9d9?w=400",
    is_published: true
  }
];

const DemoMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    // Simulate loading delay for demo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (loading || error || map.current) return;

    try {
      console.log('Initializing demo map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-73.9851, 40.7589], // Center on NYC
        zoom: 11
      });

      map.current.on('load', () => {
        console.log('Demo map loaded successfully');
        setMapInitialized(true);
      });

      map.current.on('error', (e) => {
        console.error('Demo map error:', e);
        setError('Failed to load demo map');
      });
    } catch (err) {
      console.error('Error initializing demo map:', err);
      setError('Failed to initialize demo map');
      return;
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, [loading, error]);

  // Add markers when map is ready
  useEffect(() => {
    if (!mapInitialized || !map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for mock projects
    mockProjects.forEach(project => {
      try {
        const lat = parseFloat(project.lat);
        const lng = parseFloat(project.lng);

        // Create a blue marker for demo
        const el = document.createElement('div');
        el.style.background = '#2563eb';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
        el.style.border = '2px solid #fff';
        el.style.cursor = 'pointer';

        // Build popup content with project details
        const categoryInfo = [];
        const subCategoryInfo = [];

        if (project['Category 1']) categoryInfo.push(project['Category 1']);
        if (project['Category 2']) categoryInfo.push(project['Category 2']);
        if (project['Sub Category 1']) subCategoryInfo.push(project['Sub Category 1']);
        if (project['Sub Category 2']) subCategoryInfo.push(project['Sub Category 2']);

        const popupContent = `
          <div class="max-w-sm">
            <h3 class="font-bold text-lg mb-2">${project.name}</h3>
            <p class="mb-2">${project.description}</p>
            ${categoryInfo.length > 0 ? `<p class="text-sm text-gray-600"><strong>Categories:</strong> ${categoryInfo.join(', ')}</p>` : ''}
            ${subCategoryInfo.length > 0 ? `<p class="text-sm text-gray-600"><strong>Details:</strong> ${subCategoryInfo.join(', ')}</p>` : ''}
            ${(project.before_photo || project.after_photo) ? `
              <div class="mt-3 flex gap-2">
                ${project.before_photo ? `<img src="${project.before_photo}" alt="Before" class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-gray-300 hover:border-blue-500" onclick="window.openDemoImageModal('${project.before_photo}', 'Before - ${project.name}')" />` : ''}
                ${project.after_photo ? `<img src="${project.after_photo}" alt="After" class="w-16 h-16 object-cover rounded cursor-pointer border-2 border-gray-300 hover:border-blue-500" onclick="window.openDemoImageModal('${project.after_photo}', 'After - ${project.name}')" />` : ''}
              </div>
            ` : ''}
            <p class="text-sm text-gray-600 mt-1">${[project.street, project.city, project.state].filter(Boolean).join(', ')}</p>
            <div class="mt-2 text-xs text-blue-600 font-semibold">✨ Demo Project</div>
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(popupContent)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      } catch (err) {
        console.error('Error creating marker for demo project:', project, err);
      }
    });
  }, [mapInitialized]);

  // Set up global function for image modal
  useEffect(() => {
    window.openDemoImageModal = (src, alt) => {
      setImageModal({ isOpen: true, src, alt });
    };

    return () => {
      delete window.openDemoImageModal;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading demo map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Error loading demo map: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="w-full h-screen" />

      {/* Demo Banner */}
      <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-10">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🎯</span>
          <span className="font-semibold">Interactive Demo</span>
        </div>
        <p className="text-sm text-blue-100 mt-1">Click markers to explore sample projects</p>
      </div>

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

export default DemoMap;