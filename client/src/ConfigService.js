import Vue from 'vue';
import MongoService from './MongoService';

const ConfigService = {

    server: {},

    // Get Collections
    get(key) {
        const defaults = {
            'collection_display': 'model_name'
        };
        let result = Vue.$storage.get(key);
        result = result || defaults[key];
        return result;
    },

    set(key, val) {
        Vue.$storage.set(key, val);
    },

    async getServerSettings(reload) {
        await this.loadServerSettings(reload);
        return this.server;
    },

    async loadServerSettings(reload = false) {
      if(!reload && this.server && Object.keys(this.server).length) {
        return;
      }
      this.server = await MongoService.configGet();
    },

    async saveServerSettings(settings) {
        await MongoService.configSet(settings);
        this.server = await MongoService.configGet();
    },

}

export default ConfigService;
