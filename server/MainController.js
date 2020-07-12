const Mongo = require('./mongodb-wrapper');
const _ = require('lodash');

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
        // Get Params
        const db = req.query.db;
        const coll = req.query.coll;
        const page = req.query.page;
            
        // Query
        let query = null;
        if(req.body && req.body.query) {
            if(_.isString(req.body.query)) {
                try {
                    query = JSON.parse(req.body.query)
                }
                catch(err) {}
            }
            else if(_.isPlainObject(req.body.query)) {
                query = req.body.query;
            }
        }
        if(!query) {
            query = {};
        }

        // Get Collection
        Mongo.setDbName(db);
        const Model = await Mongo.get(coll);
        let perPage = parseInt(req.query.perPage || 10);

        // Get Cursor
        const cursor = await Model.find(query).limit(perPage);
            
        // Pagination Skip
        if(page) {
            await cursor.skip(page*perPage);
        }

        // Get Records
        const records = await cursor.toArray();

        // Return Records
        res.json(records);
    },

    async collection_clear(req, res) {
        // Get Collection
        const db = req.body.db;
        const coll = req.body.coll;
        Mongo.setDbName(db);
        const Model = await Mongo.get(coll);
        result = await Model.deleteMany();
        res.json({ status: 'success', result });
    },

};

module.exports = MainController;
