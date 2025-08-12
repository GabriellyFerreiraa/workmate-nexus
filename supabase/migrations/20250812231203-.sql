-- Ensure RLS is enabled (safe to run)
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;

-- Allow analysts to cancel their own pending requests (self-cancel before approval)
CREATE POLICY "Analyst - cancel own pending absence"
ON public.absence_requests
FOR UPDATE
USING (analyst_id = auth.uid() AND status = 'pending')
WITH CHECK (analyst_id = auth.uid() AND status = 'cancelled');

-- Allow analysts to request cancellation for already approved absences
CREATE POLICY "Analyst - request cancellation for approved absence"
ON public.absence_requests
FOR UPDATE
USING (analyst_id = auth.uid() AND status = 'approved')
WITH CHECK (analyst_id = auth.uid() AND status = 'cancel_requested');

-- Allow leads to update absence requests (approve/reject and handle cancellations)
CREATE POLICY "Lead - update any absence request"
ON public.absence_requests
FOR UPDATE
USING (has_role(auth.uid(), 'lead'))
WITH CHECK (has_role(auth.uid(), 'lead'));