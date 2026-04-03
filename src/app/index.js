const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(helmet()); // Sécurité HTTP
app.use(cors()); // Activation du CORS
app.use(morgan('dev')); // Logging des requêtes
app.use(express.json()); // Parsing JSON

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: "Bienvenue sur l'API de la Chorale Sainte Marie Auxiliatrice" });
});

// Gestion des erreurs globale (à affiner plus tard)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur interne est survenue" });
});

module.exports = app;
