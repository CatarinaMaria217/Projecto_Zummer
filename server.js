const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config(); // Lê as variáveis do .env

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Servidor Ativo!');
});

app.get('/auth/token', async (req, res) => {
  try {
    const response = await fetch(process.env.FORGE_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.FORGE_CLIENT_ID,
        client_secret: process.env.FORGE_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'data:read data:write bucket:create bucket:read'
      })
    });

    const data = await response.json();
    res.json(data); // Retorna o token
  } catch (error) {
    console.error('Erro ao obter token:', error);
    res.status(500).json({ error: 'Erro ao obter token' });
  }
});

const { getHubs } = require('./controllers/hubsController');
const { getProjects } = require('./controllers/projectsController');
const { getProjectContents } = require('./controllers/contentsController');

app.get('/api/dm/hubs', getHubs);
app.get('/api/dm/hubs/:hub_id/projects', getProjects);
app.get('/api/dm/hubs/:hub_id/projects/:project_id/contents', getProjectContents);

// Global Error Middleware
app.use((err, req, res, next) => {
    res.status(500).json({
        ok: false,
        error: err.message || 'Internal server error',
    });
});

app.get('/hubs', (req, res) => {
  res.status(200).send(); // resposta vazia, só pra rota existir
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

