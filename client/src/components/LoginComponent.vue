<template>


<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Login
      </div>
    </div>
  </div>

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
        <b-button variant="primary" @click="login">Login</b-button>
      </div>
    </div>
  </div>

</div>

</template>

<script>

export default {

  data() {
    return {
      username: '',
      password: '',
      isAuthenticated: false
    }
  },

  async created () {
  },
  
  methods: {

    async login() {
      let authUser = { username: this.username };
      // localStorage.setItem('is_authenticated', 1);
      this.$storage.set('authUser', authUser);
      this.$router.push('/');
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