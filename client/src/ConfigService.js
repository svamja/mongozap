import Vue from 'vue'

class ConfigService {

    // Get Collections
    static get(key) {
        const defaults = {
            'collection_display': 'model_name'
        };
        let result = Vue.$storage.get(key);
        result = result || defaults[key];
        return result;
    }

    static set(key, val) {
        Vue.$storage.set(key, val);
    }

}

export default ConfigService;
