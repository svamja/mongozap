<template>


<div class="container">

  <!-- Breadcrumb -->
  <div class="row">
    <div class="col-auto">
      <BreadcrumbComponent
        :connection="connection"
        :database="database"
        :collection="collection" 
        :display-collection="displayCollection" 
        action="Views"
      />
    </div>
  </div>

  <div class="row mt-3">
    <div class="col">
      <div class="h5">Views</div>
    </div>
  </div>

  <b-card no-body>
    <b-tabs v-model="active_tab_index" card>

      <b-tab title="Views">
        <div v-if="!views.length">
          No History
        </div>
        <div v-else>
          <table class="table table-bordered table-sm">
            <thead>
              <th> Title </th>
              <th> User </th>
              <th> Created </th>
              <th>  </th>
            </thead>
            <tbody>
              <tr v-for="view in views" :key="view._id['$oid']">
                <td> {{ view.title }} </td>
                <td> {{ view.username }} </td>
                <td> {{ view.created | time_format }} </td>
                <td>
                  <a href="#" @click.stop.prevent="load(view)">
                    <span class="fa fa-edit"></span>
                    (Load)
                  </a>
                  &nbsp;
                  <a href="#" @click.stop.prevent="remove(view)">
                    <span class="fa fa-trash text-warning"></span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-tab>
      
      <b-tab title="Create View">
        <div class="row my-2">
          <table class="table table-bordered">
            <tr>
              <td>
                Fields
                <router-link :to="`/coll/${connection}/${database}/${collection}/fields`">
                  <span class="ml-2 fa fa-edit"></span>
                </router-link>
              </td>
              <td> 
                <div v-if="fields">
                  <div v-for="field in fields" :key="field.key">{{ field.key }}</div>
                </div>
                <div v-else>
                  (Default)
                </div>
              </td>
            </tr>
            <tr>
              <td> 
                Query
                <router-link :to="`/coll/${connection}/${database}/${collection}/filter`">
                  <span class="ml-2 fa fa-edit"></span>
                </router-link>
              </td>
              <td> 
                <pre>{{ query }}</pre>
              </td>
            </tr>
            <!-- <tr>
              <td> 
                Sort
                <router-link :to="`/coll/${connection}/${database}/${collection}/index`">
                  <span class="ml-2 fa fa-edit"></span>
                </router-link>
              </td>
              <td> 
                <pre>{{ sort }}</pre>
              </td>
            </tr> -->
          </table>
        </div>
        <div class="row">
          <div class="col">
            <b-input v-model="title" />
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="save">Save</button>
          </div>
        </div>
      </b-tab>

    </b-tabs>
  </b-card>


</div>

</template>

<script>

import MongoService from '../MongoService';
import ConfigService from '../ConfigService';
import _ from 'lodash';
import moment from 'moment';
import BreadcrumbComponent from './BreadcrumbComponent';

const caller = { connection: 0, database: '_mongozap', collection: 'views' };


export default {

  components: { BreadcrumbComponent },

  data() {
    return {
      connection: '',
      database: '',
      collection: '',
      displayCollection: '',
      query: '',
      fields: null,
      views: [],
      // sort: '',
      title: '',
      active_tab_index: 0,
    }
  },

  filters: {
    time_format(timestamp) {
      return moment(timestamp).format('MMM DD, YYYY')
    },
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

    // Default Title
    this.title =  this.displayCollection + ' ' + moment().format('YYYY.MM.DD');

    // Get Fields
    this.fields = ConfigService.get(this.collection + ':fields');
    // console.log('fields', this.fields);

    // Get Query
    let query = ConfigService.get(this.collection + ':query');
    if(query) {
      this.query = JSON.stringify(query, null, 2);
    }
    else {
      this.query = '{ }';
    }

    // // Get Sort
    // let sort = ConfigService.get(this.collection + ':sort');
    // if(sort) {
    //   this.sort = JSON.stringify(sort, null, 2);
    // }
    // else {
    //   this.sort = '{ }';
    // }

    // Load History
    this.loadHistory();

  },

  methods: {

    async execute() {

      this.export_status = 'pending';
      let pipeline = this.pipeline_text;
      if(!pipeline) {
        this.inputError = true;
        return;
      }
      let result = await MongoService.get(this, 'aggregate', { pipeline });
      if(!result.status || result.status != 'success') {
        this.inputError = true;
      }
      this.inputError = false;
      this.items = result.items;
      this.status = 'ready';
      this.count = this.items.length;
      if(!this.count) {
        this.status = 'Empty Output'
      }
    },

    build_pipeline() {
      let pipeline = JSON.parse(this.pipeline_text);
      return pipeline;
    },

    async save() {
      const authUser = ConfigService.get('authUser');
      let username = (authUser && authUser.username);
      let query = this.query;
      // let sort = this.sort;
      let fields = JSON.stringify(this.fields);
      let collection = this.collection;
      let title = this.title;
      let created = new Date().getTime();
      let doc = { username, collection, title, query, fields, created };
      await MongoService.post(caller, 'insert_documents', { doc });
      this.active_tab_index = 0;
      this.loadHistory();
    },

    async loadHistory() {
      let query = { 'collection': this.collection };
      let result = await MongoService.get(caller, 'list_documents', { query });
      this.views = result.records;
    },

    load(view) {
      let query = view.query;
      let fields = view.fields;
      if(query) {
        query = JSON.parse(query);
      }
      if(fields) {
        fields = JSON.parse(fields);
      }
      ConfigService.set(this.collection + ':query', query);
      ConfigService.set(this.collection + ':fields', fields);
      this.$router.push(`/coll/${this.connection}/${this.database}/${this.collection}/index`);
    },

    async remove(aggregation) {
      let query = { _id: aggregation._id };
      await MongoService.post(caller, 'delete_records', { query });
      this.loadHistory();
    },

    async export_sheet() {
      let pipeline = this.pipeline_text;
      this.export_status = 'started';
      let result = await MongoService.post(this, 'export_aggregation', { pipeline });
      if(result.url) {
        this.sheet_url = result.url;
        this.export_status = 'ready';
      }
      else {
        this.export_status = 'error';
      }
    },

  },

}


</script>

<style>

#pipeline_textarea {
  color: #032f62
}

.tab-content > .tab-pane {
  min-height: 50vh;
}

</style>
