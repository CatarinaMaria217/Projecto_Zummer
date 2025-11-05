const dotenv = require('dotenv');
// O 'app.js' que importa o 'express' e configura tudo
const app = require('./app');

// Lê as variáveis do .env
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend Viewer disponível em: http://localhost:${PORT}/viewer`);
});