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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Connexion via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: "Identifiants invalides ou compte non confirmé." });
    }

    const { user, session } = authData;

    // 2. Récupérer les infos du profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(400).json({ error: "Erreur lors de la récupération du profil." });
    }

    return res.status(200).json({
      message: "Connexion réussie.",
      token: session.access_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        voice_type: profile.voice_type,
        role: profile.role,
      }
    });

  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, voice_type, phone } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, voice_type, phone })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: data
    });

  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
};
