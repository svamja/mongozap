<template>


<div>


  <div class="container">
    <div class="row mt-3">
      <div class="col h4">
        Users
      </div>
    </div>
  </div>
  <div class="container table-container">
    <div class="row" v-for="user of users" :key="user.username">
      <div class="col">
        {{ user.username }}
      </div>
      <div class="col">
        {{ user.role }}
      </div>
    </div>
  </div>



  <div class="container">
    <div class="row mt-5">
      <div class="col h4">
        Create User
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

  <div v-if="message" class="container">
    <div class="row my-2">
      <div class="col text-success">
        {{ message }}
      </div>
    </div>
  </div>

  <form @submit.prevent="add_user">
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

      <div class="row">
        <div class="col">
          Role
        </div>
        <div class="col">
          <select class="form-conotr" v-model="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

    </div>


    <div class="container mt-3">
      <div class="row justify-content-end">
        <div class="col-auto">
          <b-button variant="primary" type="submit" @click.prevent="create_user">Create User</b-button>
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
      users:[],
      username: '',
      password: '',
      role: 'user',
      error: '',
      message: ''
    }
  },

  async created () {
    await this.reload();
  },
  
  methods: {

    async reload() {
      let dbpath = { connection: 0, database: '_mongozap', collection: 'users' };
      let result = await MongoService.records(dbpath);
      this.users = result.records;
    },

    async create_user() {
      let authUser = { username: this.username };
      let result = await MongoService.add_user(this.username, this.password, this.role);
      if(result.status == 'success') {
        this.username = '';
        this.password = '';
        this.message = 'User created! Reloading..';
        await this.reload();
        return;
      }
      else if(result.status == 'error') {
        if(result.sub_status === 'short_password') {
          this.error = 'Password is Too Short';
        }
        else if(result.sub_status === 'missing_field') {
          this.error = 'Username / Password Missing';
        }
        else if(result.sub_status === 'existing_user') {
          this.error = 'Username Exists!';
        }
        else {
          this.error = 'Username / Password Invalid';
        }
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


