const Mongo = require('./Mongo');

const SettingsMgr = {

    settings: {
      settings_database: process.env.SETTINGS_DB,
      settings_collection: process.env.SETTINGS_COLL
    },

    loaded: false,

    async loadSettings(reload = false) {
      if(!reload && this.loaded) {
        return;
      }
      this.Settings = this.Settings || await Mongo.get(process.env.SETTINGS_DB, process.env.SETTINGS_COLL);
      let records = await this.Settings.find().toArray();
      for(let record of records) {
        let key = record.key
        let value = record.value;
        this.settings[key] = value;
      }
      this.loaded = true;
    },

    async get(key) {
        await this.loadSettings();
        return this.settings[key];
    },

    async getAll() {
        await this.loadSettings();
        return this.settings;
    },

    async set(key, value) {
      this.Settings = this.Settings || await Mongo.get(process.env.SETTINGS_DB, process.env.SETTINGS_COLL);
      this.Settings.updateOne(
        { key }, { key, value }, { upsert: true }
      );
    },

    async setAll(settings) {
      this.Settings = this.Settings || await Mongo.get(process.env.SETTINGS_DB, process.env.SETTINGS_COLL);
      await this.Settings.deleteMany();
      let records = [];
      for(let key in settings) {
        let value = settings[key];
        records.push({ key, value });
      }
      await this.Settings.insertMany(records);
      await this.loadSettings(true);
    },

}


module.exports = SettingsMgr;



