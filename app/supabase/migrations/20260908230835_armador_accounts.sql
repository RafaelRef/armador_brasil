create table public.armador_accounts (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 0 check(revision>=0),
 preferences jsonb not null default '{}',
 updated_at timestamptz not null default now()
);
create table public.armador_teams (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 data jsonb not null check(jsonb_typeof(data)='object'),
 primary key(owner_id,id)
);
create table public.armador_games (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 data jsonb not null check(jsonb_typeof(data)='object'),
 primary key(owner_id,id)
);
alter table public.armador_accounts enable row level security;
alter table public.armador_teams enable row level security;
alter table public.armador_games enable row level security;
create policy account_owner on public.armador_accounts for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy team_owner on public.armador_teams for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy game_owner on public.armador_games for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
revoke all on public.armador_accounts,public.armador_teams,public.armador_games from anon;
grant select,insert,update,delete on public.armador_accounts,public.armador_teams,public.armador_games to authenticated;
create function public.armador_load_state() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('owner',auth.uid(),'revision',coalesce((select revision from public.armador_accounts where owner_id=auth.uid()),0),'state',
 case when exists(select 1 from public.armador_accounts where owner_id=auth.uid()) then jsonb_build_object('version',1,'prefs',(select preferences from public.armador_accounts where owner_id=auth.uid()),'teams',coalesce((select jsonb_agg(data order by data->>'name') from public.armador_teams where owner_id=auth.uid()),'[]'::jsonb),'games',coalesce((select jsonb_agg(data order by data->>'date' desc,id) from public.armador_games where owner_id=auth.uid()),'[]'::jsonb)) else null end)
$$;
create function public.armador_save_state(expected_revision bigint,document jsonb) returns bigint language plpgsql security invoker set search_path='' as $$
declare who uuid:=auth.uid(); current_revision bigint;
begin
 if who is null then raise exception 'Authentication required' using errcode='42501';end if;
 if expected_revision is null or expected_revision<0 or document->>'version' is distinct from '1' or jsonb_typeof(document->'teams') is distinct from 'array' or jsonb_typeof(document->'games') is distinct from 'array' or jsonb_typeof(document->'prefs') is distinct from 'object' then raise exception 'Invalid document';end if;
 if octet_length(document::text)>8000000 or jsonb_array_length(document->'teams')>200 or jsonb_array_length(document->'games')>500 then raise exception 'Document limit exceeded';end if;
 insert into public.armador_accounts(owner_id) values(who) on conflict(owner_id) do nothing;
 select revision into current_revision from public.armador_accounts where owner_id=who for update;
 if current_revision<>expected_revision then raise exception 'Revision conflict' using errcode='40001';end if;
 insert into public.armador_teams(owner_id,id,data) select who,(item->>'id')::uuid,item from jsonb_array_elements(document->'teams') item on conflict(owner_id,id) do update set data=excluded.data;
 delete from public.armador_teams where owner_id=who and id not in(select (item->>'id')::uuid from jsonb_array_elements(document->'teams') item);
 insert into public.armador_games(owner_id,id,data) select who,(item->>'id')::uuid,item from jsonb_array_elements(document->'games') item on conflict(owner_id,id) do update set data=excluded.data;
 delete from public.armador_games where owner_id=who and id not in(select (item->>'id')::uuid from jsonb_array_elements(document->'games') item);
 update public.armador_accounts set preferences=document->'prefs',revision=current_revision+1,updated_at=now() where owner_id=who;
 return current_revision+1;
end $$;
revoke all on function public.armador_load_state() from public,anon;
revoke all on function public.armador_save_state(bigint,jsonb) from public,anon;
grant execute on function public.armador_load_state() to authenticated;
grant execute on function public.armador_save_state(bigint,jsonb) to authenticated;
