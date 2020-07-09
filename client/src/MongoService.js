// import axios from 'axios';

// const baseUrl = '/api';

class MongoService {

    // Get Collections
    static async collections() {
        // const res = axios.get(url);
        // return res.data;
        return [
            { name: 'posts' },
            { name: 'users' }
        ];
    }

}

export default MongoService;