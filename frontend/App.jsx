import React, { useState, useEffect } from 'react';
import MapView from './pages/MapView';
import Admin from './pages/Admin';
import Auth from './components/Auth';
import Marketing from './components/Marketing';
import DemoMap from './components/DemoMap';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  // Initialize embed params from URL
  const getInitialEmbedParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const embed = urlParams.get('embed');
    if (embed === 'true') {
      const projectId = urlParams.get('project');
      const filter = urlParams.get('filter');
      const clientId = urlParams.get('client');
      const markerColor = urlParams.get('markerColor');
      const markerStyle = urlParams.get('markerStyle');
      return { projectId, filter, clientId, markerColor, markerStyle };
    }
    return {};
  };

  const [currentView, setCurrentView] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const embed = urlParams.get('embed');
    const client = urlParams.get('client');
    return (embed === 'true' && client) ? 'embed' : 'marketing';
  });
  const [embedParams, setEmbedParams] = useState(getInitialEmbedParams);
  const { user, client, loading } = useAuth();

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

  const handleSignup = () => {
    setCurrentView('signup');
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'auth':
        return <Auth onBackToMarketing={handleBackToMarketing} onLoginSuccess={() => setCurrentView('admin')} isLogin={true} />;
      case 'signup':
        return <Auth onBackToMarketing={handleBackToMarketing} onLoginSuccess={() => setCurrentView('admin')} isLogin={false} />;
      case 'demo':
        return (
          <div className="min-h-screen bg-gray-100">
            <div className="p-4 flex justify-between items-center bg-neutral-cream shadow-sm">
              <div className="flex items-center">
                <img src="/assets/logos/mappro-logo.png" alt="MapPro" className="h-8 w-auto mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-primary-600">Map Pro - Demo</h1>
                </div>
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
            <div className="p-4 flex justify-between items-center bg-neutral-cream shadow-sm">
              <div className="flex items-center">
                <div>
                  <h1 className="text-2xl font-bold text-primary-600">Map Pro - Admin</h1>
                  <p className="text-sm text-neutral-600">Welcome, {user.email}</p>
                  {!client && <p className="text-sm text-accent-600">⚠️ No client association found - limited access</p>}
                </div>
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
            <div className="p-4 flex justify-between items-center bg-neutral-cream shadow-sm">
              <div className="flex items-center">
                <div>
                  <h1 className="text-2xl font-bold text-primary-600">Map Pro - Interactive Map</h1>
                </div>
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
            <MapView clientId={client?.clients?.id} user={user} />
          </div>
        );
      case 'embed':
        return (
          <div className="w-full h-screen">
            <MapView embedMode={true} embedParams={embedParams} />
          </div>
        );
      default:
        return <Marketing onLogin={handleLogin} onDemo={handleDemo} onSignup={handleSignup} />;
    }
  };

  return renderCurrentView();
};

export default App;
