-- Add modal_config column to clients table for customizable modal content
ALTER TABLE clients ADD COLUMN modal_config JSONB DEFAULT '{
  "cta": {
    "message": "Thinking about a similar project?",
    "buttonText": "Get a Free Quote",
    "buttonColor": "#2563eb",
    "buttonUrl": null
  },
  "showReviews": true,
  "showCategories": true,
  "showSubCategories": true,
  "showProductDetails": true,
  "showCustomFields": true,
  "showLocation": true,
  "showCTA": true,
  "customFields": []
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN clients.modal_config IS 'JSON configuration for customizing project popup modals per client';