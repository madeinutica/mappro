import React, { useState } from 'react';
import MapView from './pages/MapView';
import Admin from './pages/Admin';
import Marketing from './components/Marketing';
import DemoMap from './components/DemoMap';

const App = () => {
  const [currentView, setCurrentView] = useState('marketing'); // 'marketing', 'demo', 'admin', 'map'

  const handleDemo = () => {
    setCurrentView('demo');
  };

  const handleLogin = () => {
    setCurrentView('admin');
  };

  const handleMap = () => {
    setCurrentView('map');
  };

  const handleBackToMarketing = () => {
    setCurrentView('marketing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
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
                  Login
                </button>
              </div>
            </div>
            <DemoMap />
          </div>
        );
      case 'admin':
        return (
          <div className="min-h-screen bg-gray-100">
            <div className="p-4 flex justify-between items-center bg-white shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Map Pro - Admin</h1>
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
                  Admin Login
                </button>
              </div>
            </div>
            <MapView />
          </div>
        );
      default:
        return <Marketing onLogin={handleLogin} onDemo={handleDemo} />;
    }
  };

  return renderCurrentView();
};

export default App;
