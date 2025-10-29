
exports.getHubs = async (req, res) => {
  try {
    const tokenResponse = await fetch(process.env.FORGE_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.FORGE_CLIENT_ID,
        client_secret: process.env.FORGE_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'data:read'
      })
    });

    const { access_token } = await tokenResponse.json();

    const hubsResponse = await fetch('https://developer.api.autodesk.com/project/v1/hubs', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const hubs = await hubsResponse.json();
    res.json(hubs);
  } catch (error) {
    console.error('Erro ao buscar hubs:', error);
    res.status(500).json({ error: 'Erro ao buscar hubs' });
  }
};