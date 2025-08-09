-- Allow analysts to self-assign tasks by inserting rows where assigned_to = auth.uid() and assigned_by = auth.uid()
create policy "Analysts can self-assign tasks" 
on public.tasks
for insert
with check (
  assigned_to = auth.uid() and assigned_by = auth.uid()
);
