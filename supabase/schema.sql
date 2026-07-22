-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Sets up tables, indexes, Row Level Security policies, and the new-user
-- bootstrap trigger for the task management app.

-- ── profiles ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── subscriptions (one row per user, written only by the Paddle webhook) ──
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'paused', 'canceled')),
  paddle_customer_id text,
  paddle_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Only a select policy: normal users can read their own plan status, but
-- have no insert/update/delete policy. All writes come from the Paddle
-- webhook route using the service-role key, which bypasses RLS entirely.
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ── lists ─────────────────────────────────────────────────────────────────
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lists_user_id_idx on public.lists(user_id);

alter table public.lists enable row level security;
create policy "lists_select_own" on public.lists for select using (auth.uid() = user_id);
create policy "lists_insert_own" on public.lists for insert with check (auth.uid() = user_id);
create policy "lists_update_own" on public.lists for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lists_delete_own" on public.lists for delete using (auth.uid() = user_id);

-- ── tasks (self-referencing for one level of subtasks) ────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid not null references public.lists(id) on delete cascade,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  priority text not null default 'none' check (priority in ('none', 'low', 'medium', 'high')),
  recurrence text not null default 'none' check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  completed boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_no_self_parent check (parent_task_id is null or parent_task_id <> id)
);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_list_id_idx on public.tasks(list_id);
create index tasks_parent_task_id_idx on public.tasks(parent_task_id);
create index tasks_smart_view_idx on public.tasks(user_id, completed, due_date);

alter table public.tasks enable row level security;
create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

-- ── tags ──────────────────────────────────────────────────────────────────
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index tags_user_id_idx on public.tags(user_id);

alter table public.tags enable row level security;
create policy "tags_select_own" on public.tags for select using (auth.uid() = user_id);
create policy "tags_insert_own" on public.tags for insert with check (auth.uid() = user_id);
create policy "tags_update_own" on public.tags for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tags_delete_own" on public.tags for delete using (auth.uid() = user_id);

-- ── task_tags (many-to-many join) ──────────────────────────────────────────
create table public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

alter table public.task_tags enable row level security;

create policy "task_tags_select_own" on public.task_tags for select using (
  exists (select 1 from public.tasks t where t.id = task_tags.task_id and t.user_id = auth.uid())
);
create policy "task_tags_insert_own" on public.task_tags for insert with check (
  exists (select 1 from public.tasks t where t.id = task_tags.task_id and t.user_id = auth.uid())
  and exists (select 1 from public.tags g where g.id = task_tags.tag_id and g.user_id = auth.uid())
);
create policy "task_tags_delete_own" on public.task_tags for delete using (
  exists (select 1 from public.tasks t where t.id = task_tags.task_id and t.user_id = auth.uid())
);

-- ── new-user bootstrap: profile row + free subscription + default Inbox list ──
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'free', 'active');
  insert into public.lists (user_id, name, is_default) values (new.id, 'Inbox', true);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
