// utils/oauth.js

const {
    FORGE_CLIENT_ID,
    FORGE_CLIENT_SECRET,
    FORGE_AUTH_URL,
    FORGE_CALLBACK_URL
} = process.env;

// ----------------------------------------------------
// 1. 2-Legged Flow (Server-to-Server)
// ----------------------------------------------------

/**
 * Obtém um Access Token 2-Legged para a aplicação (server-to-server).
 */
exports.getToken = async (scope) => {
    try {
        const response = await fetch(FORGE_AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: FORGE_CLIENT_ID,
                client_secret: FORGE_CLIENT_SECRET,
                grant_type: 'client_credentials',
                scope: scope
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erro APS 2-Legged: ${errorData.error_description || response.statusText}`);
        }

        return response.json();

    } catch (error) {
        console.error('Erro de autenticação em utils/oauth (2-Legged):', error.message);
        const authError = new Error('Falha ao obter o Access Token (2-Legged).');
        authError.status = 500;
        throw authError;
    }
};


// ----------------------------------------------------
// 2. 3-Legged Flow (User Login/Profile)
// ----------------------------------------------------

/**
 * Gera o URL de autorização da Autodesk para o login do utilizador.
 */
exports.getAuthorizeUrl = (scope) => {
    const url = new URL('https://developer.api.autodesk.com/authentication/v1/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', FORGE_CLIENT_ID);
    url.searchParams.set('redirect_uri', FORGE_CALLBACK_URL);
    url.searchParams.set('scope', scope);

    return url.toString();
};

/**
 * Troca o código de autorização (obtido no callback) por um Access Token 3-Legged.
 */
exports.get3LeggedToken = async (code) => {
    try {
        const response = await fetch(FORGE_AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: FORGE_CLIENT_ID,
                client_secret: FORGE_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: FORGE_CALLBACK_URL,
                // Os escopos do 3-Legged devem ser os mesmos do authorize, mais o 'profile'
                scope: 'data:read viewables:read profile'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erro APS 3-Legged: ${errorData.error_description || response.statusText}`);
        }

        return response.json();

    } catch (error) {
        console.error('Erro de autenticação em utils/oauth (3-Legged):', error.message);
        const authError = new Error('Falha na troca do código por Access Token (3-Legged).');
        authError.status = 500;
        throw authError;
    }
};

/**
 * Obtém o perfil (nome, email) do utilizador.
 */
exports.getUserProfile = async (accessToken) => {
    try {
        const response = await fetch('https://developer.api.autodesk.com/userprofile/v1/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erro APS ao obter perfil: ${errorData.title || response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Erro ao obter perfil do utilizador:', error.message);
        const profileError = new Error('Falha ao obter o perfil do utilizador.');
        profileError.status = 500;
        throw profileError;
    }
};