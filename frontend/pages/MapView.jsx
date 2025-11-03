import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../config/mapbox.config';
import { getProjects, getClientInfo } from '../utils/projectApi';
import ProjectPopup from '../components/ProjectPopup';
import { renderToString } from 'react-dom/server';

console.log('MAPBOX_TOKEN:', MAPBOX_TOKEN);
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapView = ({ user, embedMode = false, embedParams = {}, clientId }) => {
  console.log('MapView component rendering...');
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [projects, setProjects] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);
  const [mapConfig, setMapConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });
  const [mapInitialized, setMapInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const previousProjectsRef = useRef(null);
  const dataFetchedRef = useRef(false);
  const lastUserRef = useRef(null);
  const lastEmbedParamsRef = useRef(null);

  // Fetch data only when user or embed params actually change
  useEffect(() => {
    const userChanged = lastUserRef.current?.email !== user?.email;
    const embedParamsChanged = JSON.stringify(lastEmbedParamsRef.current) !== JSON.stringify(embedParams);

    if (!userChanged && !embedParamsChanged && dataFetchedRef.current) {
      console.log('No changes detected, skipping data fetch');
      return;
    }

    console.log('User or embed params changed, fetching data...', { userChanged, embedParamsChanged });

    lastUserRef.current = user;
    lastEmbedParamsRef.current = embedParams;
    dataFetchedRef.current = false;

    const fetchData = async () => {
      try {
        console.log('Fetching projects...');
        const projectsData = await getProjects(false, embedParams.clientId, clientId);
        console.log('Projects fetched:', projectsData);
        
        // Filter projects based on embed parameters and category filter
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
        
        // Generate filters based on client
        let filters = [];
        const clientIdentifier = embedParams.clientId || clientId;
        
        // Check if this client has the typical New York Sash categories
        const hasNYSashCategories = filteredProjects.some(project => {
          for (let i = 1; i <= 7; i++) {
            const category = project[`Category ${i}`];
            if (category) {
              const catLower = category.toLowerCase();
              if (catLower.includes('doors') || catLower.includes('windows') || 
                  catLower.includes('bathrooms') || catLower.includes('baths') || 
                  catLower.includes('siding')) {
                return true;
              }
            }
          }
          return false;
        });
        
        if (hasNYSashCategories) {
          // Hardcoded filters for New York Sash style clients
          filters = [
            { key: 'all', label: 'All' },
            { key: 'doors-windows', label: 'Doors & Windows' },
            { key: 'bathrooms', label: 'Bathrooms' },
            { key: 'siding', label: 'Siding' }
          ];
        } else {
          // Dynamic filters for other clients
          const categorySet = new Set();
          filteredProjects.forEach(project => {
            // Check all category fields (Category 1 through Category 7)
            for (let i = 1; i <= 7; i++) {
              const category = project[`Category ${i}`];
              if (category && category.trim() && category !== 'null') {
                categorySet.add(category.trim().toLowerCase());
              }
            }
          });
          
          // Convert to sorted array and create filter objects
          const uniqueCategories = Array.from(categorySet).sort();
          filters = [
            { key: 'all', label: 'All' },
            ...uniqueCategories.map(category => ({
              key: category,
              label: category.charAt(0).toUpperCase() + category.slice(1) // Capitalize first letter
            }))
          ];
        }
        
        setDynamicFilters(filters);
        setProjects(filteredProjects);
        dataFetchedRef.current = true;
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email, JSON.stringify(embedParams), clientId]); // Use stable values

  // Load client configuration separately (can be refreshed independently)
  useEffect(() => {
    const loadClientConfig = async () => {
      try {
        console.log('Loading client configuration...');
        const clientData = await getClientInfo();
        setClientInfo(clientData);
        setModalConfig(clientData?.modal_config || null);
        setMapConfig(clientData?.map_config || null);
        console.log('Client configuration loaded:', clientData?.map_config);
      } catch (clientErr) {
        console.warn('Failed to fetch client info:', clientErr);
        // Don't set error for client info failure, it's not critical
      }
    };

    // Always load fresh config when component mounts or when refresh is triggered
    loadClientConfig();

    // Listen for configuration refresh events
    const handleConfigRefresh = () => {
      console.log('Configuration refresh requested');
      loadClientConfig(); // Reload config immediately
    };

    window.addEventListener('refreshMapConfig', handleConfigRefresh);

    return () => {
      window.removeEventListener('refreshMapConfig', handleConfigRefresh);
    };
  }, [user?.email, clientId]); // Re-load config when user or client changes

  // Apply category filtering to projects
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => {
        // Check if any category field contains the selected category (case-insensitive)
        for (let i = 1; i <= 7; i++) {
          const category = project[`Category ${i}`];
          if (category) {
            const categoryLower = category.toLowerCase();
            
            // Special handling for bathrooms to also match "baths"
            if (selectedCategory === 'bathrooms') {
              if (categoryLower.includes('bathrooms') || categoryLower.includes('baths')) {
                return true;
              }
            } else if (categoryLower.includes(selectedCategory)) {
              return true;
            }
          }
        }
        return false;
      });
      setFilteredProjects(filtered);
    }
  }, [projects, selectedCategory]);

  // Initialize map only once
  useEffect(() => {
    console.log('Map init effect triggered:', { loading, error, mapInitialized });
    if (loading || error || map.current) {
      console.log('Skipping map initialization:', { loading, error, hasMap: !!map.current });
      return;
    }

    console.log('Initializing map...');
    console.log('Map container:', mapContainer.current);

    try {
      console.log('Creating map with container:', mapContainer.current);
      console.log('Container dimensions:', mapContainer.current?.offsetWidth, mapContainer.current?.offsetHeight);

      // Use mapConfig if available, otherwise fall back to defaults
      const mapStyle = mapConfig?.mapStyle ? `mapbox://styles/mapbox/${mapConfig.mapStyle}` : 'mapbox://styles/mapbox/light-v10';
      
      // Calculate center: use mapConfig if set, otherwise center on first project or default
      let centerLat, centerLng;
      if (mapConfig?.centerLat !== undefined && mapConfig?.centerLng !== undefined && mapConfig?.centerLat !== null && mapConfig?.centerLng !== null) {
        // Use custom center from map config
        centerLat = mapConfig.centerLat;
        centerLng = mapConfig.centerLng;
        console.log('Using custom center from config:', centerLat, centerLng);
      } else if (filteredProjects.length > 0) {
        // Center on first project if no custom center is set
        const firstProject = filteredProjects[0];
        centerLat = parseFloat(firstProject.lat);
        centerLng = parseFloat(firstProject.lng);
        console.log('Centering map on first project:', firstProject.name, centerLat, centerLng);
      } else {
        // Fallback to default (New York area)
        centerLat = 42.7;
        centerLng = -75.5;
        console.log('Using default center:', centerLat, centerLng);
      }
      
      const initialZoom = mapConfig?.initialZoom || 7;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [centerLng, centerLat],
        zoom: initialZoom,
        minZoom: mapConfig?.minZoom || 0,
        maxZoom: mapConfig?.maxZoom || 20
      });

      console.log('Map created:', map.current);

      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully');
        setMapInitialized(true);

        // Add map controls based on configuration
        if (mapConfig) {
          if (mapConfig.showNavigationControl) {
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          }
          if (mapConfig.showFullscreenControl) {
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
          }
          if (mapConfig.showGeolocateControl) {
            map.current.addControl(new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true
              },
              trackUserLocation: true
            }), 'top-right');
          }
        } else {
          // Default controls if no config
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        }
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError('Failed to load map: ' + (e.error?.message || 'Unknown error'));
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map: ' + err.message);
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

  // Update map configuration when mapConfig changes
  useEffect(() => {
    if (!map.current || !mapInitialized || !mapConfig) {
      return;
    }

    console.log('🔧 Updating map configuration:', mapConfig);

    try {
      // Update map style if it changed
      const newStyle = `mapbox://styles/mapbox/${mapConfig.mapStyle}`;
      if (map.current.getStyle().sprite !== newStyle.split('/').pop()) {
        map.current.setStyle(newStyle);
      }

      // Update center if custom center is set
      if (mapConfig.centerLat !== undefined && mapConfig.centerLng !== undefined && mapConfig.centerLat !== null && mapConfig.centerLng !== null) {
        map.current.setCenter([mapConfig.centerLng, mapConfig.centerLat]);
        console.log('Updated map center to:', mapConfig.centerLat, mapConfig.centerLng);
      } else if (filteredProjects.length > 0) {
        // Center on first project if no custom center is set
        const firstProject = filteredProjects[0];
        const centerLat = parseFloat(firstProject.lat);
        const centerLng = parseFloat(firstProject.lng);
        map.current.setCenter([centerLng, centerLat]);
        console.log('Centered map on first project:', firstProject.name, centerLat, centerLng);
      }

      // Update zoom levels
      if (mapConfig.initialZoom !== undefined) {
        map.current.setZoom(mapConfig.initialZoom);
      }
      if (mapConfig.minZoom !== undefined) {
        map.current.setMinZoom(mapConfig.minZoom);
      }
      if (mapConfig.maxZoom !== undefined) {
        map.current.setMaxZoom(mapConfig.maxZoom);
      }

      // Update controls
      // Note: Mapbox GL JS doesn't provide a way to remove controls once added,
      // so we would need to reinitialize the map to change controls.
      // For now, we'll skip control updates as they require map reinitialization.

    } catch (err) {
      console.error('Error updating map configuration:', err);
    }
  }, [mapConfig, mapInitialized, filteredProjects]);

  // Update markers when projects change or map initializes
  useEffect(() => {
    console.log('🔄 Markers effect triggered:', {
      mapInitialized,
      projectsLength: filteredProjects.length,
      hasMap: !!map.current,
      projectsChanged: JSON.stringify(filteredProjects) !== JSON.stringify(previousProjectsRef.current)
    });

    // Always update markers if map is initialized and we have projects
    // Don't skip just because projects haven't changed - we need to create markers on first load
    if (!mapInitialized || !map.current || !filteredProjects.length) {
      console.log('⏭️ Skipping marker creation:', { mapInitialized, hasMap: !!map.current, hasProjects: filteredProjects.length > 0 });
      return;
    }

    // Double-check map is still valid
    if (!map.current || !map.current.isStyleLoaded()) {
      console.log('🗺️ Map not ready, skipping marker creation');
      return;
    }

    console.log('📍 Updating markers for projects:', filteredProjects.map(p => p.name));

    // Clear existing markers
    console.log('Clearing existing markers:', markersRef.current.length);
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (err) {
        console.warn('Error removing marker:', err);
      }
    });
    markersRef.current = [];
    console.log('Markers cleared, now adding new ones');

    filteredProjects.forEach(project => {
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

        // Get marker customization from mapConfig or embed params or use defaults
        const markerColor = embedParams?.markerColor || mapConfig?.markerColor || '#2563eb';
        const markerStyle = embedParams?.markerStyle || mapConfig?.markerStyle || 'circle';
        const markerSize = embedParams?.markerSize || mapConfig?.markerSize || 24;

        // Create a custom marker element based on style
        const el = document.createElement('div');
        
        // Set base styles
        el.style.width = `${markerSize}px`;
        el.style.height = `${markerSize}px`;
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
        el.style.border = '2px solid #fff';
        el.style.cursor = 'pointer';
        el.style.backgroundColor = markerColor;

        // Apply style-specific properties
        switch (markerStyle) {
          case 'circle':
            el.style.borderRadius = '50%';
            break;
          case 'square':
            el.style.borderRadius = '0';
            break;
          case 'triangle':
            el.style.borderRadius = '0';
            el.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
            break;
          case 'diamond':
            el.style.borderRadius = '0';
            el.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            break;
          case 'pin':
            el.style.borderRadius = '0';
            el.style.clipPath = 'polygon(50% 0%, 85% 35%, 70% 65%, 50% 100%, 30% 65%, 15% 35%)';
            break;
          default:
            el.style.borderRadius = '50%'; // default to circle
        }

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

        // Create enhanced project object with category info
        const enhancedProject = {
          ...project,
          categoryInfo,
          subCategoryInfo
        };

        const popupContent = renderToString(<ProjectPopup project={enhancedProject} modalConfig={modalConfig} />);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(popupContent)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      } catch (err) {
        console.error('Error creating marker for project:', project, err);
      }
    });
    
    console.log('Finished adding markers, total markers now:', markersRef.current.length);
  }, [filteredProjects, mapInitialized, mapConfig]);

  // Set up global function for image modal
  useEffect(() => {
    window.openImageModal = (src, alt) => {
      console.log('Opening image modal:', src, alt);
      setImageModal({ isOpen: true, src, alt });
    };

    // Listen for custom events from popup images
    const handleImageModalEvent = (event) => {
      console.log('Received openImageModal event:', event.detail);
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        setImageModal({ isOpen: true, src: event.detail.src, alt: event.detail.alt });
      }, 10);
    };

    document.addEventListener('openImageModal', handleImageModalEvent);

    return () => {
      delete window.openImageModal;
      document.removeEventListener('openImageModal', handleImageModalEvent);
    };
  }, []);

  // Debug modal state changes
  useEffect(() => {
    console.log('📱 Image modal state changed:', imageModal);
  }, [imageModal]);

  // Debug mapInitialized changes
  useEffect(() => {
    console.log('🗺️ mapInitialized changed:', mapInitialized);
  }, [mapInitialized]);

  // Prevent map clicks from interfering when modal is open
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    const handleMapClick = (e) => {
      if (imageModal.isOpen) {
        console.log('Preventing map click while modal is open');
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [imageModal.isOpen, mapInitialized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 font-lato">
        <div className="text-lg text-primary-700">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 font-lato">
        <div className="text-accent-600">Error loading projects: {error}</div>
      </div>
    );
  }

  const markerColor = embedParams?.markerColor || mapConfig?.markerColor || '#2563eb';

  return (
    <div className={`w-full ${embedMode ? 'h-full' : 'h-[600px] relative'} font-inter`}>
      {/* Hide Mapbox logo */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .mapboxgl-ctrl-attrib,
          .mapboxgl-ctrl-attrib a,
          .mapboxgl-ctrl-attrib button,
          .mapboxgl-ctrl-logo {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        `
      }} />
      
      {!embedMode && loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-cream z-10 font-lato">
          <div className="text-lg text-primary-700">Loading map...</div>
        </div>
      )}
      {!embedMode && error && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-cream z-10 font-lato">
          <div className="text-accent-600">Error: {error}</div>
        </div>
      )}
      <div ref={mapContainer} className={`w-full ${embedMode ? 'h-full' : 'h-[600px]'}`} style={{ minHeight: '400px' }} />

      {/* Category Filter Buttons - Bottom Right */}
      {(!mapConfig || mapConfig.showCategoryFilters !== false) && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          {dynamicFilters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedCategory(filter.key)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedCategory === filter.key
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
              style={selectedCategory === filter.key ? { backgroundColor: markerColor } : {}}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Logo - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10">
        <a href="/" target="_blank" rel="noopener noreferrer">
          <img src="/assets/logos/mappro-logo.png" alt="MapPro" className="max-w-[130px] h-auto cursor-pointer hover:opacity-80 transition-opacity grayscale" />
        </a>
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 font-lato" 
          onClick={() => {
            console.log('Modal background clicked, closing modal');
            setImageModal({ isOpen: false, src: '', alt: '' });
          }}
          style={{ zIndex: 9999 }}
        >
          <div className="relative max-w-4xl max-h-screen p-4 bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">{imageModal.alt}</h3>
            </div>
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              className="max-w-full max-h-96 object-contain mx-auto block"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
              onClick={() => {
                console.log('Close button clicked, closing modal');
                setImageModal({ isOpen: false, src: '', alt: '' });
              }}
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
