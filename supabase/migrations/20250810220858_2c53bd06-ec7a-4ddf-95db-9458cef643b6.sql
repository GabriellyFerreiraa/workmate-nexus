-- Allow all authenticated users to view approved absences
CREATE POLICY IF NOT EXISTS "Approved absences are viewable by authenticated users"
ON public.absence_requests
FOR SELECT
USING (status = 'approved'::absence_status AND auth.uid() IS NOT NULL);
