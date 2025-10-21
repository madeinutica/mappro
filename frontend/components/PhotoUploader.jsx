import React, { useRef, useState } from 'react';

const PhotoUploader = ({ onUpload }) => {
  const fileInput = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    setError(null);
    setUploading(true);
    try {
      const file = e.target.files[0];
      if (!file) return;
      await onUpload(file);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" ref={fileInput} onChange={handleFileChange} accept="image/*" />
      {uploading && <span>Uploading...</span>}
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};

export default PhotoUploader;
