-- Create messages table for communication between system and tax agents
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.questionnaire_responses(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  
  subject text not null,
  message_text text not null,
  message_type text not null check (message_type in ('system_alert', 'client_query', 'tax_agent_response', 'general')) default 'general',
  priority text not null check (priority in ('low', 'normal', 'high', 'urgent')) default 'normal',
  
  is_read boolean default false,
  read_at timestamp with time zone,
  
  -- Optional file attachment
  attachment_url text,
  attachment_name text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create message threads table for conversation grouping
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.questionnaire_responses(id) on delete cascade,
  subject text not null,
  participants uuid[] not null,
  last_message_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.messages enable row level security;
alter table public.message_threads enable row level security;

-- Messages policies
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update their own messages"
  on public.messages for update
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Tax agents can view all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- Message threads policies
create policy "Users can view threads they participate in"
  on public.message_threads for select
  using (auth.uid() = any(participants));

create policy "Users can create threads"
  on public.message_threads for insert
  with check (auth.uid() = any(participants));

create policy "Tax agents can view all threads"
  on public.message_threads for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'tax_agent'
    )
  );

-- Create indexes for better performance
create index if not exists idx_messages_assessment on public.messages(assessment_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_recipient on public.messages(recipient_id);
create index if not exists idx_messages_created on public.messages(created_at desc);
create index if not exists idx_messages_is_read on public.messages(is_read) where is_read = false;
create index if not exists idx_message_threads_assessment on public.message_threads(assessment_id);
