<template>

<div class="container">

  <div class="row">

    <div class="col-auto">
      <BreadcrumbComponent
        :connection="connection"
        :database="database"
        :collection="collection" 
        :display-collection="displayCollection" 
        action="Fields"
      />
    </div>

    <div class="col-auto my-auto pl-0 ml-auto">
      <a v-shortkey.once="['r']"
        @shortkey="reload()" href="#" @click.stop.prevent="reload()"
        v-b-tooltip.hover title="Reload (r)">
        <span class="fa fa-sync"></span>
      </a>
      <a v-shortkey.once="['r']" class="text-danger ml-2"
        @shortkey="rebuildSchema()" href="#" 
        v-b-modal.rebuild-confirmation-modal 
        v-b-tooltip.hover title="Rebuild">
        <span class="fa fa-undo"></span>
      </a>
    </div>

  </div>

  <!-- Empty Schema  -->
  <div v-if="isSchemaEmpty">
    <div class="row">
      <div class="col border p-5 text-center">
        <div class="h4">
          No Schema
        </div>
        <div>
          <a class="btn btn-primary" @click="rebuildSchema">
            Build Schema
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- List Schema -->
  <div v-else>

    <div class="container">

      <div class="row font-italic">
        <div class="col-3">Field</div>
        <div class="col-3">Label</div>
        <div class="col-3">Formatter</div>
        <div class="col-3"></div>

      </div>

      <form @submit.prevent="addItem">
  
        <div class="row">

          <div class="col-3">

            <b-form-select
              v-show="is_path_select"
              v-model="editItem.key"
              autofocus
              :options="field_options"></b-form-select>

            <input 
              v-show="!is_path_select"
              v-model="editItem.key"
              type="text" class="form-control" />

            <span class="fa fa-edit" @click="is_path_select = !is_path_select"></span>

          </div>

          <div class="col-3">
            <b-form-input
              v-model="editItem.label"></b-form-input>
          </div>

          <div class="col-3">
            <b-form-select
              v-model="editItem.formatter"
              :options="formatter_options"></b-form-select>
          </div>

           <div class="col-1">
            <button class="btn btn-light" @click.prevent="addItem">Add</button>
          </div>

        </div>
      </form>

    </div>

    <div class="container table-container my-3">

      <draggable v-model="items" @start="drag=true" @end="drag=false">
        <div class="row py-1" v-for="(item, i) of items" :key="item.key">
          <div class="col-3"> {{ item.key }} </div>
          <div class="col-3"> {{ item.label }} </div>
          <div class="col-3"> {{ item.formatter }} </div>
          <div class="col-1">
            <a href="#" class="text-danger" @click.stop.prevent="deleteItem(i)">
              <span class="fa fa-times"></span>
            </a>
          </div>
        </div>
      </draggable>

    </div>

    <div class="container">
      <div class="row my-3">
        <div class="col-2" v-if="items.length">
          <button class="btn btn-primary" @click="apply">
            Apply
          </button>
        </div>
        <div class="col-2">
          <button class="btn btn-secondary" @click="clear">
            Clear
          </button>
        </div>
        <div class="col-2">
          <button class="btn btn-secondary" @click="reset">
            Reset
          </button>
        </div>
      </div>
    </div>



  </div>

  <!-- Reload Confirmation Modal -->
  <b-modal id="rebuild-confirmation-modal" title="Confirmation"
    ok-variant="danger" ok-title="Rebuild"
    @ok="rebuildSchema()">
    <p>
      This will delete exising schema changes, if any. <br/>
      It will rebuild the schema based on latest data.
    </p>
    <p>Proceed?</p>
  </b-modal>

</div>


</template>

<script>

import draggable from 'vuedraggable'

import MongoService from '../MongoService';
import ConfigService from '../ConfigService';
import _ from 'lodash';
import BreadcrumbComponent from './BreadcrumbComponent';

export default {

  components: { BreadcrumbComponent, draggable },

  data() {
    return {
      connection: '',
      database: '',
      collection: '',
      displayCollection: '',
      isSchemaEmpty: false,
      editItem: {
        path: null,
        operator: '$eq',
        value: null
      },
      is_path_select: true,
      fields: [],
      field_options: [],
      formatter_options: [],
      items: [],
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
    this.formatter_options = [
      { value: '', text: '(None)' },
      { value: "unix_date_time_formatter", text: "Unix Timestamp (Date Time)" },
      { value: "date_time_formatter", text: "Milliseconds (Date Time)" },
    ];
    await this.reload();
    this.items = ConfigService.get(this.collection + ':fields') || [];
  },

  methods: {

    async reload() {
      this.fields = await MongoService.loadSchema(this.connection, this.database, this.collection);
      if(!this.fields || !this.fields.length) {
        this.isSchemaEmpty = true;
      }
      else {
        this.isSchemaEmpty = false;
      }
      for(let field of this.fields) {
        this.field_options.push({ value: field.path, text: field.path });
      }
    },

    async rebuildSchema() {
      await MongoService.rebuildSchema(this.connection, this.database, this.collection);
      await this.reload();
    },

    async addItem() {
      let { key, label, formatter } = this.editItem;
      if(!key) {
        return;
      }
      label = label || key;
      let sortable = false;
      if(key == '_id') {
        sortable = true;
      }
      let item = { key, label, formatter, sortable };
      this.items.push(item);
      this.editItem.key = null;
    },

    async deleteItem(i) {
      this.items.splice(i, 1);
    },

    async apply() {
      const ttl = 24*3600*1000;

      let fields_key = this.collection + ':fields';
      ConfigService.set(fields_key, this.items, { ttl });

      this.$router.push(`/coll/${this.connection}/${this.database}/${this.collection}/index`);
    },

    async clear() {
      this.items = [];
    },

    async reset() {
      const ttl = 24*3600*1000;

      let fields_key = this.collection + ':fields';
      ConfigService.set(fields_key, null, { ttl });

      this.$router.push(`/coll/${this.connection}/${this.database}/${this.collection}/index`);
    },

  },

};

</script>

