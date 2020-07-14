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
        }
        const res = await axios.post(url, data);
        const records = res.data;
        return records;
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

}

export default MongoService;