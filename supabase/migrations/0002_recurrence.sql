-- Run this in the Supabase SQL editor for projects created before recurring
-- tasks were added (supabase/schema.sql now includes this column for any
-- brand-new project run from scratch).
alter table public.tasks
  add column recurrence text not null default 'none'
  check (recurrence in ('none', 'daily', 'weekly', 'monthly'));
