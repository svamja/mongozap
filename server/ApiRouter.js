const express = require('express');
const MainController = require('./ApiController');

const router = express.Router();

router.get('/databases', MainController.databases);
router.get('/collections', MainController.collections);

// Browse / Listing
router.get('/collection/index', MainController.collection_index);
router.post('/collection/index', MainController.collection_index);

// Clear & Drop
router.post('/collection/clear', MainController.collection_clear);
router.post('/collection/drop', MainController.collection_drop);

// Manage Schema
router.get('/collection/schema', MainController.schema_get);
router.post('/collection/schema', MainController.schema_post);


module.exports = router;
