# 🚀 Deploy no Render.com - Passo a Passo Simples

## ✅ Você JÁ TEM:
- ✅ Banco de dados Neon configurado
- ✅ Frontend na Vercel
- ✅ Código no GitHub

## 📋 AGORA FAÇA (10 minutos):

### **PASSO 1: Fazer commit dos arquivos novos**

Abra o terminal na pasta do projeto e execute:

```bash
git add .
git commit -m "Adicionar configuração Render"
git push
```

### **PASSO 2: Criar Backend no Render**

1. Acesse: https://render.com
2. Clique **"Get Started for Free"**
3. Clique **"GitHub"** (autorize a conexão)
4. Clique **"New +"** (canto superior direito)
5. Clique **"Web Service"**
6. Encontre seu repositório: **CRM Holístico** (ou nome que você deu)
7. Clique **"Connect"**

### **PASSO 3: Configurar o Serviço**

**Preencha EXATAMENTE assim:**

- **Name:** `mirelli-crm-backend`
- **Region:** `Oregon (US West)` (deixe o padrão)
- **Branch:** `master` (ou `main`)
- **Root Directory:** `server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free` (IMPORTANTE: selecione FREE)

### **PASSO 4: Variáveis de Ambiente**

Role a página até **"Environment Variables"** e clique **"Add Environment Variable"**

Adicione **CADA UMA** dessas variáveis (clique "Add" para cada):

**1ª Variável:**
- **Key:** `NODE_ENV`
- **Value:** `production`

**2ª Variável:**
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://neondb_owner:npg_tgfPdI43VpHL@ep-wandering-wildflower-acpa2wmo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`

**3ª Variável:**
- **Key:** `JWT_SECRET`
- **Value:** `mirelli_crm_ultra_secret_2024_production_key_9876543210_secure`

**4ª Variável:**
- **Key:** `PORT`
- **Value:** `4000`

**5ª Variável:**
- **Key:** `CLIENT_ORIGIN`
- **Value:** (Cole aqui a URL do seu site na Vercel, tipo: `https://seu-site.vercel.app`)

**6ª Variável:**
- **Key:** `GEMINI_API_KEY`
- **Value:** `PLACEHOLDER_API_KEY`

### **PASSO 5: Deploy**

1. Clique no botão **"Create Web Service"** (no final da página)
2. Aguarde 5-10 minutos (vai instalar dependências e subir o servidor)
3. Quando terminar, vai aparecer **"Live"** com uma bolinha verde 🟢
4. **COPIE** a URL que aparece (tipo: `https://mirelli-crm-backend.onrender.com`)

### **PASSO 6: Configurar Banco de Dados**

Quando o deploy terminar:

1. Na página do Render, procure **"Shell"** no menu lateral
2. Clique em **"Shell"** (abre um terminal)
3. Execute ESTE comando:
   ```bash
   node setup-db.js
   ```
4. Aguarde aparecer: **"Setup do banco de dados concluído com sucesso!"**

### **PASSO 7: Conectar Frontend na Vercel**

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **"Settings"** (menu superior)
4. Clique em **"Environment Variables"** (menu lateral)
5. Clique **"Add New"**
   - **Key:** `VITE_API_TARGET`
   - **Value:** (Cole a URL do Render que você copiou, ex: `https://mirelli-crm-backend.onrender.com`)
6. Clique **"Save"**
7. Volte para **"Deployments"** (menu superior)
8. Clique nos **3 pontinhos** do último deploy
9. Clique **"Redeploy"**
10. Aguarde terminar o redeploy (~2 minutos)

### **PASSO 8: TESTAR!**

1. Acesse seu site na Vercel
2. Tente fazer login com:
   - **Email:** mirellisilva@gmail.com
   - **Senha:** 918273645

---

## ✅ PRONTO! Seu CRM está no ar! 🎉

**URLs importantes:**
- Frontend: https://seu-site.vercel.app
- Backend: https://mirelli-crm-backend.onrender.com
- Banco: Neon (já configurado)

---

## ⚠️ IMPORTANTE:

**Plano gratuito do Render:**
- Backend "dorme" após 15 minutos sem uso
- Primeira requisição após "acordar" pode demorar 30-60 segundos
- Depois funciona normalmente

**Se quiser evitar isso:**
- Upgrade para plano pago: $7/mês (backend sempre ativo)

---

## 🆘 SE DER ERRO:

**Erro no deploy do Render:**
- Verifique se o "Root Directory" está como `server`
- Verifique se todas as variáveis de ambiente foram adicionadas

**Erro de login:**
- Aguarde 1-2 minutos após o primeiro deploy
- Backend pode estar "acordando"
- Tente novamente

**Ainda com erro?**
- Volte aqui e me avise qual erro aparece!
