const Mongo = require('./Mongo');
const SchemaMgr = require('./SchemaMgr');
const _ = require('lodash');

const ApiController = {

    databases: async function(req, res) {
        const databases = await Mongo.get_databases();
        res.json(databases);
    },

    collections: async function(req, res) {
        const db = req.query.db;
        const collections = await Mongo.get_coll_stats(db);
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
        const Model = await Mongo.get(db, coll);
        let perPage = parseInt(req.query.perPage || 10);

        // Get Cursor
        const cursor = await Model.find(query).limit(perPage);
            
        // Pagination Skip
        if(page) {
            await cursor.skip(page*perPage);
        }

        // Get Records
        const records = await cursor.toArray();

        // Estimated Count
        let count = records.length;
        if(query && Object.keys(query).length) {
            count = await Model.countDocuments(query);
        }
        else {
            count = await Model.estimatedDocumentCount();
        }

        // Return Data
        res.json({ records, count });
    },

    async collection_clear(req, res) {
        // Get Collection
        const db = req.body.db;
        const coll = req.body.coll;
        const Model = await Mongo.get(db, coll);
        result = await Model.deleteMany();
        res.json({ status: 'success', result });
    },

    async collection_drop(req, res) {
        // Get Collection
        const db = req.body.db;
        const coll = req.body.coll;
        const Model = await Mongo.get(db, coll);
        result = await Model.drop();
        res.json({ status: 'success', result });
    },

    //TODO: Get Collection Info
    async collection_get(req, res) {
        // Get Params
        const db = req.query.db;
        const coll = req.query.coll;
    },

    async schema_get(req, res) {
        const db = req.query.db;
        const coll = req.query.coll;

        // Schema Db
        const schema_db = 'mongozap';
        const schema_coll = 'fields';
        const SchemaModel = await Mongo.get(schema_db, schema_coll);

        // Query
        let query = { db, coll };
        result = await SchemaModel.find(query).toArray();
        res.json(result);
    },

    async schema_post(req, res) {
        // Get Collection
        const db = req.body.db;
        const coll = req.body.coll;
        const rebuild = req.body.rebuild;

        await SchemaMgr.init('mongozap', 'fields');

        if(rebuild) {
            await SchemaMgr.rebuild(db, coll);
        }

        res.json({ status: "success" });

    },

    async build_schema(req, res) {
        // Get Collection
        const db = req.body.db;
        const coll = req.body.coll;
        const Model = await Mongo.get(db, coll);
        result = await Model.deleteMany();
        res.json({ status: 'success', result });
    },

};

module.exports = ApiController;
