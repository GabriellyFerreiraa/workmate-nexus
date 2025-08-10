-- 1) Extend absence_status enum with new values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'absence_status' AND e.enumlabel = 'cancel_pending') THEN
    ALTER TYPE public.absence_status ADD VALUE 'cancel_pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'absence_status' AND e.enumlabel = 'canceled') THEN
    ALTER TYPE public.absence_status ADD VALUE 'canceled';
  END IF;
END $$;

-- 2) Add new columns to absence_requests
ALTER TABLE public.absence_requests
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS dismissed_by_analyst boolean NOT NULL DEFAULT false;

-- 3) Function: Analyst dismisses notification (safe, scoped to own row)
CREATE OR REPLACE FUNCTION public.dismiss_absence_request(_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.absence_requests
  SET dismissed_by_analyst = true,
      updated_at = now()
  WHERE id = _id AND analyst_id = auth.uid();
$$;

-- 4) Policy: Analysts can request cancellation of their approved requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'absence_requests' 
      AND policyname = 'Analysts can request cancellation of approved requests'
  ) THEN
    CREATE POLICY "Analysts can request cancellation of approved requests"
    ON public.absence_requests
    FOR UPDATE
    USING (analyst_id = auth.uid() AND status = 'approved'::absence_status)
    WITH CHECK (analyst_id = auth.uid() AND status = 'cancel_pending'::absence_status AND cancel_reason IS NOT NULL);
  END IF;
END $$;

-- 5) Update delete policy to include canceled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'absence_requests' 
      AND policyname = 'Analysts can delete their processed absence requests'
  ) THEN
    DROP POLICY "Analysts can delete their processed absence requests" ON public.absence_requests;
  END IF;
  CREATE POLICY "Analysts can delete their processed absence requests"
  ON public.absence_requests
  FOR DELETE
  USING (
    analyst_id = auth.uid() 
    AND status IN ('approved'::absence_status, 'rejected'::absence_status, 'canceled'::absence_status)
  );
END $$;

-- 6) Additional select policy for calendar visibility: only approved=true absences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'absence_requests' 
      AND policyname = 'Approved active absences are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Approved active absences are viewable by authenticated users"
    ON public.absence_requests
    FOR SELECT
    USING (
      status = 'approved'::absence_status AND approved = true AND auth.uid() IS NOT NULL
    );
  END IF;
END $$;