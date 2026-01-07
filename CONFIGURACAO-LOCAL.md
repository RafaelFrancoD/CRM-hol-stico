# Guia de Configuração - Ambiente Local

Este guia vai te ajudar a configurar o ambiente de desenvolvimento local para trabalhar no projeto antes de fazer deploy para produção.

## Pré-requisitos

Você precisa ter instalado:
- **Node.js** (versão 16 ou superior)
- **PostgreSQL** (versão 12 ou superior)
- **Git**

## Estrutura do Projeto

```
.
├── /                    # Frontend (React + Vite)
├── server/              # Backend (Node.js + Express)
├── .env                 # Variáveis de ambiente do frontend
└── server/.env          # Variáveis de ambiente do backend
```

## Configuração Passo a Passo

### 1. Instalar Dependências

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
cd ..
```

### 2. Configurar Banco de Dados PostgreSQL Local

#### Opção A: PostgreSQL Local
1. Instale o PostgreSQL em sua máquina
2. Crie um banco de dados:
```bash
psql -U postgres
CREATE DATABASE mirelli_crm;
\q
```

#### Opção B: Usar o Banco Neon (Produção)
Se preferir usar o mesmo banco da produção (Neon):
- Pegue a URL de conexão do Neon
- Use ela no arquivo `server/.env`

### 3. Configurar Variáveis de Ambiente

#### Frontend - Arquivo `.env` (raiz do projeto)
Para desenvolvimento local, o frontend deve apontar para o backend local:

```env
VITE_API_URL=http://localhost:4000
```

**IMPORTANTE:** Quando você fizer deploy, altere para:
```env
VITE_API_URL=https://mirelli-crm-backend.onrender.com
```

#### Backend - Arquivo `server/.env`
Configure as variáveis do backend:

```env
# Banco de dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mirelli_crm

# Segurança
JWT_SECRET=segredo-local-para-desenvolvimento

# Servidor
PORT=4000
NODE_ENV=development

# CORS - permite o frontend se comunicar
CLIENT_ORIGIN=http://localhost:5173

# Usuário padrão (opcional)
SEED_USER_EMAIL=mirellisilva@gmail.com
SEED_USER_PASS=918273645

# API do Gemini (opcional)
GEMINI_API_KEY=sua_chave_aqui
```

### 4. Configurar o Banco de Dados

Execute o script de setup que cria as tabelas:

```bash
cd server
npm run setup
cd ..
```

Este script vai:
- Criar todas as tabelas necessárias
- Criar um usuário administrador inicial

### 5. Iniciar os Servidores

Você precisa rodar **dois servidores** simultaneamente:

#### Terminal 1 - Backend
```bash
cd server
npm start
```
O backend vai rodar em: `http://localhost:4000`

#### Terminal 2 - Frontend
```bash
npm run dev
```
O frontend vai rodar em: `http://localhost:5173`

### 6. Acessar a Aplicação

Abra o navegador em: `http://localhost:5173`

**Login padrão:**
- Email: `mirellisilva@gmail.com`
- Senha: `918273645`

## Fluxo de Trabalho

### Desenvolvimento Local
1. Faça suas alterações no código
2. Teste localmente
3. Commit e push para o Git

### Deploy para Produção
1. **Frontend (.env)**: Altere para `VITE_API_URL=https://mirelli-crm-backend.onrender.com`
2. **Backend**: As variáveis de produção já estão configuradas no Render
3. Faça push para o Git
4. Vercel e Render vão fazer deploy automaticamente

## Comandos Úteis

### Backend
```bash
cd server
npm start          # Inicia o servidor
npm run dev        # Inicia com nodemon (auto-reload)
npm run setup      # Configura o banco de dados
npm run seed       # Popula dados de exemplo
```

### Frontend
```bash
npm run dev        # Inicia servidor de desenvolvimento
npm run build      # Cria build de produção
npm run preview    # Visualiza o build de produção
```

## Estrutura de Portas

- **Frontend (Vite)**: `localhost:5173`
- **Backend (Express)**: `localhost:4000`
- **PostgreSQL**: `localhost:5432`

## Problemas Comuns

### 1. Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confira a `DATABASE_URL` no `server/.env`
- Teste a conexão: `psql -U postgres -d mirelli_crm`

### 2. CORS Error
- Verifique se `CLIENT_ORIGIN` no `server/.env` está correto
- Deve ser `http://localhost:5173` para desenvolvimento local

### 3. Frontend não conecta ao backend
- Verifique se o backend está rodando (`localhost:4000`)
- Confira o arquivo `.env` na raiz: `VITE_API_URL=http://localhost:4000`

### 4. "Table does not exist"
- Execute: `cd server && npm run setup`

## Dicas

1. **Use dois terminais** - um para o frontend e outro para o backend
2. **Não commite o .env** - os arquivos `.env` estão no `.gitignore`
3. **Antes de fazer deploy** - teste tudo localmente primeiro
4. **Alternância local/produção** - só precisa trocar a `VITE_API_URL` no `.env` da raiz

## Próximos Passos

Depois de configurar o ambiente local:
1. Faça suas alterações
2. Teste localmente
3. Siga o guia de deploy quando estiver pronto para atualizar a produção
