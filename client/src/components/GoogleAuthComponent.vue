<template>


<div>

  <div class="container my-3">
    <div class="row border border-round">
      <div class="col p-3 text-center">
        <div class="h3">
          Completing Google {{ this.mode == 'login' ? 'Login' : 'Connect' }}..
        </div>
        <div class="text-danger">
          {{ error }}
        </div>
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
      mode: '',
      error: ''
    }
  },


  async created () {
    this.mode = this.$route.params.mode;
    if(this.mode == 'login') {
      await this.login();
    }
    else {
      const authUser = ConfigService.get('authUser');
      const username = authUser.username;
      await MongoService.get(this, 'google_connect', { username });
      this.$router.push(`/settings`);
    }
  },
  
  methods: {
    async login() {
      let result = await MongoService.get(this, 'google_login');
      if(result.status == 'success' && result.user) {
        ConfigService.set('token', result.token, { ttl: 30*24*3600*1000 });
        ConfigService.set('authUser', result.user, { ttl: 30*24*3600*1000 });
        window.location = '/';
      }
      else if(result.status == 'error') {
        this.error = 'Invalid User';
      }
      else {
        this.error = 'Server/Network Error: Unable to Login';
      }
    },
  },

}


</script>

