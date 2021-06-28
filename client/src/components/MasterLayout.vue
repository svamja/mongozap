<template>


<div>

  <b-navbar toggleable="lg" type="light" variant="light" class="py-1">
    <b-navbar-brand href="#">
      MongoZap
      <img alt="Vue logo" src="../assets/mongozap-logo.png" style="height: 1.4em" />
    </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav v-if="username">
        <b-nav-item href="#"><router-link to="/">Connections</router-link></b-nav-item>
        <b-nav-item href="#"><router-link to="/db/0/list">Databases</router-link></b-nav-item>
        <b-nav-item href="#"><router-link to="/settings">Settings</router-link></b-nav-item>
        <b-nav-item href="#" v-if='is_allowed_users'>
          <router-link to="/users">Users</router-link>
        </b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="username">
          <router-link to="/profile">{{ username }}</router-link>
          (<a href="#" @click="logout">Logout</a>)
        </b-nav-item>
        <b-nav-item v-else>
          <router-link to="/login">Login</router-link>
        </b-nav-item>
        <b-nav-item href="https://github.com/svamja/mongozap" target="_blank">
          <img alt="Vue logo" src="../assets/github-logo.png" style="height: 1.4em" />
        </b-nav-item>
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>

  <div class="content-wrapper">
    <router-view></router-view>
  </div>

  <div class="container">
    <div class="row">
      <div class="col">
        <div class="mt-3 mb-1 small">Made with <span style="color: #e25555;">&#9829;</span> in India</div>
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
      connection: '',
      database: '',
      collection: '',
      username: '',
      is_allowed_users: false,
    }
  },
  async created () {
    this.connection = this.$route.params.connection;
    this.database = this.$route.params.database;

    let authUser = ConfigService.get('authUser');
    if(authUser && authUser.role === 'admin') {
      this.is_allowed_users = true;
    }
    if(authUser && authUser.username) {
      this.username = authUser.username;
    }
  },
  methods: {
    async logout() {
      this.$storage.remove('authUser');
      this.$storage.remove('token');
      this.$router.push('/login');
      window.location.reload();
    }
  }
}

</script>


<style>

.content-wrapper {
  min-height: 80vh;
}

</style>
