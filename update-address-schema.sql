-- Add separate address fields to projects table
ALTER TABLE projects ADD COLUMN street TEXT;
ALTER TABLE projects ADD COLUMN city TEXT;
ALTER TABLE projects ADD COLUMN state TEXT;
ALTER TABLE projects ADD COLUMN zip TEXT;

-- Add category fields to projects table
ALTER TABLE projects ADD COLUMN "category 1" TEXT;
ALTER TABLE projects ADD COLUMN "sub category 1" TEXT;
ALTER TABLE projects ADD COLUMN "category 2" TEXT;
ALTER TABLE projects ADD COLUMN "sub category 2" TEXT;
ALTER TABLE projects ADD COLUMN "category 3" TEXT;
ALTER TABLE projects ADD COLUMN "sub category 3" TEXT;

-- Update RLS policies to include new columns (if needed)
-- The existing policies should work since they allow all operations on projects table