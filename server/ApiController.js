const Mongo = require('./Mongo');
const SchemaMgr = require('./SchemaMgr');
const SettingsMgr = require('./SettingsMgr');
const _ = require('lodash');

const ApiController = {

    databases: async function(req, res) {
        const connection_url = req.query.connection_url || req.body.connection_url;
        const databases = await Mongo.get_databases(connection_url);
        res.json(databases);
    },

    db_info: async function(req, res) {
        const connection_url = req.query.connection_url || req.body.connection_url;
        const dbName = req.query.db;

        // Get Stats
        const db = await Mongo.get_database(connection_url, dbName);
        let info = await db.stats();

        // Get Schema Info
        const SchemaModel = await SchemaMgr.init();
        let pipeline = [
            { '$match' : { 'db': dbName } },
            { '$group' : { _id: "$coll" } }
        ];
        records = await SchemaModel.aggregate(pipeline).toArray();
        info.schema_count = records.length;

        res.json(info);
    },

    collections: async function(req, res) {
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db;
        const collections = await Mongo.get_coll_stats(connection_url, db);
        res.json(collections);
    },

    collection_index: async function(req, res) {
        // Get Params
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        const page = req.query.page || req.body.page;

        // Query
        let query;
        let input_query = req.query.query || req.body.query;
        if(input_query) {
            if(_.isString(input_query)) {
                try {
                    query = JSON.parse(input_query)
                }
                catch(err) {}
            }
            else if(_.isPlainObject(input_query)) {
                query = input_query;
            }
        }
        if(!input_query) {
            query = {};
        }

        // Sort
        let sort = { '_id' : -1 };
        if(req.body && req.body.sort) {
            if(_.isPlainObject(req.body.sort)) {
                sort = req.body.sort;
            }
        }

        // Get Collection
        const Model = await Mongo.get(connection_url, db, coll);
        let perPage = parseInt(req.query.perPage || req.body.perPage || 10);

        // Get Cursor
        const cursor = await Model.find(query).limit(perPage);

        // Sort
        if(sort) {
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
        if(!ApiController.last_schema || ApiController.last_schema_coll != coll || ApiController.last_schema_db != db) {
            await ApiController.loadSchema(connection_url, db, coll);
        }
        let schema = ApiController.last_schema;

        // Return Data
        res.json({ records, count, schema });
    },

    async loadSchema(connection_url, db, coll) {

        const SchemaModel = await SchemaMgr.init();

        if(!SchemaModel) {
            return;
        }

        let query = { db, coll };

        records = await SchemaModel.find(query).toArray();

        let fields = [];
        for(let record of records) {
            if(record.depth == 1) {
                fields.push(record.name);
            }
            // if(record.depth == 1 && record.type != 'Array' && record.type != 'Document') {
            //     fields.push(record.name);
            // }
            // if(record.depth == 2) {
            //     fields.push(record.path);
            // }
        }
        this.last_schema = { fields };
        this.last_schema_db = db;
        this.last_schema_coll = coll;
        return this.last_schema;
    },

    async collection_delete(req, res) {
        const { EJSON } = require('bson');

        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        let query = req.query.query || req.body.query;
        const Model = await Mongo.get(connection_url, db, coll);
        query = EJSON.deserialize(query);
        let result = await Model.deleteMany(query);
        res.json({ status: 'success', count: result.deletedCount });
    },

    async collection_clear(req, res) {
        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.body.db;
        const coll = req.body.coll;
        const Model = await Mongo.get(connection_url, db, coll);
        result = await Model.deleteMany();
        res.json({ status: 'success', result });
    },

    async collection_drop(req, res) {
        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.body.db;
        const coll = req.body.coll;
        const Model = await Mongo.get(connection_url, db, coll);
        result = await Model.drop();
        res.json({ status: 'success', result });
    },

    //TODO: Get Collection Info
    async collection_get(req, res) {
        // Get Params
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db;
        const coll = req.query.coll;
    },

    async schema_get(req, res) {
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db;
        const coll = req.query.coll;
        const rebuild = req.query.rebuild || req.body.rebuild;

        // Schema Db
        const SchemaModel = await SchemaMgr.init();
        if(rebuild) {
            await SchemaMgr.rebuild(connection_url, db, coll);
        }

        // Query
        let query = { db, coll };
        result = await SchemaModel.find(query).toArray();
        res.json(result);
    },

    async schema_post(req, res) {
        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.body.db;
        const coll = req.body.coll;
        const rebuild = req.body.rebuild;

        const SchemaModel = await SchemaMgr.init();

        if(rebuild) {
            await SchemaMgr.rebuild(connection_url, db, coll);
        }

        res.json({ status: "success" });

    },

    async bulk(req, res) {
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.body.db;
        const coll = req.body.coll;
        const ops = req.body.ops;
        const Model = await Mongo.get(connection_url, db, coll);
        await Model.bulkWrite(ops);
        res.json({ status: 'success' });
    },

    async settings_get(req, res) {
        let settings = await SettingsMgr.read();
        res.json(settings);
    },

    async settings_set(req, res) {
        let settings = req.body.settings || req.query.settings;
        await SettingsMgr.write(settings);
        res.json({ status: 'success' });
    },

};

module.exports = ApiController;
