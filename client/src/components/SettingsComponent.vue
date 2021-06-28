<template>


<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        UI Settings
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
        Sticky Table Height
      </div>
      <div class="col p-1">
        <b-form-input v-model="uiSettings.stickyTableHeight" />&nbsp;
        <div>
          Height of Sticky Table as Valid CSS.<br/>
          To turn off Sticky Table, enter "false".<br/>
          Default: "80vh"
        </div>
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

  <!-- Server Settings -->
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
        Default Connection
        <div class="small">process.env.DEFAULT_DATABASE <br/> (see .env file)</div>
      </div>
      <div class="col p-1">
        <b-form-input v-model="serverSettings.default_connection" readonly></b-form-input>
      </div>
    </div>

    <div class="row">
      <div class="col">
        Mongozap Database
        <div class="small">process.env.MONGOZAP_DATABASE <br/> (see .env file)</div>
      </div>
      <div class="col p-1">
        <b-form-input v-model="serverSettings.mongozap_database" readonly></b-form-input>
      </div>
    </div>

    <div class="row">
      <div class="col">
        Google Client Id
        <div class="small">process.env.GOOGLE_CLIENT_ID <br/> (see .env file)</div>
      </div>
      <div class="col p-1">
        <b-form-input v-model="serverSettings.google_client_id" readonly></b-form-input>
      </div>
    </div>


  </div>

  <!-- Miscellaneous Settings -->
  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Miscellaneous
      </div>
    </div>
  </div>

  <div class="container table-container">
    <div class="row">
      <div class="col">
        Google Connect (Sheet Export)
      </div>
      <div class="col p-1">
        <a :href="googleLoginUrl">Google Connect</a>
      </div>
    </div>

  </div>

</div>

</template>

<script>

import ConfigService from '../ConfigService';
import MongoService from '../MongoService';
import queryString from 'query-string';


export default {

  data() {
    return {
      collection_display: '',
      records_display_default: '',
      serverSettings: {},
      uiSettings: {},
      auth2: null,
      googleLoginUrl: '',
    }
  },

  async created () {
    this.collection_display = ConfigService.get('collection_display') || 'name';
    this.records_display_default = ConfigService.get('records_display_default') || 'table';
    this.uiSettings = ConfigService.get('uiSettings');
    await this.loadServerSettings();
    this.google_auth_init();
  },
  
  methods: {

    saveClientSettings() {
      ConfigService.set('uiSettings', this.uiSettings);
      ConfigService.set('collection_display', this.collection_display);
      ConfigService.set('records_display_default', this.records_display_default);
    },

    async loadServerSettings() {
      this.serverSettings = await ConfigService.getServerSettings();
    },

    google_auth_init() {
      const domain = window.location.href.split('/').slice(0, 3).join('/')
      const stringifiedParams = queryString.stringify({
        client_id: this.serverSettings.google_client_id,
        redirect_uri: domain + '/api/google/auth/connect',
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/spreadsheets',
        ].join(' '),
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent'
      });
      this.googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
    },

  },

}


</script>

