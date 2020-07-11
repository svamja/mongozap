<template>


<div>

  <b-navbar toggleable="lg" type="light" variant="light" class="py-1">
    <b-navbar-brand href="#">
      MongoZap
      <img alt="Vue logo" src="../assets/mongozap-logo.png" style="height: 1.4em" />

    </b-navbar-brand>
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

  <div class="container">
    <div class="row">
      <div class="col">
        <div class="mt-3 mb-1 small">Made with ❤️ in India</div>
      </div>
    </div>
  </div>

</div>

</template>


