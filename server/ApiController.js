const Mongo = require('./Mongo');
const SchemaMgr = require('./SchemaMgr');
const SettingsMgr = require('./SettingsMgr');
const { EJSON } = require('bson');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const ApiController = {

    async api(req, res) {
        let fn_name = req.params.fn_name;
        console.time('api: ' + fn_name);
        const result = await ApiController[fn_name](req, res);
        console.timeEnd('api: ' + fn_name);
        return result;
    },

    async init_request(req) {

        // Core Params
        let connection_url = req.query.connection_url || req.body.connection_url;
        let db = req.query.db || req.body.db;
        let coll = req.query.coll || req.body.coll;

        // "mongozap" Special Database
        db = db === '_mongozap' ? process.env.MONGOZAP_DATABASE : db;

        // Model
        let Model;
        if(connection_url && db && coll) {
            Model = await Mongo.get(connection_url, db, coll);
        }

        // Query
        let query = req.query.query || req.body.query;
        if(query) {
            query = EJSON.deserialize(query);        
        }

        // Fields
        let fields = req.body.fields || req.query.fields;

        return { connection_url, db, coll, Model, query, fields };

    },

    async login(req, res) {

        // input credentials
        const username = req.query.username || req.body.username;
        const password = req.query.password || req.body.password;

        let status, user, token;
        let allow_default_login = process.env.ALLOW_DEFAULT_LOGIN &&
            (process.env.ALLOW_DEFAULT_LOGIN.toLowerCase() === 'yes' ||
                process.env.ALLOW_DEFAULT_LOGIN.toLowerCase() === 'y' ||
                parseInt(process.env.ALLOW_DEFAULT_LOGIN) === 1);

        // check default credentials
        if(allow_default_login) {
            let default_user = process.env.DEFAULT_USERNAME || 'admin';
            let default_password = process.env.DEFAULT_PASSWORD || 'admin';
            let default_role = process.env.DEFAULT_ROLE || 'admin';

            // check default username & password
            if(default_user === username && default_password === password) {
                user = { username, role: default_role, is_default: true };
            }
        }

        // check from database 
        if(!user) {
            const connection_url = SettingsMgr.settings.default_connection;
            const db = SettingsMgr.settings.mongozap_database;
            const coll = 'users';
            const Users = await Mongo.get(connection_url, db, coll);
            const hashed_password = ApiController.hash_password(password);
            const db_user = await Users.findOne({ username, password: hashed_password });
            user = { username: db_user.username, role: db_user.role, is_default: false };
        }

        if(user) {
            token = jwt.sign(user, process.env.MONGOZAP_SECRET, {
              expiresIn: 30*86400 // expires in 30 days
            });
        }

        // response
        status = user ? 'success' : 'error';
        res.json({ status, user, token });

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
        let records = await cursor.toArray();

        // Convert to EJSON
        records = records.map(r => EJSON.serialize(r));

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

    async insert_documents(req, res) {
        const { EJSON } = require('bson');

        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        let db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        let docs = req.query.doc || req.body.docs;
        let doc = req.query.doc || req.body.doc;
        if(doc && !docs) {
            docs = [ doc ];
        }
        if(db === '_mongozap') {
            db = process.env.MONGOZAP_DATABASE;
        }

        const Model = await Mongo.get(connection_url, db, coll);
        docs = EJSON.deserialize(docs);
        let result = await Model.insertMany(docs);
        res.json({ status: 'success', count: result.insertedCount });
    },

    async update_documents(req, res) {
        const { EJSON } = require('bson');

        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        let query = req.query.query || req.body.query;
        let changes = req.query.changes || req.body.changes;
        const Model = await Mongo.get(connection_url, db, coll);
        query = EJSON.deserialize(query);
        changes = EJSON.deserialize(changes);
        let result = await Model.updateMany(query, changes);
        res.json({ status: 'success', count: result.modifiedCount });
    },

    async replace_document(req, res) {
        const { EJSON } = require('bson');

        // Get Collection
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        let query = req.query.query || req.body.query;
        let doc = req.query.doc || req.body.doc;

        // Replace (save) document
        const Model = await Mongo.get(connection_url, db, coll);
        query = EJSON.deserialize(query);
        doc = EJSON.deserialize(doc);
        let result = await Model.replaceOne(query, doc);
        res.json({ status: 'success', count: result.modifiedCount });
    },

    async delete_records(req, res) {
        const { Model, query } = await this.init_request(req);
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

    async aggregate(req, res) {
        const connection_url = req.query.connection_url || req.body.connection_url;
        const db = req.query.db || req.body.db;
        const coll = req.query.coll || req.body.coll;
        let pipeline_text = req.query.pipeline || req.body.pipeline;
        let pipeline;
        if(!pipeline_text) {
            return res.json({ status: 'error', items: []});
        }
        try {
            pipeline = JSON.parse(pipeline_text);
        }
        catch(err) {}
        if(!pipeline || !pipeline.length) {
            return res.json({ status: 'error', items: []});
        }
        const Model = await Mongo.get(connection_url, db, coll);
        let cursor = await Model.aggregate(pipeline);
        let items = [];
        for await(let item of cursor) {
            items.push(item);
            if(items.length >= 100) break;
        }
        return res.json({ status: 'success', items });
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

    async google_auth_complete(req, res) {
        const fs = require('fs');
        const { google } = require('googleapis');
        const code = req.body.code || req.query.code;
        const path = require('path');
        const base_path = path.resolve(__dirname, '..');
        const cred_path = base_path + '/.google_credentials.json';
        const content = fs.readFileSync(cred_path);
        const cred = JSON.parse(content);
        const { client_secret, client_id, redirect_uris } = cred.web;
        // const redirect_uri = process.env.GOOGLE_REDIRECT_URI;
        const redirect_uri = process.env.BASE_URL + '/api/google/auth/complete';

        console.log(client_id.substring(0, 10), redirect_uri);
        const auth = new google.auth.OAuth2(
            client_id, client_secret, redirect_uri
        );
        const { tokens } = await auth.getToken(code);
        console.log('token obtained');

        //TODO: Save the Tokens to "users" Collection

        // Save the Token
        const token_path = base_path + '/.google_token.json';
        fs.writeFileSync(token_path, JSON.stringify(tokens, null, 4));

        // Redirect to Settings
        res.redirect('/#/google/auth/complete');

    },

    async save_token(req, res) {
        const fs = require('fs');
        const path = require('path');
        const username = req.body.username || req.query.username;
        const base_path = path.resolve(__dirname, '..');
        const token_path = base_path + '/.google_token.json';
        const token = JSON.parse(fs.readFileSync(token_path));
        const connection_url = SettingsMgr.settings.default_connection;
        const db = SettingsMgr.settings.mongozap_database;
        const Users = await Mongo.get(connection_url, db, 'users');
        const user = await Users.findOne({ username });
        if(user) {
            await Users.updateOne(
                { _id: user._id },
                { '$set':  { google_token: token } }
            );
            res.json({ status: 'success' });
        }
        else {
            res.json({ status: 'error' });
        }
    },

    init_google() {
        const Google = require('google-api-wrapper');
        const path = require('path');
        const base_path = path.resolve(__dirname, '..');
        const cred_path = base_path + '/.google_credentials.json';
        const token_path = base_path + '/.google_token.json';
        Google.loadCredFile(cred_path);
        Google.loadTokenFile(token_path);
        return Google;
    },

    async export_sheet(req, res) {
        const moment = require('moment');

        // Get Req Params
        const { coll, Model, query, fields } = await this.init_request(req);

        // Initialize Google APIs
        const Google = this.init_google();

        // Get Collection
        const date_time = moment().format('YYYY-MM-DD-HHmm');

        // Get Sheet
        const sheet = Google.getSheet();
        const sheet_id = await sheet.create(`${coll} export ${date_time}`);
        await sheet.write(fields);

        // Write to Sheet
        let chunks = await Model.chunks(query);
        let count = 0;
        for await(let docs of chunks) {
            for(let doc of docs) {
                let row = [];
                for(let field of fields) {
                    let value = _.get(doc, field);
                    if(_.isPlainObject(value) || _.isArray(value)) {
                        value = JSON.stringify(value);
                    }
                    row.push(value);
                }
                await sheet.write(row);
                count++;
            }
        }

        // End Write
        await sheet.endWrite();
        let url = `https://docs.google.com/spreadsheets/d/${sheet_id}`;

        res.json({ status: 'success', count, url });
    },

    async export_aggregation(req, res) {
        const moment = require('moment');

        // Get Req Params
        const { coll, Model } = await this.init_request(req);

        // Initialize Google APIs
        const Google = this.init_google();

        // Get Collection
        const date_time = moment().format('YYYY-MM-DD-HHmm');

        // Get Sheet
        const sheet = Google.getSheet();
        const sheet_id = await sheet.create(`${coll} aggregation ${date_time}`);

        // Get Pipeline
        let pipeline;
        const pipeline_text = req.query.pipeline || req.body.pipeline;
        if(!pipeline_text) {
            return res.json({ status: 'error', items: []});
        }
        try {
            pipeline = JSON.parse(pipeline_text);
        }
        catch(err) {}
        if(!pipeline || !pipeline.length) {
            return res.json({ status: 'error', items: []});
        }

        let cursor = await Model.aggregate(pipeline);
        let items = [];

        // Write to Sheet
        let count = 0;
        let fields;
        for await(let doc of cursor) {
            if(count == 0) {
                fields = Object.keys(doc);
                await sheet.write(fields);
            }
            let row = [];
            for(let field of fields) {
                let value = _.get(doc, field);
                if(_.isPlainObject(value) || _.isArray(value)) {
                    value = JSON.stringify(value);
                }
                row.push(value);
            }
            await sheet.write(row);
            count++;
            if(count >= 20000) break;
        }

        // End Write
        await sheet.endWrite();
        let url = `https://docs.google.com/spreadsheets/d/${sheet_id}`;

        res.json({ status: 'success', count, url });
    },


};

module.exports = ApiController;
