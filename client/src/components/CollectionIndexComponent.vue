<template>


<div class="container">

  <div class="row">

    <!-- Breadcrumb -->
    <div class="col-auto">
      <BreadcrumbComponent
        :connection="connection"
        :database="database"
        :collection="collection" 
        :display-collection="displayCollection" 
        action="Browse"
      />
    </div>

    <!-- Toolbar -->
    <div class="col-auto my-auto pl-0 ml-auto">

      <a v-shortkey.once="['i']" 
        @shortkey="openInsert()" href="#" @click.stop.prevent="openInsert()"
        v-b-tooltip.hover title="Insert (i)">
        <span class="fa fa-plus"></span>
      </a>
      <a class="ml-2" v-shortkey.once="['/']" 
        @shortkey="openSearch()" href="#" @click.stop.prevent="openSearch()"
        v-b-tooltip.hover title="Search (/)">
        <span class="fa fa-search"></span>
      </a>
      <a class="ml-2" v-shortkey.once="['r']"
        @shortkey="reload()" href="#" @click.stop.prevent="reload()"
        v-b-tooltip.hover title="Reload (r)">
        <span class="fa fa-sync"></span>
      </a>
      <a class="ml-2" v-shortkey.once="['shift', '?']"
        @shortkey="openShortcuts()" href="#" @click.stop.prevent="openShortcuts()"
        v-b-tooltip.hover title="Keyboard Shortcuts (?)">
        <span class="fa fa-question-circle"></span>
      </a>
    </div>

    <!-- Pagination -->
    <div class="col-auto my-auto" v-b-tooltip.hover :title="totalRows">
      {{ displayTotal }}
    </div>
    <div class="col-auto my-auto pl-0">
      <b-form-select
        v-model="perPage"
        id="perPageSelect"
        size="sm"
        :options="pageOptions"
      ></b-form-select>
    </div>

    <div class="col-auto my-auto pl-0">
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
  <b-table id="records_table" ref="bv_table" bordered small
    :items="records_fn"
    :fields="fields"
    :current-page="currentPage"
    :per-page="perPage">

      <template v-slot:cell(_id)="row">
        <div @click="row.toggleDetails" class="id-field">{{ row.item._id }}</div>
      </template>

      <template v-slot:row-details="row">
        <pre v-highlightjs><code class="json">{{ JSON.stringify(row.item, null, 2) }}</code></pre>
      </template>

  </b-table>

  <!-- Empty Table  -->
  <div v-if="isCollEmpty">
    <div class="row">
      <div class="col border p-5 text-center h4">
        Empty Collection
      </div>
    </div>
  </div>

  <!-- Insert Modal -->
  <b-modal id="insert-modal" title="Insert Document" v-model="showInsertModal">
    <b-textarea v-model="query_text" rows="8" autofocus></b-textarea>
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
          @click="applySearch()"
        >
          Search
        </b-button>
        <b-button
          variant="danger"
          size="sm"
          class="mx-2 float-right"
          @click="deleteRecords()"
        >
          Delete
        </b-button>
      </div>
    </template>
  </b-modal>

  <!-- Keyboard Shortcuts Modal -->
  <b-modal id="shortcuts-modal" title="Keyboard Shortcuts" v-model="showShortcutsModal" ok-only>
    <table class="table table-bordered">
      <tbody>
        <tr>
          <td>/</td>
          <td>Search</td>
        </tr>
        <tr>
          <td>r</td>
          <td>Reload</td>
        </tr>
        <tr>
          <td>?</td>
          <td>Keyboard Shortcuts</td>
        </tr>
      </tbody>
    </table>
  </b-modal>

  <!-- Clear Confirmation Modal -->
  <b-modal id="clear-confirmation-modal" title="Confirmation"
    ok-variant="danger" ok-title="Clear Collection"
    @ok="clearCollection()">
    <p>
      This will drop the collection and recreate it with same indexes. <br/>
      You will lose all data in this collection.
    </p>
    <p>Proceed?</p>
  </b-modal>

  <!-- Drop Modal -->
  <b-modal id="drop-confirmation-modal" title="Confirmation"
    ok-variant="danger" ok-title="Drop Collection"
    @ok="dropCollection()">
    <p>
      This will drop the collection. <br/>
      You will lose all data and indexes in this collection.
    </p>
    <p>Proceed?</p>
  </b-modal>

</div>

</template>

<script>

import MongoService from '../MongoService';
import ConfigService from '../ConfigService';
import _ from 'lodash';
import BreadcrumbComponent from './BreadcrumbComponent';


export default {

  components: { BreadcrumbComponent },

  data() {
    return {
      connection: '',
      database: '',
      collection: '',
      showInsertModal: false,
      showSearchModal: false,
      showShortcutsModal: false,
      isCollEmpty: false,
      displayCollection: '',
      search_text: '',
      query_text: '',
      // records: [],
      fields: null,
      perPage: 20,
      totalRows: 2000,
      displayTotal: '100+',
      currentPage: 1,
      pageOptions: [ 5, 10, 20, 50, 100, 500, 1000, 2000 ]
    }
  },

  async created () {
    this.connection = this.$route.params.connection;
    this.database = this.$route.params.database;
    this.collection = this.$route.params.collection;
    const displayField = ConfigService.get('collection_display');
    if(displayField == 'name') {
      this.displayCollection = this.collection;
    }
    else {
      this.displayCollection = _.upperFirst(_.camelCase(this.collection));
    }
  },

  watch: {
    totalRows(val) {
      if(val > 1000 && val < 1000000) {
        this.displayTotal = Math.floor(val/1000) + 'k';
      }
      else if(val > 1000000) {
        this.displayTotal = Math.floor(val/1000000) + 'm';
      }
      else {
        this.displayTotal = '' + val;
      }
    },
  },

  methods: {

    async reload() {
      this.$root.$emit('bv::refresh::table', 'records_table');
    },
    
    async records_fn(ctx) {
      ctx.query = this.query;
      let result = await MongoService.records(this.connection, this.database, this.collection, ctx);
      let records = result.records;
      this.totalRows = result.count;
      this.isCollEmpty = !records.length;
      if(result.schema && result.schema.fields) {
        this.fields = this.map_fields(result.schema.fields);
      }
      return records;
    },

    map_fields(schema_fields) {
      return schema_fields.map(function(field) {
        let key = field;
        let label = field;
        let sortable;
        if(key == '_id') {
          sortable = true;
        }
        return { key, label, sortable };
      });
    },
    
    async clearCollection() {
      await MongoService.clear(this.connection, this.database, this.collection);
      this.reload();
    },
    
    async dropCollection() {
      await MongoService.drop(this.connection, this.database, this.collection);
      this.$router.push(`/db/${this.connection}/${this.database}/index`);
    },
    
    openInsert() {
      this.showInsertModal = true;
    },
    
    openSearch() {
      this.showSearchModal = true;
    },
    
    openShortcuts() {
      this.showShortcutsModal = true;
    },
    
    applySearch() {
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

    async deleteRecords() {
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
      let result = await MongoService.deleteRecords(this.connection, this.database, this.collection, query);
      console.log('delete result', result);
      this.$bvToast.toast(`${result.count} records deleted`, {
        title: 'Success',
        variant: 'success',
        solid: true,
        autoHideDelay: 5000,
        appendToast: true
      });
      this.query = null;
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

.id-field {
  color: var(--primary);
  cursor: pointer;
}

</style>
