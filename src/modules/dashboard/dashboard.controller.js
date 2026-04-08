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

/**
 * Préférences dashboard utilisateur (favoris, annonces lues, dernière partition)
 */
const getDashboardPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('dashboard_preferences')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        // Si la table n'existe pas encore en base, on renvoie une config vide pour ne pas casser le front.
        if (error && error.code === '42P01') {
            return res.status(200).json({
                readAnnouncementIds: [],
                favoriteScoreIds: [],
                lastOpenedScore: null,
            });
        }

        if (error) throw error;

        return res.status(200).json({
            readAnnouncementIds: data?.read_announcement_ids || [],
            favoriteScoreIds: data?.favorite_score_ids || [],
            lastOpenedScore: data?.last_opened_score || null,
        });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors du chargement des préférences dashboard." });
    }
};

const updateDashboardPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            readAnnouncementIds = [],
            favoriteScoreIds = [],
            lastOpenedScore = null,
        } = req.body || {};

        const payload = {
            user_id: userId,
            read_announcement_ids: readAnnouncementIds,
            favorite_score_ids: favoriteScoreIds,
            last_opened_score: lastOpenedScore,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('dashboard_preferences')
            .upsert(payload, { onConflict: 'user_id' })
            .select('*')
            .single();

        if (error && error.code === '42P01') {
            return res.status(200).json({
                warning: 'dashboard_preferences table missing',
                readAnnouncementIds,
                favoriteScoreIds,
                lastOpenedScore,
            });
        }

        if (error) throw error;

        return res.status(200).json({
            readAnnouncementIds: data?.read_announcement_ids || [],
            favoriteScoreIds: data?.favorite_score_ids || [],
            lastOpenedScore: data?.last_opened_score || null,
        });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour des préférences dashboard." });
    }
};

module.exports = {
  getDashboardOverview,
  getPartitions,
  getAnnouncements,
  getEvents,
  getDashboardPreferences,
  updateDashboardPreferences,
};
