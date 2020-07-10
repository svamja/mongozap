<template>


<div class="container">
  <div class="row">
    <div class="col">
      <b-button class="ml-0 pl-0" variant="link" to="/databases">Databases</b-button>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <div v-for="database in databases" :key="database.name">
        <router-link :to="'/database/' + database.name + '/collections'">
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
            databases: []
        }
    },
    async created() {
        this.databases = await MongoService.databases();
    },
    methods: {
        async selectDb(database) {
            console.log(`setting db ${database.name}`);
            this.$storage.set('database', database.name);
        }
    }
}

</script>

<style scoped>

</style>
