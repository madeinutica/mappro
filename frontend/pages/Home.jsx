import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWZsb3JlenNhc2giLCJhIjoiY21mcHJkYjR5MGo0cjJtb2xoZjd4Zmd2ZyJ9.mu2PN6vioX71RvV5J-HhWA';

const Home = () => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Sample demo projects
  const demoProjects = [
    {
      id: 1,
      name: 'Downtown Office Complex',
      lat: 40.7589,
      lng: -73.9851,
      description: 'Modern office building in Manhattan'
    },
    {
      id: 2,
      name: 'Residential Tower',
      lat: 40.7505,
      lng: -73.9934,
      description: 'Luxury residential development'
    },
    {
      id: 3,
      name: 'Shopping Center',
      lat: 40.7282,
      lng: -73.7949,
      description: 'Retail and entertainment complex'
    }
  ];

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    console.log('Home: Initializing demo map...');
    console.log('Home: Mapbox token available:', !!mapboxgl.accessToken);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-73.9851, 40.7589], // Center on NYC
        zoom: 10
      });

      console.log('Home: Map created successfully');

      map.current.on('load', () => {
        console.log('Home: Map loaded successfully');

        // Add demo project markers
        demoProjects.forEach(project => {
          console.log('Home: Adding marker for project:', project.name);
          const el = document.createElement('div');
          el.style.background = '#2C8BC7';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
          el.style.border = '2px solid #fff';
          el.style.cursor = 'pointer';

          new mapboxgl.Marker({ element: el })
            .setLngLat([project.lng, project.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="max-w-xs">
                    <h3 class="font-bold text-lg mb-1">${project.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${project.description}</p>
                    <button onclick="window.location.href='/auth'" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      View Details
                    </button>
                  </div>
                `)
            )
            .addTo(map.current);
        });

        console.log('Home: All markers added');
      });

      map.current.on('error', (e) => {
        console.error('Home: Map error:', e);
      });
    } catch (err) {
      console.error('Home: Error initializing map:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 font-inter">
      {/* Header */}
  <header className="bg-neutral-cream shadow-sm font-lato">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src="/assets/logos/mappro-logo.png" alt="MapPro" className="max-w-[200px] h-auto" />
              <span className="ml-2 text-sm text-neutral-500">Interactive Project Mapping</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/auth')}
                className="text-neutral-600 hover:text-primary-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Demo
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
  <section className="py-20 px-4 sm:px-6 lg:px-8 font-inter">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-900 mb-6">
              Transform Your Projects with
              <span className="text-primary-600 block">Interactive Mapping</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Create stunning interactive maps for your construction projects, real estate developments,
              and location-based services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/auth')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg"
              >
                Try Demo
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg text-lg font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Map Section */}
  <section className="py-16 bg-neutral-cream font-lato">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">See MapPro in Action</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Explore our interactive demo map showing sample construction projects across New York City.
              Click on the markers to learn more about each project.
            </p>
          </div>
          <div className="bg-neutral-100 rounded-lg overflow-hidden shadow-lg">
            <div ref={mapContainer} className="w-full h-96" />
          </div>
          <div className="mt-8 text-center">
            <p className="text-neutral-600 mb-4">
              Ready to create your own interactive project maps?
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg"
            >
              Start Mapping Your Projects
            </button>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
  <section className="py-16 bg-primary-600 font-inter">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of construction and real estate professionals using MapPro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="bg-neutral-cream text-primary-600 hover:bg-neutral-100 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Try Free Demo
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;