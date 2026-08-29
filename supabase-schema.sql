create table if not exists public.lab_app_state (
  id text primary key,
  owner_id uuid,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.lab_app_state add column if not exists owner_id uuid;
alter table public.lab_app_state enable row level security;

drop policy if exists "public can read lab app state" on public.lab_app_state;
drop policy if exists "public can insert lab app state" on public.lab_app_state;
drop policy if exists "public can update lab app state" on public.lab_app_state;
drop policy if exists "authenticated users can read own lab app state" on public.lab_app_state;
create policy "authenticated users can read own lab app state"
  on public.lab_app_state for select
  to authenticated
  using (owner_id = auth.uid());

create policy "authenticated users can insert own lab app state"
  on public.lab_app_state for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "authenticated users can update own lab app state"
  on public.lab_app_state for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "authenticated users can delete own lab app state"
  on public.lab_app_state for delete
  to authenticated
  using (owner_id = auth.uid());

create index if not exists lab_app_state_updated_at_idx
  on public.lab_app_state (updated_at);

create table if not exists public.lab_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  mpin_hash text,
  background_data text,
  logo_data text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lab_user_profiles add column if not exists logo_data text;

alter table public.lab_user_profiles enable row level security;

drop policy if exists "authenticated users can read own profile" on public.lab_user_profiles;
create policy "authenticated users can read own profile"
  on public.lab_user_profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "authenticated users can insert own profile" on public.lab_user_profiles;
create policy "authenticated users can insert own profile"
  on public.lab_user_profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "authenticated users can update own profile" on public.lab_user_profiles;
create policy "authenticated users can update own profile"
  on public.lab_user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
