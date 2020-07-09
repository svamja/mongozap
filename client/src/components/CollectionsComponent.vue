<template>


<div class="container">
  <div class="row">
    <div class="col">
      {{ database }} &gt; Collections
      <div v-for="collection in collections"
        :key="collection.name"
        @click="selectDb(collection)">
        {{ collection.name }}
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
      database: '[db]',
      collections: []
    }
  },
  async created () {
    this.database = this.$storage.get('database');
    this.collections = await MongoService.collections(this.database);
  },
}


</script>

<style scoped>

</style>
