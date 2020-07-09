const Mongo = require('./mongodb-wrapper');

const MainController = {

    index: async function(req, res) {
        console.log('index called');
        res.send('success');
    },

    databases: async function(req, res) {
        console.log('req databases');
        const databases = await Mongo.get_databases();
        res.json(databases);
    },

    collections: async function(req, res) {
        console.log('req collections');
        const db = req.query.db;
        const collections = await Mongo.get_collections(db);
        res.json(collections);
    },

};

module.exports = MainController;
