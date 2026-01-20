-- Add RLS policy to allow authenticated users to read practice clients

-- Allow authenticated users to read all practice clients
CREATE POLICY "Users can read all practice clients (SELECT)"
ON public.dyh_practice_clients
FOR SELECT
USING (true);
