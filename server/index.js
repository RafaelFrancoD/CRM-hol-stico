require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy (necessário para Render, Heroku, etc)
app.set('trust proxy', 1);

// --- File Upload Configuration ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Allow only safe file types
    const allowedTypes = /jpeg|jpg|png|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Apenas arquivos de imagem (jpg, png), PDF e documentos (doc, docx) são permitidos.'));
  }
});

// --- PostgreSQL Connection ---
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureSchema() {
  const initSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;
  await pool.query(initSql);
}

// --- Middlewares ---
// Configuração avançada de segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Limitar tamanho do body para prevenir ataques de DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// CORS: configuração segura com whitelist
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (proteção contra brute force e DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 200, // mais restritivo em produção
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit excedido: ${req.ip} - ${req.path}`);
    res.status(429).json({
      error: 'Muitas requisições. Tente novamente em alguns minutos.',
      retryAfter: 15
    });
  }
});

// Rate limiting MUITO restritivo para autenticação (previne brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login
  message: 'Muitas tentativas de login. Aguarde 15 minutos.',
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const email = req.body?.email || 'unknown';
    console.warn(`🚨 ALERTA: Possível ataque brute force - IP: ${req.ip} - Email: ${email}`);
    res.status(429).json({
      error: 'Muitas tentativas de login. Sua conta foi temporariamente bloqueada por 15 minutos.',
      retryAfter: 15
    });
  }
});

// Rate limiting para cadastro (previne spam de contas)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 cadastros por hora por IP
  message: 'Muitos cadastros. Tente novamente mais tarde.',
  handler: (req, res) => {
    console.warn(`🚨 ALERTA: Múltiplas tentativas de cadastro - IP: ${req.ip}`);
    res.status(429).json({
      error: 'Limite de cadastros atingido. Tente novamente em 1 hora.',
      retryAfter: 60
    });
  }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);

// Middleware de logging de segurança
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  // Log de requisições suspeitas
  if (req.url.includes('..') || req.url.includes('<script>') || req.url.includes('SELECT')) {
    console.warn(`⚠️  [SECURITY] Suspicious request detected: ${method} ${url} from ${ip} at ${timestamp}`);
  }

  next();
});

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is healthy' });
});

function authMiddleware(req, res, next) {
  // Aceita token de cookies OU do header Authorization (para funcionar cross-domain)
  let token = req.cookies && req.cookies.token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Validação de senha forte
function isStrongPassword(password) {
  // Mínimo 8 caracteres, pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return strongRegex.test(password);
}

// --- Auth Routes ---
app.post('/api/auth/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;

    // Validação de senha forte
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Senha fraca. Use pelo menos 8 caracteres incluindo maiúsculas, minúsculas, números e caracteres especiais (@$!%*?&#)'
      });
    }

    try {
      const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (rows.length) return res.status(409).json({ error: 'Usuário já existe' });

      // Bcrypt com 12 rounds (mais seguro para produção)
      const hash = await bcrypt.hash(password, 12);
      await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, hash]);

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Novo usuário registrado:', email);
      }

      return res.status(201).json({ ok: true, message: 'Usuário registrado com sucesso' });
    } catch (err) {
      console.error('Register error', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

app.post('/api/auth/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;

    try {
      // Log apenas em desenvolvimento (não em produção por segurança)
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Tentativa de login para:', email);
      }

      const { rows } = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);

      // Timing attack protection: sempre processa hash mesmo se usuário não existir
      if (!rows.length) {
        // Simula processamento para evitar timing attack
        await bcrypt.compare(password, '$2a$12$dummyhashtopreventtimingattack1234567890');
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);

      if (!ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('❌ Senha incorreta para:', email);
        }
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // JWT com secret forte (nunca use dev_secret em produção)
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret') {
        console.error('⚠️  PERIGO: JWT_SECRET não configurado ou usando valor padrão!');
      }

      const token = jwt.sign(
        { email, userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '8h', issuer: 'mirelli-crm' }
      );

      // Envia cookie (funciona em localhost)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 8 * 60 * 60 * 1000,
        domain: process.env.COOKIE_DOMAIN || undefined
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Login bem-sucedido para:', email);
      }

      // IMPORTANTE: Envia token no body também (funciona cross-domain)
      return res.json({ ok: true, message: 'Login realizado com sucesso', token });
    } catch (err) {
      console.error('❌ Erro no login:', err.message);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ ok: true });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT email, created_at FROM users WHERE email = $1', [req.user.email]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Me error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// --- File Upload Route ---
app.post('/api/files/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  // Return the path to the file, which can be used to access it via the static route
  res.status(201).json({ filePath: `/uploads/${req.file.filename}` });
});


// --- Gemini Proxy Routes ---
app.post('/api/gemini/generate',
  body('messageType').isString().optional(),
  body('context').isString().optional(),
  body('patientName').isString().optional(),
  authMiddleware,
  async (req, res) => {
    const { messageType = 'general', context = '', patientName = 'Paciente', tone = 'empático' } = req.body;
    const template = `Olá ${patientName}, tudo bem? ${context} — Com carinho, Dra. Mirelli.`;
    return res.json({ text: template });
  }
);

app.post('/api/gemini/strategy', body('niche').isString().optional(), authMiddleware, async (req, res) => {
  const { niche = 'geral' } = req.body;
  return res.json({ persona: `Paciente ${niche}`, pains: ['falta de tempo', 'ansiedade'], contentIdeas: ['posts', 'stories'], outreachMessage: `Olá! Tenho vagas para ${niche}.` });
});

// --- Generic CRUD Routes ---
const ALLOWED_STORES = new Set(['patients', 'finance', 'appointments', 'documents', 'message_templates']);

function validateStoreParam(req, res, next) {
  const store = req.params.store;
  if (!ALLOWED_STORES.has(store)) return res.status(404).json({ error: 'Store not found' });
  next();
}

app.get('/api/data/:store', authMiddleware, validateStoreParam, async (req, res) => {
  const store = req.params.store;
  try {
    const { rows } = await pool.query(`SELECT id, data, owner_email, created_at, updated_at FROM ${store} WHERE owner_email = $1 ORDER BY created_at DESC`, [req.user.email]);
    return res.json(rows.map(r => ({ id: r.id, ...r.data })));
  } catch (err) {
    console.error('List error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/data/:store/:id', authMiddleware, validateStoreParam, async (req, res) => {
  const { store, id } = req.params;
  try {
    const { rows } = await pool.query(`SELECT id, data, owner_email FROM ${store} WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const row = rows[0];
    if (row.owner_email !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    return res.json({ id: row.id, ...row.data });
  } catch (err) {
    console.error('Get error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/data/:store', authMiddleware, validateStoreParam, async (req, res) => {
  const { store } = req.params;
  const data = req.body;
  try {
    const id = data.id || (require('crypto').randomUUID ? require('crypto').randomUUID() : require('crypto').randomBytes(16).toString('hex'));
    const now = new Date();
    // Remove id from data if it exists to avoid storing it in the JSON blob
    const { id: dataId, ...restOfData } = data;
    await pool.query(`INSERT INTO ${store} (id, data, owner_email, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`, [id, restOfData, req.user.email, now, now]);
    return res.status(201).json({ id, ...restOfData });
  } catch (err) {
    console.error('Create error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.put('/api/data/:store/:id', authMiddleware, validateStoreParam, async (req, res) => {
  const { store, id } = req.params;
  const data = req.body;
  try {
    const now = new Date();
    const { rows: existing } = await pool.query(`SELECT owner_email FROM ${store} WHERE id = $1`, [id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    if (existing[0].owner_email !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    const { id: dataId, ...restOfData } = data;
    const result = await pool.query(`UPDATE ${store} SET data = $1, updated_at = $2 WHERE id = $3 RETURNING id, data`, [restOfData, now, id]);
    return res.json({ id: result.rows[0].id, ...result.rows[0].data });
  } catch (err) {
    console.error('Update error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.delete('/api/data/:store/:id', authMiddleware, validateStoreParam, async (req, res) => {
  const { store, id } = req.params;
  try {
    const { rows: existing } = await pool.query(`SELECT data, owner_email FROM ${store} WHERE id = $1`, [id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    if (existing[0].owner_email !== req.user.email) return res.status(403).json({ error: 'Forbidden' });

    // If deleting a document, also delete the associated file from disk
    if (store === 'documents' && existing[0].data && existing[0].data.filePath) {
      const filePath = path.join(__dirname, existing[0].data.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Erro ao deletar arquivo físico:", err);
        });
      }
    }

    const result = await pool.query(`DELETE FROM ${store} WHERE id = $1 RETURNING id`, [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// --- Server Initialization ---
ensureSchema().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to initialize DB schema', err);
  process.exit(1);
});