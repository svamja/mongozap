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

    async getServerSettings(useCache = true) {
        let settings;
        if(useCache) {
            settings = this.get('server_settings');
        }
        if(!settings) {
            settings = await MongoService.get({}, 'settings_get');
            this.set('server_settings', settings);
        }
        this.serverSettings = settings;
        return settings;
    },

    async setServerSettings(settings) {
        this.serverSettings = await MongoService.post({}, 'settings_set', { settings });
        this.set('server_settings', this.serverSettings);
    },

    async setConnections(connections) {
        let default_connection = connections.shift();
        this.serverSettings.connections = connections;
        await this.setServerSettings(this.serverSettings);
        connections.unshift(default_connection);
    },

    async getConnections(useCache = true) {
        let settings = await this.getServerSettings(useCache);
        let connections = settings['connections'] || [];
        connections.unshift({ name: 'Default', url: settings.default_connection });
        return connections;
    },

    async connection(id) {
        let connections = await this.getConnections();
        return connections[id].url;
    }

}

export default ConfigService;
