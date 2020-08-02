const express = require('express');
const ApiController = require('./ApiController');

const router = express.Router();

router.get('/databases', ApiController.databases);
router.get('/db/info', ApiController.db_info);
router.get('/collections', ApiController.collections);

// Browse / Listing
router.get('/collection/index', ApiController.collection_index);
router.post('/collection/index', ApiController.collection_index);

// Insert
router.post('/collection/insert', ApiController.collection_insert);

// Clear & Drop
router.post('/collection/clear', ApiController.collection_clear);
router.post('/collection/drop', ApiController.collection_drop);
router.post('/collection/delete', ApiController.collection_delete);

// Manage Indexes
router.get('/collection/indexes', ApiController.indexes_get);
// router.post('/collection/indexes', ApiController.indexes_post);
router.delete('/collection/indexes', ApiController.indexes_delete);

// Manage Schema
router.get('/collection/schema', ApiController.schema_get);
router.post('/collection/schema', ApiController.schema_post);

// Bulk Operations (Update, Replace, etc)
router.post('/collection/bulk', ApiController.bulk);

// Manage Config
router.get('/settings/get', ApiController.settings_get);
router.post('/settings/set', ApiController.settings_set);

module.exports = router;
