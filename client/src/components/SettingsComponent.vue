<template>


<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Client Settings
      </div>
    </div>
  </div>

  <div class="container table-container">

    <div class="row">
      <div class="col">
        Collection Display
      </div>
      <div class="col">
        <input type="radio" value="name" v-model="collection_display" />&nbsp;
        <label for="one">By Name</label>
        <br />
        <input type="radio" value="model_name" v-model="collection_display" />&nbsp;
        <label for="two">By Model Name</label>
      </div>
    </div>

    <div class="row">
      <div class="col">
        Records Display Default (TBD)
      </div>
      <div class="col">
        <input type="radio" value="table" v-model="records_display_default" />&nbsp;
        <label for="one">Tabular</label>
        <br />
        <input type="radio" value="json" v-model="records_display_default" />&nbsp;
        <label for="two">JSON</label>
      </div>
    </div>

  </div>

  <div class="container mt-3">
    <div class="row justify-content-end">
      <div class="col-auto">
        <b-button variant="primary" @click="saveClientSettings">Save</b-button>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Server Settings
      </div>
    </div>
  </div>


  <div class="container table-container">

    <div class="row">
      <div class="col">
        Settings Database
      </div>
      <div class="col p-1">
        <b-form-input v-model="settings_database"></b-form-input>
      </div>
    </div>

    <div class="row">
      <div class="col">
        Settings Collection
      </div>
      <div class="col p-1">
        <b-form-input v-model="settings_collection"></b-form-input>
      </div>
    </div>

    <div class="row">
      <div class="col">
        Schema Database
      </div>
      <div class="col p-1">
        <b-form-input v-model="schema_database"></b-form-input>
      </div>
    </div>

    <div class="row">
      <div class="col">
        Schema Collection
      </div>
      <div class="col p-1">
        <b-form-input v-model="schema_collection"></b-form-input>
      </div>
    </div>

  </div>

  <div class="container mt-3">
    <div class="row justify-content-end">
      <div class="col-auto">
        <b-button variant="primary" @click="saveServerSettings">Save</b-button>
      </div>
    </div>
  </div>


</div>

</template>

<script>

import ConfigService from '../ConfigService';

export default {
  data() {
    return {
      collection_display: '',
      records_display_default: '',
      settings_database: '',
      settings_collection: '',
      schema_database: '',
      schema_collection: '',
    }
  },
  async created () {
    this.collection_display = ConfigService.get('collection_display') || 'name';
    this.records_display_default = ConfigService.get('records_display_default') || 'table';
    this.settings_database = ConfigService.get('settings_database') || 'mongozap';
    this.settings_collection = ConfigService.get('settings_collection') || 'settings';
    this.schema_database = ConfigService.get('schema_database') || 'mongozap';
    this.schema_collection = ConfigService.get('schema_collection') || 'schema_fields';
  },
  
  methods: {
    saveClientSettings: function() {
      ConfigService.set('collection_display', this.collection_display);
      ConfigService.set('records_display_default', this.records_display_default);
      ConfigService.set('setttings_database', this.setttings_database);
      ConfigService.set('setttings_collection', this.setttings_collection);
    },
  },

}


</script>

<style scoped>

.table-container .row {
  border-top: solid 1px #ccc;
}
.table-container .row:last-child {
  border-bottom: solid 1px #ccc;
}

</style>
