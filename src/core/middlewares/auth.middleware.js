const supabase = require('../../config/supabase');

/**
 * Middleware pour protéger les routes et vérifier l'authentification
 */
const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Accès non autorisé. Token manquant." });
    }

    const token = authHeader.split(' ')[1];

    // Utilisation de Supabase pour vérifier le token et récupérer l'utilisateur
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Session invalide ou expirée." });
    }

    // On injecte l'utilisateur dans la requête pour les middlewares suivants
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(500).json({ error: "Erreur interne lors de l'authentification." });
  }
};

/**
 * Middleware pour vérifier les rôles (ex: Admin, Choir_Master)
 * @param {Array} roles - Liste des rôles autorisés
 */
const roleGuard = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié." });
      }

      // On récupère le rôle du profil dans la base de données
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({ error: "Impossible de vérifier le profil utilisateur." });
      }

      if (!roles.includes(profile.role)) {
        return res.status(403).json({ error: "Permission refusée. Niveau de privilèges insuffisant." });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: "Erreur interne lors de la vérification des permissions." });
    }
  };
};

module.exports = {
  authGuard,
  roleGuard,
};
