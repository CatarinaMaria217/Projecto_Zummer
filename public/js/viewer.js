// public/js/viewer.js

let viewer;
let accessToken;

document.addEventListener('DOMContentLoaded', function() {
    // Hook the "Load Model" button to the loadModel function
    document.getElementById('loadModelButton').addEventListener('click', loadModel);

    // Check Authentication Status on load
    checkAuthStatus();
});

/**
 * Verifica o status de autenticação (3-Legged para User ou 2-Legged para App).
 */
async function checkAuthStatus() {
    const statusElement = document.getElementById('statusMessage');
    const loadButton = document.getElementById('loadModelButton');
    const userElement = document.getElementById('userStatus');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');

    // Mostra estado de carregamento inicial
    userElement.textContent = 'User: A Carregar...';
    statusElement.textContent = 'A verificar autenticação...';

    try {
        const response = await fetch('/api/oauth/profile');
        const data = await response.json();

        if (!response.ok) {
             throw new Error(data.error || 'Falha ao obter o perfil/token.');
        }

        // 1. Lógica do 3-Legged (Utilizador Logado)
        if (data.isLoggedIn) {
            accessToken = data.accessToken;
            statusElement.textContent = `Token do Utilizador ativo.`;
            statusElement.style.color = 'blue';
            userElement.textContent = `User: ${data.user.name} (${data.user.email})`;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            loadButton.disabled = false;
        } else {
            // 2. Lógica do 2-Legged (App Token)
            accessToken = data.accessToken;
            statusElement.textContent = 'Token da Aplicação ativo. Modelos públicos disponíveis.';
            statusElement.style.color = 'green';
            userElement.textContent = 'User: Não Logado (apenas App Token)';
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            loadButton.disabled = false;
        }

        // Inicializa o Viewer (mesmo que seja com 2-Legged)
        initializeViewer(data.expires_in);

    } catch (error) {
        console.error('Erro ao verificar Auth Status:', error);
        statusElement.textContent = `Erro: ${error.message}`;
        statusElement.style.color = 'red';
        userElement.textContent = 'User: Não Autenticado';
        loadButton.disabled = true;
        loginButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }
}

/**
 * Cria e inicializa o Autodesk Viewer environment.
 * @param {number} expiresIn - Token expiry time in seconds.
 */
function initializeViewer(expiresIn) {
    if (viewer) return; // Se já estiver inicializado, não faz nada

    const options = {
        env: 'AutodeskProduction2',
        api: 'streamingV2',
        getAccessToken: function(onTokenReady) {
            // Callback para fornecer token ao Viewer
            onTokenReady(accessToken, expiresIn);
        }
    };

    const viewerContainer = document.getElementById('viewerContainer');

    // Inicializa o Viewer
    Autodesk.Viewing.Initializer(options, function() {
        viewer = new Autodesk.Viewing.GuiViewer3D(viewerContainer);
        viewer.start();
        console.log('Viewer inicializado com sucesso.');
    });
}

/**
 * Carrega um modelo no viewer com base no campo URN.
 */
function loadModel() {
    if (!viewer) {
        alert('O Viewer não está inicializado. Verifique a autenticação.');
        return;
    }

    const urna = document.getElementById('urnInput').value.trim();

    if (!urna) {
        alert('Por favor, insira o URN da versão do Item.');
        return;
    }

    const documentId = urna;

    document.getElementById('statusMessage').textContent = 'A carregar modelo...';

    // Carrega o documento e o modelo padrão
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
}

/**
 * Callback de sucesso no carregamento do documento.
 */
function onDocumentLoadSuccess(doc) {
    const modelNode = doc.getRoot().getDefaultGeometry();

    viewer.loadDocumentNode(doc, modelNode, { preserveView: false });

    document.getElementById('statusMessage').textContent = 'Modelo carregado com sucesso.';
    document.getElementById('statusMessage').style.color = 'black';
}

/**
 * Callback de falha no carregamento do documento.
 */
function onDocumentLoadFailure(errCode) {
    console.error('Error loading document:', errCode);
    document.getElementById('statusMessage').textContent = `Falha ao carregar o modelo. Código: ${errCode}`;
    document.getElementById('statusMessage').style.color = 'red';
}