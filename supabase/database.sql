-- Execute este SQL no Supabase > SQL Editor.
-- Banco compartilhado para produtos e lojistas.

create extension if not exists pgcrypto;

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  nome_loja text not null,
  responsavel text not null,
  whatsapp text not null,
  email text not null default '',
  instagram text not null default '',
  descricao text not null default '',
  categoria text not null default 'Moda Feminina',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  loja text not null,
  whatsapp text not null,
  breve_descricao text not null default '',
  descricao text not null default '',
  modelo text not null default '',
  cores text[] not null default '{}',
  tamanhos text[] not null default '{}',
  preco numeric(12,2) not null default 0,
  categoria text not null default 'Moda Feminina',
  fotos text[] not null default '{}',
  youtube_url text not null default '',
  instagram_video_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.merchants enable row level security;
alter table public.products enable row level security;

drop policy if exists "public read merchants" on public.merchants;
create policy "public read merchants" on public.merchants for select using (true);
drop policy if exists "public insert merchants" on public.merchants;
create policy "public insert merchants" on public.merchants for insert with check (true);
drop policy if exists "public update merchants" on public.merchants;
create policy "public update merchants" on public.merchants for update using (true) with check (true);
drop policy if exists "public delete merchants" on public.merchants;
create policy "public delete merchants" on public.merchants for delete using (true);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "public insert products" on public.products;
create policy "public insert products" on public.products for insert with check (true);
drop policy if exists "public update products" on public.products;
create policy "public update products" on public.products for update using (true) with check (true);
drop policy if exists "public delete products" on public.products;
create policy "public delete products" on public.products for delete using (true) with check (true);

-- Dados de demonstração iniciais.
insert into public.merchants (nome_loja,responsavel,whatsapp,email,instagram,descricao,categoria)
select * from (values
('Bella Moda','Atendimento Bella Moda','5511987650001','','','Moda feminina.','Moda Feminina'),
('Don Alberto','Atendimento Don Alberto','5511987650002','','','Moda masculina.','Moda Masculina'),
('Passo Certo Calçados','Atendimento Passo Certo','5511987650003','','','Calçados.','Calçados'),
('Atelier Luna','Atendimento Atelier Luna','5511987650004','','','Acessórios.','Acessórios'),
('TecPonto','Atendimento TecPonto','5511987650005','','','Eletrônicos.','Eletrônicos'),
('Mundo Kids','Atendimento Mundo Kids','5511987650006','','','Moda infantil.','Infantil')
) v(nome_loja,responsavel,whatsapp,email,instagram,descricao,categoria)
where not exists (select 1 from public.merchants);

insert into public.products (nome,loja,whatsapp,breve_descricao,descricao,modelo,cores,tamanhos,preco,categoria,fotos,youtube_url,instagram_video_url)
select * from (values
('Vestido Midi Plissado','Bella Moda','5511987650001','Vestido leve e elegante para o dia a dia.','Vestido midi em tecido plissado com caimento fluido, forro interno e cinto removível. Ideal para eventos e trabalho.','Midi Plissado 2024',array['Preto','Verde Oliva','Vinho'],array['P','M','G','GG'],219.90,'Moda Feminina',array['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'],'',''),
('Camisa Social Slim','Don Alberto','5511987650002','Algodão egípcio com toque macio.','Camisa social slim fit confeccionada em algodão egípcio, com botões em madrepérola e punho duplo.','Slim Premium',array['Branco','Azul Claro'],array['1','2','3','4'],179.00,'Moda Masculina',array['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],'',''),
('Tênis Urbano Confort','Passo Certo Calçados','5511987650003','Solado em memory foam para o dia inteiro.','Tênis casual com cabedal em couro sintético, palmilha em memory foam e solado antiderrapante.','Confort Max',array['Branco','Preto'],array['37','38','39','40','41','42'],289.90,'Calçados',array['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],'',''),
('Bolsa Transversal Couro','Atelier Luna','5511987650004','Couro legítimo com alça ajustável.','Bolsa transversal em couro legítimo, com dois compartimentos, bolso interno com zíper e alça ajustável.','Luna Cross',array['Caramelo','Preto'],array['Único'],349.00,'Acessórios',array['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'],'',''),
('Fone Bluetooth Studio','TecPonto','5511987650005','Cancelamento de ruído e 30h de bateria.','Fone over-ear com cancelamento ativo de ruído, bluetooth 5.3, microfone integrado e até 30 horas de bateria.','Studio ANC',array['Preto','Prata'],array['Único'],459.90,'Eletrônicos',array['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],'',''),
('Conjunto Infantil Verão','Mundo Kids','5511987650006','Camiseta e bermuda em algodão.','Conjunto infantil com camiseta estampada e bermuda em moletinho leve, confortável para o verão.','Verão Kids',array['Amarelo','Azul'],array['2','4','6','8'],89.90,'Infantil',array['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80'],'','')
) v(nome,loja,whatsapp,breve_descricao,descricao,modelo,cores,tamanhos,preco,categoria,fotos,youtube_url,instagram_video_url)
where not exists (select 1 from public.products);
