const Mongo = require('./mongodb-wrapper');

const MainController = {

    index: async function(req, res) {
        console.log('index called');
        res.send('success');
    },

};

module.exports = MainController;
