// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// Handles server startup and port binding
const app = require('./app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

router.get('/hubs', (req, res) => {
  res.status(200).send(); // resposta vazia, só pra rota existir
});

