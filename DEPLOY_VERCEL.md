Deploy no Vercel — Guia rápido

Resumo recomendado
- Hospede o cliente (frontend) no Vercel (ótimo para Vite/React).
- Hospede o banco Postgres em um serviço gerenciado (Supabase, Railway, Neon).
- Hospede a API (server) em Railway/Render/Fly ou como Serverless na Vercel (opção B).

Opções (escolha uma)
- Opção 1 (recomendada): Cliente no Vercel + API/DB em Railway ou Supabase.
  - Vercel serve apenas frontend (`VITE_API_URL` apontando para a API).
  - API continua como serviço Node (servidor que criamos) com `DATABASE_URL` apontando para Postgres gerenciado.

- Opção 2 (alternativa): Cliente + funções serverless na Vercel.
  - Requer mover `server` endpoints para `api/` como funções (posso fazer isso se quiser).
  - Postgres ainda precisa ser gerenciado (Supabase/Railway).

Passos detalhados (Opção 1 — Recomendada)

1) Prepare repositório
- Suba seu código para um repositório Git (GitHub recomendado).

2) Criar Postgres gerenciado (ex.: Supabase)
- Crie um projeto no Supabase (ou Railway). Copie `DATABASE_URL`.
- Rode as migrations localmente ou no editor SQL do provedor.

  Exemplo usando `psql` localmente:
  ```bash
  psql "$DATABASE_URL" -f server/migrations/init.sql
  psql "$DATABASE_URL" -f server/migrations/crm_tables.sql
  ```

  Ou use o seed (após definir `DATABASE_URL` em .env):
  ```bash
  cd server
  npm install
  DATABASE_URL="<sua_database_url>" npm run seed
  ```

3) Deploy do servidor (API)
- Opção A: Railway/Render — crie um novo projeto, adicione `DATABASE_URL` e `JWT_SECRET` nas variáveis de ambiente e conecte o repositório ou use o `server/Dockerfile`.
- Opção B: Vercel Serverless — preciso adaptar `server` para `api/` functions. Informe se prefere essa opção.

4) Deploy do cliente no Vercel
- No Vercel, clique em "New Project" → importe do GitHub → configure build (Vite: `npm run build`).
- Em Settings → Environment Variables, adicione:
  - `VITE_API_URL` = `https://api.seu-dominio.com` (ou URL do servidor da Opção A)

5) Testes finais
- Registrar usuário via API, logar, testar CRUD no cliente apontando para `VITE_API_URL`.

Notas para Opção 2 (Serverless na Vercel)
- Prós: tudo no Vercel, deploy unificado.
- Contras: cold-starts e conexão Postgres requer cuidado (reusable pool).
- Se quiser essa rota, eu converto `server/index.js` em funções `api/*.js` e adapto pooling.

Variáveis de ambiente importantes
- `DATABASE_URL` — string de conexão Postgres (server)
- `JWT_SECRET` — segredo para tokens JWT (server)
- `GEMINI_API_KEY` — opcional, somente no server
- `VITE_API_URL` — no Vercel (client), URL pública da API

Segurança e recomendações antes do go-live
- Habilite HTTPS/TLS (Vercel já fornece para o client).
- Limite CORS apenas para o domínio do cliente.
- Use `HttpOnly` cookies para autenticação (já implementado).
- Configure backups, monitoramento e alertas do banco.

Supabase – recomendações de segurança específicas
- Após rodar as migrations, habilite Row-Level Security (RLS) nas tabelas sensíveis (as migrations incluídas já ativam RLS e revogam acesso público).
- NÃO exponha a `service_role` no frontend; mantenha-a apenas em variáveis de ambiente do servidor.
- Remova ou restrinja a `anon` key do projeto (ou deixe-a sem permissões de leitura/escrita nas tabelas do CRM).
- Se pretende permitir acesso direto do cliente ao DB (não recomendado), crie policies RLS que limitem leitura/escrita ao dono das linhas (usando claims do JWT do Supabase).


Próximos passos que posso implementar agora
1) Implementar Opção 1 completa (deploy server em Railway/Supabase + client no Vercel).
2) Converter o `server` para Serverless (`api/`) para hospedar tudo no Vercel.
3) Criar GitHub Actions para CI e deploy automático.

Responda com 1, 2 ou 3 para eu começar.
