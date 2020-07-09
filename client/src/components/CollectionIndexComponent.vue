<template>


<div class="container">
  <div class="row">
    <div class="col">
      <router-link to="/databases">
        <span class="text-info">Databases</span>
      </router-link>
      &nbsp;
      <span class="text-muted">&gt;</span>
      <router-link :to="'/database/' + database + '/collections'">
        <span class="text-info">{{ database }}</span>
      </router-link>
      &nbsp;
      <span class="text-muted">&gt; </span>
      <span class="text-muted"> {{ collection }}</span>
    </div>
  </div>
  <div class="row my-2">
    <div class="col">
      <b-form-input v-model="search_text" placeholder="Search"></b-form-input>
    </div>
  </div>
  <div class="row">
    <div class="col-md-3 col-sm-6" v-for="record in records"
      :key="record._id">
        {{ record._id }}
    </div>
  </div>
</div>

</template>

<script>

import ConfigService from '../ConfigService';
import MongoService from '../MongoService';
// import _ from 'lodash';

export default {
  data() {
    return {
      database: '[db]',
      collection: '',
      search_text: '',
      records: [],
    }
  },
  async created () {
    if(this.$route.params.collection) {
      this.$storage.set('collection', this.$route.params.collection);
    }
    this.database = this.$storage.get('database');
    this.collection = this.$storage.get('collection');
    this.records = await MongoService.records(this.database, this.collection);
  },
}


</script>

<style scoped>

</style>
