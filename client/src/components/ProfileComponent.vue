<template>


<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        My Profile
      </div>
    </div>
  </div>

  <div class="container table-container">

    <div class="row">
      <div class="col">
        Username
      </div>
      <div class="col">
        {{ user.username }}
      </div>
    </div>

    <div class="row">
      <div class="col">
        Google Connect
      </div>
      <div class="col">
        <div v-if="user.google_token">
          <div> Token Present </div>
          <div> Expiry: {{ user.google_token.expiry_date | time_format }} </div>
          <div> Long-Term Validity: 
              <span v-if="user.google_token.refresh_token"> Yes </span>
              <span v-else> No </span>
          </div>
          <a :href="googleLoginUrl">Re-Connect</a>
        </div>
        <div v-else>
          <a :href="googleLoginUrl">Google Connect</a>
        </div>
      </div>
    </div>

  </div>


</div>

</template>

<script>

import moment from 'moment';
import ConfigService from '../ConfigService';
import MongoService from '../MongoService';
import queryString from 'query-string';
const caller = { connection: 0, database: '_mongozap', collection: 'users' };

export default {

  data() {
    return {
      serverSettings: {},
      user: {},
      auth2: null,
      googleLoginUrl: '',
    }
  },

  async created () {
    await this.loadProfile();
    await this.loadServerSettings();
    this.google_auth_init();
  },
  
  methods: {

    async loadProfile() {
      let result = await MongoService.get(this, 'get_profile');
      if(result && result.user) {
        this.user = result.user;
      }
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

  filters: {
    time_format(timestamp) {
      return moment(timestamp).format('MMM DD, YYYY hh:mm a')
    },
  },


}


</script>

