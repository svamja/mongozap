<template>


<div>

  <b-navbar toggleable="lg" type="light" variant="light">
    <b-navbar-brand href="#">MongoZap</b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item href="#"><router-link to="/">Connections</router-link></b-nav-item>
        <b-nav-item href="#"><router-link to="/databases">Databases</router-link></b-nav-item>
        <b-nav-item href="#"><router-link to="/collections">Collections</router-link></b-nav-item>
        <b-nav-item href="#"><router-link to="/settings">Settings</router-link></b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>

  <router-view></router-view>

</div>

</template>

<script>

</script>

<style scoped>

</style>
