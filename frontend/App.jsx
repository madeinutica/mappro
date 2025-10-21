import React, { useState } from 'react';
import MapView from './pages/MapView';
import Admin from './pages/Admin';

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mapro App</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAdmin((v) => !v)}
          >
            {showAdmin ? 'Show Map' : 'Admin'}
          </button>
        </div>
      </div>
      {showAdmin ? <Admin /> : <MapView />}
    </div>
  );
};

export default App;
