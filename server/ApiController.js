const Mongo = require('./Mongo');
const SchemaMgr = require('./SchemaMgr');
const SettingsMgr = require('./SettingsMgr');
const _ = require('lodash');

const ApiController = {

    async login(req, res) {

        // input credentials
        const username = req.query.username || req.body.username;
        const password = req.query.password || req.body.password;

        let status, user;
        let allow_default_login = process.env.ALLOW_DEFAULT_LOGIN &&
            (process.env.ALLOW_DEFAULT_LOGIN.toLowerCase() === 'yes' ||
                process.env.ALLOW_DEFAULT_LOGIN.toLowerCase() === 'y' ||
                parseInt(process.env.ALLOW_DEFAULT_LOGIN) === 1);

        if(allow_default_login) {
            // default credentials
            let default_user = process.env.DEFAULT_USERNAME || 'admin';
            let default_password = process.env.DEFAULT_PASSWORD || 'admin';
            let default_role = process.env.DEFAULT_ROLE || 'admin';

            // check default username & password
            if(default_user === username && default_password === password) {
                status = 'success';
                user = { username, role: default_role, is_default: true };
                res.json({ status: 'success', user });
                return;
            }
        }

        // check from database 
        const connection_url = SettingsMgr.settings.default_connection;
        const db = SettingsMgr.settings.mongozap_database;
        const coll = 'users';
        const Users = await Mongo.get(connection_url, db, coll);
        const hashed_password = ApiController.hash_password(password);
        user = await Users.findOne({ username, password: hashed_password });
        if(user) {
            status = 'success';
        }
        else {
            status = 'error';
        }
        res.json({ status, user });
    },

    async add_user(req, res) {

        // input credentials
        const username = req.query.username || req.body.username;
        let password = req.query.password || req.body.password;
        const role = req.query.role || req.body.role || 'user';

        let status, sub_status, user;

        // check for errors
        if(!username || !password) {
            status = 'error';
            sub_status = 'missing_field';
            return res.json({ status, sub_status, user });
        }
        else if(password.length < 4) {
            status = 'error';
            sub_status = 'short_password';
            return res.json({ status, sub_status, user });
        }

        // get collection
        const connection_url = SettingsMgr.settings.default_connection;
        const db = SettingsMgr.settings.mongozap_database;
        const coll = 'users';
        const Users = await Mongo.get(connection_url, db, coll);

        // check from existing user 
        user = await Users.findOne({ username });
        if(user) {
            status = 'error';
            sub_status = 'existing_user';
            return res.json({ status, sub_status, user });
        }

        // create user
        password = ApiController.hash_password(password);
        await Users.insertOne({ username, password, role });
        status = 'success';
        return res.json({ status, sub_status, user });

    },

    hash_password(password) {
        let crypto = require('crypto');
        let hash_key = process.env.HASH_KEY || 'nGfdJuILpwD';
        let input = hash_key + ':' + password;
        let hash = crypto.createHash('md5').update(input).digest('hex');
        return hash;
    },
    
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

        const { EJSON } = require('bson');

        // Get Params
        const connection_url = req.query.connection_url || req.body.connection_url;
        let db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        const page = req.query.page || req.body.page;
        if(db === '_mongozap') {
            db = process.env.MONGOZAP_DATABASE;
        }

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
        else {
            query = EJSON.deserialize(query);
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
        }
        this.last_schema = { fields };
        this.last_schema_db = db;
        this.last_schema_coll = coll;
        return this.last_schema;
    },

    async collection_insert(req, res) {
        const { EJSON } = require('bson');

        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        let docs = req.query.doc || req.body.docs;
        let doc = req.query.doc || req.body.doc;
        if(doc && !docs) {
            docs = [ doc ];
        }
        const Model = await Mongo.get(connection_url, db, coll);
        docs = EJSON.deserialize(docs);
        let result = await Model.insertMany(docs);
        res.json({ status: 'success', count: result.insertedCount });
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
            ApiController.last_schema = null;
            ApiController.last_schema_db = null;
            ApiController.last_schema_coll = null;
        }

        // Query
        let query = { db, coll };
        result = await SchemaModel.find(query).toArray();
        res.json(result);
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


    async indexes_get(req, res) {

        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;

        // Get Indexes
        const Model = await Mongo.get(connection_url, db, coll);
        const indexes = await Model.indexes();
        res.json(indexes);
    },

    async indexes_delete(req, res) {

        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        const index_name = req.query.index_name || req.body.index_name;

        // Get Indexes
        const Model = await Mongo.get(connection_url, db, coll);
        const result = await Model.dropIndex(index_name);
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
