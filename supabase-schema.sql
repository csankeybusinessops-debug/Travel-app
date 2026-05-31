-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Places table
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other',
  city text,
  region text,
  address text,
  google_maps_url text not null,
  latitude float,
  longitude float,
  notes text,
  tags text[] default '{}',
  visited boolean default false,
  rating integer check (rating >= 1 and rating <= 5),
  cover_image_url text,
  created_at timestamptz default now()
);

-- Itineraries table
create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  share_token text unique default encode(gen_random_bytes(8), 'hex'),
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Itinerary days
create table if not exists itinerary_days (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid references itineraries(id) on delete cascade,
  day_number integer not null,
  date date,
  label text
);

-- Itinerary items
create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references itinerary_days(id) on delete cascade,
  place_id uuid references places(id) on delete set null,
  position integer not null default 0,
  time_of_day text,
  notes text
);

-- Enable RLS but allow all operations (single-user app)
alter table places enable row level security;
alter table itineraries enable row level security;
alter table itinerary_days enable row level security;
alter table itinerary_items enable row level security;

-- Permissive policies (no auth required — single user app)
create policy "allow all on places" on places for all using (true) with check (true);
create policy "allow all on itineraries" on itineraries for all using (true) with check (true);
create policy "allow all on itinerary_days" on itinerary_days for all using (true) with check (true);
create policy "allow all on itinerary_items" on itinerary_items for all using (true) with check (true);
