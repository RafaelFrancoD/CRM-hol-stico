# 🚀 COMO USAR - CRM Holístico

Sistema 100% AUTOMÁTICO! Tudo já está configurado.

---

## ⚡ RODAR NO SEU COMPUTADOR (3 Passos)

### PASSO 1: Instalar Dependências

Abra o terminal na pasta do projeto e rode:

```bash
# Instalar dependências do backend
cd server
npm install

# Voltar e instalar dependências do frontend
cd ..
npm install
```

**Tempo:** ~2 minutos

---

### PASSO 2: Configurar e Criar Banco de Dados

```bash
cd server
npm run setup
```

**O que esse comando faz:**
- ✅ Cria o banco de dados `mirelli_crm` automaticamente
- ✅ Cria todas as tabelas necessárias
- ✅ Cria o usuário com login e senha
- ✅ Deixa tudo pronto para usar

**Login criado:**
- Email: `mirellisilva@gmail.com`
- Senha: `918273645`

**Tempo:** ~10 segundos

---

### PASSO 3: Iniciar o Sistema

Abra **2 terminais** (ou abas):

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
✅ Servidor rodando em: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ CRM rodando em: http://localhost:5173

---

### PASSO 4: Usar o Sistema

1. Abra o navegador em: **http://localhost:5173**
2. Faça login:
   - Email: `mirellisilva@gmail.com`
   - Senha: `918273645`

**Pronto! 🎉**

---

## ✅ O Que Já Funciona Automaticamente

- ✅ **Login e Logout** - Totalmente seguro
- ✅ **Cadastrar Pacientes** - Adicionar novos pacientes
- ✅ **Editar Pacientes** - Modificar informações
- ✅ **Excluir Pacientes** - Remover com confirmação
- ✅ **Kanban** - Organizar fluxo de atendimento
- ✅ **Agenda** - Marcar consultas
- ✅ **Financeiro** - Controlar pagamentos
- ✅ **Documentos** - Anexar arquivos
- ✅ **Mensagens** - Templates de mensagens
- ✅ **Dashboard** - Visão geral do negócio

**Tudo salva automaticamente no banco PostgreSQL!**

---

## 🔄 Comandos Úteis

### Reiniciar o Banco (Limpar tudo)
```bash
cd server
npm run setup
```

### Ver dados no banco
```bash
# Conectar ao PostgreSQL
psql -U postgres -d mirelli_crm

# Ver usuários
SELECT * FROM users;

# Ver pacientes
SELECT * FROM patients;

# Sair
\q
```

---

## 🆘 Problemas?

### "Não conectou no banco"
1. Certifique-se que PostgreSQL está rodando
2. Abra `server/.env` e verifique a linha:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mirelli_crm
   ```
3. Se sua senha do PostgreSQL for diferente, mude `postgres:postgres` para `postgres:SUA_SENHA`

### "Erro no npm run setup"
- Verifique se o PostgreSQL está instalado: `psql --version`
- Tente manualmente:
  ```bash
  psql -U postgres
  CREATE DATABASE mirelli_crm;
  \q
  npm run setup
  ```

### "Porta 4000 ocupada"
- Abra `server/.env` e mude:
  ```
  PORT=5000
  ```

### "Porta 5173 ocupada"
- O Vite escolherá automaticamente outra porta
- Ou mate o processo: `npx kill-port 5173`

---

## 📋 Próximos Passos (Quando Quiser)

Quando estiver satisfeito com o sistema rodando localmente:

1. **Subir para o Git**
   ```bash
   git init
   git add .
   git commit -m "CRM Holístico Mirelli"
   git remote add origin https://github.com/SEU-USUARIO/seu-repo.git
   git push -u origin main
   ```

2. **Hospedar Online**
   - Você escolhe onde hospedar (Vercel, Heroku, etc)
   - Quando decidir, me avise que te ajudo!

---

**Sistema pronto e funcionando! 🚀**

Qualquer dúvida, é só me chamar!
