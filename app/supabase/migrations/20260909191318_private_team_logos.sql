insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('team-logos','team-logos',false,2097152,array['image/png','image/jpeg','image/webp']);
create policy team_logo_read on storage.objects for select to authenticated using (bucket_id='team-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy team_logo_upload on storage.objects for insert to authenticated with check (bucket_id='team-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy team_logo_remove on storage.objects for delete to authenticated using (bucket_id='team-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
