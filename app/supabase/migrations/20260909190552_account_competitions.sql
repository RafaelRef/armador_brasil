create table public.armador_competitions (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 name text not null check(length(trim(name)) between 1 and 100),
 season text not null check(season ~ '^[0-9]{4}(/[0-9]{2})?$'),
 type text not null check(type in ('league','cup','tournament','friendly')),
 primary key(owner_id,id)
);
create unique index competition_name_season on public.armador_competitions(owner_id,lower(regexp_replace(trim(name),'\s+',' ','g')),season);
alter table public.armador_competitions enable row level security;
create policy competition_owner on public.armador_competitions for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
revoke all on public.armador_competitions from anon;
grant select,insert,update,delete on public.armador_competitions to authenticated;
create or replace function public.armador_save_state(expected_revision bigint,document jsonb) returns bigint language plpgsql security invoker set search_path='' as $$
declare who uuid:=auth.uid(); current_revision bigint;
begin
 if who is null then raise exception 'Authentication required' using errcode='42501';end if;
 if expected_revision is null or expected_revision<0 or document->>'version' is distinct from '1' or jsonb_typeof(document->'teams') is distinct from 'array' or jsonb_typeof(document->'games') is distinct from 'array' or jsonb_typeof(document->'prefs') is distinct from 'object' then raise exception 'Invalid document';end if;
 if octet_length(document::text)>8000000 or jsonb_array_length(document->'teams')>200 or jsonb_array_length(document->'games')>500 then raise exception 'Document limit exceeded';end if;
 insert into public.armador_accounts(owner_id) values(who) on conflict(owner_id) do nothing;
 select revision into current_revision from public.armador_accounts where owner_id=who for update;
 if current_revision<>expected_revision then raise exception 'Revision conflict' using errcode='PT409';end if;
 if document ? 'competitions' then
  if jsonb_typeof(document->'competitions') is distinct from 'array' or jsonb_array_length(document->'competitions')>200 then raise exception 'Invalid competitions'; end if;
  insert into public.armador_competitions(owner_id,id,name,season,type)
  select who,(item->>'id')::uuid,item->>'name',item->>'season',item->>'type' from jsonb_array_elements(document->'competitions') item
  on conflict(owner_id,id) do update set name=excluded.name,season=excluded.season,type=excluded.type;
 end if;
 if exists(select 1 from jsonb_array_elements(document->'games') item where item->>'competitionId' is not null and not exists(select 1 from public.armador_competitions c where c.owner_id=who and c.id=(item->>'competitionId')::uuid)) then raise exception 'Competition not found'; end if;
 insert into public.armador_teams(owner_id,id,data) select who,(item->>'id')::uuid,item from jsonb_array_elements(document->'teams') item on conflict(owner_id,id) do update set data=excluded.data;
 delete from public.armador_teams where owner_id=who and id not in(select (item->>'id')::uuid from jsonb_array_elements(document->'teams') item);
 insert into public.armador_games(owner_id,id,data) select who,(item->>'id')::uuid,item from jsonb_array_elements(document->'games') item on conflict(owner_id,id) do update set data=excluded.data;
 delete from public.armador_games where owner_id=who and id not in(select (item->>'id')::uuid from jsonb_array_elements(document->'games') item);
 update public.armador_accounts set preferences=document->'prefs',revision=current_revision+1,updated_at=now() where owner_id=who;
 return current_revision+1;
end $$;
create or replace function public.armador_load_state() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('owner',auth.uid(),'revision',coalesce((select revision from public.armador_accounts where owner_id=auth.uid()),0),'state',
 case when exists(select 1 from public.armador_accounts where owner_id=auth.uid()) then jsonb_build_object('competitions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'season',season,'type',type) order by name,id) from public.armador_competitions where owner_id=auth.uid()),'[]'::jsonb),'version',1,'prefs',(select preferences from public.armador_accounts where owner_id=auth.uid()),'teams',coalesce((select jsonb_agg(data order by data->>'name') from public.armador_teams where owner_id=auth.uid()),'[]'::jsonb),'games',coalesce((select jsonb_agg(data order by data->>'date' desc,id) from public.armador_games where owner_id=auth.uid()),'[]'::jsonb)) else null end)
$$;
