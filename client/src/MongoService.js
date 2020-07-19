import axios from 'axios';
import _ from 'lodash';
import ConfigService from './ConfigService';

const baseUrl = 'api';

class MongoService {

    static async api_call(method, path, params) {

        // Resolve Connection Id to Connection URL
        if(params.connection_id) {
            let connections = ConfigService.get('connections');
            if(connections[params.connection_id]) {
                params.connection_url = connections[params.connection_id].url;
            }
            delete(params.connection_id);
        }

        let res;
        let url = baseUrl + path;

        if(method == 'get') {
            let data = { params };
            res = await axios.get(url, data);
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

    static async records(db, coll, ctx) {
        let url = baseUrl + `/collection/index?db=${db}&coll=${coll}`;
        let data = {};
        if(ctx) {
            if(ctx.currentPage) {
                url += '&page=' + (ctx.currentPage - 1);
            }
            if(ctx.perPage) {
                url += '&perPage=' + ctx.perPage;
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
        const res = await axios.post(url, data);
        const result = res.data;
        return result;
    }

    static async clear(db, coll) {
        let url = baseUrl + `/collection/clear`;
        const data = { db, coll };
        const res = await axios.post(url, data);
        return res.data;
    }

    static async drop(db, coll) {
        let url = baseUrl + `/collection/drop`;
        const data = { db, coll };
        const res = await axios.post(url, data);
        return res.data;
    }

    static async loadSchema(db, coll) {
        let url = baseUrl + `/collection/schema?db=${db}&coll=${coll}`;
        const res = await axios.get(url);
        return res.data;
    }

    static async rebuildSchema(db, coll) {
        let url = baseUrl + `/collection/schema`;
        let data = { db, coll, rebuild: true };
        const res = await axios.post(url, data);
        return res.data;
    }

    static async bulkOps(db, coll, ops) {
        let url = baseUrl + '/collection/bulk';
        let data = { db, coll, ops };
        const res = await axios.post(url, data);
        return res.data;
    }

    static async configGet() {
        let url = baseUrl + `/config/get`;
        const res = await axios.get(url);
        return res.data;
    }

    static async configSet(settings) {
        let url = baseUrl + `/config/set`;
        let data = { settings };
        let res = await axios.post(url, data);
        return res;
    }

    static async fetchDbInfo(db) {
        let url = baseUrl + `/db/info?db=${db}`;
        const res = await axios.get(url);
        return res.data;
    }

}

export default MongoService;
