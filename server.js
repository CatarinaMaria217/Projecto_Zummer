const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
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

app.get('/hubs', (req, res) => {
  res.status(200).send(); // resposta vazia, só pra rota existir
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

