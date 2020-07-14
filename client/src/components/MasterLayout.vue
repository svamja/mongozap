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

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
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
        <div class="mt-3 mb-1 small">Made with ❤️ in India</div>
      </div>
    </div>
  </div>

</div>

</template>

<style>

.content-wrapper {
  min-height: 80vh;
}

</style>
