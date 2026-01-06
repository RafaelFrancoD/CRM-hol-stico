# 🚀 Guia de Deploy - CRM Holístico Mirelli Silva

Este guia contém instruções detalhadas e seguras para colocar seu projeto em produção na Vercel.

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Backend](#preparação-do-backend)
3. [Deploy do Backend (Railway)](#deploy-do-backend-railway)
4. [Deploy do Frontend (Vercel)](#deploy-do-frontend-vercel)
5. [Configurações de Segurança](#configurações-de-segurança)
6. [Teste Local](#teste-local)

---

## ✅ Pré-requisitos

- [x] Conta no GitHub
- [x] Conta na Vercel (https://vercel.com)
- [x] Conta no Railway (https://railway.app) - para banco PostgreSQL gratuito
- [x] Git instalado
- [x] Node.js instalado

---

## 🔧 Preparação do Backend

### 1. Criar Banco de Dados PostgreSQL no Railway

1. Acesse https://railway.app
2. Faça login/cadastro
3. Clique em "New Project" → "Provision PostgreSQL"
4. Aguarde a criação do banco
5. Clique no banco → Aba "Connect" → Copie a **DATABASE_URL**
   - Exemplo: `postgresql://postgres:senha@containers-us-west.railway.app:5432/railway`

### 2. Deploy do Backend no Railway

**Opção A: Via GitHub (Recomendado)**

1. Crie um repositório separado para o backend no GitHub
2. Copie apenas a pasta `server/` para este repositório
3. No Railway, clique em "New Project" → "Deploy from GitHub repo"
4. Selecione o repositório do backend
5. Railway detectará automaticamente o Node.js

**Opção B: Via Railway CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Na pasta server/
cd server
railway init
railway up
```

### 3. Configurar Variáveis de Ambiente no Railway

No painel do Railway, vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://[copie do banco que você criou]
JWT_SECRET=crie_uma_chave_muito_segura_aqui_min_32_caracteres_1234567890
CLIENT_ORIGIN=https://seu-app.vercel.app
COOKIE_DOMAIN=.railway.app
GEMINI_API_KEY=sua_chave_gemini_opcional
```

**⚠️ IMPORTANTE - JWT_SECRET:**
Gere uma chave super segura. Exemplo usando Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Executar Migrations no Railway

Após o deploy, execute as migrations:

1. No Railway, vá na aba "Deployments"
2. Clique no último deploy bem-sucedido
3. Abra o terminal (botão "Shell")
4. Execute:
```bash
npm run setup
```

**Anote a URL do backend:** `https://seu-app.up.railway.app`

---

## 🌐 Deploy do Frontend (Vercel)

### 1. Preparar o Repositório Git

```bash
# Na raiz do projeto
cd "C:\Users\Rafael\Downloads\Mirelli\CRM Holístico"

# Inicializar git (se ainda não tiver)
git init

# Adicionar todos os arquivos (o .gitignore protege arquivos sensíveis)
git add .

# Fazer o primeiro commit
git commit -m "Initial commit - CRM Holístico Mirelli Silva"

# Criar repositório no GitHub
# Vá em https://github.com/new e crie um repositório PRIVADO

# Adicionar remote e push
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main
```

### 2. Deploy na Vercel

1. Acesse https://vercel.com
2. Clique em "Add New" → "Project"
3. Importe o repositório do GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3. Configurar Variáveis de Ambiente na Vercel

Na seção **Environment Variables**, adicione:

```env
VITE_API_URL=https://seu-backend.up.railway.app
NODE_ENV=production
```

**⚠️ Substitua** `seu-backend.up.railway.app` pela URL real do seu backend no Railway!

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada: `https://seu-app.vercel.app`

---

## 🔒 Configurações de Segurança

### 1. Atualizar CLIENT_ORIGIN no Railway

Depois que o frontend estiver no ar, volte no Railway e atualize:

```env
CLIENT_ORIGIN=https://seu-app.vercel.app
```

Clique em "Redeploy" para aplicar.

### 2. Checklist de Segurança

- [x] Arquivo `.env` está no `.gitignore`
- [x] Credenciais NÃO estão no código fonte
- [x] JWT_SECRET é uma chave forte e única
- [x] DATABASE_URL não está exposta publicamente
- [x] CORS está configurado apenas para origens permitidas
- [x] Rate limiting está ativo
- [x] Cookies com httpOnly e secure
- [x] Helmet configurado com CSP

### 3. Alterar Senha Padrão

**CRÍTICO:** Após o primeiro login, crie uma nova conta de administrador e delete a conta padrão:

1. Faça login com: `mirellisilva@gmail.com` / `918273645`
2. Na interface (quando disponível), crie novo usuário com senha forte
3. Desconecte do banco e delete o usuário padrão:

```sql
-- Conecte ao banco via Railway CLI ou pgAdmin
DELETE FROM users WHERE email = 'mirellisilva@gmail.com';
```

---

## 🧪 Teste Local

Antes de subir, teste localmente:

### Backend
```bash
cd server
npm install
npm run setup    # Cria banco e usuário
npm start        # Inicia servidor na porta 4000
```

### Frontend
```bash
# Na raiz
npm install
npm run dev      # Inicia em localhost:5173
```

Acesse http://localhost:5173 e teste o login!

---

## 🆘 Resolução de Problemas

### Erro: "Invalid credentials"
- Verifique se as migrations foram executadas
- Confirme que o usuário foi criado (rode `npm run setup` no servidor)
- Verifique a conexão com o banco de dados

### Erro: "CORS"
- Confirme que `CLIENT_ORIGIN` no Railway está correto
- Verifique se a URL da Vercel está sem `/` no final

### Erro: "Cannot connect to database"
- Verifique se `DATABASE_URL` está correta
- Confirme que o banco PostgreSQL está rodando no Railway
- Teste a conexão: `psql $DATABASE_URL`

### Cookie não está sendo salvo
- Em produção, confirme que está usando HTTPS
- Verifique `COOKIE_DOMAIN` no Railway
- O domínio do frontend e backend devem ser compatíveis

---

## 📊 Monitoramento

### Railway
- Acesse a aba "Metrics" para ver uso de recursos
- Aba "Logs" mostra logs em tempo real

### Vercel
- Dashboard mostra analytics de visitas
- Aba "Logs" para erros do frontend

---

## 🔐 Recomendações Finais de Segurança

1. **Backup Regular:** Configure backups automáticos do banco no Railway
2. **SSL/TLS:** Já está ativo por padrão na Vercel e Railway ✅
3. **Firewall:** Configure regras no Railway se necessário
4. **Monitoramento:** Use ferramentas como Sentry para tracking de erros
5. **Atualizações:** Mantenha dependências atualizadas (`npm audit fix`)
6. **Senhas Fortes:** Use gerenciador de senhas
7. **2FA:** Ative autenticação de 2 fatores no GitHub, Vercel e Railway

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Railway e Vercel
2. Consulte documentação oficial:
   - Vercel: https://vercel.com/docs
   - Railway: https://docs.railway.app
3. GitHub Issues: Abra uma issue detalhada

---

## ✅ Checklist Final

- [ ] Backend rodando no Railway
- [ ] Banco PostgreSQL configurado
- [ ] Migrations executadas
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend deployado na Vercel
- [ ] Login funcionando
- [ ] CORS configurado corretamente
- [ ] Senha padrão alterada
- [ ] Backup do banco configurado

**Parabéns! Seu CRM está no ar e seguro! 🎉**
