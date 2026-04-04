const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authGuard } = require('../../core/middlewares/auth.middleware');

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);

// Route de mise à jour du profil
router.put('/profile', authGuard, authController.updateProfile);

module.exports = router;
