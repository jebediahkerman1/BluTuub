-- Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default 'BluTuub User',
  avatar_color text not null default '#1769e0',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select using (true);
drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_name text;
  requested_username text;
  base_username text;
begin
  requested_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'BluTuub User');
  requested_username := lower(regexp_replace(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1)), '[^a-zA-Z0-9_.]', '', 'g'));
  if length(requested_username) < 3 then requested_username := 'user' || substr(new.id::text, 1, 8); end if;
  base_username := requested_username;
  if exists (select 1 from public.profiles p where p.username = requested_username) then
    requested_username := left(base_username, 15) || '_' || substr(new.id::text, 1, 8);
  end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, requested_username, requested_name)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
