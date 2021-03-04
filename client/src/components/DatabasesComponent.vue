<template>


<div class="container">

  <div class="row">
    <div class="col">

      <b-button variant="link" to="/">
        <span class="fa fa-home"></span>
      </b-button>
      <span class="text-muted">/</span>
      <b-button variant="link" :to="`/db/${connection}/list`">{{ connection_name }} </b-button>
      <span class="text-muted">/</span>
      Databases
    </div>
    <div class="col-auto my-auto pl-0 ml-auto">
      <a class="ml-2" v-shortkey.once="['r']"
        @shortkey="reload()" href="#" @click.stop.prevent="reload()"
        v-b-tooltip.hover title="Reload (r)">
        <span class="fa fa-sync"></span>
      </a>
    </div>
  </div>

  <!-- Search Bar -->
  <div class="row my-2">
    <div class="col">
      <form @submit.prevent="endSearch">
        <b-form-input v-model="search_text" placeholder="Search (/)" v-shortkey.focus="['/']"></b-form-input>
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
import ConfigService from '../ConfigService';

export default {
    data() {
      return {
        connection: '',
        databases: [],
        connection_name: '',
        search_text: '',
      }
    },
    async created() {
      this.connection = this.$route.params.connection;
      let connections = await ConfigService.getConnections();
      if(connections) {
        this.connection_name = connections[this.connection].name;
      }
      await this.reload(true);
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

      async reload(useCache = false) {
        this.databases = await this.getCacheDatabases(useCache);
      },

      async getCacheDatabases(useCache) {
        let cache_key = 'dbs:' + this.connection;
        let databases;
        if(useCache) {
          databases = ConfigService.get(cache_key);
        }
        if(!databases) {
          databases = await MongoService.get(this, 'databases');
          ConfigService.set(cache_key, databases);
        }
        return databases;
      },

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
