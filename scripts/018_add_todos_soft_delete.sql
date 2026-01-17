-- Add soft delete capability to todos table
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for deleted_at for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_deleted_at ON public.todos(deleted_at);

-- Add full-text search support
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_todos_search ON public.todos USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_todos_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_todos_search_vector
  BEFORE INSERT OR UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_todos_search_vector();

COMMENT ON COLUMN public.todos.deleted_at IS 'Timestamp when todo was soft deleted. NULL means not deleted.';
COMMENT ON COLUMN public.todos.search_vector IS 'Full-text search vector for title, description, and notes';
