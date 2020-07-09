<template>


<div class="container">
  <div class="row">
    <div class="col">
      Databases
      <div v-for="database in databases"
        :key="database.name"
        @click="selectDb(database)">
        {{ database.name }}
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
