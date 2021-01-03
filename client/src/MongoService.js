import axios from 'axios';
import _ from 'lodash';
import ConfigService from './ConfigService';

const baseUrl = 'api';

class MongoService {

    static async api_call(method, path, params = {}) {

        // Resolve Connection Id to Connection URL
        if(params.connection_id) {
            params.connection_url = await ConfigService.connection(params.connection_id);
            delete(params.connection_id);
        }

        let res;
        let url = baseUrl + path;

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
        return res;
    }

    // Get Collections
    static async databases(connection_id) {
        const res = await this.api_call('get', '/databases', { connection_id });
        return res.data;
    }

    // Get Collections
    static async collections(connection_id, db) {
        const res = await this.api_call('get', '/collections', { connection_id, db })
        // const url = baseUrl + `/collections?db=${db}`;
        // const res = await axios.get(url);
        let collections = res.data;
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
        const res = await this.api_call('post', '/collection/index', data);
        const result = res.data;
        return result;
    }

    static async clear(connection_id, db, coll) {
        const res = await this.api_call('post', '/collection/clear', { connection_id, db, coll });
        return res.data;
    }

    static async drop(connection_id, db, coll) {
        const res = await this.api_call('post', '/collection/drop', { connection_id, db, coll });
        return res.data;
    }

    static async loadSchema(connection_id, db, coll) {
        const res = await this.api_call('get', '/collection/schema', { connection_id, db, coll });
        return res.data;
    }

    static async rebuildSchema(connection_id, db, coll) {
        let rebuild = true;
        const res = await this.api_call('get', '/collection/schema', { connection_id, db, coll, rebuild });
        return res.data;
    }

    static async bulkOps(connection_id, db, coll, ops) {
        const res = await this.api_call('post', '/collection/bulk', { connection_id, db, coll, ops });
        return res.data;
    }

    static async getIndexes(connection_id, db, coll) {
        const res = await this.api_call('get', '/collection/indexes', { connection_id, db, coll });
        return res.data;
    }

    static async deleteIndex(connection_id, db, coll, index_name) {
        const res = await this.api_call('delete', '/collection/indexes', { connection_id, db, coll, index_name });
        return res.data;
    }

    static async getServerSettings() {
        const res = await this.api_call('get', '/settings/get');
        return res.data;
    }

    static async setServerSettings(settings) {
        const res = await this.api_call('post', '/settings/set', { settings });
        return res;
    }

    static async fetchDbInfo(connection_id, db) {
        const res = await this.api_call('get', '/db/info', { connection_id, db });
        return res.data;
    }

    static async insertDoc(connection_id, db, coll, doc) {
        const res = await this.api_call('post', '/collection/insert', { connection_id, db, coll, doc });
        return res.data;
    }

    static async deleteRecords(connection_id, db, coll, query) {
        const res = await this.api_call('post', '/collection/delete', { connection_id, db, coll, query });
        return res.data;
    }

    static async login(username, password) {
        const res = await this.api_call('post', '/login', { username, password });
        return res.data;
    }

}

export default MongoService;
