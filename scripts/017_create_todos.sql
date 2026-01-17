-- Create To-Do List table for tax agents to manage tasks with urgency levels
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('8_hours', '24_hours', '72_hours', '7_days', '14_days', 'other')) DEFAULT '24_hours',
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Tax agents can view all todos
CREATE POLICY "Tax agents can view all todos"
  ON public.todos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can create todos
CREATE POLICY "Tax agents can insert todos"
  ON public.todos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can update todos
CREATE POLICY "Tax agents can update todos"
  ON public.todos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Tax agents can delete todos
CREATE POLICY "Tax agents can delete todos"
  ON public.todos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tax_agent'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_todos_assigned_by ON public.todos(assigned_by);
CREATE INDEX idx_todos_client_id ON public.todos(client_id);
CREATE INDEX idx_todos_status ON public.todos(status);
CREATE INDEX idx_todos_urgency ON public.todos(urgency);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);
CREATE INDEX idx_todos_created_at ON public.todos(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_todos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Automatically calculate due_date based on urgency if not provided
  IF NEW.due_date IS NULL THEN
    NEW.due_date := CASE NEW.urgency
      WHEN '8_hours' THEN NOW() + INTERVAL '8 hours'
      WHEN '24_hours' THEN NOW() + INTERVAL '24 hours'
      WHEN '72_hours' THEN NOW() + INTERVAL '72 hours'
      WHEN '7_days' THEN NOW() + INTERVAL '7 days'
      WHEN '14_days' THEN NOW() + INTERVAL '14 days'
      ELSE NULL
    END;
  END IF;
  
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_todos_updated_at();

-- Trigger for INSERT to set due_date
CREATE OR REPLACE FUNCTION set_todo_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date IS NULL THEN
    NEW.due_date := CASE NEW.urgency
      WHEN '8_hours' THEN NOW() + INTERVAL '8 hours'
      WHEN '24_hours' THEN NOW() + INTERVAL '24 hours'
      WHEN '72_hours' THEN NOW() + INTERVAL '72 hours'
      WHEN '7_days' THEN NOW() + INTERVAL '7 days'
      WHEN '14_days' THEN NOW() + INTERVAL '14 days'
      ELSE NULL
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_todo_due_date
  BEFORE INSERT ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION set_todo_due_date();

COMMENT ON TABLE public.todos IS 'To-Do list for tax agents with urgency levels and notes';
COMMENT ON COLUMN public.todos.urgency IS 'Urgency level: 8_hours, 24_hours, 72_hours, 7_days, 14_days, or other';
