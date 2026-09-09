create or replace function public.armador_save_state(expected_revision bigint,document jsonb) returns bigint language plpgsql security invoker set search_path='' as $$
declare who uuid:=auth.uid(); current_revision bigint;
begin
 if who is null then raise exception 'Authentication required' using errcode='42501';end if;
 if expected_revision is null or expected_revision<0 or document->>'version' is distinct from '1' or jsonb_typeof(document->'teams') is distinct from 'array' or jsonb_typeof(document->'games') is distinct from 'array' or jsonb_typeof(document->'prefs') is distinct from 'object' then raise exception 'Invalid document';end if;
 if octet_length(document::text)>8000000 or jsonb_array_length(document->'teams')>200 or jsonb_array_length(document->'games')>500 then raise exception 'Document limit exceeded';end if;
 insert into public.armador_accounts(owner_id) values(who) on conflict(owner_id) do nothing;
 select revision into current_revision from public.armador_accounts where owner_id=who for update;
 if current_revision<>expected_revision then raise exception 'Revision conflict' using errcode='PT409';end if;
 insert into public.armador_teams(owner_id,id,data) select who,(item->>'id')::uuid,item from jsonb_array_elements(document->'teams') item on conflict(owner_id,id) do update set data=excluded.data;
 delete from public.armador_teams where owner_id=who and id not in(select (item->>'id')::uuid from jsonb_array_elements(document->'teams') item);
 insert into public.armador_games(owner_id,id,data) select who,(item->>'id')::uuid,item from jsonb_array_elements(document->'games') item on conflict(owner_id,id) do update set data=excluded.data;
 delete from public.armador_games where owner_id=who and id not in(select (item->>'id')::uuid from jsonb_array_elements(document->'games') item);
 update public.armador_accounts set preferences=document->'prefs',revision=current_revision+1,updated_at=now() where owner_id=who;
 return current_revision+1;
end $$;
