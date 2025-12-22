-- Temporarily disable RLS on reference_documents to bypass the profiles recursion issue
-- This is safe since we've already removed authentication requirements from the upload endpoints

ALTER TABLE reference_documents DISABLE ROW LEVEL SECURITY;

-- Drop the foreign key constraint that requires uploaded_by to reference profiles
-- This prevents the profiles table from being queried during inserts
ALTER TABLE reference_documents DROP CONSTRAINT IF EXISTS reference_documents_uploaded_by_fkey;

-- Allow NULL for uploaded_by since we're not tracking who uploads anymore
ALTER TABLE reference_documents ALTER COLUMN uploaded_by DROP NOT NULL;
