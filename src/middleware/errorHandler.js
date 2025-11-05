// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
    // A função de middleware de erro deve sempre aceitar 4 argumentos: (err, req, res, next)

    // Log do erro completo para fins de debug no servidor
    console.error('Erro Capturado Globalmente:', err.message, err.stack);

    // Define o status HTTP. Se o erro tiver um status, usa-o. Caso contrário, usa 500.
    const statusCode = err.status || 500;

    // Envia a resposta de erro
    res.status(statusCode).json({
        ok: false,
        // Em produção, deve-se evitar enviar o 'err.message' completo.
        error: err.message || 'Internal server error',
    });
};