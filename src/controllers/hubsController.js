// src/controllers/hubsController.js
// O caminho deve ser ajustado consoante a sua estrutura de pastas (assumindo utils/ está na raiz)
const { getToken } = require('../../utils/oauth');

exports.getHubs = async (req, res, next) => {
  try {
    // 1. Obtém o token 2-Legged para acesso à API
    const tokenData = await getToken('data:read');
    const access_token = tokenData.access_token;

    // 2. Faz o pedido à API APS
    const hubsResponse = await fetch('https://developer.api.autodesk.com/project/v1/hubs', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // 3. Verifica o estado da resposta
    if (!hubsResponse.ok) {
        throw new Error(`Erro da API ao buscar hubs: ${hubsResponse.statusText}`);
    }

    const hubs = await hubsResponse.json();
    res.json(hubs);
  } catch (error) {
    // Envia o erro para o middleware global em app.js
    next(error);
  }
};