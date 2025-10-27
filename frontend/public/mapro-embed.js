// Mapro Embeddable Map Script
// Include this script on any website to embed the solar projects map

(function() {
    // Configuration
    const CONFIG = {
        MAPBOX_TOKEN: 'pk.eyJ1IjoiZWZsb3JlenNhc2giLCJhIjoiY21mcHJkYjR5MGo0cjJtb2xoZjd4Zmd2ZyJ9.mu2PN6vioX71RvV5J-HhWA',
        SUPABASE_URL: 'https://fvrueabzpinhlzyrnhne.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w',
        DEFAULT_CENTER: [-75.5, 42.7],
        DEFAULT_ZOOM: 7
    };

    // CSS styles
    const styles = `
        .mapro-map-container {
            position: relative;
            width: 100%;
            height: 500px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .mapro-map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
        }

        .mapro-header {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 12px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 1;
            font-size: 14px;
            font-weight: 600;
            color: #2c5530;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .mapro-loading, .mapro-error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 2;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .mapro-error {
            color: #d32f2f;
        }

        .mapro-marker {
            position: absolute;
            background: #2c5530;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            box-shadow: 0 0 4px rgba(0,0,0,0.2);
            border: 2px solid #fff;
            cursor: pointer;
            transform: translate(-50%, -50%);
        }

        .mapro-popup h3 {
            margin: 0 0 8px 0;
            color: #2c5530;
            font-size: 16px;
        }

        .mapro-popup p {
            margin: 4px 0;
            font-size: 14px;
            line-height: 1.4;
        }

        .mapro-popup strong {
            color: #555;
        }

        .mapro-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        }

        .mapro-modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            cursor: default;
        }

        .mapro-modal-content img {
            max-width: 100%;
            max-height: 100%;
            display: block;
        }

        .mapro-modal-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        }

        .mapro-modal-close:hover {
            background: rgba(0, 0, 0, 0.9);
        }
    `;

    // Main embed function
    window.createMaproMap = function(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Mapro: Container element not found:', containerId);
            return;
        }

        // Merge options with defaults
        const config = {
            height: options.height || '500px',
            showHeader: options.showHeader || false,
            center: options.center || CONFIG.DEFAULT_CENTER,
            zoom: options.zoom || CONFIG.DEFAULT_ZOOM,
            clientId: options.clientId || null, // New: client-specific filtering
            ...options
        };

        // Inject CSS
        if (!document.getElementById('mapro-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'mapro-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        // Create map container
        container.innerHTML = `
            ${config.showHeader ? '<div class="mapro-header">Mapro Solar Projects</div>' : ''}
            <div class="mapro-map" id="mapro-map-${containerId}"></div>
        `;

        const mapContainer = container.querySelector('.mapro-map');
        mapContainer.style.height = config.height;

        // Load dependencies and initialize
        loadDependencies(() => {
            initializeMap(containerId, config);
        });
    };

    // Load required dependencies
    function loadDependencies(callback) {
        let loaded = 0;
        const total = 2;

        function checkLoaded() {
            loaded++;
            if (loaded === total) {
                callback();
            }
        }

        // Load Mapbox GL JS
        if (!window.mapboxgl) {
            const mapboxScript = document.createElement('script');
            mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
            mapboxScript.onload = checkLoaded;
            document.head.appendChild(mapboxScript);

            const mapboxCSS = document.createElement('link');
            mapboxCSS.rel = 'stylesheet';
            mapboxCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
            document.head.appendChild(mapboxCSS);
        } else {
            checkLoaded();
        }

        // Load Supabase
        if (!window.supabase) {
            const supabaseScript = document.createElement('script');
            supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            supabaseScript.onload = checkLoaded;
            document.head.appendChild(supabaseScript);
        } else {
            checkLoaded();
        }
    }

    // Initialize the map
    function initializeMap(containerId, config) {
        const mapContainer = document.getElementById(`mapro-map-${containerId}`);

        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'mapro-loading';
        loadingDiv.textContent = 'Loading solar projects...';
        mapContainer.parentNode.appendChild(loadingDiv);

        // Initialize Supabase
        const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

        // Initialize map
        mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;
        const map = new mapboxgl.Map({
            container: `mapro-map-${containerId}`,
            style: 'mapbox://styles/mapbox/light-v11',
            center: config.center,
            zoom: config.zoom
        });

        let markers = [];

        // Fetch and display projects
        map.on('load', async () => {
            try {
                let query = supabase
                    .from('projects')
                    .select(`
                        *,
                        reviews (*)
                    `)
                    .eq('is_published', true); // Only show published projects

                // Filter by client if specified
                if (config.clientId) {
                    query = query.eq('client_id', config.clientId);
                }

                const { data: projects, error } = await query;

                if (error) throw error;

                loadingDiv.remove();

                if (projects && projects.length > 0) {
                    addProjectMarkers(map, projects, markers);

                    // Fit map to show all markers
                    const bounds = new mapboxgl.LngLatBounds();
                    projects.forEach(project => {
                        if (project.lng && project.lat) {
                            bounds.extend([parseFloat(project.lng), parseFloat(project.lat)]);
                        }
                    });
                    map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
                } else {
                    const noDataDiv = document.createElement('div');
                    noDataDiv.className = 'mapro-error';
                    noDataDiv.textContent = config.clientId
                        ? 'No published solar projects found for this client.'
                        : 'No solar projects found.';
                    mapContainer.parentNode.appendChild(noDataDiv);
                }

            } catch (error) {
                console.error('Mapro: Error loading projects:', error);
                loadingDiv.remove();

                const errorDiv = document.createElement('div');
                errorDiv.className = 'mapro-error';
                errorDiv.textContent = 'Error loading map data. Please try again later.';
                mapContainer.parentNode.appendChild(errorDiv);
            }
        });
    }

    // Add project markers to map
    function addProjectMarkers(map, projects, markers) {
        projects.forEach(project => {
            if (!project.lat || !project.lng) return;

            // Create marker element
            const el = document.createElement('div');
            el.className = 'mapro-marker';

            // Create popup content
            const reviewsHtml = project.reviews && project.reviews.length > 0
                ? `<div style="margin-top: 12px;">
                    <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #2c5530;">Reviews (${project.reviews.length})</h4>
                    <div style="max-height: 120px; overflow-y: auto;">
                      ${project.reviews.slice(0, 3).map(review => `
                        <div style="background: #f5f5f5; padding: 8px; margin-bottom: 8px; border-radius: 4px; font-size: 12px;">
                          <div style="display: flex; align-items: center; margin-bottom: 4px;">
                            <span style="font-weight: bold;">${review.author}</span>
                            <span style="margin-left: 8px; color: #f59e0b;">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                          </div>
                          <p style="margin: 0; color: #555;">${review.text}</p>
                        </div>
                      `).join('')}
                      ${project.reviews.length > 3 ? `<p style="font-size: 11px; color: #666; margin: 4px 0 0 0;">...and ${project.reviews.length - 3} more reviews</p>` : ''}
                    </div>
                  </div>`
                : '';

            // Format categories for display
            const formatCategories = (project) => {
                const categories = [];
                if (project['category 1']) categories.push(`${project['category 1']}${project['sub category 1'] ? ` (${project['sub category 1']})` : ''}`);
                if (project['category 2']) categories.push(`${project['category 2']}${project['sub category 2'] ? ` (${project['sub category 2']})` : ''}`);
                if (project['category 3']) categories.push(`${project['category 3']}${project['sub category 3'] ? ` (${project['sub category 3']})` : ''}`);
                return categories.length > 0 ? categories.join(', ') : '';
            };

            // Format address from separate fields
            const formatAddress = (project) => {
                const parts = [];
                if (project.street) parts.push(project.street);
                if (project.city) parts.push(project.city);
                if (project.state) parts.push(project.state);
                if (project.zip) parts.push(project.zip);
                return parts.length > 0 ? parts.join(', ') : (project.address || 'N/A');
            };

            const categoriesText = formatCategories(project);

            const popupContent = `
                <div class="mapro-popup">
                    <h3>${project.name}</h3>
                    ${project.customer ? `<p><strong>Client:</strong> ${project.customer}</p>` : ''}
                    ${project.project_type ? `<p><strong>Project Type:</strong> ${project.project_type}</p>` : ''}
                    ${project['category 1'] ? `<p><strong>Category 1:</strong> ${project['category 1']}</p>` : ''}
                    ${project['sub category 1'] ? `<p><strong>Sub Category 1:</strong> ${project['sub category 1']}</p>` : ''}
                    ${project['category 2'] ? `<p><strong>Category 2:</strong> ${project['category 2']}</p>` : ''}
                    ${project['sub category 2'] ? `<p><strong>Sub Category 2:</strong> ${project['sub category 2']}</p>` : ''}
                    ${project['category 3'] ? `<p><strong>Category 3:</strong> ${project['category 3']}</p>` : ''}
                    ${project['sub category 3'] ? `<p><strong>Sub Category 3:</strong> ${project['sub category 3']}</p>` : ''}
                    ${formatAddress(project) !== 'N/A' ? `<p><strong>Address:</strong> ${formatAddress(project)}</p>` : ''}
                    ${project.description ? `<p style="margin: 8px 0; color: #666;">${project.description}</p>` : ''}

                    ${(project.after_photo || project.before_photo) ? `
                        <div style="margin: 8px 0;">
                            <div style="position: relative; overflow: hidden; border-radius: 4px;">
                                <div style="display: flex; transition: transform 0.3s ease;" id="photo-slider-${project.id}">
                                    ${project.after_photo ? `<div style="width: 100%; height: 120px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #666; font-size: 12px;" data-image-src="${project.after_photo}" data-image-type="after">Loading image...</div>` : ''}
                                    ${project.before_photo ? `<div style="width: 100%; height: 120px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #666; font-size: 12px;" data-image-src="${project.before_photo}" data-image-type="before">Loading image...</div>` : ''}
                                </div>
                                    <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px;">
                                        ${project.after_photo ? `<button style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); border: none; cursor: pointer;" class="photo-dot active" data-slide="0"></button>` : ''}
                                        ${project.before_photo ? `<button style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); border: none; cursor: pointer;" class="photo-dot${!project.after_photo ? ' active' : ''}" data-slide="${project.after_photo ? '1' : '0'}"></button>` : ''}
                                    </div>
                                <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.5); color: white; padding: 2px 6px; border-radius: 2px; font-size: 10px;">
                                    ${project.after_photo ? 'After' : 'Before'}
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${reviewsHtml}
                </div>
            `;

            // Create marker
            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([parseFloat(project.lng), parseFloat(project.lat)])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                        .setHTML(popupContent)
                        .on('open', function() {
                            // Add slider functionality
                            const slider = document.getElementById(`photo-slider-${project.id}`);
                            if (slider) {
                                const sliderContainer = slider.closest('div[style*="position: relative"]');

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
                                        img.style.width = '100%';
                                        img.style.height = '120px';
                                        img.style.objectFit = 'cover';
                                        img.style.flexShrink = '0';
                                        img.style.cursor = 'pointer';
                                        img.onclick = function() {
                                            // Create modal
                                            const modal = document.createElement('div');
                                            modal.className = 'mapro-modal';
                                            modal.onclick = function() {
                                                document.body.removeChild(modal);
                                            };

                                            const modalContent = document.createElement('div');
                                            modalContent.className = 'mapro-modal-content';
                                            modalContent.onclick = function(e) {
                                                e.stopPropagation();
                                            };

                                            const modalImg = document.createElement('img');
                                            modalImg.src = imageSrc;
                                            modalImg.alt = `${project.name} - ${imageType === 'after' ? 'After' : 'Before'}`;

                                            const closeBtn = document.createElement('button');
                                            closeBtn.className = 'mapro-modal-close';
                                            closeBtn.textContent = '×';
                                            closeBtn.onclick = function() {
                                                document.body.removeChild(modal);
                                            };

                                            modalContent.appendChild(modalImg);
                                            modalContent.appendChild(closeBtn);
                                            modal.appendChild(modalContent);
                                            document.body.appendChild(modal);
                                        };
                                        img.onload = () => {
                                            // Replace the loading container with the actual image
                                            container.parentNode.replaceChild(img, container);
                                        };
                                        img.onerror = () => {
                                            container.textContent = 'Image failed to load';
                                            container.style.background = '#f5f5f5';
                                            container.style.display = 'flex';
                                            container.style.alignItems = 'center';
                                            container.style.justifyContent = 'center';
                                            container.style.color = '#666';
                                            container.style.fontSize = '12px';
                                        };
                                    }
                                });

                                const dots = sliderContainer.querySelectorAll('.photo-dot');
                                const label = sliderContainer.querySelector('div[style*="position: absolute"][style*="top: 8px"]');

                                dots.forEach((dot) => {
                                    dot.addEventListener('click', function() {
                                        const slideIndex = parseInt(this.getAttribute('data-slide'));
                                        slider.style.transform = `translateX(-${slideIndex * 100}%)`;
                                        dots.forEach(d => d.classList.remove('active'));
                                        this.classList.add('active');
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
                .addTo(map);

            markers.push(marker);
        });
    }
})();