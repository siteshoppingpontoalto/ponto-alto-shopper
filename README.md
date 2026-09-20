# Ponto Alto Shop

Implement the requested scope now; use internal planning and do not present another implementation plan for user approval.

### Contexto e Requisitos do Usuário
"Crie uma loja virtual para do shopping ponto alto, esse site tem como objetivo disponibilizar aos usuários os produtos dos lojistas do shopping, separando por categorias.
Será necessário um painel administrativo para gerenciar o cadastro dos produtos, colocação de fotos, descrição, cor, nome, modelo, preço, variações de tamanho e breve descrição. Na página do carrinho de compras após o cliente informar seus dados o botão "realizar pedido" direcionará o conteúdo da compra do cliente para o número whatsApp do lojista a qual pertence o item comprado, portanto será necessário que no momento do cadastro do produtos informemos o telefone whatApp do lojista, pois será ele que receberá no whatsApp o formulário com os dados do cliente e os itens da compra.
Ao clicar no botão "Admin" da página inicial haverá uma palavra-chave que deverá ser digitada, somente após a inclusão da palavra-chave correta a página liberará para inclusão do cadastro dos produtos, nome da palavra-chave "pontinho""

### Detalhes de Implementação Esperados
1. **Identidade e Vitrine (Shopping Ponto Alto)**:
   - Header com logo/nome do Shopping Ponto Alto, barra de busca, botão do carrinho com contador e botão "Admin".
   - Navegação por categorias (ex: Moda Feminina, Masculina, Calçados, Acessórios, Eletrônicos, etc.).
   - Cards de produtos atraentes com foto, nome, lojista, preço, cores e tamanhos disponíveis.
   - Modal ou página de detalhes do produto exibindo modelo, fotos, descrição completa, variações de cor e tamanho e botão de adicionar ao carrinho.

2. **Acesso Administrativo**:
   - Botão "Admin" no header que abre modal solicitando a palavra-chave de acesso.
   - Palavra-chave obrigatória: `pontinho`.
   - Somente após digitar a palavra-chave correta, liberar acesso à área de administração.

3. **Painel Administrativo de Produtos**:
   - Gestão completa (cadastro, edição, exclusão e listagem).
   - Campos no formulário de cadastro:
     - Nome do produto
     - Nome da loja / lojista
     - Breve descrição
     - Descrição detalhada
     - Modelo
     - Cor
     - Preço
     - Variações de tamanho (ex: P, M, G, GG ou numerações)
     - Categoria
     - URL da foto ou upload de imagem
     - Número de WhatsApp do lojista (com DDD)
   - Armazenamento persistente local (localStorage ou Lovable Cloud/Supabase) já pré-carregado com alguns produtos demonstrativos do Shopping Ponto Alto.

4. **Carrinho e Fechamento de Pedido via WhatsApp**:
   - Drawer ou página do carrinho listando itens, quantidades, variações selecionadas (tamanho/cor) e valores.
   - Formulário com dados do cliente (Nome completo, Telefone, Endereço de entrega / retirada no shopping, Observações).
   - Botão "Realizar pedido":
     - Monta mensagem formatada com saudação, dados do cliente, itens comprados, variações, subtotal e total.
     - Abre diretamente a conversa no WhatsApp do lojista responsável (`https://wa.me/55...`).
     - Se houver produtos de lojistas diferentes no carrinho, agrupa os itens por lojista e permite enviar o pedido específico de cada lojista com um clique individual.

5. **Design e Usabilidade**:
   - Interface moderna, responsiva (focada em mobile e desktop), limpa e em português (pt-BR).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ponto-alto-shopper.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aada52b4-8b43-413f-a4e1-ae49ddff5042).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
