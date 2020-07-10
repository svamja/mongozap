const express = require('express');
const cors = require('cors');

const server = express();
const port = process.env.PORT || 3183;
const MainController = require('./MainController');

server.use(cors());

server.get('/', MainController.index);
server.get('/api/databases', MainController.databases);
server.get('/api/collections', MainController.collections);
server.get('/api/collection/index', MainController.collection_index);

server.listen(port, function() {
    console.log(`mongozap started on port ${port}`)
});


