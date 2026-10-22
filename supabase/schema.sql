-- ByB Soul Jewelry: esquema inicial para Supabase
-- Ejecuta este archivo completo en Supabase > SQL Editor.
-- Crea productos, permisos y almacenamiento público para las fotos.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  price integer not null check (price >= 0),
  description text,
  category text,
  image_url text,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_available_created_idx
  on public.products (available, created_at desc);
create index if not exists products_category_idx
  on public.products (category);

-- Lista explícita de cuentas autorizadas a administrar el inventario.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public can read available products" on public.products;
create policy "Public can read available products"
  on public.products for select to anon, authenticated
  using (available = true);

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
  on public.products for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can read their own admin row" on public.admin_users;
create policy "Admins can read their own admin row"
  on public.admin_users for select to authenticated
  using (user_id = auth.uid());

-- Bucket público: las fotos de catálogo se pueden ver sin iniciar sesión.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-images', 'catalog-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view catalog images" on storage.objects;
create policy "Public can view catalog images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'catalog-images');

drop policy if exists "Admins can upload catalog images" on storage.objects;
create policy "Admins can upload catalog images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'catalog-images'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "Admins can update catalog images" on storage.objects;
create policy "Admins can update catalog images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'catalog-images'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  )
  with check (
    bucket_id = 'catalog-images'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "Admins can delete catalog images" on storage.objects;
create policy "Admins can delete catalog images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'catalog-images'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

-- IMPORTANTE: crea primero el usuario desde Supabase Dashboard > Authentication > Users.
-- Luego ejecuta la instrucción de README con el UUID de esa cuenta para autorizarla.
-- No insertes usuarios desde el catálogo público.


-- Compatibilidad con el proyecto existente: la app utiliza products.category
-- y el bucket catalog-images. Este bloque también puede ejecutarse en una
-- base de datos que ya tenga category_id y una tabla categories.
alter table public.products add column if not exists category text;
create index if not exists products_category_idx on public.products (category);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-images', 'catalog-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public can view catalog images') then
    create policy "Public can view catalog images"
      on storage.objects for select to anon, authenticated
      using (bucket_id = 'catalog-images');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Admins can upload catalog images') then
    create policy "Admins can upload catalog images"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'catalog-images'
        and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Admins can update catalog images') then
    create policy "Admins can update catalog images"
      on storage.objects for update to authenticated
      using (bucket_id = 'catalog-images'
        and exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
      with check (bucket_id = 'catalog-images'
        and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Admins can delete catalog images') then
    create policy "Admins can delete catalog images"
      on storage.objects for delete to authenticated
      using (bucket_id = 'catalog-images'
        and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
  end if;
end $$;
