# Sistema de Gestão de Frequência

## Configuração

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
\`\`\`

Você pode encontrar essas informações no painel do Supabase em Configurações > API.

**IMPORTANTE**: Após criar o arquivo `.env.local`, você precisa reiniciar o servidor de desenvolvimento para que as variáveis sejam carregadas.

### 2. Criar as tabelas no Supabase

1. Acesse o Editor SQL no painel do Supabase
2. Cole e execute o SQL do arquivo `schema.sql` para criar todas as tabelas necessárias

### 3. Criar um usuário de teste

1. No painel do Supabase, vá para Authentication > Users
2. Clique em "Add User"
3. Crie um usuário com email `admin@example.com` e senha `password`
4. Copie o UUID do usuário criado
5. No Editor SQL, execute o seguinte comando para atualizar o ID do usuário na tabela users:

\`\`\`sql
UPDATE users SET id = 'COLE_O_UUID_AQUI' WHERE email = 'admin@example.com';
\`\`\`

### 4. Iniciar o aplicativo

\`\`\`bash
npm run dev
\`\`\`

## Credenciais para teste

- **Email**: `admin@example.com`
- **Senha**: `password`

## Solução de problemas

Se você encontrar o erro "Failed to construct 'URL': Invalid URL", verifique:

1. Se o arquivo `.env.local` foi criado corretamente
2. Se as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão definidas
3. Se o servidor de desenvolvimento foi reiniciado após a criação do arquivo `.env.local`
