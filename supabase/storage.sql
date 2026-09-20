-- Execute este SQL no Supabase > SQL Editor.
-- Ele cria o bucket público usado pelo painel para fotos de produtos.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Upload público controlado pelo painel atual.
-- IMPORTANTE: o painel atual ainda usa a palavra-chave local "pontinho".
-- Para produção, substitua esse acesso por Supabase Auth + RLS.

create policy "product images public read"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "product images public upload"
on storage.objects for insert
with check (bucket_id = 'product-images');

create policy "product images public update"
on storage.objects for update
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

create policy "product images public delete"
on storage.objects for delete
using (bucket_id = 'product-images');
