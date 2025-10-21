import React from 'react';

const ProjectPopup = ({ project }) => (
  <div>
    <h3>{project.name}</h3>
    <p>{project.details}</p>
    <h4>Reviews:</h4>
    <ul>
      {project.reviews.map((r, i) => (
        <li key={i}><b>{r.author}</b> ({r.rating}/5): {r.text}</li>
      ))}
    </ul>
    {/* Add photo display here in the future */}
  </div>
);

export default ProjectPopup;
