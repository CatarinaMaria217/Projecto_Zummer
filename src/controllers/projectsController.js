// src/controllers/projectsController.js
const { getToken } = require('../../utils/oauth');

exports.getProjects = async (req, res, next) => {
  const { hub_id } = req.params;

  try {
    // 1. Obtém o token 2-Legged
    const tokenData = await getToken('data:read');
    const access_token = tokenData.access_token;

    // 2. Faz o pedido à API APS
    const projectsResponse = await fetch(
      `https://developer.api.autodesk.com/project/v1/hubs/${hub_id}/projects`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // 3. Verifica o estado da resposta
    if (!projectsResponse.ok) {
        throw new Error(`Erro da API ao buscar projetos: ${projectsResponse.statusText}`);
    }

    const projects = await projectsResponse.json();
    res.json(projects);
  } catch (error) {
    next(error);
  }
};