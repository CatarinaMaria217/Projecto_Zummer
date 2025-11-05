// src/controllers/contentsController.js
const { getToken } = require('../../utils/oauth');

exports.getProjectContents = async (req, res, next) => {
  const { project_id } = req.params;

  try {
    // 1. Obtém o token 2-Legged
    const tokenData = await getToken('data:read');
    const access_token = tokenData.access_token;

    // 2. Faz o pedido à API APS
    const contentsResponse = await fetch(
      `https://developer.api.autodesk.com/data/v1/projects/${project_id}/folders/root`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // 3. Verifica o estado da resposta
    if (!contentsResponse.ok) {
        throw new Error(`Erro da API ao buscar conteúdos: ${contentsResponse.statusText}`);
    }

    const contents = await contentsResponse.json();
    res.json(contents);
  } catch (error) {
    next(error);
  }
};