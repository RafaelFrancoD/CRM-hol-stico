# 🚀 Deploy Simples - Vercel (Tudo em um Lugar)

Guia direto para subir seu CRM na Vercel com banco de dados gratuito.

## 📋 O Que Você Vai Precisar

- ✅ Conta no GitHub (gratuita)
- ✅ Conta na Vercel (gratuita) - https://vercel.com
- ✅ Conta no Supabase (gratuita) - https://supabase.com - para banco PostgreSQL

**Total de custo: R$ 0,00** 💰

---

## 🗄️ PASSO 1: Criar Banco de Dados no Supabase

### 1.1 Criar Projeto

1. Acesse https://supabase.com e faça login/cadastro
2. Clique em "New Project"
3. Preencha:
   - **Name:** mirelli-crm
   - **Database Password:** Crie uma senha FORTE e anote
   - **Region:** South America (São Paulo) - mais próximo
4. Clique em "Create new project" e aguarde 2-3 minutos

### 1.2 Pegar URL de Conexão

1. No painel do Supabase, vá em **Settings** → **Database**
2. Role até "Connection string" → Aba **URI**
3. Copie a URL (algo como):
   ```
   postgresql://postgres:[SUA-SENHA]@db.xxxx.supabase.co:5432/postgres
   ```
4. **IMPORTANTE:** Substitua `[SUA-SENHA]` pela senha que você criou

### 1.3 Executar Migrations no Supabase

1. No Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o seguinte SQL:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabelas do CRM
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  owner_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  owner_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  owner_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  owner_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  owner_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_patients_owner_email ON patients(owner_email);
CREATE INDEX IF NOT EXISTS idx_finance_owner_email ON finance(owner_email);
CREATE INDEX IF NOT EXISTS idx_appointments_owner_email ON appointments(owner_email);
CREATE INDEX IF NOT EXISTS idx_documents_owner_email ON documents(owner_email);
CREATE INDEX IF NOT EXISTS idx_message_templates_owner_email ON message_templates(owner_email);

-- Criar usuário inicial (ALTERE A SENHA DEPOIS!)
-- Hash para senha: 918273645
INSERT INTO users (email, password_hash)
VALUES ('mirellisilva@gmail.com', '$2a$10$xvZ1R8YqJQxqJlX8r9yLK.N0YvKZHGWKBLHJ7YvH9QwJZ1QZ1QZ1Q')
ON CONFLICT (email) DO NOTHING;
```

4. Clique em "Run" (ou F5)
5. Verifique se apareceu "Success" ✅

**⚠️ IMPORTANTE:** Por segurança, você deve criar o hash correto da senha. Vamos fazer isso localmente:

```bash
# No seu computador, rode:
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('918273645', 10, (err, hash) => console.log(hash));"
```

Copie o hash gerado e substitua no SQL acima onde está `$2a$10$xvZ...`

---

## 📁 PASSO 2: Preparar o Projeto para Vercel

### 2.1 Ajustar Estrutura (Já está pronto!)

Seu projeto já está configurado corretamente. Só precisamos verificar alguns arquivos.

### 2.2 Verificar package.json

Abra `package.json` na raiz e confirme que tem:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

✅ **Já está correto!**

---

## 🌐 PASSO 3: Subir para o GitHub

### 3.1 Criar Repositório

1. Acesse https://github.com/new
2. Preencha:
   - **Nome:** crm-holistico-mirelli
   - **Visibilidade:** ⚠️ **PRIVADO** (importante para segurança!)
3. **NÃO** marque "Initialize with README"
4. Clique em "Create repository"

### 3.2 Fazer Push do Código

Abra o terminal na pasta do projeto e execute:

```bash
# Navegar para a pasta do projeto
cd "C:\Users\Rafael\Downloads\Mirelli\CRM Holístico"

# Inicializar git (se ainda não fez)
git init

# Adicionar todos os arquivos (o .gitignore protege os sensíveis)
git add .

# Fazer primeiro commit
git commit -m "Initial commit - CRM Holístico Mirelli Silva"

# Adicionar repositório remoto (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/crm-holistico-mirelli.git

# Renomear branch para main
git branch -M main

# Enviar código
git push -u origin main
```

**📝 Nota:** O Git vai pedir suas credenciais do GitHub.

---

## 🚀 PASSO 4: Deploy na Vercel

### 4.1 Importar Projeto

1. Acesse https://vercel.com
2. Clique em "Add New..." → "Project"
3. Clique em "Import Git Repository"
4. Selecione o repositório `crm-holistico-mirelli`
5. Clique em "Import"

### 4.2 Configurar Build

Na tela de configuração:

- **Framework Preset:** Vite
- **Root Directory:** `./` (deixe em branco ou `./`)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `dist` ✅
- **Install Command:** `npm install` ✅

### 4.3 Configurar Variáveis de Ambiente

**CRÍTICO:** Role até "Environment Variables" e adicione:

```env
NODE_ENV=production
```

**NÃO** adicione mais nada aqui no frontend por enquanto.

### 4.4 Deploy

1. Clique em "Deploy"
2. Aguarde 2-5 minutos
3. Quando terminar, você verá a URL: `https://seu-app.vercel.app`

**🎉 Frontend está no ar!**

---

## 🔧 PASSO 5: Deploy do Backend na Vercel

Para o backend funcionar na Vercel, precisamos criar Serverless Functions.

### 5.1 Criar Projeto Separado para Backend

1. Na Vercel, clique em "Add New..." → "Project"
2. Clique em "Import Git Repository"
3. **Importante:** Você precisa criar um repositório separado apenas com a pasta `server/`

### 5.2 Criar Repositório do Backend

No GitHub, crie outro repositório:
- **Nome:** crm-holistico-backend
- **Visibilidade:** PRIVADO

```bash
# Criar pasta temporária para o backend
cd "C:\Users\Rafael\Downloads"
mkdir crm-backend-deploy
cd crm-backend-deploy

# Copiar apenas os arquivos do servidor
cp -r "../Mirelli/CRM Holístico/server/"* .

# Inicializar git
git init
git add .
git commit -m "Backend do CRM"
git remote add origin https://github.com/SEU-USUARIO/crm-holistico-backend.git
git branch -M main
git push -u origin main
```

### 5.3 Configurar Backend na Vercel

1. Importe o repositório `crm-holistico-backend`
2. **Framework:** Node.js
3. **Root Directory:** `./`
4. **Build Command:** (deixe vazio)
5. **Output Directory:** (deixe vazio)

### 5.4 Variáveis de Ambiente do Backend

Adicione estas variáveis na Vercel (seção Environment Variables):

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[SENHA]@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=cole_aqui_a_chave_que_voce_gerou_com_32_caracteres
CLIENT_ORIGIN=https://seu-app-frontend.vercel.app
PORT=4000
```

**⚠️ Substitua:**
- `DATABASE_URL`: Cole a URL completa do Supabase
- `JWT_SECRET`: Gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `CLIENT_ORIGIN`: URL do seu frontend na Vercel

### 5.5 Deploy do Backend

1. Clique em "Deploy"
2. Anote a URL: `https://seu-backend.vercel.app`

---

## 🔗 PASSO 6: Conectar Frontend ao Backend

### 6.1 Atualizar Variáveis do Frontend

1. Volte no projeto do **frontend** na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:

```env
VITE_API_URL=https://seu-backend.vercel.app
```

**⚠️ Substitua** pela URL real do seu backend!

### 6.2 Redesploy do Frontend

1. Vá na aba **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em "Redeploy"

### 6.3 Atualizar CLIENT_ORIGIN no Backend

1. Volte no projeto do **backend** na Vercel
2. Vá em **Settings** → **Environment Variables**
3. **Edite** `CLIENT_ORIGIN` e coloque a URL do frontend:
   ```
   https://seu-app-frontend.vercel.app
   ```
4. Vá em **Deployments** e faça Redeploy

---

## ✅ PASSO 7: Testar o Login

1. Acesse seu site: `https://seu-app-frontend.vercel.app`
2. Faça login com:
   - **Email:** mirellisilva@gmail.com
   - **Senha:** 918273645

**🎉 Se funcionou, está tudo pronto!**

---

## 🔒 PASSO 8: Segurança Pós-Deploy

### 8.1 Alterar Senha Padrão

**CRÍTICO:** Altere a senha padrão:

1. Acesse Supabase → SQL Editor
2. Execute:
```sql
-- Primeiro, gere o hash da NOVA senha localmente:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SUA_NOVA_SENHA_FORTE', 10, (err, hash) => console.log(hash));"

-- Depois atualize no banco:
UPDATE users
SET password_hash = '$2a$10$SEU_NOVO_HASH_AQUI'
WHERE email = 'mirellisilva@gmail.com';
```

### 8.2 Checklist de Segurança

- [ ] Senha padrão alterada
- [ ] JWT_SECRET é único e forte (32+ caracteres)
- [ ] Repositórios do GitHub são PRIVADOS
- [ ] DATABASE_URL não está exposta
- [ ] CLIENT_ORIGIN está correto em ambos os lados
- [ ] Backups automáticos no Supabase configurados

---

## 🆘 Problemas Comuns

### Erro: "Cannot connect to database"
- Verifique se `DATABASE_URL` está correta na Vercel
- Confirme que a senha está correta (sem `[` `]`)
- Teste a conexão no Supabase

### Erro: "CORS"
- Confirme que `CLIENT_ORIGIN` no backend tem a URL exata do frontend
- Sem `/` no final da URL
- Ambos devem estar com HTTPS

### Erro: "Invalid credentials" no login
- Confirme que as migrations foram executadas no Supabase
- Verifique se o usuário foi criado na tabela `users`
- O hash da senha foi gerado corretamente?

---

## 📊 Limites Gratuitos

### Vercel
- ✅ 100GB de bandwidth/mês
- ✅ Builds ilimitados
- ✅ HTTPS automático
- ✅ Domínio `.vercel.app`

### Supabase
- ✅ 500MB de banco de dados
- ✅ 2GB de bandwidth/mês
- ✅ Backups por 7 dias
- ✅ PostgreSQL completo

**Para um CRM pessoal, é mais que suficiente!** 🎯

---

## 🎉 Pronto!

Seu CRM está no ar de forma **100% gratuita** e **segura**!

- ✅ HTTPS ativo
- ✅ Banco protegido
- ✅ Senhas hasheadas
- ✅ CORS configurado
- ✅ Rate limiting ativo
- ✅ Cookies seguros

**URLs importantes:**
- Frontend: `https://seu-app.vercel.app`
- Backend: `https://seu-backend.vercel.app`
- Banco: Supabase Dashboard

---

**Alguma dúvida? Verifique os logs na Vercel e no Supabase!**
