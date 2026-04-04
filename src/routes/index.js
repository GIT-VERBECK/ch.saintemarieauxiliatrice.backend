const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const adminRoutes = require('../modules/admin/admin.routes');

// Module Authentification
router.use('/auth', authRoutes);

// Module Dashboard (protégé)
router.use('/dashboard', dashboardRoutes);

// Module Admin (protégé par rôle)
router.use('/admin', adminRoutes);

module.exports = router;
