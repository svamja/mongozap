<template>


<div class="container">

  <div class="row">
    <div class="col">
      <b-button class="ml-0 pl-0" variant="link" to="/databases">Databases</b-button>
      <span class="text-muted">/</span>
      <b-button variant="link">{{ database }}</b-button>
      <span class="text-muted">/</span>
      <b-dropdown id="dropdown-dropright" dropright text="Collections" variant="muted" class="text-muted">
        <b-dropdown-item href="#">Home</b-dropdown-item>
        <b-dropdown-item href="#">Collections</b-dropdown-item>
      </b-dropdown>
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

  <!-- Filtered Collections  -->
  <div class="row">
    <div class="col-md-3 col-sm-6" v-for="collection in filtered_collections"
      :key="collection.name">
      <router-link :to="'/collection/' + collection.name + '/index'">
        {{ collection.displayName }}
        <span v-if="collection.displayCount">({{ collection.displayCount }})</span>
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
      display: '',
      single_filter: false
    }
  },
  async created () {
    if(this.$route.params.database) {
      this.$storage.set('database', this.$route.params.database);
    }
    this.database = this.$storage.get('database');
    this.collections = await MongoService.collections(this.database);
    const displayField = ConfigService.get('collection_display');
    this.collections.forEach(function(coll) {
      coll.displayName = coll[displayField];
      if(coll.count) {
        if(coll.count > 1000 && coll.count < 1000000) {
          coll.displayCount = Math.floor(coll.count/1000) + 'k';
        }
        else if(coll.count > 1000000) {
          coll.displayCount = Math.floor(coll.count/1000000) + 'm';
        }
        else {
          coll.displayCount = '' + coll.count;
        }
      }

    });
  },
  computed: {
    filtered_collections() {
      if(!this.search_text || !this.search_text.trim()) {
        return this.collections;
      }
      let chars = this.search_text.trim().split('');
      let expression = '^' + chars.join('.*');
      return this.collections.filter(x => x.name.match(new RegExp(expression, 'i')));
    }
  },
  watch: {
    filtered_collections(val) {
      this.single_filter = val && val.length == 1;
    },
  },
  methods: {
    endSearch() {
      if(this.filtered_collections.length) {
        let collection = this.filtered_collections[0];
        if(this.filtered_collections.length > 1) {
          let search_alpha = this.search_text.toLowerCase().replace(/[^a-z]/g, '');
          for(let index in this.filtered_collections) {
            let coll = this.filtered_collections[index];
            let alpha = coll.name.toLowerCase().replace(/[^a-z]/g, '');
            if(alpha == search_alpha) {
              collection = coll;
              break;
            }
          }
        }
        this.$router.push('/collection/' + collection.name + '/index');
      }
    }
  }
}


</script>

<style scoped>

</style>
