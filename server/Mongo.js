const mongodb = require('mongodb');
const _ = require('lodash');

class Mongo {

    constructor(model_name, coll) {
        if(!coll) {
            throw new Error('constructor cannot be called directly. use get');
        }
        this.model_name = model_name;
        this.coll = coll;

        return new Proxy(this, {
            get(target, name) {
                if(target[name]) {
                    return target[name];
                }
                if(target.coll && target.coll[name]) {
                    if(_.isFunction(target.coll[name])) {
                        target[name] = function(...args) {
                            return target.coll[name](...args);
                        }
                        return target[name];
                    }
                    else {
                        return target.coll[name];
                    }
                }
                return;
            }
        });

    }

    static setDbUrl(dbUrl) {
        Mongo.dbUrl = dbUrl;
    }

    static setDbName(dbName) {
        Mongo.dbName = dbName;
    }

    static async get(dbName, model_name) {
        if(!model_name) {
            throw new Error('model name is missing');
        }
        Mongo.setDbName(dbName);
        let coll_name = _.snakeCase(model_name);
        let coll = await Mongo.get_collection(coll_name);
        return new Mongo(model_name, coll);
    }

    static async get_collection(coll_name) {
        const dbUrl = Mongo.dbUrl || 'mongodb://localhost/';
        const options = { useUnifiedTopology: true, useNewUrlParser: true };
        const client = await mongodb.MongoClient.connect(dbUrl, options);
        const dbName = Mongo.dbName || 'test';
        return client.db(dbName).collection(coll_name);
    }

    static async get_databases() {
        const dbUrl = 'mongodb://localhost/';
        const options = { useUnifiedTopology: true, useNewUrlParser: true };
        const client = await mongodb.MongoClient.connect(dbUrl, options);
        const adminDb = await client.db('admin').admin();
        const result = await adminDb.listDatabases();
        return result.databases;
    }

    static async get_database(dbName) {
        const dbUrl = 'mongodb://localhost/';
        const options = { useUnifiedTopology: true, useNewUrlParser: true };
        const client = await mongodb.MongoClient.connect(dbUrl, options);
        const db = await client.db(dbName);
        return db;
    }

    static async get_collections(dbName) {
        const dbUrl = 'mongodb://localhost/';
        const options = { useUnifiedTopology: true, useNewUrlParser: true };
        const client = await mongodb.MongoClient.connect(dbUrl, options);
        const db = await client.db(dbName);
        const result = await db.collections();
        let collections = [];
        for(let collection of result) {
            const name = collection.collectionName;
            const model_name = _.startCase(name).replace(/ /g, '');
            collections.push({ name, model_name });
        }
        return collections;
    }

    static async get_coll_stats(dbName) {
        const dbUrl = 'mongodb://localhost/';
        const options = { useUnifiedTopology: true, useNewUrlParser: true };
        const client = await mongodb.MongoClient.connect(dbUrl, options);
        const db = await client.db(dbName);
        const result = await db.collections();
        let collections = [];
        for(let collection of result) {
            const name = collection.collectionName;
            const model_name = _.startCase(name).replace(/ /g, '');
            collections.push({ name, model_name });
        }
        for(let collection of collections) {
            let coll = await db.collection(collection.name);
            collection.count = await coll.estimatedDocumentCount();
        }
        return collections;
    }

    async * chunks(query = {}, sort = null, options = {}) {
        if(!sort) {
            sort = { "_id": 1 }
        }
        if(options['fields']) {
            options['projection'] = {};
            options['fields'].forEach(x => options['projection'][x] = 1);
            delete(options['fields']);
        }
        const chunk_size = options['size'] || 1000;
        delete(options['size']);

        let items = await this.find(query, options).sort(sort);
        let batch_items = [];
        while(await items.hasNext()) {
            let item = await items.next();
            batch_items.push(item);
            if(batch_items.length >= chunk_size) {
                yield batch_items;
                batch_items = [];
            }
        }
        if(batch_items.length) {
            yield batch_items;
        }
    }

    async lookup(items, key, options = {}) {
        const is_join = options['is_join'] || false;
        const self_key = options['self_key'] || key;
            
        // query options
        let query_options = {};
        if(options['fields'] && options['fields'].length) {
            let projection = {};
            options['fields'].forEach(x => projection[x] = 1);
            projection[self_key] = 1;
            query_options['projection'] = projection;
        }
        if(options['sort']) {
            query_options['sort'] = options['sort'];
        }

        // Gather Search Values
        let search_values = [];
        for(let item of items) {
            let search_value = _.get(item, key);
            if(search_value) {
                search_values.push(search_value);
            }
        }

        if(!search_values.length) {
            return items;
        }

        // Query by Join/Lookup Key
        let query = { [self_key] : { '$in' : search_values } };
        if(options['query']) {
            Object.assign(query, options['query']);
        }
        let self_items = await this.find(query, query_options).toArray();

        // Index by Join/Lookup Key
        let indexed_items = {};
        for(let item of self_items) {
            let search_value = _.get(item, self_key);
            if(is_join) {
                indexed_items[search_value] = indexed_items[search_value] || [];
                indexed_items[search_value].push(item);
            }
            else {
                indexed_items[search_value] = item;
            }
        }

        // Mix with Original Items
        for(let i in items) {
            let item = items[i];
            let search_value = _.get(item, key);
            if(search_value) {
                items[i][this.model_name] = indexed_items[search_value] || null;
            }
        }
        return items;
    }

    async bulk_insert(doc) {
        this.bulk_insert_docs = this.bulk_insert_docs || [];
        if(doc !== null) {
            this.bulk_insert_docs.push(doc);
        }
        if(doc === null || this.bulk_insert_docs.length >= 1000) {
            if(this.bulk_insert_docs.length) {
                await this.insertMany(this.bulk_insert_docs);
                this.bulk_insert_docs = [];
            }
        }
    }

    async bulk_update(filter, update) {
        this.bulk_operations = this.bulk_operations || [];
        if(filter !== null) {
            this.bulk_operations.push({ updateOne: { filter, update } });
        }
        if(filter === null || this.bulk_operations.length >= 1000) {
            if(this.bulk_operations.length) {
                await this.bulkWrite(this.bulk_operations);
                this.bulk_operations = [];
            }
        }
    }

    async bulk_save(doc) {
        this.bulk_operations = this.bulk_operations || [];
        if(doc !== null) {
            this.bulk_operations.push({
                replaceOne: {
                    filter: { '_id' : doc['_id'] },
                    replacement: doc
                }
            });
        }
        if(doc === null || this.bulk_operations.length >= 1000) {
            if(this.bulk_operations.length) {
                await this.bulkWrite(this.bulk_operations);
                this.bulk_operations = [];
            }
        }
    }

    async bulk_operation(type, params) {
        this.bulk_operations = this.bulk_operations || [];
        if(type !== null) {
            let operation = {};
            operation[type] = params;
            this.bulk_operations.push(operation);
        }
        if(type === null || this.bulk_operations.length >= 1000) {
            if(this.bulk_operations.length) {
                await this.bulkWrite(this.bulk_operations);
                this.bulk_operations = [];
            }
        }
    }

    async bulk_delete(doc) {
        this.bulk_delete_ids = this.bulk_delete_ids || [];
        if(doc !== null) {
            this.bulk_delete_ids.push(doc['_id']);
        }
        if(doc === null || this.bulk_delete_ids.length >= 1000) {
            if(this.bulk_delete_ids.length) {
                await this.deleteMany({
                    _id: { '$in' : this.bulk_delete_ids }
                });
                this.bulk_delete_ids = [];
            }
        }
    }

    async delete_all(docs) {
        const ids = _.map(docs, '_id');
        return await this.deleteMany({
            _id: { '$in' : ids }
        });
    }

    static objectId(id) {
        return new mongodb.ObjectID(id);
    }

    async findById(id) {
        const _ = require('lodash');
        if(_.isString(id)) {
            id = Mongo.objectId(id);
        }
        return await this.findOne({ _id: id });
    }

    async findLast(query = {}, sort = { _id: -1 }) {
        return await this.find(query).sort(sort).next();
    }

    async findFirst(query = {}, sort = { _id: 1 }) {
        return await this.find(query).sort(sort).next();
    }

    //TODO: Write lookup specs here

    // Easy iteration after multiple Lookups on a Collection
    // with Function-based filtering in between lookups
    static async * lookups(chain) {

        if(!_.isArray(chain)) {
            chain = Mongo.lookup_specs(chain);
        }

        this.lookup_counts = { in: 0 };

        let primary = chain.shift();
        this.lookup_counts[primary.model] = 0;
        const Primary = await Mongo.get(primary.db, primary.model);
        let bead;
        for(bead of chain) {
            bead.Model = await Mongo.get(bead.db, bead.model);
            this.lookup_counts[bead.model] = 0;
        }
        this.lookup_counts['out'] = 0;
        const { query, sort, options } = primary;
        const chunks = await Primary.chunks(query, sort, options);
        let cutoff_time = 0;
        let cutoff_field = primary.cutoff_field || 'created';
        if(primary.cutoff_minutes) {
            cutoff_time = Math.round(new Date().getTime() / 1000 - primary.cutoff_minutes*60);
        }

        let result_chunk = [];
        while(true) {
            let result = await chunks.next();
            if(result.done) {
                break;
            }
            let docs = result.value;

            if(cutoff_time) {
                docs = docs.filter(x => x[cutoff_field] > cutoff_time);
                if(!docs.length) {
                    break;
                }
            }

            this.lookup_counts['in'] += docs.length;
            if(primary.filter) {
                docs = docs.filter(primary.filter);
            }
            this.lookup_counts[primary.model] += docs.length;
            for(bead of chain) {
                await bead.Model.lookup(docs, bead.key, bead.options);
                if(bead.filter) {
                    docs = docs.filter(bead.filter);
                }
                this.lookup_counts[bead.model] += docs.length;
            }
            this.lookup_counts['out'] += docs.length;

            for(let doc of docs) {
                result_chunk.push(doc);
                if(result_chunk.length >= 1000) {
                    yield result_chunk;
                    result_chunk = [];
                }
            }
        }
        if(result_chunk.length) {
            yield result_chunk;
        }
    }


}


module.exports = Mongo;



