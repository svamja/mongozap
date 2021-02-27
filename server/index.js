const DotEnv = require('dotenv');
const path = require('path');
// const jwt = require('express-jwt');
// const unless = require('express-unless');
const jwt = require('jsonwebtoken');

DotEnv.config();
DotEnv.config({ path: path.resolve(__dirname, '..', '.env.default') });

const express = require('express');
const cors = require('cors');
const ApiRouter = require('./ApiRouter');

const server = express();
const port = process.env.PORT || 3333;

// const jwtMiddleware = jwt({
//     secret: process.env.MONGOZAP_SECRET,
//     algorithms: [ 'HS256' ],
    
// }).unless({ path:  });


function jwtMiddleware(req, res, next) {
    const allowed_paths = [
        '/api/login', '/api/api/login',
        '/api/google/auth/login',
        '/api/settings_get', '/api/api/settings_get',
        '/api/google_login', '/api/api/google_login'
    ];
    if(allowed_paths.includes(req.path)) {
        return next();
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401); // if there isn't any token
    }
    let user;
    try {
        user = jwt.verify(token, process.env.MONGOZAP_SECRET);
    }
    catch(err) {
        return res.sendStatus(403);
    }
    req.user = user;
    return next();
}

server.use(jwtMiddleware);

server.use(cors());
server.use(express.json());
server.use('/api', ApiRouter);

server.use(express.static(__dirname + '/public/'));
server.use(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));

server.listen(port, function() {
    console.log(`mongozap started on port ${port}`)
});


