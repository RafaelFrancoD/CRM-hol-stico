# ⚡ Quick Start - Rodando Localmente

Guia rápido para testar o CRM Holístico na sua máquina.

## 📦 Instalação Rápida

### 1. Instalar Dependências

```bash
# Backend
cd server
npm install

# Frontend (em outro terminal)
cd ..
npm install
```

### 2. Configurar Banco de Dados

Certifique-se de que o PostgreSQL está rodando:

```bash
# Verificar se PostgreSQL está ativo
psql --version

# Se não estiver rodando, inicie:
# Windows: Abra Services → PostgreSQL → Start
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### 3. Setup Automático

```bash
cd server
npm run setup
```

Este comando irá:
- ✅ Criar o banco de dados `mirelli_crm`
- ✅ Executar todas as migrations
- ✅ Criar o usuário: `mirellisilva@gmail.com` / `918273645`

### 4. Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
Servidor rodando em: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Aplicação rodando em: http://localhost:5173

### 5. Fazer Login

Abra http://localhost:5173 e faça login:
- **Email:** mirellisilva@gmail.com
- **Senha:** 918273645

---

## 🔧 Comandos Úteis

### Backend
```bash
npm start       # Inicia servidor
npm run dev     # Inicia com nodemon (auto-reload)
npm run setup   # Setup completo do banco
npm run migrate # Apenas migrations
npm run seed    # Popular com dados de exemplo
```

### Frontend
```bash
npm run dev     # Modo desenvolvimento
npm run build   # Build para produção
npm run preview # Preview do build
```

---

## 🛠️ Resolver Problemas

### PostgreSQL não conecta
```bash
# Edite server/.env e ajuste a DATABASE_URL:
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/mirelli_crm
```

### Porta 4000 ocupada
```bash
# Edite server/.env:
PORT=5000
```

### Erro "Cannot find module"
```bash
# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Próximos Passos

1. Explore a interface do CRM
2. Adicione pacientes
3. Teste o Kanban
4. Configure a agenda
5. Quando estiver pronto, siga o [DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md) para colocar na web!

---

**Boa sorte! 🚀**
