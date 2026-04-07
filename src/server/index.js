require('dotenv').config();
const app = require('../app');

const PORT = process.env.PORT || 5000;

const startServer = () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur prêt sur : http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
        console.error('❌ Erreur critique du serveur :', err);
        process.exit(1);
    });

    server.on('close', () => {
        console.log('🏁 Serveur arrêté.');
    });

  } catch (error) {
    console.error(`❌ Erreur au démarrage du serveur : ${error.message}`);
    process.exit(1);
  }
};

startServer();
