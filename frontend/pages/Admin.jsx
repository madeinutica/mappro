import React, { useState, useEffect } from 'react';
import { getProjects } from '../utils/projectApi';

const Admin = () => {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  return (
    <div className="admin-page bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8">
        <div className="flex gap-8">
          <aside className="w-64 bg-white rounded-xl shadow p-6 sticky top-8 h-fit self-start">
            <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Panel</h1>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <ul className="space-y-2">
              {projects
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(project => (
                  <li key={project.id}>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                        selected === project.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-blue-50 text-gray-700'
                      }`}
                      onClick={() => setSelected(project.id)}
                    >
                      {project.name}
                    </button>
                  </li>
                ))}
            </ul>
          </aside>
          <main className="flex-1">
            {selected && (
              <div className="bg-white rounded-xl shadow p-8">
                <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit Project</h2>
                {/* Add more fields and sections as needed */}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;

