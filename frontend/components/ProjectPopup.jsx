import React from 'react';

const ProjectPopup = ({ project }) => (
  <div className="max-w-xs bg-neutral-cream p-2">
    <h3 className="font-semibold text-xl text-gray-900 mb-1">{project.name || 'Unnamed Project'}</h3>
    {project.description && (
      <p className="mb-2 text-gray-700 text-sm">{project.description}</p>
    )}
    
    {/* Categories */}
    {project.categoryInfo && project.categoryInfo.length > 0 && (
      <div className="mb-1 flex flex-wrap gap-1">
        {project.categoryInfo.map((cat, index) => (
          <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
            {cat}
          </span>
        ))}
      </div>
    )}
    
    {/* Sub-categories */}
    {project.subCategoryInfo && project.subCategoryInfo.length > 0 && (
      <div className="mb-2 flex flex-wrap gap-1">
        {project.subCategoryInfo.map((sub, index) => (
          <span key={index} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">
            {sub}
          </span>
        ))}
      </div>
    )}
    
    {/* Reviews */}
    <h4 className="font-semibold text-gray-900 mb-1">Reviews:</h4>
    <ul className="text-sm">
      {project.reviews && project.reviews.length > 0 ? (
        project.reviews.map((r, i) => (
          <li key={i} className="mb-1">
            <b>{r.author}</b> ({r.rating}/5): {r.text}
          </li>
        ))
      ) : (
        <li className="text-gray-500 italic">No reviews yet</li>
      )}
    </ul>
    
    {/* Add photo display here in the future */}
  </div>
);

export default ProjectPopup;
