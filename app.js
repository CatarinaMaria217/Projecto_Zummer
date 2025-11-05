const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session'); // NOVO: Módulo para gerir sessões

// --- Importar Módulos ---
const forgeRoutes = require('./src/routes/forgeRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');


// --- Middlewares Gerais ---

// Middleware para processar payloads JSON
app.use(express.json());

// NOVO MIDDLEWARE: Configuração de Sessão (Obrigatório para 3-Legged OAuth)
app.use(session({
    secret: 'UMA_CHAVE_SECRETA_FORTE_AQUI', // Troque por uma string segura e única
    resave: false,
    saveUninitialized: false,
    // Em produção, use secure: true se estiver em HTTPS
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000 // 1 hora de vida útil da sessão
    }
}));


// Serve ficheiros estáticos da pasta 'public' na raiz
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de Log/Tempo de Resposta
app.use(logger);


// --- Definição de Rotas Gerais ---

app.get('/', (req, res) => {
    res.send('API Server Ativo. Aceda a /viewer para o frontend.');
});

// Rota para servir a página do Viewer
app.get('/viewer', (req, res) => {
    // Aponta para o index.html que está em ./public/html/index.html
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// ... (Outras rotas de teste) ...
app.get('/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date().toISOString() });
});

app.get('/time', (req, res) => {
    res.send(new Date().toISOString());
});

app.get('/echo', (req, res) => {
    const { category, color } = req.query;
    if (!category && !color) {
        throw new Error('category or color are required');
    } else {
        res.json({ ok: true, category: category, color: color });
    }
});

app.get('/error-route', (req, res) => {
    throw new Error('Something went wrong!');
});

// --- Montagem das Rotas Específicas ---

// Monta as rotas da API Forge/Autodesk (inclui auth/profile, login, logout)
app.use(forgeRoutes);


// --- Global Error Middleware ---

// Este deve ser o ÚLTIMO app.use() montado
app.use(errorHandler);


module.exports = app;