import axios from 'axios';
const baseUrl = 'http://localhost:3183/api';

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
        return res.data;
    }
}

export default MongoService;