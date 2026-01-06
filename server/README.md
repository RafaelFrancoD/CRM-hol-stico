Servidor de apoio (auth + proxy mock para IA)

Como usar localmente

1) Entre na pasta do servidor e instale dependências:

```bash
cd server
npm install
```

2) Crie um arquivo `.env` no diretório raiz do projeto (não commitado) copiando de `.env.example` e configure:

- `JWT_SECRET` (uma string longa e segura)
- `CLIENT_ORIGIN` (ex.: http://localhost:3000)
- Opcional: `GEMINI_API_KEY` se você quiser implementar integração real no servidor
 - `DATABASE_URL` (ex.: postgres://user:password@localhost:5432/mirelli_crm) — necessário para persistência de usuários

Rodando Postgres localmente (Docker):

```bash
docker run --name mirelli-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=mirelli_crm -p 5432:5432 -d postgres:15
```

Depois, configure `DATABASE_URL` apontando para `postgres://user:pass@localhost:5432/mirelli_crm` e inicie o servidor.

3) Rodar servidor em modo dev:

```bash
cd server
npm run dev
```

Endpoints úteis:
- `POST /api/auth/register` { email, password }
- `POST /api/auth/login` { email, password } -> seta cookie HttpOnly
- `POST /api/auth/logout`
- `GET /api/auth/me` -> requires auth cookie
- `POST /api/gemini/generate` { messageType, context, patientName, tone }
- `POST /api/gemini/strategy` { niche }
CRUD endpoints for CRM data (authenticated):
- `GET /api/data/:store` — list items (stores: patients, finance, appointments, documents, message_templates)
- `GET /api/data/:store/:id` — get item
- `POST /api/data/:store` — create item (body is JSON object stored as `data`)
- `PUT /api/data/:store/:id` — update item
- `DELETE /api/data/:store/:id` — delete item

Migration runner
- Use `server/migrate.js` to apply all SQL files in `server/migrations` to the database pointed by `DATABASE_URL`.
- Example:
```bash
cd server
DATABASE_URL="<sua_database_url>" node migrate.js
```

Notas de segurança:
- Substitua o store em memória por um banco de dados seguro.
- Use HTTPS em produção e marque cookies com `secure: true`.
- Integre com provedores de secrets (AWS Secrets Manager, Azure Key Vault, etc.)
