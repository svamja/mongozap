const express = require('express');
const server = express();
const port = process.env.PORT || 3183;
const MainController = require('./MainController');

server.get('/', MainController.index);

server.listen(port, function() {
    console.log(`mongozap started on port ${port}`)
});


