import axios from 'axios';
import _ from 'lodash';
import ConfigService from './ConfigService';

const baseUrl = 'api';

/*
    Wrapper Class for all the API calls to Server.
    Provides easy "get" and "post" methods to make calls to ApiController
    on the Server side.
*/

class MongoService {

    static async api_call(method, path, params = {}) {
        // Resolve Connection Id to Connection URL
        if(params.connection_id !== undefined && params.connection_id !== null) {
            params.connection_url = await ConfigService.connection(params.connection_id);
            delete(params.connection_id);
        }

        let res;
        let url = baseUrl + path;

        const headers = this.get_headers();

        if(method == 'get') {
            let data = { params, headers };
            res = await axios.get(url, data);
        }
        else if(method == 'post') {
            res = await axios.post(url, params, { headers });
        }
        else if(method == 'delete') {
            res = await axios.delete(url, { headers, data: params });
        }
        return res.data;
    }

    static get_headers() {
        const token = ConfigService.get('token');
        const headers = { Authorization: `Bearer ${token}` };
        return headers;
        
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

    static async records(dbpath, ctx) {
        let params = {};
        if(ctx) {
            if(ctx.currentPage) {
                params.page = (ctx.currentPage - 1);
            }
            if(ctx.perPage) {
                params.perPage = ctx.perPage;
            }
            if(ctx.query) {
                params.query = JSON.stringify(ctx.query);
            }
            if(ctx.sortBy) {
                let sortdir = 1;
                if(ctx.sortDesc) {
                    sortdir = -1;
                }
                params.sort = {};
                params.sort[ctx.sortBy] = sortdir;
            }
            params.limit = ctx.limit || 0;
        }
        const result = await this.post(dbpath, 'list_documents', params);
        return result;
    }

}

export default MongoService;
