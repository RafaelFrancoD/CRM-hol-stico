# 🔒 Guia de Segurança para Produção

## ✅ Melhorias de Segurança Implementadas

### 1. Autenticação e Senhas
- ✅ **Senhas fortes obrigatórias:** Mínimo 8 caracteres com maiúsculas, minúsculas, números e caracteres especiais
- ✅ **Bcrypt com 12 rounds:** Hash de senha mais seguro (aumentado de 10 para 12)
- ✅ **Proteção contra timing attacks:** Sempre processa hash mesmo para usuários inexistentes
- ✅ **JWT com 8h de expiração:** Tokens com issuer e expiration seguros
- ✅ **Cookies HttpOnly e Secure:** Proteção contra XSS em produção

### 2. Rate Limiting Avançado
- ✅ **Login:** Máximo 5 tentativas em 15 minutos (proteção brute force)
- ✅ **Registro:** Máximo 3 cadastros por hora por IP (anti-spam)
- ✅ **API Geral:** 100 requisições em 15 minutos em produção
- ✅ **Alertas de segurança:** Logs de tentativas suspeitas

### 3. Proteções Implementadas
- ✅ **Helmet.js:** Headers de segurança HTTP (CSP, HSTS, etc)
- ✅ **CORS configurado:** Apenas origens permitidas
- ✅ **SQL Injection protegido:** Queries parametrizadas
- ✅ **XSS protegido:** Cookies HttpOnly + validação de inputs
- ✅ **CSRF protegido:** SameSite cookies
- ✅ **Validação de inputs:** express-validator em todas as rotas
- ✅ **Logs de segurança:** Detecção de requisições suspeitas

---

## 🚨 CHECKLIST OBRIGATÓRIO ANTES DE COLOCAR NA WEB

### 1. Variáveis de Ambiente (.env)

⚠️ **NUNCA comite o arquivo .env no Git!**

Crie um `.env` na pasta `server/` com valores ÚNICOS e FORTES:

```bash
# PRODUÇÃO - VALORES REAIS E ÚNICOS
NODE_ENV=production

# DATABASE - Use um serviço gerenciado (RDS, Azure Database, etc)
DATABASE_URL=postgresql://usuario:senha_complexa@host.com:5432/mirelli_crm

# JWT SECRET - GERE UMA CHAVE FORTE E ÚNICA
# Use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=sua_chave_super_secreta_gerada_aqui_64_bytes_minimo

# Servidor
PORT=4000

# CORS - Domínio do seu site em produção
CLIENT_ORIGIN=https://seusite.com.br

# Cookie Domain (seu domínio)
COOKIE_DOMAIN=seusite.com.br

# Chave Gemini (se usar IA)
GEMINI_API_KEY=sua_chave_gemini_aqui
```

### 2. HTTPS Obrigatório

🔴 **NUNCA rode em HTTP em produção!**

Opções:
- **Let's Encrypt:** Certificado SSL gratuito
- **Cloudflare:** SSL + proteção DDoS grátis
- **Vercel/Netlify:** HTTPS automático
- **AWS CloudFront + ACM:** SSL gerenciado

### 3. Banco de Dados Seguro

🔴 **NUNCA use banco local em produção!**

Use serviços gerenciados:
- **AWS RDS PostgreSQL**
- **Azure Database for PostgreSQL**
- **Google Cloud SQL**
- **Supabase** (opção gratuita)
- **Neon.tech** (opção gratuita)

**Configurações obrigatórias:**
- ✅ Backup automático diário
- ✅ SSL/TLS habilitado
- ✅ Firewall: apenas IPs do servidor
- ✅ Senhas fortes (20+ caracteres)
- ✅ Criptografia em repouso (encryption at rest)

### 4. Servidor Backend

**Opções recomendadas:**
- **Railway.app** (fácil, barato)
- **Render.com** (gratuito com limitações)
- **Fly.io** (bom para Node.js)
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**
- **Azure App Service**

**Configurações obrigatórias:**
```bash
# No servidor, configure:
NODE_ENV=production
DATABASE_URL=<seu_banco_seguro>
JWT_SECRET=<chave_forte_64_bytes>
CLIENT_ORIGIN=https://seusite.com.br
```

### 5. Frontend

**Opções recomendadas:**
- **Vercel** (recomendado, grátis)
- **Netlify** (grátis)
- **Cloudflare Pages** (grátis)

**Configure o proxy para apontar para seu backend:**
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'https://seu-backend.com',
    changeOrigin: true,
    secure: true
  }
}
```

### 6. Firewall e Segurança de Rede

✅ **Configurar firewall:**
- Porta 4000 (backend): Apenas para o frontend
- Porta 5432 (PostgreSQL): Apenas para o backend
- Bloquear todas as outras portas

✅ **Usar CDN/WAF:**
- Cloudflare (gratuito) - proteção DDoS
- AWS WAF - filtro de ataques

### 7. Monitoramento e Logs

✅ **Implementar:**
- **Sentry.io:** Rastreamento de erros (grátis até 5k eventos/mês)
- **LogTail/Papertrail:** Logs centralizados
- **UptimeRobot:** Monitoramento de uptime (grátis)

### 8. Backup

✅ **Estratégia 3-2-1:**
- 3 cópias dos dados
- 2 mídias diferentes
- 1 cópia offsite

Configure backup automático do PostgreSQL:
- Diário: últimos 7 dias
- Semanal: último mês
- Mensal: último ano

### 9. Política de Senhas para Usuários

✅ **Já implementado no código:**
- Mínimo 8 caracteres
- 1 letra maiúscula
- 1 letra minúscula
- 1 número
- 1 caractere especial (@$!%*?&#)

⚠️ **Recomendado adicionar (futuro):**
- Expiração de senha (90 dias)
- Histórico de senhas (não repetir últimas 5)
- 2FA (Two-Factor Authentication)

### 10. Compliance e LGPD

✅ **Para estar em conformidade com LGPD:**
1. **Termo de Privacidade:** Adicione no site
2. **Consentimento:** Usuários devem aceitar uso de dados
3. **Direito ao esquecimento:** Função de deletar conta
4. **Criptografia:** Dados sensíveis criptografados
5. **Logs de acesso:** Registre quem acessou dados
6. **DPO:** Nomeie um responsável pela proteção de dados

---

## 🛡️ Checklist de Deploy Final

Antes de colocar no ar, verifique:

- [ ] `.env` com valores únicos e fortes
- [ ] `NODE_ENV=production` configurado
- [ ] HTTPS habilitado (certificado SSL válido)
- [ ] Banco de dados em serviço gerenciado
- [ ] Backup automático configurado
- [ ] Firewall configurado
- [ ] Rate limiting testado
- [ ] CORS configurado para domínio de produção
- [ ] Cookies com `secure: true`
- [ ] JWT_SECRET forte (64+ bytes)
- [ ] Logs de segurança ativos
- [ ] Monitoramento de erros (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Teste de penetração básico realizado
- [ ] Documentação de segurança para equipe
- [ ] Plano de resposta a incidentes definido

---

## 🚀 Script de Deploy Recomendado

### 1. Backend (Railway/Render)

```bash
# Adicione as variáveis de ambiente no painel
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=sua_chave_forte
CLIENT_ORIGIN=https://seusite.com.br

# Deploy automático via Git
git push origin main
```

### 2. Frontend (Vercel)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
cd "C:\Users\Rafael\Downloads\Mirelli\CRM Holístico"
vercel --prod

# Configure variáveis de ambiente no painel Vercel
VITE_API_TARGET=https://seu-backend.railway.app
```

---

## 📞 Suporte e Atualizações

### Dependências de Segurança

Atualize mensalmente:
```bash
cd server
npm audit fix
npm update

cd ..
npm audit fix
npm update
```

### Teste de Segurança Online

Use ferramentas gratuitas:
- **SSL Labs:** https://www.ssllabs.com/ssltest/
- **Security Headers:** https://securityheaders.com/
- **Mozilla Observatory:** https://observatory.mozilla.org/

---

## ⚠️ AVISOS IMPORTANTES

1. **NUNCA exponha credenciais no código**
2. **NUNCA comite arquivos .env**
3. **SEMPRE use HTTPS em produção**
4. **SEMPRE faça backup antes de updates**
5. **SEMPRE monitore logs de segurança**
6. **SEMPRE teste mudanças em staging primeiro**
7. **SEMPRE mantenha dependências atualizadas**

---

## 📋 Resumo de Custos Estimados (Mínimo)

**Opção Gratuita/Muito Barata:**
- Frontend: Vercel (grátis)
- Backend: Render.com (grátis com limitações) ou Railway ($5/mês)
- Banco: Supabase/Neon (grátis até 500MB)
- SSL: Let's Encrypt (grátis via Cloudflare)
- Domínio: ~R$ 40/ano (.com.br)
- **Total: ~R$ 100-200/ano**

**Opção Profissional:**
- Frontend: Vercel Pro ($20/mês)
- Backend: Railway/DigitalOcean ($10-20/mês)
- Banco: Supabase Pro ($25/mês) ou AWS RDS ($15-30/mês)
- Monitoramento: Sentry ($26/mês)
- Backup: AWS S3 ($5/mês)
- **Total: ~R$ 500-700/mês**

---

**Última atualização:** 2026-01-06
**Versão:** 1.0.0
