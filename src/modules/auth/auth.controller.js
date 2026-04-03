const supabase = require('../../config/supabase');

const register = async (req, res) => {
  try {
    const { email, password, full_name, voice_type, phone } = req.body;

    // 1. Inscription dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const user = authData.user;

    if (user) {
      // 2. Création du profil complémentaire dans la table 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            full_name,
            voice_type,
            phone,
            role: 'Member', // Rôle par défaut
          },
        ]);

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }
    }

    return res.status(201).json({
      message: "Utilisateur créé avec succès. Veuillez vérifier vos emails pour confirmer l'inscription.",
      user: {
        id: user.id,
        email: user.email,
        full_name,
      }
    });

  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
};

module.exports = {
  register,
};
