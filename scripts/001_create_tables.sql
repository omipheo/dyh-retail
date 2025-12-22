-- Create users profile table with role-based access
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('end_user', 'tax_agent')) default 'end_user',
  company_name text,
  tax_agent_number text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create questionnaire responses table
create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('draft', 'completed', 'archived')) default 'draft',
  
  -- Personal details
  full_name text,
  address text,
  tfn text,
  
  -- Home office details
  home_size_sqm decimal,
  office_size_sqm decimal,
  office_hours_per_week decimal,
  
  -- Business details
  business_type text,
  employment_status text check (employment_status in ('employee', 'sole_trader', 'partnership', 'company')),
  
  -- Expenses tracking
  internet_annual decimal,
  phone_annual decimal,
  electricity_annual decimal,
  heating_cooling_annual decimal,
  cleaning_annual decimal,
  
  -- Calculated results
  scenario_type text,
  total_deduction decimal,
  fixed_rate_deduction decimal,
  actual_cost_deduction decimal,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create documents table for file uploads
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  questionnaire_id uuid references public.questionnaire_responses(id) on delete cascade,
  
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  file_url text not null,
  document_type text not null check (document_type in ('receipt', 'photo', 'utility_bill', 'other')),
  
  created_at timestamp with time zone default now()
);

-- Create usage tracking table (3 outputs per purchaser limit)
create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  questionnaire_id uuid not null references public.questionnaire_responses(id) on delete cascade,
  
  output_type text not null check (output_type in ('ato_document', 'scenario_report')),
  generated_at timestamp with time zone default now(),
  
  unique(user_id, questionnaire_id, output_type)
);

-- Create reference documents table (for admin uploaded books/resources)
create table if not exists public.reference_documents (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid references auth.users(id),
  
  title text not null,
  document_type text not null check (document_type in ('book', 'ato_letter', 'guide', 'other')),
  file_url text not null,
  description text,
  
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.questionnaire_responses enable row level security;
alter table public.documents enable row level security;
alter table public.usage_tracking enable row level security;
alter table public.reference_documents enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Tax agents can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- Questionnaire responses policies
create policy "Users can view their own questionnaire responses"
  on public.questionnaire_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own questionnaire responses"
  on public.questionnaire_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own questionnaire responses"
  on public.questionnaire_responses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own questionnaire responses"
  on public.questionnaire_responses for delete
  using (auth.uid() = user_id);

create policy "Tax agents can view all questionnaire responses"
  on public.questionnaire_responses for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- Documents policies
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

create policy "Tax agents can view all documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- Usage tracking policies
create policy "Users can view their own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert their own usage"
  on public.usage_tracking for insert
  with check (auth.uid() = user_id);

create policy "Tax agents can view all usage"
  on public.usage_tracking for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- Reference documents policies (admin only write, public read)
create policy "Anyone can view reference documents"
  on public.reference_documents for select
  using (true);

create policy "Tax agents can insert reference documents"
  on public.reference_documents for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

create policy "Tax agents can update reference documents"
  on public.reference_documents for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

create policy "Tax agents can delete reference documents"
  on public.reference_documents for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );
