const Mongo = require('./mongodb-wrapper');

const MainController = {

    index: async function(req, res) {
        res.send('success');
    },

    databases: async function(req, res) {
        const databases = await Mongo.get_databases();
        res.json(databases);
    },

    collections: async function(req, res) {
        const db = req.query.db;
        const collections = await Mongo.get_collections(db);
        res.json(collections);
    },

    collection_index: async function(req, res) {
        const db = req.query.db;
        const coll = req.query.coll;
        const page = req.query.page;
        Mongo.setDbName(db);
        const Model = await Mongo.get(coll);
        let perPage = parseInt(req.query.perPage || 10);
        const cursor = await Model.find().limit(perPage);
        if(page) {
            await cursor.skip(page*perPage);
        }
        const records = await cursor.toArray();
        res.json(records);
    },

};

module.exports = MainController;
