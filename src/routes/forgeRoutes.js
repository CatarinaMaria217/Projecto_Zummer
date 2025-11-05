const express = require('express');
const router = express.Router();

// O utils está na raiz (../../utils/oauth)
const {
    getToken,
    getAuthorizeUrl,
    get3LeggedToken,
    getUserProfile
} = require('../../utils/oauth');

// Importa os controllers
const { getHubs } = require('../controllers/hubsController');
const { getProjects } = require('../controllers/projectsController');
const { getProjectContents } = require('../controllers/contentsController');

// --- Rotas de Autenticação 3-Legged (LOGIN/LOGOUT) ---

// 1. Inicia o processo de login: Redireciona para a Autodesk
router.get('/api/oauth/login', (req, res) => {
    // Escopos: 'data:read' (para DM), 'viewables:read' (para o Viewer) e 'profile' (para o user)
    const scope = 'data:read viewables:read profile';
    const authUrl = getAuthorizeUrl(scope);
    res.redirect(authUrl);
});

// 2. Recebe o código da Autodesk e troca-o pelo Token
router.get('/api/oauth/callback', async (req, res, next) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/viewer?error=auth_cancelled');
    }

    try {
        const tokenData = await get3LeggedToken(code);

        // Armazenar o token e o tempo de expiração na sessão do utilizador
        req.session.accessToken = tokenData.access_token;
        req.session.expiresAt = Date.now() + (tokenData.expires_in * 1000);

        res.redirect('/viewer');
    } catch (error) {
        next(error);
    }
});

// 3. Logout: Destrói a sessão e desloga o utilizador
router.get('/api/oauth/logout', (req, res) => {
    // Apenas destrói o token guardado na sessão
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao terminar sessão:', err);
            return res.status(500).json({ error: 'Erro ao terminar sessão.' });
        }
        res.redirect('/viewer');
    });
});


// 4. Rota para obter o status de autenticação (Refatorada)
router.get('/api/oauth/profile', async (req, res, next) => {

    // A. Tenta verificar o Login 3-Legged (Prioridade)
    if (req.session.accessToken && req.session.expiresAt > Date.now()) {
        try {
            // Se a sessão estiver ativa, obtém o perfil para o frontend
            const userProfile = await getUserProfile(req.session.accessToken);

            return res.json({
                isLoggedIn: true,
                user: {
                    name: userProfile.firstName + ' ' + userProfile.lastName,
                    email: userProfile.emailId
                },
                accessToken: req.session.accessToken,
                // Calcula o tempo restante para expirar
                expires_in: Math.floor((req.session.expiresAt - Date.now()) / 1000)
            });
        } catch (error) {
            // Se o token na sessão for inválido (expirou/revogado), limpamos a sessão e tentamos o 2-Legged
            req.session.destroy(() => {});
        }
    }

    // B. Lógica de fallback 2-Legged (para o Viewer carregar modelos da aplicação)
    try {
        const data = await getToken('data:read viewables:read');
        res.json({
            isLoggedIn: false, // Indica que não é um utilizador logado
            user: null,
            accessToken: data.access_token,
            expires_in: data.expires_in
        });
    } catch (error) {
        // Se ambos falharem, o errorHandler global trata disto
        next(error);
    }
});


// --- Rotas de Data Management (DM) ---
router.get('/api/dm/hubs', getHubs);
router.get('/api/dm/hubs/:hub_id/projects', getProjects);
router.get('/api/dm/hubs/:hub_id/projects/:project_id/contents', getProjectContents);

module.exports = router;