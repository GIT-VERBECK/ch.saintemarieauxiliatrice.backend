const supabase = require('../../config/supabase');

/**
 * Récupère les statistiques et les données globales pour le tableau de bord
 */
const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
        return res.status(404).json({ error: "Profil non trouvé." });
    }

    // 2. Compter le nombre total de membres (Choristes)
    const { count: membersCount, error: membersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 3. Récupérer les dernières partitions (ex: 5 dernières)
    const { data: recentPartitions, error: partitionsError } = await supabase
      .from('partitions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // 4. Récupérer la prochaine répétition / prochain événement
    const { data: nextEvent, error: eventError } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(1)
      .single();

    // 5. Récupérer les dernières annonces
    const { data: lastAnnouncements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    return res.status(200).json({
      profile,
      stats: {
        totalMembers: membersCount || 0,
        totalPartitions: 0, // Sera remplacé quand on aura la table
      },
      nextEvent: nextEvent || null,
      recentPartitions: recentPartitions || [],
      announcements: lastAnnouncements || [],
    });

  } catch (error) {
    return res.status(500).json({ error: "Erreur lors du chargement des données du dashboard." });
  }
};

/**
 * Récupère toutes les partitions disponibles pour l'utilisateur
 */
const getPartitions = async (req, res) => {
    try {
        const { data: partitions, error } = await supabase
            .from('partitions')
            .select('*')
            .order('title', { ascending: true });

        if (error) throw error;
        
        return res.status(200).json(partitions || []);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors du chargement des partitions." });
    }
};

/**
 * Récupère toutes les annonces
 */
const getAnnouncements = async (req, res) => {
    try {
        const { data: announcements, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return res.status(200).json(announcements || []);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors du chargement des annonces." });
    }
};

/**
 * Récupère tous les événements futurs (Agenda)
 */
const getEvents = async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .gte('event_date', new Date().toISOString())
            .order('event_date', { ascending: true });

        if (error) throw error;
        
        return res.status(200).json(events || []);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors du chargement de l'agenda." });
    }
};

module.exports = {
  getDashboardOverview,
  getPartitions,
  getAnnouncements,
  getEvents,
};
