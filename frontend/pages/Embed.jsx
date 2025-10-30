import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MapView from './MapView';

const Embed = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate that we have a project ID
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }

    // Set loading to false after a brief delay to allow MapView to initialize
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 font-inter">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 font-inter">
        <div className="text-center">
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 max-w-md">
            <h2 className="text-accent-800 font-semibold mb-2">Error Loading Project</h2>
            <p className="text-accent-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-container font-lato">
      <MapView embedMode={true} embedProjectId={projectId} />
    </div>
  );
};

export default Embed;