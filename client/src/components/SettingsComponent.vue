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
        <div id="google-signin-button"></div>
        <button id="signinButton" @click="googleSignInClick">Sign in with Google</button>

      </div>
    </div>

  </div>

</div>

</template>

<script>

import ConfigService from '../ConfigService';
import MongoService from '../MongoService';


export default {

  data() {
    return {
      collection_display: '',
      records_display_default: '',
      serverSettings: {},
      uiSettings: {},
      auth2: null,
    }
  },

  mounted() {
    window.addEventListener('gapiloadevent', this.gapiLoaded, false);
  },

  async created () {
    this.collection_display = ConfigService.get('collection_display') || 'name';
    this.records_display_default = ConfigService.get('records_display_default') || 'table';
    this.uiSettings = ConfigService.get('uiSettings');
    await this.loadServerSettings();
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

    gapiLoaded(e) {

      const scope = [
        'profile', 'email',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
      ].join(' ');
      const client_id = process.env.GOOGLE_CLIENT_ID;

      window.gapi.load('auth2', function() {
        window.auth2 = window.gapi.auth2.init({ client_id, scope });
      });

    },

    googleSignInClick() {
      window.auth2.grantOfflineAccess().then(this.onGoogleSignIn);
    },

    async onGoogleSignIn (authResult) {
      const code = authResult.code;
      const result = await MongoService.post(this, 'google_auth', { code });
    }

  },

}


</script>

