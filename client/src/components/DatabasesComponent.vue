<template>


<div class="container">

  <div class="row">
    <div class="col">

      <b-button variant="link" to="/">conns</b-button>
      <span class="text-muted">/</span>
      <b-button variant="link" :to="`/db/${connection}/list`">{{ parseInt(connection) + 1 }} </b-button>
      <span class="text-muted">/</span>
      Databases
    </div>
  </div>

  <!-- Search Bar -->
  <div class="row my-2">
    <div class="col">
      <form @submit.prevent="endSearch">
        <b-form-input v-model="search_text" placeholder="Search" autofocus></b-form-input>
      </form>
    </div>
  </div>

  <!-- List of databases -->
  <div class="row">
    <div class="col">
      <div v-for="database in filtered_databases" :key="database.name">
        <router-link :to="'/db/' + connection + '/' + database.name + '/index'">
          {{ database.name }}
        </router-link>

      </div>
    </div>
  </div>


</div>

</template>

<script>

import MongoService from '../MongoService';

export default {
    data() {
      return {
        connection: '',
        databases: [],
        search_text: '',
      }
    },
    async created() {
      this.connection = this.$route.params.connection;
      this.databases = await MongoService.databases(this.connection);
    },
    computed: {
      filtered_databases() {
        if(!this.search_text || !this.search_text.trim()) {
          return this.databases;
        }
        let chars = this.search_text.trim().split('');
        let expression = '^' + chars.join('.*');
        return this.databases.filter(x => x.name.match(new RegExp(expression, 'i')));
      }
    },
    methods: {
      endSearch() {
        if(this.filtered_databases.length) {
          let database = this.filtered_databases[0];
          if(this.filtered_databases.length > 1) {
            let search_alpha = this.search_text.toLowerCase().replace(/[^a-z]/g, '');
            for(let index in this.filtered_databases) {
              let db = this.filtered_databases[index];
              let alpha = db.name.toLowerCase().replace(/[^a-z]/g, '');
              if(alpha == search_alpha) {
                database = db;
                break;
              }
            }
          }
          this.$router.push('/db/' + this.connection + '/' + database.name + '/index');
        }
      },
    }
}

</script>

<style scoped>

</style>
