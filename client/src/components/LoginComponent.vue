<template>


<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Login
      </div>
    </div>
  </div>

  <div v-if="error" class="container">
    <div class="row my-2">
      <div class="col text-danger">
        {{ error }}
      </div>
    </div>
  </div>

  <form @submit.prevent="login">
    <div class="container table-container">

      <div class="row">
        <div class="col">
          Username
        </div>
        <div class="col">
          <input class="form-input" type="text" v-model="username" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          Password
        </div>
        <div class="col">
          <input class="form-input" type="password" v-model="password" />
        </div>
      </div>

    </div>

    <div class="container mt-3">
      <div class="row justify-content-end">
        <div class="col-auto">
          <b-button variant="primary" type="submit" @click.prevent="login">Login</b-button>
        </div>
      </div>
    </div>

    <div class="container mt-3">
      <div class="row justify-content-end">
        <div class="col-auto">
          <a :href="googleLoginUrl">Google Login</a>
        </div>
      </div>
    </div>

  </form>

</div>

</template>

<script>

import MongoService from '../MongoService';
import ConfigService from '../ConfigService';
import queryString from 'query-string';

export default {

  data() {
    return {
      username: '',
      password: '',
      error: '',
      googleLoginUrl: '',
      isAuthenticated: false
    }
  },

  async created () {
    await this.google_auth_init();
  },
  
  methods: {

    async login() {
      let authUser = { username: this.username };
      let result = await MongoService.post(this, 'login', { username: this.username, password: this.password });
      if(result.status == 'success' && result.user) {
        ConfigService.set('token', result.token, { ttl: 30*24*3600*1000 });
        ConfigService.set('authUser', result.user, { ttl: 30*24*3600*1000 });
        window.location = '/';
      }
      else if(result.status == 'error') {
        this.error = 'Username / Password Invalid';
      }
      else {
        this.error = 'Server/Network Error: Unable to Login';
      }
    },

    async google_auth_init() {
      this.serverSettings = await ConfigService.getServerSettings();
      const domain = window.location.href.split('/').slice(0, 3).join('/');
      const redirect_uri = domain + '/api/google/auth/login';
      const stringifiedParams = queryString.stringify({
        client_id: this.serverSettings.google_client_id,
        redirect_uri,
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/spreadsheets',
        ].join(' '),
        response_type: 'code',
        access_type: 'offline',
      });
      console.log('google auth init', redirect_uri);
      this.googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
    },


  },

}


</script>


<style scoped>

.table-container .col {
  padding-top: 0.5em;
  padding-bottom: 0.5em;
}

</style>

