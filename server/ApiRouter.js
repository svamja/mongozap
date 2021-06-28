const express = require('express');
const ApiController = require('./ApiController');

const router = express.Router();

// Login
router.post('/login', ApiController.login);

// New Routing Method to Call Functions from Client
router.get('/api/:fn_name', ApiController.api);
router.post('/api/:fn_name', ApiController.api);

// Google Authentication
router.get('/google/auth/:mode', ApiController.google_auth_complete);


module.exports = router;
