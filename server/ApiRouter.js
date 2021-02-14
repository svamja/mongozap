const express = require('express');
const ApiController = require('./ApiController');

const router = express.Router();

// Login
router.post('/login', ApiController.login);
router.post('/add_user', ApiController.add_user);

// Db Operations
router.get('/databases', ApiController.databases);
router.get('/db/info', ApiController.db_info);
router.get('/collections', ApiController.collections);

// Browse / Listing
router.get('/collection/index', ApiController.collection_index);
router.post('/collection/index', ApiController.collection_index);

// Clear & Drop
router.post('/collection/clear', ApiController.collection_clear);
router.post('/collection/drop', ApiController.collection_drop);

// Manage Indexes
router.get('/collection/indexes', ApiController.indexes_get);
// router.post('/collection/indexes', ApiController.indexes_post);
router.delete('/collection/indexes', ApiController.indexes_delete);

// Manage Schema
router.get('/collection/schema', ApiController.schema_get);

// Bulk Operations (Update, Replace, etc)
router.post('/collection/bulk', ApiController.bulk);

// New Routing Method to Call Functions from Client
router.get('/api/:fn_name', ApiController.api);
router.post('/api/:fn_name', ApiController.api);

// Google Authentication
router.get('/google/auth/complete', ApiController.google_auth_complete);

module.exports = router;
