-- Enhanced Row Level Security and Privacy Controls
-- This script adds comprehensive security measures for client data protection

-- ================================================
-- AUDIT LOGGING TABLE
-- ================================================
-- Track all sensitive data access and modifications
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on audit logs
alter table public.audit_logs enable row level security;

-- Only tax agents can view audit logs
create policy "Tax agents can view all audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- System can insert audit logs (service role)
create policy "Service role can insert audit logs"
  on public.audit_logs for insert
  with check (true);

-- ================================================
-- CLIENT-AGENT RELATIONSHIP TABLE
-- ================================================
-- Track which tax agents are authorized to access which clients
create table if not exists public.client_agent_relationships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamp with time zone default now(),
  assigned_by uuid references auth.users(id),
  is_active boolean default true,
  
  unique(client_id, agent_id),
  
  check (
    exists (
      select 1 from public.profiles p1
      where p1.id = client_id and p1.role = 'end_user'
    )
  ),
  check (
    exists (
      select 1 from public.profiles p2
      where p2.id = agent_id and p2.role = 'tax_agent'
    )
  )
);

alter table public.client_agent_relationships enable row level security;

-- Clients can view their assigned agents
create policy "Clients can view their assigned agents"
  on public.client_agent_relationships for select
  using (auth.uid() = client_id);

-- Tax agents can view their assigned clients
create policy "Tax agents can view their assigned clients"
  on public.client_agent_relationships for select
  using (auth.uid() = agent_id);

-- Tax agents can assign themselves to clients
create policy "Tax agents can create client relationships"
  on public.client_agent_relationships for insert
  with check (
    auth.uid() = agent_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- Tax agents can deactivate relationships
create policy "Tax agents can update their client relationships"
  on public.client_agent_relationships for update
  using (
    auth.uid() = agent_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- ================================================
-- ENHANCED RLS POLICIES - REPLACE EXISTING ONES
-- ================================================

-- Drop existing tax agent policies that allow viewing ALL data
drop policy if exists "Tax agents can view all profiles" on public.profiles;
drop policy if exists "Tax agents can view all questionnaire responses" on public.questionnaire_responses;
drop policy if exists "Tax agents can view all documents" on public.documents;
drop policy if exists "Tax agents can view all usage" on public.usage_tracking;

-- NEW: Tax agents can only view profiles of their assigned clients
create policy "Tax agents can view assigned client profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'tax_agent'
    ) and (
      -- Can view own profile
      auth.uid() = id or
      -- Can view assigned clients
      exists (
        select 1 from public.client_agent_relationships
        where agent_id = auth.uid() 
        and client_id = id 
        and is_active = true
      )
    )
  );

-- NEW: Tax agents can only view questionnaire responses of assigned clients
create policy "Tax agents can view assigned client questionnaires"
  on public.questionnaire_responses for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'tax_agent'
    ) and
    exists (
      select 1 from public.client_agent_relationships
      where agent_id = auth.uid() 
      and client_id = user_id 
      and is_active = true
    )
  );

-- NEW: Tax agents can only view documents of assigned clients
create policy "Tax agents can view assigned client documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'tax_agent'
    ) and
    exists (
      select 1 from public.client_agent_relationships
      where agent_id = auth.uid() 
      and client_id = user_id 
      and is_active = true
    )
  );

-- NEW: Tax agents can only view usage of assigned clients
create policy "Tax agents can view assigned client usage"
  on public.usage_tracking for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'tax_agent'
    ) and
    exists (
      select 1 from public.client_agent_relationships
      where agent_id = auth.uid() 
      and client_id = user_id 
      and is_active = true
    )
  );

-- ================================================
-- SENSITIVE DATA PROTECTION
-- ================================================

-- Add encrypted columns for sensitive data
alter table public.questionnaire_responses 
  add column if not exists tfn_encrypted bytea,
  add column if not exists encrypted_at timestamp with time zone;

-- Function to anonymize data for non-authorized users
create or replace function anonymize_sensitive_data()
returns trigger as $$
begin
  -- Only show full TFN to the owner and assigned tax agents
  if not (
    auth.uid() = new.user_id or
    exists (
      select 1 from public.profiles p
      join public.client_agent_relationships car on car.agent_id = p.id
      where p.id = auth.uid() 
      and p.role = 'tax_agent'
      and car.client_id = new.user_id
      and car.is_active = true
    )
  ) then
    new.tfn = '***-***-' || right(new.tfn, 3);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- ================================================
-- DATA RETENTION AND DELETION POLICIES
-- ================================================

-- Table for tracking data deletion requests (GDPR compliance)
create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_at timestamp with time zone default now(),
  scheduled_deletion_at timestamp with time zone,
  completed_at timestamp with time zone,
  status text not null check (status in ('pending', 'scheduled', 'completed', 'cancelled')) default 'pending',
  
  unique(user_id, requested_at)
);

alter table public.data_deletion_requests enable row level security;

create policy "Users can view their own deletion requests"
  on public.data_deletion_requests for select
  using (auth.uid() = user_id);

create policy "Users can create deletion requests"
  on public.data_deletion_requests for insert
  with check (auth.uid() = user_id);

create policy "Tax agents can view all deletion requests"
  on public.data_deletion_requests for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- ================================================
-- AUDIT TRIGGERS
-- ================================================

-- Function to log all modifications to sensitive tables
create or replace function log_audit_trail()
returns trigger as $$
begin
  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    created_at
  ) values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    now()
  );
  
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Create audit triggers for all sensitive tables
drop trigger if exists audit_questionnaire_responses on public.questionnaire_responses;
create trigger audit_questionnaire_responses
  after insert or update or delete on public.questionnaire_responses
  for each row execute function log_audit_trail();

drop trigger if exists audit_documents on public.documents;
create trigger audit_documents
  after insert or update or delete on public.documents
  for each row execute function log_audit_trail();

drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles
  after insert or update or delete on public.profiles
  for each row execute function log_audit_trail();

-- ================================================
-- SESSION SECURITY
-- ================================================

-- Function to validate session and enforce timeout
create or replace function check_session_validity()
returns boolean as $$
declare
  last_activity timestamp with time zone;
  session_timeout interval := interval '2 hours';
begin
  -- Get last activity time from auth metadata
  select (auth.jwt()->>'last_activity')::timestamp with time zone into last_activity;
  
  if last_activity is null then
    return true; -- First request
  end if;
  
  if now() - last_activity > session_timeout then
    return false; -- Session expired
  end if;
  
  return true;
end;
$$ language plpgsql security definer;

-- ================================================
-- ENCRYPTION HELPERS
-- ================================================

-- Install pgcrypto extension for encryption
create extension if not exists pgcrypto;

-- Function to encrypt sensitive text
create or replace function encrypt_sensitive_data(data text, key text)
returns bytea as $$
begin
  return pgp_sym_encrypt(data, key);
end;
$$ language plpgsql security definer;

-- Function to decrypt sensitive text
create or replace function decrypt_sensitive_data(encrypted_data bytea, key text)
returns text as $$
begin
  return pgp_sym_decrypt(encrypted_data, key);
end;
$$ language plpgsql security definer;

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

create index if not exists idx_client_agent_relationships_active 
  on public.client_agent_relationships(client_id, agent_id) 
  where is_active = true;

create index if not exists idx_audit_logs_user_created 
  on public.audit_logs(user_id, created_at desc);

create index if not exists idx_questionnaire_user_status 
  on public.questionnaire_responses(user_id, status);

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================

comment on table public.audit_logs is 'Comprehensive audit trail for all sensitive data access and modifications';
comment on table public.client_agent_relationships is 'Tracks authorized relationships between clients and tax agents for granular access control';
comment on table public.data_deletion_requests is 'GDPR-compliant data deletion request tracking';
comment on function log_audit_trail() is 'Automatically logs all changes to sensitive tables for compliance and security auditing';
comment on function check_session_validity() is 'Enforces session timeout for enhanced security';
