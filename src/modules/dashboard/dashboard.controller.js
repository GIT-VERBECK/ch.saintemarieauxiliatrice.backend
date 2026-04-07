const supabase = require('../../config/supabase');

/**
 * Récupère les statistiques et les données globales pour le tableau de bord
 */
const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lancement de toutes les requêtes en parallèle pour éviter le "Waterfall"
    const [
      { data: profile, error: profileError },
      { count: membersCount, error: membersError },
      { count: partitionsCount, error: partitionsCountError },
      { data: recentPartitions, error: partitionsError },
      { data: nextEvent, error: eventError },
      { data: lastAnnouncements, error: announcementsError }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('partitions').select('id', { count: 'exact', head: true }),
      supabase.from('partitions').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date', { ascending: true }).limit(1).maybeSingle(),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3)
    ]);

    if (profileError) {
        return res.status(404).json({ error: "Profil utilisateur non trouvé." });
    }

    // On log les erreurs non bloquantes si nécessaire
    if (membersError) console.error("Error fetching members count:", membersError);
    if (partitionsCountError) console.error("Error fetching partitions count:", partitionsCountError);
    if (partitionsError) console.error("Error fetching recent partitions:", partitionsError);
    if (eventError) console.error("Error fetching next event:", eventError);
    if (announcementsError) console.error("Error fetching announcements:", announcementsError);

    return res.status(200).json({
      profile,
      stats: {
        totalMembers: membersCount || 0,
        totalPartitions: partitionsCount || 0,
      },
      nextEvent: nextEvent || null,
      recentPartitions: recentPartitions || [],
      announcements: lastAnnouncements || [],
    });

  } catch (error) {
    console.error("Dashboard Overview Error:", error);
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
