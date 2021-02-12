import axios from 'axios';
import _ from 'lodash';
import ConfigService from './ConfigService';

const baseUrl = 'api';

class MongoService {

    static async api_call(method, path, params = {}) {
        // Resolve Connection Id to Connection URL
        if(params.connection_id !== undefined && params.connection_id !== null) {
            params.connection_url = await ConfigService.connection(params.connection_id);
            delete(params.connection_id);
        }

        let res;
        let url = baseUrl + path;

        this.add_token(params);

        if(method == 'get') {
            let data = { params };
            res = await axios.get(url, data);
        }
        else if(method == 'post') {
            res = await axios.post(url, params);
        }
        else if(method == 'delete') {
            res = await axios.delete(url, { data: params });
        }
        return res.data;
    }

    static add_token(params) {
        const token = ConfigService.get('token');
        params.token = token;
        return params;
    }

    static async api(caller, method, fn_name, params = {}) {
        params.connection_id = caller.connection;
        if(caller.database) {
            params.db = caller.database;          
        }
        if(caller.collection) {
            params.coll = caller.collection;
        }
        let path = '/api/' + fn_name;
        return await this.api_call(method, path, params);
    }

    static async get(caller, fn_name, params = {}) {
        return await this.api(caller, 'get', fn_name, params);
    }

    static async post(caller, fn_name, params = {}) {
        return await this.api(caller, 'post', fn_name, params);
    }

    // Get Collections
    static async databases(connection_id) {
        return await this.api_call('get', '/databases', { connection_id });
    }

    // Get Collections
    static async collections(connection_id, db) {
        let collections = await this.api_call('get', '/collections', { connection_id, db });
        collections = _.sortBy(collections, [ 'name' ]);
        return collections;
    }

    static async records(connection_id, db, coll, ctx) {
        let data = { connection_id, db, coll };
        if(ctx) {
            if(ctx.currentPage) {
                data.page = (ctx.currentPage - 1);
            }
            if(ctx.perPage) {
                data.perPage = ctx.perPage;
            }
            if(ctx.query) {
                data.query = JSON.stringify(ctx.query);
            }
            if(ctx.sortBy) {
                let sortdir = 1;
                if(ctx.sortDesc) {
                    sortdir = -1;
                }
                data.sort = {};
                data.sort[ctx.sortBy] = sortdir;
            }
        }
        const result = await this.api_call('post', '/collection/index', data);
        return result;
    }

    static async clear(connection_id, db, coll) {
        return await this.api_call('post', '/collection/clear', { connection_id, db, coll });
    }

    static async drop(connection_id, db, coll) {
        return await this.api_call('post', '/collection/drop', { connection_id, db, coll });
    }

    static async loadSchema(connection_id, db, coll) {
        return await this.api_call('get', '/collection/schema', { connection_id, db, coll });
    }

    static async rebuildSchema(connection_id, db, coll) {
        let rebuild = true;
        return await this.api_call('get', '/collection/schema', { connection_id, db, coll, rebuild });
    }

    static async bulkOps(connection_id, db, coll, ops) {
        return await this.api_call('post', '/collection/bulk', { connection_id, db, coll, ops });
    }

    static async getIndexes(connection_id, db, coll) {
        return await this.api_call('get', '/collection/indexes', { connection_id, db, coll });
    }

    static async deleteIndex(connection_id, db, coll, index_name) {
        return await this.api_call('delete', '/collection/indexes', { connection_id, db, coll, index_name });
    }

    static async fetchDbInfo(connection_id, db) {
        return await this.api_call('get', '/db/info', { connection_id, db });
    }

    static async insertDoc(connection_id, db, coll, doc) {
        return await this.api_call('post', '/collection/insert', { connection_id, db, coll, doc });
    }

    static async delete_records(connection_id, db, coll, query) {
        return await this.api_call('post', '/api/delete_records', { connection_id, db, coll, query });
    }

    static async add_user(username, password, role) {
        return await this.api_call('post', '/add_user', { username, password, role });
    }

}

export default MongoService;
