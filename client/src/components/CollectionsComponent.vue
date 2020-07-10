<template>


<div class="container">

  <div class="row">
    <div class="col">
      <b-button class="ml-0 pl-0" variant="link" to="/databases">Databases</b-button>
      <span class="text-muted">/</span>
      <b-button variant="link">{{ database }}</b-button>
      <span class="text-muted">/</span>
      <b-dropdown id="dropdown-dropright" dropright text="Collections" variant="muted" class="text-muted m-2">
        <b-dropdown-item href="#">Home</b-dropdown-item>
        <b-dropdown-item href="#">Collections</b-dropdown-item>
      </b-dropdown>
    </div>
  </div>

  <div class="row my-2">
    <div class="col">
      <b-form-input v-model="search_text" placeholder="Search" @change="searchChange" autofocus></b-form-input>
    </div>
  </div>
  <div v-if="search_text" class="row">
    <div class="col-md-3 col-sm-6" v-for="collection in filtered_collections"
      :key="collection.name">
      <router-link :to="'/collection/' + collection.name + '/index'">
        {{ collection.displayName }}
      </router-link>
    </div>
  </div>
  <div v-else class="row">
    <div class="col-md-3 col-sm-6" v-for="collection in collections"
      :key="collection.name">
      <router-link :to="'/collection/' + collection.name + '/index'">
        {{ collection.displayName }}
      </router-link>
    </div>
  </div>
</div>

</template>

<script>

import ConfigService from '../ConfigService';
import MongoService from '../MongoService';

export default {
  data() {
    return {
      database: '[db]',
      search_text: '',
      collections: [],
      display: ''
    }
  },
  async created () {
    if(this.$route.params.database) {
      this.$storage.set('database', this.$route.params.database);
    }
    this.database = this.$storage.get('database');
    this.collections = await MongoService.collections(this.database);
    const displayField = ConfigService.get('collection_display');
    this.collections.forEach(x => x.displayName = x[displayField]);
  },
  computed: {
    filtered_collections: function() {
      if(!this.search_text || !this.search_text.trim()) {
        return [];
      }
      return this.collections.filter(x => x.name.match(new RegExp(this.search_text)));
    }
  }
}


</script>

<style scoped>

</style>
