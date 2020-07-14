const express = require('express');
const cors = require('cors');
const ApiRouter = require('./ApiRouter');

const server = express();
const port = process.env.PORT || 3333;

server.use(cors());
server.use(express.json());
server.use('/api', ApiRouter);

server.use(express.static(__dirname + '/public/'));
server.use(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));

server.listen(port, function() {
    console.log(`mongozap started on port ${port}`)
});


