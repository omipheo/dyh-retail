-- Add missing columns to reference_documents table
ALTER TABLE public.reference_documents
ADD COLUMN IF NOT EXISTS version text,
ADD COLUMN IF NOT EXISTS file_path text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_size integer,
ADD COLUMN IF NOT EXISTS file_type text;
