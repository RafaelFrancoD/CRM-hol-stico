Resumo de ações de segurança para deploy do CRM

Passos imediatos (prioridade alta):
- Não embutir chaves privadas no bundle cliente.
  - Mova GEMINI_API_KEY e outras chaves privadas para o servidor (variáveis de ambiente do servidor).
  - Crie endpoints no backend que façam proxy das chamadas à API externa.
- Autenticação e sessão:
  - Implemente autenticação via backend com senhas hashed (bcrypt/argon2).
  - Emita tokens JWT com `HttpOnly` + `Secure` cookies ou use sessões server-side.
  - Proteja endpoints sensíveis com verificação de escopo/roles e refresh tokens.
- Cabeçalhos de segurança (definir no servidor/proxy):
  - `Content-Security-Policy` adequada (evitar inline scripts/styles).
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
  - `X-Frame-Options: DENY`.
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: no-referrer-when-downgrade`.
  - `Permissions-Policy` restrita.
- CORS:
  - Habilite apenas orígens permitidos no servidor.
- Proteção contra ataques e uploads:
  - Limite tamanho e tipo de arquivos; faça scan antivírus em uploads.
  - Armazene arquivos em buckets privados e gere URLs assinadas para acesso.
- Proteção de dados no cliente/offline:
  - Evite guardar dados sensíveis no IndexedDB sem criptografia.
  - Se precisar de modo offline, criptografe dados locais com Web Crypto API e derive chave a partir de credenciais do usuário.
- Monitoramento e resposta:
  - Logging centralizado sem dados sensíveis, alertas e retenção controlada.
  - Backups regulares e testes de restauração.
- Ferramentas e CI:
  - Habilite Dependabot/Snyk ou similar.
  - Adicione `npm audit` e scanner estático no pipeline (GitHub Actions).
- Testes:
  - Testes de segurança / pentest antes da entrega.

Recomendações de implementação técnica (rápido checklist):
- Backend (Node/Express/Nest/etc.):
  - `helmet` para headers, `express-rate-limit`, `cors` configurado, `express-validator`.
  - Use TLS com certificados válidos (Let's Encrypt/Cloud provider).
  - Habilite WAF (Cloudflare, AWS WAF) e rate-limiting global.
- Deploy:
  - Não hospede chaves em repositório. Use secrets do provedor.
  - Ative CI para builds e análises de vulnerabilidades.

Notas finais:
- Posso gerar exemplos de código para:
  - Proxy backend seguro que chama a API externa (ex.: /api/gemini)
  - Exemplo de autenticação com Express + bcrypt + JWT via cookie HttpOnly
  - Exemplo de CSP + helmet config
  - GitHub Actions pipeline com `npm audit` e `npm ci`

Diga qual exemplo você prefere que eu implemente primeiro que eu crio os arquivos e testes localmente.
 
Docker e seed
- Adicionei `docker-compose.yml` para facilitar rodar Postgres + server + client localmente.
- Adicionei `server/seed.js` para popular o banco com um usuário de teste e um paciente de exemplo.

Comandos úteis:
```powershell
# build e subir serviços
docker-compose up --build

# rodar apenas o seed (após o serviço Postgres estar pronto)
cd server
npm run seed
```
