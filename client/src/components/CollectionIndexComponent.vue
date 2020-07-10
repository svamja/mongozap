<template>


<div class="container">

  <!-- Breadcrumb -->
  <div class="row">
    <div class="col">
      <b-button class="ml-0 pl-0" variant="link" to="/databases">Databases</b-button>
      <span class="text-muted">/</span>
      <b-button variant="link" :to="'/database/' + database + '/collections'">{{ database }}</b-button>
      <span class="text-muted">/</span>
      <b-button variant="link">{{ collection }}</b-button>
      <span class="text-muted">/</span>
      <b-dropdown id="dropdown-dropright" dropright text="Browse" variant="muted" class="text-muted m-2">
        <b-dropdown-item href="#">Home</b-dropdown-item>
        <b-dropdown-item href="#">Browse</b-dropdown-item>
        <b-dropdown-item href="#" variant="danger">Clear</b-dropdown-item>
        <b-dropdown-item href="#" variant="danger">Drop</b-dropdown-item>
      </b-dropdown>
    </div>
  </div>

  <!-- Search Bar -->
  <div class="row my-2">
    <div class="col">
      <b-form-input v-model="search_text" placeholder="Search"></b-form-input>
    </div>
  </div>

  <!-- Pagination -->
  <div class="row justify-content-end">
    <div class="col-auto my-1">
      <b-form-select
        v-model="perPage"
        id="perPageSelect"
        size="sm"
        :options="pageOptions"
      ></b-form-select>
    </div>
    <div class="col-md-4">
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        align="fill"
        size="sm"
        class="my-1"
      ></b-pagination>
    </div>
  </div>

  <!-- Table -->
  <b-table bordered small
    :items="records_fn"
    :current-page="currentPage"
    :per-page="perPage"
    :fields="fields">

      <template v-slot:cell(_id)="row">
        <div @click="row.toggleDetails">{{ row.item._id }}</div>
      </template>

      <template v-slot:row-details="row">
        <b-card>
          <pre>{{ JSON.stringify(row.item, null, 2) }}
          </pre>
        </b-card>
      </template>    
  </b-table>


</div>

</template>

<script>

import MongoService from '../MongoService';

export default {
  data() {
    return {
      database: '[db]',
      collection: '',
      search_text: '',
      records: [],
      fields: null,
      perPage: 20,
      totalRows: 2000,
      currentPage: 1,
      pageOptions: [ 5, 10, 20, 50, 100, 500, 1000, 2000 ]
    }
  },
  async created () {
    if(this.$route.params.collection) {
      this.$storage.set('collection', this.$route.params.collection);
    }
    this.database = this.$storage.get('database');
    this.collection = this.$storage.get('collection');
    // this.records = await MongoService.records(this.database, this.collection);
  },
  methods: {
    records_fn: async function(ctx) {
      console.log(ctx);
      let records = await MongoService.records(this.database, this.collection, ctx);
      return records;
    },
  }
}


</script>

<style scoped>

table {
  font-size: 0.8em;
}

</style>
