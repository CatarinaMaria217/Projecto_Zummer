const express = require('express');
const router = express.Router();

// Importa os controllers da pasta src/controllers/
const { getHubs } = require('../controllers/hubsController');
const { getProjects } = require('../controllers/projectsController');
const { getProjectContents } = require('../controllers/contentsController');

// Rotas da API Forge/Autodesk (Definições de rota que mapeiam para funções do controller)
router.get('/api/dm/hubs', getHubs);
router.get('/api/dm/hubs/:hub_id/projects', getProjects);
router.get('/api/dm/hubs/:hub_id/projects/:project_id/contents', getProjectContents);

module.exports = router;