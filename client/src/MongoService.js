import axios from 'axios';
import _ from 'lodash';

const baseUrl = 'api';

class MongoService {

    // Get Collections
    static async databases() {
        const url = baseUrl + '/databases';
        const res = await axios.get(url);
        return res.data;
    }

    // Get Collections
    static async collections(db) {
        const url = baseUrl + `/collections?db=${db}`;
        const res = await axios.get(url);
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

}

export default MongoService;
