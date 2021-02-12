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
  </form>

</div>

</template>

<script>

import MongoService from '../MongoService';
import ConfigService from '../ConfigService';

export default {

  data() {
    return {
      username: '',
      password: '',
      error: '',
      isAuthenticated: false
    }
  },

  async created () {
  },
  
  methods: {

    async login() {
      let authUser = { username: this.username };
      let result = await MongoService.post(this, 'login', { username: this.username, password: this.password });
      console.log('login result', result);
      if(result.status == 'success' && result.user) {
        ConfigService.set('token', result.token, { ttl: 30*24*3600*1000 });
        ConfigService.set('authUser', result.user, { ttl: 30*24*3600*1000 });
        window.location = '/login';
      }
      else if(result.status == 'error') {
        this.error = 'Username / Password Invalid';
      }
      else {
        this.error = 'Server/Network Error: Unable to Login';
      }
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

