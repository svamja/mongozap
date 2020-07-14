const express = require('express');
const MainController = require('./ApiController');

const router = express.Router();

router.get('/databases', MainController.databases);
router.get('/collections', MainController.collections);
router.get('/collection/index', MainController.collection_index);
router.post('/collection/index', MainController.collection_index);
router.post('/collection/clear', MainController.collection_clear);
router.post('/collection/drop', MainController.collection_drop);
router.get('/collection/schema', MainController.schema_get);

module.exports = router;
