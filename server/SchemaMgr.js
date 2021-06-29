const Mongo = require('./Mongo');
const _ = require('lodash');
const mongodbSchema = require('mongodb-schema');
const SettingsMgr = require('./SettingsMgr');

const SchemaMgr = {

    SchemaModel: null,
    fields_indexed: false,

    async init() {
        if(this.SchemaModel) {
            return this.SchemaModel;
        }
        const connection_url = await SettingsMgr.get('default_connection');
        const schema_db = await SettingsMgr.get('mongozap_database');
        const schema_coll = 'fields';
        this.SchemaModel = await Mongo.get(connection_url, schema_db, schema_coll);
        return this.SchemaModel;
    },

    async rebuild(connection_url, db, coll) {

        await this.init();

        // Create Index (in background)
        if(!this.fields_indexed) {
            this.fields_indexed = true;
            this.SchemaModel.createIndex({ db: 1, coll: 1 });
        }

        // Obtain Sample Records
        const Model = await Mongo.get(connection_url, db, coll);
        const sort = { _id: -1 };
        const docs = await Model.find().sort(sort).limit(5000).toArray();

        if(!docs || !docs.length) {
            return;
        }

        // Get "Raw" Schema from mongodb-schema module
        let options = { storeValues: false };
        let schema = await new Promise(function(resolve, reject) {
            mongodbSchema(docs, options, (err, schema) => resolve(schema) );
        });

        if(!schema || !schema.fields) {
            return;
        }

        // Delete Existing Records
        await this.SchemaModel.deleteMany({ db, coll });

        // Format Schema into Database Records
        this.depth = 0;
        this.fields = [];
        let fields = this.schema_fields(schema.fields, db, coll);

        // Add Display Order to Top Level Fields
        fields = this.field_order(fields, docs);

        // Insert Schema Records
        await this.SchemaModel.insertMany(fields);

    },

    schema_fields(curr_fields, db, coll, parent) {
        this.fields = this.fields || [];
        this.depth++;
        for(let curr_field of curr_fields) {
            let name = curr_field.name;
            let path = curr_field.path;

            // Clean up Types
            let types = curr_field.types;
            while(types.length && (types[0]['name'] == 'Undefined' || types[0]['name'] == 'Null')) {
                types.shift();
            }

            // Get Type
            let type;
            if(types.length) {
                type = types[0].name;
            }
            else {
                type = 'null';
            }

            // Depth
            let depth = this.depth;

            // Array
            let sub_type, sub_types;
            if(type == 'Array') {
                sub_types = types[0]['types'];
                while(sub_types.length && (sub_types[0]['name'] == 'Undefined' || sub_types[0]['name'] == 'Null')) {
                    sub_types.shift();
                }
                if(sub_types.length) {
                    sub_type = sub_types[0]['name'];
                }
                else {
                    sub_type = 'null';
                }
            }

            // Probability
            let probability = Math.round(curr_field.probability * 100);

            // Insert Field
            this.fields.push({ name, path, depth, type, sub_type, probability, parent, db, coll });

            // Traversal - Parent
            let next_parent = { path: curr_field.path, type };

            // Document
            if(type == 'Document' && types[0].fields) {
                this.schema_fields(types[0].fields, db, coll, next_parent);
            }

            // Array of Document
            if(type == 'Array' && sub_type == 'Document') {
                this.schema_fields(sub_types[0].fields, db, coll, next_parent);
            }

        }
        this.depth--;
        return this.fields;
    },

    field_order(schema_fields, docs) {

        // Build an Index of all Orders using 10 records
        let field_orders = {};

        let len = docs.length > 10 ? 10: docs.length;

        for(let i=0; i < len; i++) {
            let doc = docs[i];
            let index = 0;
            for(let field_name in doc) {
                index++;
                field_orders[field_name] = field_orders[field_name] || [];
                field_orders[field_name].push(index);
            }
        }

        // Average Out the Order
        let average_orders = {};
        for(let field_name in field_orders) {
            let orders = field_orders[field_name];
            let average_order = orders.reduce((a, b) => a + b) / orders.length;
            average_orders[field_name] = Math.round(average_order);
        }

        // Add Order to Schema Fields
        for(let schema_field of schema_fields) {
            let field_name = schema_field.path;
            let order = average_orders[field_name] || 99;
            schema_field.order = order;
        }

        return schema_fields;

    },

}


module.exports = SchemaMgr;



