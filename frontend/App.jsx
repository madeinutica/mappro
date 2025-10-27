import React, { useState, useEffect } from 'react';
import MapView from './pages/MapView';
import Admin from './pages/Admin';
import Auth from './components/Auth';
import Marketing from './components/Marketing';
import DemoMap from './components/DemoMap';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const [currentView, setCurrentView] = useState('marketing'); // 'marketing', 'demo', 'admin', 'map', 'embed', 'auth'
  const [embedParams, setEmbedParams] = useState({});
  const { user, client, loading } = useAuth();

  useEffect(() => {
    // Check URL parameters for embed mode
    const urlParams = new URLSearchParams(window.location.search);
    const embed = urlParams.get('embed');
    const projectId = urlParams.get('project');
    const filter = urlParams.get('filter');
    const clientId = urlParams.get('client');

    if (embed === 'true') {
      setCurrentView('embed');
      setEmbedParams({ projectId, filter, clientId });
    }
  }, []);

  useEffect(() => {
    // Auto-redirect to admin if user is authenticated and associated with client
    if (user && client && currentView === 'auth') {
      setCurrentView('admin');
    }
  }, [user, client, currentView]);

  const handleDemo = () => {
    setCurrentView('demo');
  };

  const handleLogin = () => {
    if (user && client) {
      setCurrentView('admin');
    } else {
      setCurrentView('auth');
    }
  };

  const handleMap = () => {
    setCurrentView('map');
  };

  const handleBackToMarketing = () => {
    setCurrentView('marketing');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'auth':
        return <Auth onBackToMarketing={handleBackToMarketing} onLoginSuccess={() => setCurrentView('admin')} />;
      case 'demo':
        return (
          <div className="min-h-screen bg-gray-100">
            <div className="p-4 flex justify-between items-center bg-white shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Map Pro - Demo</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToMarketing}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Back to Home
                </button>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                  {user && client ? 'Admin Panel' : 'Login'}
                </button>
              </div>
            </div>
            <DemoMap />
          </div>
        );
      case 'admin':
        // Only show admin if user is authenticated
        if (!user) {
          setCurrentView('auth');
          return <Auth />;
        }
        return (
          <div className="min-h-screen bg-gray-100">
            <div className="p-4 flex justify-between items-center bg-white shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Map Pro - Admin</h1>
                <p className="text-sm text-gray-600">Welcome, {user.email}</p>
                {!client && <p className="text-sm text-orange-600">⚠️ No client association found - limited access</p>}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToMarketing}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
            <Admin onMap={handleMap} />
          </div>
        );
      case 'map':
        return (
          <div className="min-h-screen bg-gray-100">
            <div className="p-4 flex justify-between items-center bg-white shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Map Pro - Interactive Map</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToMarketing}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Back to Home
                </button>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                  {user && client ? 'Admin Panel' : 'Login'}
                </button>
              </div>
            </div>
            <MapView />
          </div>
        );
      case 'embed':
        return (
          <div className="w-full h-screen">
            <MapView embedMode={true} embedParams={embedParams} />
          </div>
        );
      default:
        return <Marketing onLogin={handleLogin} onDemo={handleDemo} />;
    }
  };

  return renderCurrentView();
};

export default App;
