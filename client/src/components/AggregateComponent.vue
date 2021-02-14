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
        action="Aggregate"
      />
    </div>
  </div>

  <div class="row mt-3">
    <div class="col">
      <div class="h5">Aggregation</div>
    </div>
  </div>

  <b-card no-body>
    <b-tabs v-model="active_tab_index" card>
      <b-tab title="Execute" active>
        <div>
          <b-textarea
            id="pipeline_textarea"
            v-model="pipeline_text" rows="8"
            :class="{ 'is-invalid': inputError  }"
            autofocus></b-textarea>
        </div>

        <div class="row">
          <div class="col small pt-2">
            Use
            <a class="my-2" href="https://docs.mongodb.com/manual/reference/mongodb-extended-json/#example" target="_blank">
              EJSON Format
            </a>
          </div>
          <div class="col text-danger" v-if="inputError">
            Invalid JSON.
          </div>
          <div class="col pt-2 text-right">
            <button class="btn btn-primary" @click="execute">Execute</button> &nbsp;
          </div>
        </div>

      </b-tab>
      <b-tab title="Save">
        Title
        <div>
          <b-input v-model="title" />
        </div>
        <div class="text-right mt-2">
          <button class="btn btn-primary" @click="save">Save</button>
        </div>
      </b-tab>
      <b-tab title="Load">
        <div v-if="!aggregations.length">
          Loading History..
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
              <tr v-for="aggregation in aggregations" :key="aggregation._id['$oid']">
                <td> {{ aggregation.title }} </td>
                <td> {{ aggregation.username }} </td>
                <td> {{ aggregation.created | time_format }} </td>
                <td>
                  <a href="#" @click.stop.prevent="load(aggregation)">
                    <span class="fa fa-edit"></span>
                    (Load)
                  </a>
                  &nbsp;
                  <a href="#" @click.stop.prevent="remove(aggregation)">
                    <span class="fa fa-trash text-warning"></span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-tab>
    </b-tabs>
  </b-card>


  <div class="row mt-3">
    <div class="col">
      <div class="h5">Output (First 100 Items) </div>

      <!-- Table -->
      <b-table id="records_table" ref="bv_table"
        bordered small :sticky-header="true"
        class="mb-0"
        header-variant="light"
        v-if="status == 'ready'"
        :items="items"
        :fields="fields"
      >
      </b-table>

      <div v-if="status == 'ready'">
        {{ count }} records
      </div>

      <!-- Empty Table  -->
      <div v-if="status != 'ready'">
        <div class="row border m-1">
          <div class="col p-5 text-center h4">
            <span> {{ status }} </span>
          </div>
        </div>
      </div>

      <div v-if="status == 'ready'">
        <span v-if="!sheet_url">
          <a href="#" @click.prevent.stop="export_sheet">Export (Google Sheet)</a>
        </span>
        <span v-else>
          <a :href="sheet_url">
            Sheet URL
          </a>
        </span>
      </div>

    </div>
  </div>


</div>

</template>

<script>

import MongoService from '../MongoService';
import ConfigService from '../ConfigService';
import _ from 'lodash';
import moment from 'moment';
import BreadcrumbComponent from './BreadcrumbComponent';

const caller = { connection: 0, database: '_mongozap', collection: 'aggregations' };


export default {

  components: { BreadcrumbComponent },

  data() {
    return {
      connection: '',
      database: '',
      collection: '',
      displayCollection: '',
      items: [],
      count: 0,
      fields: [],
      pipeline: [],
      inputError: '',
      title: '',
      aggregations: [],
      active_tab_index: 0,
      pipeline_text: '[\n  { "$group" : { "_id" : "$_id", "total": { "$sum" : 1 } } }\n]',
      status: "Click 'Execute'",
      sheet_url: '',
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
    this.title = 'Aggregation ' + moment().format('MMM DD, YYYY');
    this.loadHistory();
  },

  methods: {

    async execute() {

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
      let pipeline = this.pipeline_text;
      let title = this.title;
      let created = new Date().getTime();
      let doc = { username, title, pipeline, created };
      await MongoService.post(caller, 'insert_documents', { doc });
      this.active_tab_index = 2;
      this.loadHistory();
    },

    async loadHistory() {
      let result = await MongoService.get(caller, 'collection_index');
      this.aggregations = result.records;
    },

    load(aggregation) {
      this.pipeline_text = aggregation.pipeline;
      this.active_tab_index = 0;
    },

    async remove(aggregation) {
      let query = { _id: aggregation._id };
      await MongoService.post(caller, 'delete_records', { query });
      this.loadHistory();
    },

    async export_sheet() {
      let pipeline = this.pipeline_text;
      let result = await MongoService.post(this, 'export_aggregation', { pipeline });
      this.sheet_url = result.url;
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
