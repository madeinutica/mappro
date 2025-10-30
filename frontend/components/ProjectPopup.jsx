import React from 'react';

const ProjectPopup = ({ project }) => (
  <div className="max-w-xs bg-neutral-cream p-2">
    <h3 className="font-semibold text-lg text-gray-900 mb-1 leading-tight">{project.name || 'Unnamed Project'}</h3>
    
    {/* City and Zip */}
    {(project.city || project.zip) && (
      <div className="text-sm text-gray-600 mb-2">
        {[project.city, project.zip].filter(Boolean).join(', ')}
      </div>
    )}
    
    {/* Reviews */}
    {project.reviews && project.reviews.length > 0 && (
      <div className="mb-2">
        {project.reviews.slice(0, 1).map((r, i) => (
          <div key={i} className="text-sm">
            {/* Star Rating */}
            <div className="flex items-center mb-1">
              {[...Array(5)].map((_, starIndex) => (
                <svg
                  key={starIndex}
                  className={`w-4 h-4 ${starIndex < r.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {/* Review Text */}
            {r.text && <p className="text-gray-700 italic mb-1">"{r.text}"</p>}
            {/* Review Photos - placeholder for future implementation */}
            {r.photos && r.photos.length > 0 && (
              <div className="flex gap-1 mt-1">
                {r.photos.map((photo, photoIndex) => (
                  <img
                    key={photoIndex}
                    src={photo.url}
                    alt={`Review photo ${photoIndex + 1}`}
                    className="w-12 h-12 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
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
    
    {/* Product Details */}
    {project.description && (
      <div className="mb-2">
        <div className="text-xs font-medium text-gray-700 mb-1">Product Details</div>
        <div className="text-sm text-gray-600">{project.description}</div>
      </div>
    )}
    
    {/* Add photo display here in the future */}
  </div>
);

export default ProjectPopup;
