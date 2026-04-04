const supabase = require('../../config/supabase');

/**
 * ------------------------------------------------------------
 * GESTION DES PARTITIONS (SCORES)
 * ------------------------------------------------------------
 */
const addPartition = async (req, res) => {
    try {
        const { title, composer, category, voice_type, attachment_url } = req.body;
        
        const { data, error } = await supabase
            .from('partitions')
            .insert([{ title, composer, category, voice_type, attachment_url }])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json({ message: "Partition ajoutée !", data });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de l'ajout de la partition." });
    }
};

const deletePartition = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('partitions').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: "Partition supprimée." });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la suppression." });
    }
};

/**
 * ------------------------------------------------------------
 * GESTION DES ÉVÉNEMENTS (AGENDA)
 * ------------------------------------------------------------
 */
const addEvent = async (req, res) => {
    try {
        const { title, event_date, location, time, description } = req.body;
        
        const { data, error } = await supabase
            .from('events')
            .insert([{ title, event_date, location, time, description }])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json({ message: "Événement programmé !", data });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la programmation." });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: "Événement annulé." });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de l'annulation." });
    }
};

/**
 * ------------------------------------------------------------
 * GESTION DES ANNONCES
 * ------------------------------------------------------------
 */
const addAnnouncement = async (req, res) => {
    try {
        const { title, content, type } = req.body;
        
        const { data, error } = await supabase
            .from('announcements')
            .insert([{ title, content, type }])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json({ message: "Annonce publiée !", data });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la publication." });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ message: "Annonce supprimée." });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la suppression." });
    }
};

/**
 * ------------------------------------------------------------
 * GESTION DES MEMBRES
 * ------------------------------------------------------------
 */
const getAllMembers = async (req, res) => {
    try {
        const { data: members, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return res.status(200).json(members);
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors du chargement des membres." });
    }
};

const updateMemberRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // 'Admin', 'Choir_Master', 'Member'
        
        const { data, error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return res.status(200).json({ message: "Rôle mis à jour !", data });
    } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
};

module.exports = {
    addPartition,
    deletePartition,
    addEvent,
    deleteEvent,
    addAnnouncement,
    deleteAnnouncement,
    getAllMembers,
    updateMemberRole,
};
