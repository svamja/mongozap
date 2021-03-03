const express = require('express');
const ApiController = require('./ApiController');

const router = express.Router();

// Login
router.post('/login', ApiController.login);
router.post('/add_user', ApiController.add_user);

// Db Operations
router.get('/db/info', ApiController.db_info);
router.get('/collections', ApiController.collections);

// Clear & Drop
router.post('/collection/clear', ApiController.collection_clear);
router.post('/collection/drop', ApiController.collection_drop);

// Manage Schema
router.get('/collection/schema', ApiController.schema_get);

// Bulk Operations (Update, Replace, etc)
router.post('/collection/bulk', ApiController.bulk);

// New Routing Method to Call Functions from Client
router.get('/api/:fn_name', ApiController.api);
router.post('/api/:fn_name', ApiController.api);

// Google Authentication
router.get('/google/auth/:mode', ApiController.google_auth_complete);


module.exports = router;
