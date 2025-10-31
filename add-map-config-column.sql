-- Add map_config column to clients table for customizable map settings
ALTER TABLE clients ADD COLUMN map_config JSONB DEFAULT '{
  "markerColor": "#2563eb",
  "markerStyle": "circle",
  "markerSize": 24,
  "mapStyle": "light-v10",
  "initialZoom": 7,
  "centerLat": null,
  "centerLng": null,
  "showCategoryFilters": true,
  "showZoomControls": true,
  "showFullscreenControl": true,
  "showNavigationControl": true,
  "showGeolocateControl": false,
  "maxZoom": 20,
  "minZoom": 0
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN clients.map_config IS 'JSON configuration for customizing map appearance and behavior per client';