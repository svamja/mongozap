<template>


<div class="container">
  <div class="row">
    <div class="col h5">
      <span class="text-info">Databases</span>
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
