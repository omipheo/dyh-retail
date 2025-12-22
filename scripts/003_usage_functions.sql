-- Function to check usage limit
create or replace function public.check_usage_limit(p_user_id uuid, p_questionnaire_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  usage_count integer;
begin
  select count(*)
  into usage_count
  from public.usage_tracking
  where user_id = p_user_id and questionnaire_id = p_questionnaire_id;
  
  return usage_count;
end;
$$;

-- Function to add updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_questionnaire_responses_updated_at on public.questionnaire_responses;
create trigger update_questionnaire_responses_updated_at
  before update on public.questionnaire_responses
  for each row
  execute function public.update_updated_at_column();
