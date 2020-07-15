const Mongo = require('./Mongo');
const SchemaMgr = require('./SchemaMgr');
const SettingsMgr = require('./SettingsMgr');
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

        // Sort
        let sort;
        if(req.body && req.body.sort) {
            if(_.isPlainObject(req.body.sort)) {
                sort = req.body.sort;
            }
        }


        // Get Collection
        const Model = await Mongo.get(db, coll);
        let perPage = parseInt(req.query.perPage || 10);

        // Get Cursor
        const cursor = await Model.find(query).limit(perPage);

        // Sort
        if(sort) {
            console.log('sorting enabled', sort);
            await cursor.sort(sort);
        }

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

        // Schema (Fields)
        if(!ApiController.schema || ApiController.schema_coll != coll || ApiController.schema_db != db) {
            await ApiController.loadSchema(db, coll);
        }
        let schema = ApiController.schema;

        // Return Data
        res.json({ records, count, schema });
    },

    async loadSchema(db, coll) {
        let schema_db = await SettingsMgr.get('schema_database');
        let schema_coll = await SettingsMgr.get('schema_collection');
        let query = { db, coll };

        const SchemaModel = await Mongo.get(schema_db, schema_coll);
        records = await SchemaModel.find(query).toArray();

        let fields = [];
        for(let record of records) {
            if(record.depth == 1 && record.type != 'Array' && record.type != 'Document') {
                fields.push(record.name);
            }
            if(record.depth == 2) {
                fields.push(record.path);
            }
        }
        this.schema = { fields };
        this.schema_db = db;
        this.schema_coll = coll;
        return this.schema;
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
        const schema_db = await SettingsMgr.get('schema_database');
        const schema_coll = await SettingsMgr.get('schema_collection');
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

        const schema_db = await SettingsMgr.get('schema_database');
        const schema_coll = await SettingsMgr.get('schema_collection');
        await SchemaMgr.init(schema_db, schema_coll);

        if(rebuild) {
            await SchemaMgr.rebuild(db, coll);
        }

        res.json({ status: "success" });

    },

    async bulk(req, res) {
        const db = req.body.db;
        const coll = req.body.coll;
        const ops = req.body.ops;
        const Model = await Mongo.get(db, coll);
        await Model.bulkWrite(ops);
        res.json({ status: 'success' });
    },

    async config_get(req, res) {
        let settings = await SettingsMgr.getAll();
        res.json(settings);
    },

    async config_post(req, res) {
        let settings = req.body.settings;
        await SettingsMgr.setAll(settings);
        res.json({ status: 'success' });
    },

};

module.exports = ApiController;
