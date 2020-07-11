<template>


<div class="container">

  <div class="row justify-content-between">

    <!-- Breadcrumb -->
    <div class="col-auto">
      <b-button class="ml-0 pl-0" variant="link" to="/databases">Databases</b-button>
      <span class="text-muted">/</span>
      <b-button variant="link" :to="'/database/' + database + '/collections'">{{ database }}</b-button>
      <span class="text-muted">/</span>
      <b-button variant="link">{{ collection }}</b-button>
      <span class="text-muted">/</span>
      <b-dropdown id="dropdown-dropright" dropright text="Browse" variant="muted" class="text-muted">
        <b-dropdown-item href="#">Home</b-dropdown-item>
        <b-dropdown-item href="#">Browse</b-dropdown-item>
        <b-dropdown-item href="#" v-b-modal.search-modal>Search</b-dropdown-item>
        <b-dropdown-item href="#" variant="danger">Clear</b-dropdown-item>
        <b-dropdown-item href="#" variant="danger">Drop</b-dropdown-item>
      </b-dropdown>
      <a class="small" v-shortkey.once="['/']" @shortkey="openSearch()" href="#" @click="openSearch()">
        <span class="fa fa-search"></span>
      </a>
      &nbsp;
      <a class="small" v-shortkey.once="['r']" @shortkey="reload()" href="#" @click="reload()">
        <span class="fa fa-sync"></span>
      </a>
    </div>

    <!-- Pagination -->
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
  <b-table id="records_table" bordered small
    :items="records_fn"
    :current-page="currentPage"
    :per-page="perPage">

      <template v-slot:cell(_id)="row">
        <div @click="row.toggleDetails">{{ row.item._id }}</div>
      </template>

      <template v-slot:row-details="row">
        <pre v-highlightjs><code class="json">{{ JSON.stringify(row.item, null, 2) }}</code></pre>
      </template>

  </b-table>

  <!-- Search Modal -->
  <b-modal id="search-modal" title="Search" v-model="showSearchModal">
    <b-tabs content-class="mt-3">
      <b-tab title="Query" active>
        <p>
          <b-textarea v-model="query_text" rows="8" autofocus></b-textarea>
        </p>
      </b-tab>
      <!-- 
      <b-tab title="Search">
        <p>..</p>
      </b-tab>
      -->
    </b-tabs>
    <template v-slot:modal-footer>
      <div class="w-100">
        <b-button
          variant="primary"
          size="sm"
          class="float-right"
          @click="saveSearch()"
        >
          Save
        </b-button>
      </div>
    </template>
  </b-modal>

</div>

</template>

<script>

import MongoService from '../MongoService';

export default {
  data() {
    return {
      showSearchModal: false,
      database: '[db]',
      collection: '',
      search_text: '',
      query_text: '',
      // records: [],
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
  // computed: {
  //   query() {
  //     let query;
  //     if(this.query_text && this.query_text.trim()) {
  //       try {
  //         query = JSON.parse(this.query_text);
  //       }
  //       catch(err) {
  //         // handle later
  //       }
  //     }
  //     if(!query) {
  //       query = {};
  //     }
  //     return query;
  //   }
  // },
  methods: {
    async reload() {
      this.$root.$emit('bv::refresh::table', 'records_table');
    },
    async records_fn(ctx) {
      ctx.query = this.query;
      let records = await MongoService.records(this.database, this.collection, ctx);
      return records;
    },
    openSearch() {
      this.showSearchModal = true;
    },
    saveSearch() {
      this.showSearchModal = false;
      let query;
      if(this.query_text && this.query_text.trim()) {
        try {
          query = JSON.parse(this.query_text);
        }
        catch(err) {
          // handle later
        }
      }
      if(!query) {
        query = {};
      }
      this.query = query;
      this.$root.$emit('bv::refresh::table', 'records_table');
    },
  }
}


</script>

<style>

th {
  white-space: nowrap;
}

td {
  max-width: 20em;
  text-overflow: ellipsis;
  word-break: break-all;
  overflow:hidden;
  white-space: nowrap;
}
/*td:hover {
    overflow: visible; 
    white-space: normal;
    height:auto;
}*/

</style>
