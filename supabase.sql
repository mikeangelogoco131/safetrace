create table profiles (
  id uuid primary key,
  name text,
  phone text,
  email text,
  created_at timestamp default now()
);

create table emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  contact_name text,
  contact_phone text,
  created_at timestamp default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  latitude float,
  longitude float,
  created_at timestamp default now()
);