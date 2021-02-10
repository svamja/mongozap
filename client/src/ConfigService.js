import Vue from 'vue';
import MongoService from './MongoService';

const ConfigService = {

    serverSettings: {},

    // Get Collections
    get(key) {
        const defaults = {
            collection_display: 'name',
            uiSettings : {
                stickyTableHeight: '80vh',
            },
        };
        let result = Vue.$storage.get(key);
        result = result || defaults[key];
        return result;
    },

    set(key, val, options = {}) {
        options.ttl = options.ttl || 24*3600*1000;
        Vue.$storage.set(key, val, options);
    },

    async getServerSettings() {
      this.serverSettings = await MongoService.getServerSettings();
      return this.serverSettings;
    },

    async setServerSettings(settings) {
        this.serverSettings = await MongoService.setServerSettings(settings);
    },

    async setConnections(connections) {
        this.serverSettings.connections = connections;
        this.serverSettings = await this.setServerSettings(this.serverSettings);
    },

    async getConnections() {
        this.serverSettings = await this.getServerSettings();
        return this.serverSettings['connections'] || [];
    },

    async connection(id) {
        if(!this.serverSettings.default_connection) {
            await this.getServerSettings();
        }
        if(id == 0) {
            return this.serverSettings.default_connection;
        }
        else {
            return this.serverSettings.connections[id - 1].url;
        }
    }

}

export default ConfigService;
