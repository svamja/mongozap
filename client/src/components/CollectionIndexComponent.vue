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
        action="Home"
      />
    </div>

    <!-- Toolbar -->
    <div class="col-auto my-auto pl-0 ml-auto">

      <a v-shortkey.once="['shift', '+']" 
        @shortkey="openInsert()" href="#" @click.stop.prevent="openInsert()"
        v-b-tooltip.hover title="Insert (+)">
        <span class="fa fa-plus"></span>
      </a>
      <a class="ml-2" v-shortkey.once="['q']" 
        @shortkey="openSearch()" href="#" @click.stop.prevent="openSearch()"
        v-b-tooltip.hover title="Query (q)">
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
      <a v-shortkey.once="['shift', 'arrowleft']"
        @shortkey="pageLeft()" href="#" @click.stop.prevent="pageLeft()"
        >
      </a>
      <a v-shortkey.once="['shift', 'arrowright']"
        @shortkey="pageRight()" href="#" @click.stop.prevent="pageRight()"
        >
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
        <div class="small">
          <span v-if="is_allowed_edit">
            <a href="#" @click.stop.prevent="showEdit(row)">Edit</a>
          </span>
          &nbsp;
          <span v-if="is_allowed_delete">
            <a href="#" @click.stop.prevent="confirmDelete(row.item)">Delete</a>
          </span>
        </div>
      </template>

  </b-table>

  <!-- Empty Table  -->
  <div v-if="isCollEmpty">
    <div class="row">
      <div class="col border p-5 text-center h4">
        <span v-if="query_text"> No Records Found </span>
        <span v-else> Empty Collection </span>
      </div>
    </div>
  </div>

  <!-- Insert Modal -->
  <b-modal id="insert-modal" title="Insert Document" size="xl" v-model="showInsertModal">
    <div>
      <b-textarea
        id="insert_textarea"
        v-model="insertItem" rows="12"
        :class="{ 'is-invalid': insertError  }"
        autofocus></b-textarea>
    </div>
    <div class="row">
      <div class="col text-danger" v-if="insertError">
        Invalid JSON.
      </div>
      <div class="col text-right">
        <a class="small my-2" href="https://docs.mongodb.com/manual/reference/mongodb-extended-json/#example" target="_blank">
          EJSON Format <i class="fa fa-external-link-alt"></i>
        </a>
      </div>
    </div>
    <template v-slot:modal-footer>
      <div class="w-100">
        <b-button
          variant="primary"
          size="sm"
          class="float-right"
          @click="insertDoc()"
        >
          Save
        </b-button>
      </div>
    </template>
  </b-modal>

  <!-- Search Modal -->
  <b-modal id="search-modal" title="Query" v-model="showSearchModal">
    <b-tabs content-class="mt-3">
      <div>
        <b-textarea
          v-model="query_text" rows="8"
          :class="{ 'is-invalid': searchError  }"
          autofocus></b-textarea>
      </div>
      <div class="row">
        <div class="col text-danger" v-if="searchError">
          Invalid JSON.
        </div>
        <div class="col text-right">
          <a class="small my-2" href="https://docs.mongodb.com/manual/reference/mongodb-extended-json/#example" target="_blank">
            EJSON Format <i class="fa fa-external-link-alt"></i>
          </a>
        </div>
      </div>
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
          variant="secondary"
          size="sm"
          class="mr-2 float-right"
          @click="resetSearch()"
        >
          Reset
        </b-button>
        <b-button
          v-if="is_allowed_delete" 
          variant="danger"
          size="sm"
          class="mr-2 float-right"
          @click="deleteRecords()"
        >
          Delete
        </b-button>
      </div>
    </template>
  </b-modal>

  <!-- Keyboard Shortcuts Modal -->
  <b-modal id="shortcuts-modal" title="Keyboard Shortcuts" v-model="showShortcutsModal" ok-only>
    <table class="table table-bordered table-sm">
      <tbody>
        <tr>
          <td>r</td>
          <td>Reload Documents</td>
        </tr>
        <tr>
          <td>d</td>
          <td>Go to Database</td>
        </tr>
        <tr>
          <td>h</td>
          <td>Home (Go to Collection)</td>
        </tr>
        <tr>
          <td>/</td>
          <td>Filter</td>
        </tr>
        <tr>
          <td>f</td>
          <td>Fields</td>
        </tr>
        <tr>
          <td>+</td>
          <td>Insert</td>
        </tr>
        <tr>
          <td>i</td>
          <td>Indexes</td>
        </tr>
        <tr>
          <td>&lt;shift&gt; &rarr;</td>
          <td>Next Page</td>
        </tr>
        <tr>
          <td>&lt;shift&gt; &larr;</td>
          <td>Previous Page</td>
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

  <!-- Edit Modal -->
  <b-modal id="edit-modal" title="Edit Document"
    v-model="showEditModal" size="xl" 
    ok-variant="success" ok-title="Save"
    @ok="updateRecord">

    <div>
      <b-textarea
        id="edit_textarea"
        v-model="editItem"
        :class="{ 'is-invalid': editError  }"
        rows="12"
        autofocus></b-textarea>
    </div>
    <div class="row">
      <div class="col text-danger" v-if="editError">
        Invalid JSON.
      </div>
      <div class="col text-right">
        <a class="small my-2" href="https://docs.mongodb.com/manual/reference/mongodb-extended-json/#example" target="_blank">
          EJSON Format <i class="fa fa-external-link-alt"></i>
        </a>
      </div>
    </div>

  </b-modal>

  <!-- Delete Confirmation Modal -->
  <b-modal id="delete-confirmation-modal" title="Confirmation"
    v-model="showDeleteModal"
    ok-variant="danger" ok-title="Delete"
    @ok="deleteRecord()">
    <p class="font-weight-bold">
      This will delete below record. Proceed?
    </p>
    <pre v-highlightjs style="height: 11em;"><code class="json">{{ JSON.stringify(deleteItem, null, 2) }}</code></pre>
  </b-modal>

</div>

</template>

<script>

import MongoService from '../MongoService';
import ConfigService from '../ConfigService';
import _ from 'lodash';
import moment from 'moment';
import BreadcrumbComponent from './BreadcrumbComponent';
import { EJSON } from 'bson';

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
      showEditModal: false,
      showDeleteModal: false,
      isCollEmpty: false,
      displayCollection: '',
      search_text: '',
      query_text: '',
      deleteItem: null,
      editItem: null,
      insertItem: null,
      insertError: false,
      searchError: false,
      editError: false,
      records: [],
      fields: null,
      perPage: 20,
      totalRows: 2000,
      displayTotal: '100+',
      currentPage: 1,
      pageOptions: [ 5, 10, 20, 50, 100, 500, 1000, 2000 ],
      is_allowed_delete: false,
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
    let key = this.collection + ':query';
    this.query = ConfigService.get(key);
    if(this.query) {
      this.query_text = JSON.stringify(this.query, null, 4);
    }
    else {
      this.query = {};
    }
    key = this.collection + ':fields';
    let fields = ConfigService.get(key);
    if(!fields) {
      fields = await this.default_fields();
      ConfigService.set(key, fields);
    }
    let perPage = ConfigService.get('perPage');
    if(perPage) {
      this.perPage = perPage;
    }
    this.fields = fields;
    let authUser = ConfigService.get('authUser');
    if(authUser.role === 'admin') {
      this.is_allowed_delete = true;
      this.is_allowed_edit = true;
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
    
    perPage(val) {
      ConfigService.set('perPage', val);
    },

  },

  methods: {

    async reload() {
      this.$root.$emit('bv::refresh::table', 'records_table');
    },
    
    async records_fn(ctx) {
      ctx.query = this.query;
      let result = await MongoService.records(this.connection, this.database, this.collection, ctx);
      this.records = result.records; 
      let records = this.records.map(r => EJSON.deserialize(r));
      this.totalRows = result.count;
      this.isCollEmpty = !records.length;
      return records;
    },

    date_time_formatter(value) {
      let pretty_date = moment(value).format('MMM DD, YYYY HH:mm:ss');
      return pretty_date;
    },

    unix_date_time_formatter(value) {
      let pretty_date = moment.unix(value).format('MMM DD, YYYY HH:mm:ss');
      return pretty_date;
    },

    async default_fields() {
      console.log('fetching default fields');
      let schema_fields = await MongoService.loadSchema(this.connection, this.database, this.collection);
      if(!schema_fields || !schema_fields.length) {
        return null;
      }

      // Get Indexes
      const db_indexes = await MongoService.getIndexes(this.connection, this.database, this.collection);

      // Filter to Depth 1
      schema_fields = schema_fields.filter(x => x.depth == 1);

      // Sort by "order" field
      schema_fields = _.sortBy(schema_fields, [ 'order' ]);

      // Prepare List of Sortable Fields
      let sortables = {};
      for(let db_index of db_indexes) {
        for(let index_field in db_index.key) {
          sortables[index_field] = true;
          break;
        }
      }

      // Prepare and Return Fields
      let fields = schema_fields.map(function(schema_field) {
        let key = schema_field.path;
        let label = schema_field.path;
        let sortable, formatter;
        if(sortables[key]) {
          sortable = true;
        }
        if(key == 'created' && schema_field.type == 'Number') {
          formatter = 'unix_date_time_formatter';
        }
        if(key == 'updated' && schema_field.type == 'Number') {
          formatter = 'unix_date_time_formatter';
        }
        return { key, label, sortable, formatter };
      });

      // Store it

      return fields;
    },

    // Edit Dialog
    showEdit(row) {
      let ejson_item = this.records[row.index];
      this.editItem = JSON.stringify(ejson_item, null, 4);
      this.editError = false;
      this.showEditModal = true;
    },

    async updateRecord(event) {

      this.editError = false;

      // Get Item - Check for Errors
      let changes;
      try {
        changes = JSON.parse(this.editItem);
      }
      catch(err) {
        this.editError = true;
        event.preventDefault();
        return;
      }
      if(!changes || !changes._id) {
        this.editError = true;
        event.preventDefault()
        return;
      }

      // Call API
      let query = { _id : changes._id };
      delete(changes._id);
      changes = { '$set': changes };

      await MongoService.post(this, 'update_documents', { query, changes });
      this.reload();

    },

    async clearCollection() {
      await MongoService.clear(this.connection, this.database, this.collection);
      this.reload();
    },

    async dropCollection() {
      await MongoService.drop(this.connection, this.database, this.collection);
      this.$router.push(`/db/${this.connection}/${this.database}/index`);
    },
    
    confirmDelete(item) {
      this.deleteItem = item;
      this.showDeleteModal = true;
    },

    async deleteRecord() {
      let query = { _id: { "$oid" : this.deleteItem._id } };
      await MongoService.post(this, 'delete_records', { query });
      this.reload();
    },

    openInsert() {
      this.showInsertModal = true;
    },

    async insertDoc() {
      let insertItem;
      this.insertError = false;
      try {
        insertItem = JSON.parse(this.insertItem);
      }
      catch(err) {
        this.insertError = true;
        return;
      }
      await MongoService.insertDoc(this.connection, this.database, this.collection, insertItem);
      this.showInsertModal = false;
      this.reload();
    },
    
    openSearch() {
      this.showSearchModal = true;
    },
    
    openShortcuts() {
      this.showShortcutsModal = true;
    },

    gotoShortcut(path_code) {
      this.$router.push(`/coll/${this.connection}/${this.database}/${this.collection}/${path_code}`);
    },

    pageLeft() {
      if(this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    pageRight() {
      let page_count = Math.ceil(this.totalRows / this.perPage);
      if(this.currentPage < page_count) {
        this.currentPage++;
      }
    },
    
    applySearch() {
      let query;
      this.searchError = false;
      if(this.query_text && this.query_text.trim()) {
        try {
          query = JSON.parse(this.query_text);
        }
        catch(err) {
          this.searchError = true;
          return;
        }
      }
      if(!query) {
        query = {};
      }
      this.showSearchModal = false;
      this.query = query;
      this.$root.$emit('bv::refresh::table', 'records_table');
    },

    resetSearch() {
      this.query_text = "";
      this.query = {};
      this.$root.$emit('bv::refresh::table', 'records_table');
      this.searchError = false;
      this.showSearchModal = false;
    },

    async deleteRecords() {
      let query;
      if(this.query_text && this.query_text.trim()) {
        try {
          query = JSON.parse(this.query_text);
        }
        catch(err) {
          this.searchError = true;
          return;
        }
      }
      if(!query) {
        query = {};
      }
      this.showSearchModal = false;
      let result = await MongoService.post(this, 'delete_records', { query });
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

#edit_textarea, #insert_textarea {
  font-family: Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size: 0.8rem;
}

</style>
