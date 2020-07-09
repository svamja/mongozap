<template>


<div>

  <b-navbar toggleable="lg" type="light" variant="light">
    <b-navbar-brand href="#">Mongozap</b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item href="#"><router-link to="/">Connections</router-link></b-nav-item>
        <b-nav-item href="#"><router-link to="/databases">Databases</router-link></b-nav-item>
        <b-nav-item href="#"><router-link to="/settings">Settings</router-link></b-nav-item>
      </b-navbar-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
          <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
        </b-nav-form>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>

  <router-view></router-view>

</div>

</template>

<script>

import MongoService from '../MongoService.js';

export default {
    data() {
        return {
            title: 'Mongodb',
            collections: []
        }
    },
    async created() {
        this.collections = await MongoService.collections();
    },
    methods: {

    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
