require('dotenv').config();
const app = require('../app');

const PORT = process.env.PORT || 5000;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Serveur prêt sur : http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Erreur au démarrage du serveur : ${error.message}`);
    process.exit(1);
  }
};

startServer();
