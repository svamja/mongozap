const Mongo = require('./Mongo');

const SettingsMgr = {

    settings: {
      default_connection: process.env.DEFAULT_CONNECTION,
      mongozap_database: process.env.MONGOZAP_DATABASE,
      connections: [],
    },

    loaded: false,

    async init_model() {
      this.SettingsModel = this.SettingsModel || await Mongo.get(this.settings.default_connection, this.settings.mongozap_database, 'settings');
    },

    async loadFromDatabase() {
      await this.init_model();
      let records = await this.SettingsModel.find().toArray();
      for(let record of records) {
        let key = record.key
        let value = record.value;
        if(key != 'default_connection' && key != 'mongozap_database') {
          this.settings[key] = value;
        }
      }
      this.loaded = true;
      return this.settings;
    },

    async read() {
      await this.init_model();
      if(!this.loaded) {
        await this.loadFromDatabase();
      }
      return this.settings;
    },

    async write(settings) {
      await this.init_model();
      await this.SettingsModel.deleteMany();
      let records = [];
      for(let key in settings) {
        let value = settings[key];
        records.push({ key, value });
      }
      await this.SettingsModel.insertMany(records);
      await this.loadFromDatabase();
    },

    async get(key) {
      await this.loadFromDatabase();
      return this.settings[key];
    }

}


module.exports = SettingsMgr;



