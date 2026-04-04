const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authGuard, roleGuard } = require('../../core/middlewares/auth.middleware');

// Protection globale de toutes les routes admin
// Seuls les Admins et Choir_Master peuvent accéder
router.use(authGuard);
router.use(roleGuard(['Admin', 'Choir_Master']));

/**
 * ROUTES PARTITIONS
 */
router.post('/partitions', adminController.addPartition);
router.delete('/partitions/:id', adminController.deletePartition);

/**
 * ROUTES ÉVÉNEMENTS (AGENDA)
 */
router.post('/events', adminController.addEvent);
router.delete('/events/:id', adminController.deleteEvent);

/**
 * ROUTES ANNONCES
 */
router.post('/announcements', adminController.addAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

/**
 * ROUTES MEMBRES
 */
router.get('/members', adminController.getAllMembers);
router.put('/members/:id/role', adminController.updateMemberRole);

module.exports = router;
