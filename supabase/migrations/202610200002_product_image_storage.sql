-- OrvianPlace storage for product images.
-- Apply this migration in Supabase SQL Editor after reviewing it.
-- Images are publicly readable so product image URLs can be used in the catalog.
-- Only authenticated Orvian administrators may upload, update, or delete files.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read Orvian product images" on storage.objects;
create policy "Public can read Orvian product images"
on storage.objects for select to public
using (bucket_id = 'product-images');

drop policy if exists "Orvian admins upload product images" on storage.objects;
create policy "Orvian admins upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_orvian_admin());

drop policy if exists "Orvian admins update product images" on storage.objects;
create policy "Orvian admins update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_orvian_admin())
with check (bucket_id = 'product-images' and public.is_orvian_admin());

drop policy if exists "Orvian admins delete product images" on storage.objects;
create policy "Orvian admins delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_orvian_admin());
