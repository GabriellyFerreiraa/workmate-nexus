DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'absence_requests' 
      AND polname = 'Approved absences are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Approved absences are viewable by authenticated users"
    ON public.absence_requests
    FOR SELECT
    USING (status = 'approved'::absence_status AND auth.uid() IS NOT NULL);
  END IF;
END $$;