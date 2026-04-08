const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authGuard } = require('../../core/middlewares/auth.middleware');

/**
 * Route vers le dashboard protégée par l'authentification
 */
router.get('/overview', authGuard, dashboardController.getDashboardOverview);

/**
 * Route pour récupérer toutes les partitions (bibliothèque)
 */
router.get('/partitions', authGuard, dashboardController.getPartitions);

/**
 * Route pour récupérer toutes les annonces
 */
router.get('/announcements', authGuard, dashboardController.getAnnouncements);

/**
 * Route pour récupérer tous les événements (agenda)
 */
router.get('/events', authGuard, dashboardController.getEvents);

/**
 * Préférences personnelles du dashboard
 */
router.get('/preferences', authGuard, dashboardController.getDashboardPreferences);
router.put('/preferences', authGuard, dashboardController.updateDashboardPreferences);

module.exports = router;
