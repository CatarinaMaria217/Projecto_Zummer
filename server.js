const express = require('express');
const dotenv = require('dotenv');

dotenv.config(); // Lê as variáveis do .env

const app = express();
const PORT = process.env.PORT || 3000;

const hubs = [
  { id: 'hub1', name: 'Main Hub' },
  { id: 'hub2', name: 'Secondary Hub' }
];

const projects = {
  hub1: [{ id: 'projA', name: 'Projeto A' }, { id: 'projB', name: 'Projeto B' }],
  hub2: [{ id: 'projC', name: 'Projeto C' }]
};

const contents = {
  projA: [{ id: 'item1', name: 'Arquivo.dwg' }, { id: 'item2', name: 'Planta.rvt' }]
};


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


// GET /api/dm/hubs
app.get('/api/dm/hubs', (req, res) => {
  res.json(hubs);
});

// GET /api/dm/hubs/:hub_id/projects
app.get('/api/dm/hubs/:hub_id/projects', (req, res) => {
  const { hub_id } = req.params;
  res.json(projects[hub_id] || []);
});

// GET /api/dm/hubs/:hub_id/projects/:project_id/contents
app.get('/api/dm/hubs/:hub_id/projects/:project_id/contents', (req, res) => {
  const { project_id } = req.params;
  res.json(contents[project_id] || []);
});

// GET /api/dm/hubs/:hub_id/projects/:project_id/folders/:folder_id
app.get('/api/dm/hubs/:hub_id/projects/:project_id/folders/:folder_id', (req, res) => {
  const { folder_id } = req.params;
  res.json({ folder_id, name: `Conteúdo da pasta ${folder_id}` });
});

// GET /api/dm/hubs/:hub_id/projects/:project_id/contents/:item_id/versions
app.get('/api/dm/hubs/:hub_id/projects/:project_id/contents/:item_id/versions', (req, res) => {
  const { item_id } = req.params;
  res.json([
    { version: 1, item: item_id, updatedAt: '2024-01-10' },
    { version: 2, item: item_id, updatedAt: '2024-05-21' }
  ]);
});

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

