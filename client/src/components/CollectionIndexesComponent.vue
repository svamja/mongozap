<template>

<div class="container">

  <div class="row">

    <div class="col-auto">
      <BreadcrumbComponent
        :connection="connection"
        :database="database"
        :collection="collection" 
        :display-collection="displayCollection" 
        action="Indexes"
      />
    </div>

    <div class="col-auto my-auto pl-0 ml-auto">
      <a v-shortkey.once="[ 'shift', '+']"
        @shortkey="showCreate()" href="#" @click.stop.prevent="showCreate()"
        v-b-tooltip.hover title="Create Index (+)">
        <span class="fa fa-plus"></span>
      </a>
      <a v-shortkey.once="['r']" class="ml-2"
        @shortkey="reload()" href="#" @click.stop.prevent="reload()"
        v-b-tooltip.hover title="Reload (r)">
        <span class="fa fa-sync"></span>
      </a>
    </div>

  </div>

  <!-- Empty  -->
  <div v-if="isEmpty">
    <div class="row">
      <div class="col border p-5 text-center">
        <div class="h4">
          No Indexes Found
        </div>
      </div>
    </div>
  </div>

  <!-- List -->
  <div v-else>
    <div class="container table-container mt-3">
      <div class="row py-2" v-for="index in this.indexes" :key="index.name">
        <div class="col text-monospace">
          {{ JSON.stringify(index.key) }}
        </div>
        <div v-if="is_allowed_delete" class="col text-center">
          <span class="text-warning fa fa-trash"
            v-if="index.name != '_id_'"
            @click="deleteConfirmation(index)"></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <b-modal id="delete-confirmation-modal" title="Confirmation"
    ok-variant="danger" ok-title="Delete"
    v-model="showDeleteModal"
    @ok="deleteIndex()">
    <div>This will delete below index.</div>
    <div class="text-monospace my-2">
      {{ this.deleteItem ? JSON.stringify(this.deleteItem.key) : '' }}
    </div>
    <div>Proceed?</div>
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
      displayCollection: '',
      isEmpty: false,
      indexes: [],
      deleteItem: null,
      showDeleteModal: false,
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
    let authUser = ConfigService.get('authUser');
    if(authUser.role === 'admin') {
      this.is_allowed_delete = true;
    }
    await this.reload();
  },

  methods: {

    async reload() {
      this.indexes = await MongoService.getIndexes(this.connection, this.database, this.collection);
      if(!this.indexes || !this.indexes.length) {
        this.isEmpty = true;
      }
      else {
        this.isEmpty = false;
      }
    },

    deleteConfirmation(index) {
      this.deleteItem = index;
      this.showDeleteModal = true;
    },

    async deleteIndex() {
      await MongoService.deleteIndex(this.connection, this.database, this.collection, this.deleteItem.name);
      this.reload();
    },

  },


}

</script>

