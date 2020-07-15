const Mongo = require('./Mongo');
const _ = require('lodash');
const mongodbSchema = require('mongodb-schema');

const SchemaMgr = {

    async init(schema_db, schema_coll) {
        this.schema_db = schema_db;
        this.schema_coll = schema_coll;
        this.SchemaModel = await Mongo.get(schema_db, schema_coll);
    },

    async rebuild(db, coll) {

        const Model = await Mongo.get(db, coll);
        const sort = { _id: -1 };
        const docs = await Model.find().sort(sort).limit(100).toArray();

        if(!docs || !docs.length) {
            return;
        }

        let options = { storeValues: false };
        let schema = await new Promise(function(resolve, reject) {
            mongodbSchema(docs, options, (err, schema) => resolve(schema) );
        });

        if(!schema || !schema.fields) {
            return;
        }

        // Delete Existing Records
        await this.SchemaModel.deleteMany({ db, coll });

        // Build Fields
        this.depth = 0;
        this.fields = [];
        let fields = this.schema_fields(schema.fields, db, coll);

        // Insert Fields
        await this.SchemaModel.insertMany(fields);

    },

    schema_fields(curr_fields, db, coll) {
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

            // Insert Field
            this.fields.push({ name, path, depth, type, sub_type, db, coll });

            // Document
            if(type == 'Document' && types[0].fields) {
                this.schema_fields(types[0].fields, db, coll);
            }

            // Array of Document
            if(sub_type == 'Document') {
                this.schema_fields(sub_types[0].fields, db, coll);
            }

        }
        this.depth--;
        return this.fields;
    }

}


module.exports = SchemaMgr;



