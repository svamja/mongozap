<template>

<div class="container">

  <div class="row">

    <div class="col-auto">
      <BreadcrumbComponent
        :connection="connection"
        :database="database"
        :collection="collection" 
        :display-collection="displayCollection" 
        action="Filter"
      />
    </div>

    <div class="col-auto my-auto pl-0 ml-auto">
      <a v-shortkey.once="['r']"
        @shortkey="reload()" href="#" @click.stop.prevent="reload()"
        v-b-tooltip.hover title="Reload (r)">
        <span class="fa fa-sync"></span>
      </a>
      <a v-shortkey.once="['r']" class="text-danger ml-2"
        @shortkey="reload(true)" href="#" 
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
          <a class="btn btn-primary" @click="reload(true)">
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
        <div class="col-6">Field</div>
        <div class="col-1"></div>
        <div class="col-4">Value</div>

      </div>

      <form @submit.prevent="addItem">
  
        <div class="row">

          <div class="col-5">

            <b-form-select
              v-show="is_path_select"
              v-model="editItem.path"
              placeholder="Field"
              autofocus
              :options="field_options"></b-form-select>

            <input 
              v-show="!is_path_select"
              v-model="editItem.path"
              type="text" class="form-control" />

            <span class="fa fa-edit" @click="is_path_select = !is_path_select"></span>

          </div>

          <div class="col-2">
            <select v-model="editItem.operator" class="form-control">
              <option value="$eq">=</option>
              <option value="$ne">!=</option>
              <option value="$gt">&gt;</option>
              <option value="$lt">&lt;</option>
              <option value="$regex">Contains</option>
              <option value="begins">Begins with</option>
              <option value="null">null</option>
              <option value="not null">not null</option>
            </select>
          </div>

          <div class="col-4">
            <input v-model="editItem.value" type="text" class="form-control" />
          </div>

          <div class="col-1">
            <button class="btn btn-light" @click.prevent="addItem">Add</button>
          </div>

        </div>
      </form>

    </div>

    <div class="container table-container my-3">

      <div class="row py-1" v-for="(item, i) of items" :key="item.path">
        <div class="col-5"> {{ item.path }} </div>
        <div class="col-2"> {{ item.operator }} </div>
        <div class="col-4"> {{ item.value }} </div>
        <div class="col-1">
          <a href="#" class="text-warning" @click.stop.prevent="startEdit(i)">
            <span class="fa fa-edit"></span>
          </a>
          &nbsp;
          <a href="#" class="text-danger" @click.stop.prevent="deleteItem(i)">
            <span class="fa fa-times"></span>
          </a>
        </div>
      </div>

    </div>

  </div>

  <div class="row my-3">
    <div class="col">
      <div class="">
        Limit <input type="text" v-model="limit" />
      </div>
    </div>
  </div>

  <div class="row my-3">
    <div class="col-2">
      <button class="btn btn-primary" @click="applyFilter">
        Apply
      </button>
    </div>
    <div class="col-2">
      <button class="btn btn-secondary" @click="reset">
        Reset
      </button>
    </div>
  </div>

  <div class="row my-3" v-if="items.length">
    <div class="col">
      <pre v-highlightjs="query_display"><code class="json">{{ query_display }}</code></pre>
    </div>
  </div>

  <!-- Reload Confirmation Modal -->
  <b-modal id="rebuild-confirmation-modal" title="Confirmation"
    ok-variant="danger" ok-title="Rebuild"
    @ok="reload(true)">
    <p>
      This will delete exising schema changes, if any. <br/>
      It will rebuild the schema based on latest data.
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
      items: [],
      query: {},
      query_display: '',
      limit: 0
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
    this.limit = ConfigService.get(this.collection + ':limit') || 0;
    await this.reload();
    this.items = ConfigService.get(this.collection + ':filter') || [];
    this.updateQuery();
  },

  methods: {

    async reload(rebuild) {
      this.fields = await MongoService.get(this, 'schema_get', { rebuild });
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

    async addItem() {
      let { path, operator, value } = this.editItem;
      if(!path) {
        return;
      }
      
      // data type check
      for(let field of this.fields) {
        if(path == field.path) {
          if(field.type == 'Number') {
            value = parseFloat(value);
          }
          else if(field.type == 'Boolean') {
            value = value.toLowerCase() == 'true';
          }
          else if(field.type == 'ObjectID') {
            value = { '$oid': value };
          }
        }
      }

      let item = { path, operator, value };
      this.items.push(item);
      this.editItem.path = null;
      this.editItem.value = null;
      this.updateQuery();
    },

    async startEdit(i) {
      this.editItem = this.items[i];
      this.items.splice(i, 1);
      this.updateQuery();
    },

    async deleteItem(i) {
      this.items.splice(i, 1);
      this.updateQuery();
    },

    updateQuery() {
      this.query = {};
      for(let item of this.items) {
        this.query[item.path] = this.query[item.path] || {};
        if(item.operator == 'null') {
          this.query[item.path]['$eq'] = null;
        }
        else if(item.operator == 'not null') {
          this.query[item.path]['$ne'] = null;
        }
        else if(item.operator == 'begins') {
          this.query[item.path]['$regex'] = '^' + item.value;
        }
        else if(item.operator == '$regex') {
          this.query[item.path]['$regex'] = item.value;
          this.query[item.path]['$options'] = 'i';
        }
        else {
          this.query[item.path][item.operator] = item.value;
        }
      }
      this.query_display = JSON.stringify(this.query, null, 4);
    },

    async applyFilter() {
      const ttl = 24*3600*1000;

      let query_key = this.collection + ':query';
      ConfigService.set(query_key, this.query, { ttl });

      let filter_key = this.collection + ':filter';
      ConfigService.set(filter_key, this.items, { ttl });

      let limit_key = this.collection + ':limit';
      ConfigService.set(limit_key, this.limit, { ttl });

      this.$router.push(`/coll/${this.connection}/${this.database}/${this.collection}/index`);
    },

    async reset() {
      const ttl = 1000;
      let filter_key = this.collection + ':filter';
      ConfigService.set(filter_key, null, { ttl });
      let query_key = this.collection + ':query';
      ConfigService.set(query_key, null, { ttl });
      this.$router.push(`/coll/${this.connection}/${this.database}/${this.collection}/index`);
    },

  },

};

</script>

