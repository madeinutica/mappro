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
        setProjects(projectsData);

        if (user) {
          const clientData = await getClientInfo();
          setClientInfo(clientData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
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

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-75.5, 42.7],
      zoom: 7
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');
    });

    projects.forEach(project => {
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

      // Create popup HTML content
      const reviewsHtml = project.reviews && project.reviews.length > 0
        ? `<div class="mb-4">
            <h4 class="font-semibold mb-2">Reviews (${project.reviews.length})</h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              ${project.reviews.slice(0, 3).map(review => `
                <div class="bg-gray-50 p-2 rounded text-sm">
                  <div class="flex items-center mb-1">
                    <span class="font-medium">${review.author}</span>
                    <span class="ml-2 text-yellow-500">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                  </div>
                  <p class="text-gray-700">${review.text}</p>
                </div>
              `).join('')}
              ${project.reviews.length > 3 ? `<p class="text-xs text-gray-500 mt-1">...and ${project.reviews.length - 3} more reviews</p>` : ''}
            </div>
          </div>`
        : '';

      // Format address from separate fields
      const formatAddress = (project) => {
        const parts = [];
        if (project.street) parts.push(project.street);
        if (project.city) parts.push(project.city);
        if (project.state) parts.push(project.state);
        if (project.zip) parts.push(project.zip);
        return parts.length > 0 ? parts.join(', ') : (project.address || 'N/A');
      };

      // Format categories for display
      const formatCategories = (project) => {
        const categories = [];
        if (project['category 1']) categories.push(`${project['category 1']}${project['sub category 1'] ? ` (${project['sub category 1']})` : ''}`);
        if (project['category 2']) categories.push(`${project['category 2']}${project['sub category 2'] ? ` (${project['sub category 2']})` : ''}`);
        if (project['category 3']) categories.push(`${project['category 3']}${project['sub category 3'] ? ` (${project['sub category 3']})` : ''}`);
        return categories.length > 0 ? categories.join(', ') : '';
      };

      const categoriesText = formatCategories(project);

      const popupHtml = `
        <div class="max-w-sm">
          <h3 class="font-bold text-lg mb-2">${project.name}</h3>
          ${project.customer ? `<p class="mb-1"><b>Client:</b> ${project.customer}</p>` : ''}
          ${project.project_type ? `<p class="mb-1"><b>Project Type:</b> ${project.project_type}</p>` : ''}
          ${project['category 1'] ? `<p class="mb-1"><b>Project Type:</b> ${project['category 1']}</p>` : ''}
          ${project['sub category 1'] ? `<p class="mb-1"><b>Sub Category 1:</b> ${project['sub category 1']}</p>` : ''}
          ${project['category 2'] ? `<p class="mb-1"><b>Category 2:</b> ${project['category 2']}</p>` : ''}
          ${project['sub category 2'] ? `<p class="mb-1"><b>Sub Category 2:</b> ${project['sub category 2']}</p>` : ''}
          ${project['category 3'] ? `<p class="mb-1"><b>Category 3:</b> ${project['category 3']}</p>` : ''}
          ${project['sub category 3'] ? `<p class="mb-1"><b>Sub Category 3:</b> ${project['sub category 3']}</p>` : ''}
          ${formatAddress(project) !== 'N/A' ? `<p class="mb-1"><b>Address:</b> ${formatAddress(project)}</p>` : ''}
          ${project.description ? `<p class="mb-2 text-gray-700">${project.description}</p>` : ''}

          ${(project.after_photo || project.before_photo) ? `
            <div class="mb-2">
              <div class="relative overflow-hidden rounded">
                <div class="flex transition-transform duration-300 ease-in-out" id="photo-slider-${project.id}">
                  ${project.after_photo ? `<div class="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm" data-image-src="${project.after_photo}" data-image-type="after">Loading image...</div>` : ''}
                  ${project.before_photo ? `<div class="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm" data-image-src="${project.before_photo}" data-image-type="before">Loading image...</div>` : ''}
                </div>
                <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  ${project.after_photo ? `<button class="w-2 h-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all photo-dot active" data-slide="0"></button>` : ''}
                  ${project.before_photo ? `<button class="w-2 h-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all photo-dot${!project.after_photo ? ' active' : ''}" data-slide="${project.after_photo ? '1' : '0'}"></button>` : ''}
                </div>
                <div class="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  ${project.after_photo ? 'After' : 'Before'}
                </div>
              </div>
            </div>
          ` : ''}

          ${reviewsHtml}
        </div>
      `;

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
            .setHTML(popupHtml)
            .on('open', () => {
              // Add slider functionality after popup opens
              const slider = document.getElementById(`photo-slider-${project.id}`);
              if (slider) {
                const sliderContainer = slider.closest('.relative');

                // Reset slider to first slide
                slider.style.transform = 'translateX(0%)';

                // Dynamically create images from data URLs
                const imageContainers = slider.querySelectorAll('[data-image-src]');
                imageContainers.forEach(container => {
                  const imageSrc = container.getAttribute('data-image-src');
                  const imageType = container.getAttribute('data-image-type');

                  if (imageSrc) {
                    const img = document.createElement('img');
                    img.src = imageSrc;
                    img.alt = imageType === 'after' ? 'After' : 'Before';
                    img.className = 'w-full h-32 object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity';
                    img.onclick = () => {
                      setImageModal({ isOpen: true, src: imageSrc, alt: `${project.name} - ${imageType === 'after' ? 'After' : 'Before'}` });
                    };
                    img.onload = () => {
                      // Replace the loading container with the actual image
                      container.parentNode.replaceChild(img, container);
                    };
                    img.onerror = () => {
                      container.textContent = 'Image failed to load';
                      container.className = 'w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm';
                    };
                  }
                });

                const dots = sliderContainer.querySelectorAll('.photo-dot');

                dots.forEach((dot) => {
                  dot.addEventListener('click', () => {
                    const slideIndex = parseInt(dot.getAttribute('data-slide'));
                    slider.style.transform = `translateX(-${slideIndex * 100}%)`;
                    dots.forEach(d => d.classList.remove('active', 'bg-opacity-75'));
                    dot.classList.add('active', 'bg-opacity-75');
                    // Update label
                    const label = sliderContainer.querySelector('.absolute');
                    if (label) {
                      if (slideIndex === 0) {
                        label.textContent = project.after_photo ? 'After' : 'Before';
                      } else {
                        label.textContent = 'Before';
                      }
                    }
                  });
                });
              }
            })
        )
        .addTo(map.current);
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
