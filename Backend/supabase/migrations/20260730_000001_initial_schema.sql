-- VARA UAE canonical Supabase baseline
-- Intended for a new/empty Supabase project.
-- Safe to rerun: objects use IF NOT EXISTS and seed rows use ON CONFLICT.
--
-- The application performs database access through a server-side Supabase
-- secret key. RLS is enabled and no browser-facing table policies are created.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared trigger functions
-- ---------------------------------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_application_id()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  year_text text := to_char(current_date, 'YYYY');
  sequence_number integer;
begin
  if new.application_id is not null then
    return new;
  end if;

  -- Serialize ID generation for concurrent registrations in the same year.
  perform pg_advisory_xact_lock(hashtext('vara-application-' || year_text));

  select coalesce(
    max(
      case
        when application_id ~ ('^APP-' || year_text || '-[0-9]+$')
        then split_part(application_id, '-', 3)::integer
        else null
      end
    ),
    0
  ) + 1
  into sequence_number
  from public.membership_applications
  where application_id like 'APP-' || year_text || '-%';

  new.application_id :=
    'APP-' || year_text || '-' || lpad(sequence_number::text, 3, '0');
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Authentication and application users
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  name varchar(255),
  full_name varchar(255),
  phone varchar(50),
  role text not null default 'user'
    check (role in ('user', 'admin', 'superadmin')),
  is_active boolean not null default true,
  is_verified boolean not null default false,
  email_verified boolean not null default false,
  linkedin_url text,
  portfolio_link text,
  behance_url text,
  dribbble_url text,
  instagram_handle varchar(100),
  portfolio_pdf_url text,
  image_gallery_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users (email);

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token varchar(255) not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_reset_user_id
  on public.password_reset_tokens (user_id);
create index if not exists idx_reset_token
  on public.password_reset_tokens (token);

-- ---------------------------------------------------------------------------
-- Membership
-- ---------------------------------------------------------------------------

create table if not exists public.membership_types (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) not null unique,
  category varchar(100) not null,
  price_aed numeric(10, 2) not null check (price_aed >= 0),
  duration_months integer not null default 12 check (duration_months > 0),
  benefits jsonb not null default '[]'::jsonb
    check (jsonb_typeof(benefits) = 'array'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  application_id varchar(20) unique,
  full_name varchar(255) not null,
  email varchar(255) not null,
  gender varchar(20)
    check (gender in ('Male', 'Female', 'Other', 'Not Specified')),
  age_category varchar(20),
  blood_group varchar(5),
  profile_photo text,
  profile_photo_url text,
  country varchar(100) default 'UAE',
  emirate varchar(50),
  area_name varchar(100),
  country_code varchar(10) default '+971',
  contact_number varchar(20),
  whatsapp_country_code varchar(10) default '+971',
  whatsapp_number varchar(20),
  kerala_district varchar(100),
  company_name varchar(255),
  job_title varchar(255),
  visa_status varchar(50),
  years_in_uae integer not null default 0 check (years_in_uae >= 0),
  months_in_uae integer not null default 0
    check (months_in_uae between 0 and 11),
  total_industry_experience varchar(50),
  primary_area_of_work varchar(255),
  skillsets jsonb not null default '[]'::jsonb
    check (jsonb_typeof(skillsets) = 'array'),
  other_skill varchar(255),
  portfolio_link text,
  linkedin_link text,
  behance_link text,
  instagram_link text,
  software_and_tools text,
  vara_whatsapp_group varchar(10),
  interested_in_volunteering boolean not null default false,
  volunteering_areas jsonb not null default '[]'::jsonb
    check (jsonb_typeof(volunteering_areas) = 'array'),
  proceed_with_membership_fee boolean not null default false,
  message text,
  status varchar(20) not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  assigned_admin_id uuid references public.users(id) on delete set null,
  application_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_membership_applications_user_id
  on public.membership_applications (user_id);
create index if not exists idx_membership_applications_status
  on public.membership_applications (status);
create index if not exists idx_membership_applications_email
  on public.membership_applications (email);
create index if not exists idx_membership_applications_assigned_admin
  on public.membership_applications (assigned_admin_id);

create table if not exists public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  member_id varchar(20) not null unique,
  full_name varchar(255) not null,
  email varchar(255),
  gender varchar(20) not null
    check (gender in ('Male', 'Female', 'Other', 'Not Specified')),
  age_category varchar(20) not null,
  blood_group varchar(5),
  profile_photo varchar(500),
  profile_photo_url text,
  country varchar(100) default 'UAE',
  emirate varchar(50),
  area_name varchar(100),
  country_code varchar(10) default '+971',
  contact_number varchar(20),
  whatsapp_country_code varchar(10) default '+971',
  whatsapp_number varchar(20),
  kerala_district varchar(100),
  company_name varchar(255),
  job_title varchar(255),
  visa_status varchar(50),
  years_in_uae integer not null default 0 check (years_in_uae >= 0),
  months_in_uae integer not null default 0
    check (months_in_uae between 0 and 11),
  total_industry_experience varchar(50),
  primary_area_of_work varchar(255),
  skillsets jsonb not null default '[]'::jsonb
    check (jsonb_typeof(skillsets) = 'array'),
  other_skill varchar(255),
  portfolio_link varchar(500),
  linkedin_link text,
  behance_link text,
  instagram_link text,
  software_and_tools text,
  vara_whatsapp_group boolean not null default false,
  interested_in_volunteering boolean not null default false,
  volunteering_areas jsonb not null default '[]'::jsonb
    check (jsonb_typeof(volunteering_areas) = 'array'),
  proceed_with_membership_fee boolean not null default false,
  message text,
  assigned_admin_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_member_profiles_user_id
  on public.member_profiles (user_id);
create index if not exists idx_member_profiles_member_id
  on public.member_profiles (member_id);
create index if not exists idx_member_profiles_email
  on public.member_profiles (email);
create index if not exists idx_member_profiles_assigned_admin
  on public.member_profiles (assigned_admin_id);
create index if not exists idx_member_profiles_profile_photo
  on public.member_profiles (profile_photo)
  where profile_photo is not null;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null
    references public.member_profiles(id) on delete cascade,
  membership_type_id uuid not null
    references public.membership_types(id),
  status text not null default 'pending'
    check (status in ('active', 'expired', 'pending', 'cancelled')),
  joined_date date not null,
  expiry_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expiry_date >= joined_date)
);

create index if not exists idx_memberships_member_id
  on public.memberships (member_id);
create index if not exists idx_memberships_status
  on public.memberships (status);

-- ---------------------------------------------------------------------------
-- Administration
-- ---------------------------------------------------------------------------

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  name varchar(255) not null,
  phone varchar(20),
  department varchar(100),
  admin_since date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name varchar(255) not null,
  email varchar(255) not null,
  role text not null check (role in ('superadmin', 'admin')),
  assigned_date date not null,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Accounting
-- ---------------------------------------------------------------------------

create table if not exists public.income_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  contact_person varchar(255),
  email varchar(255),
  phone varchar(20),
  address text,
  category varchar(100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_income_categories_active
  on public.income_categories (is_active);
create index if not exists idx_expense_categories_active
  on public.expense_categories (is_active);
create index if not exists idx_vendors_active
  on public.vendors (is_active);

create table if not exists public.income_records (
  id uuid primary key default gen_random_uuid(),
  income_id varchar(50) not null unique,
  source varchar(255) not null,
  category_id uuid references public.income_categories(id) on delete set null,
  description text,
  amount_aed numeric(12, 2) not null check (amount_aed >= 0),
  date date not null,
  status varchar(20) not null default 'pending'
    check (status in ('received', 'pending')),
  payment_mode varchar(50) not null
    check (
      payment_mode in (
        'Cash',
        'Bank Transfer',
        'UPI',
        'NEFT',
        'Credit Card',
        'Cheque'
      )
    ),
  receipt_number varchar(50),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_income_records_source
  on public.income_records (source);
create index if not exists idx_income_records_created_by
  on public.income_records (created_by);
create index if not exists idx_income_records_date_status
  on public.income_records (date, status);
create index if not exists idx_income_records_category_id
  on public.income_records (category_id);

create table if not exists public.expense_records (
  id uuid primary key default gen_random_uuid(),
  expense_id varchar(50) not null unique,
  category_id uuid references public.expense_categories(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  category varchar(255),
  vendor varchar(255),
  description text,
  amount_aed numeric(12, 2) not null check (amount_aed >= 0),
  date date not null,
  status varchar(20) not null default 'pending'
    check (status in ('paid', 'pending')),
  payment_mode varchar(50) not null
    check (
      payment_mode in (
        'Cash',
        'Bank Transfer',
        'UPI',
        'NEFT',
        'Credit Card',
        'Cheque'
      )
    ),
  invoice_number varchar(50),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expense_records_category_id
  on public.expense_records (category_id);
create index if not exists idx_expense_records_vendor_id
  on public.expense_records (vendor_id);
create index if not exists idx_expense_records_date_status
  on public.expense_records (date, status);
create index if not exists idx_expense_records_created_by
  on public.expense_records (created_by);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date not null,
  time time not null,
  location text not null,
  registration_link text,
  status varchar(20) not null default 'draft'
    check (status in ('draft', 'published')),
  max_participants integer check (max_participants is null or max_participants >= 0),
  category text,
  banner_image text,
  type varchar(20) not null default 'upcoming'
    check (type in ('upcoming', 'past')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_status_date
  on public.events (status, date);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  date date not null,
  priority varchar(20) not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  message text,
  type varchar(50) not null default 'general'
    check (type in ('news', 'alert', 'update', 'general')),
  status varchar(20) not null default 'draft'
    check (status in ('draft', 'published')),
  expiry_date date,
  registration_link text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_status_expiry
  on public.announcements (status, expiry_date);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_title text not null,
  description text not null,
  role text not null,
  company_name text,
  application_link text not null,
  apply_by_date date not null,
  location text not null,
  employment_type varchar(50) not null,
  experience_level varchar(50) not null,
  salary text,
  status varchar(20) not null default 'draft'
    check (status in ('draft', 'published')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_status_apply_by
  on public.jobs (status, apply_by_date);

-- ---------------------------------------------------------------------------
-- Notifications and audit
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  message text not null,
  type text not null default 'info'
    check (type in ('info', 'success', 'warning', 'error')),
  is_read boolean not null default false,
  link varchar(500),
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id
  on public.notifications (user_id);
create index if not exists idx_notifications_is_read
  on public.notifications (is_read);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action varchar(100) not null,
  entity_type varchar(50) not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address varchar(45),
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_user_id
  on public.activity_logs (user_id);
create index if not exists idx_activity_logs_created_at
  on public.activity_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
before update on public.users
for each row execute function public.update_updated_at_column();

drop trigger if exists update_membership_applications_updated_at
  on public.membership_applications;
create trigger update_membership_applications_updated_at
before update on public.membership_applications
for each row execute function public.update_updated_at_column();

drop trigger if exists set_application_id on public.membership_applications;
create trigger set_application_id
before insert on public.membership_applications
for each row
when (new.application_id is null)
execute function public.generate_application_id();

drop trigger if exists update_member_profiles_updated_at
  on public.member_profiles;
create trigger update_member_profiles_updated_at
before update on public.member_profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists update_memberships_updated_at on public.memberships;
create trigger update_memberships_updated_at
before update on public.memberships
for each row execute function public.update_updated_at_column();

drop trigger if exists update_admin_profiles_updated_at
  on public.admin_profiles;
create trigger update_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists update_board_members_updated_at
  on public.board_members;
create trigger update_board_members_updated_at
before update on public.board_members
for each row execute function public.update_updated_at_column();

drop trigger if exists update_income_records_updated_at
  on public.income_records;
create trigger update_income_records_updated_at
before update on public.income_records
for each row execute function public.update_updated_at_column();

drop trigger if exists update_expense_records_updated_at
  on public.expense_records;
create trigger update_expense_records_updated_at
before update on public.expense_records
for each row execute function public.update_updated_at_column();

drop trigger if exists update_events_updated_at on public.events;
create trigger update_events_updated_at
before update on public.events
for each row execute function public.update_updated_at_column();

drop trigger if exists update_announcements_updated_at
  on public.announcements;
create trigger update_announcements_updated_at
before update on public.announcements
for each row execute function public.update_updated_at_column();

drop trigger if exists update_jobs_updated_at on public.jobs;
create trigger update_jobs_updated_at
before update on public.jobs
for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

insert into public.membership_types
  (name, category, price_aed, duration_months, benefits, is_active)
values
  (
    'Standard',
    'Individual Member',
    500.00,
    12,
    '[
      "Access to events",
      "Newsletter subscription",
      "Member directory access"
    ]'::jsonb,
    true
  ),
  (
    'Premium',
    'Individual Member',
    1000.00,
    12,
    '[
      "Access to all events",
      "Priority registration",
      "Exclusive member discounts",
      "Newsletter subscription",
      "Voting rights",
      "Member directory access"
    ]'::jsonb,
    true
  ),
  (
    'Corporate',
    'Corporate Member',
    5000.00,
    12,
    '[
      "Up to 5 employee memberships",
      "Corporate branding at events",
      "Priority sponsorship opportunities",
      "All Premium benefits"
    ]'::jsonb,
    true
  )
on conflict (name) do update
set
  category = excluded.category,
  price_aed = excluded.price_aed,
  duration_months = excluded.duration_months,
  benefits = excluded.benefits,
  is_active = excluded.is_active;

insert into public.income_categories (name, description)
values
  ('Membership Fees', 'Membership subscriptions and renewals'),
  ('Event Revenue', 'Event tickets and registrations'),
  ('Donations', 'Donations and corporate sponsorships'),
  ('Workshop Fees', 'Paid workshops and training sessions'),
  ('Merchandise', 'VARA merchandise sales'),
  ('Other Income', 'Miscellaneous income')
on conflict (name) do update
set description = excluded.description;

insert into public.expense_categories (name, description)
values
  ('Operations', 'Office, utilities, and general operations'),
  ('Marketing', 'Advertising, promotion, and marketing materials'),
  ('Events', 'Venue, catering, and event expenses'),
  ('Technology', 'Hosting, software, and IT infrastructure'),
  ('Salaries', 'Staff and contractor payments'),
  ('Travel', 'Travel and transportation'),
  ('Office Supplies', 'Stationery and office equipment'),
  ('Miscellaneous', 'Other expenses')
on conflict (name) do update
set description = excluded.description;

-- ---------------------------------------------------------------------------
-- Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.password_reset_tokens enable row level security;
alter table public.membership_types enable row level security;
alter table public.membership_applications enable row level security;
alter table public.member_profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.board_members enable row level security;
alter table public.income_categories enable row level security;
alter table public.expense_categories enable row level security;
alter table public.vendors enable row level security;
alter table public.income_records enable row level security;
alter table public.expense_records enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;
alter table public.jobs enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- The Express backend uses the server-side secret/service role for all access.
-- Browser roles receive no direct table privileges from this migration.
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Public Storage buckets used by the backend.
insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'profiles',
    'profiles',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'event',
    'event',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
