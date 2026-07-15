-- ============================================================================
-- Supabase Storage: Verification Documents Bucket
-- ============================================================================

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('verification_docs', 'verification_docs', false)
on conflict (id) do nothing;

-- 2. RLS Policies for the bucket

-- Allow authenticated users (providers) to upload their own documents
create policy "Providers can upload verification docs"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'verification_docs' );

-- Allow authenticated users to view their own documents
create policy "Users can view their own docs"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'verification_docs' and auth.uid() = owner );

-- Allow admin users to view all documents
create policy "Admins can view all docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification_docs'
    and exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'role' = 'admin'
    )
  );
