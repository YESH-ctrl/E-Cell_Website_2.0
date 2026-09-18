create extension if not exists pgcrypto;

-- User profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  role text not null default 'student'
    check (role in ('student', 'ecell_member')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      ''
    ),
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Contact inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- E-Cell applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  roll_number text not null,
  branch text not null,
  year_of_study text not null,
  mobile_number text not null,
  email_id text not null,
  linkedin_profile text,
  portfolio_url text,
  past_club_member text not null,
  past_club_details text,
  organized_event text not null,
  organized_event_details text,
  best_describes_you text not null,
  preferred_domains text[] not null
    check (cardinality(preferred_domains) > 0),
  team_crisis_answer text not null,
  opportunity_answer text not null,
  leadership_answer text not null,
  founders_office_answer text not null,
  impact_answer text not null,
  why_join text not null,
  solve_problem text not null,
  take_initiative text not null,
  ten_thousand_rupees text not null,
  success_meaning text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.inquiries enable row level security;
alter table public.applications enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.inquiries from anon, authenticated;
revoke all on public.applications from anon, authenticated;

grant select on public.profiles to authenticated;

drop policy if exists "Users can read own profile"
  on public.profiles;

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);