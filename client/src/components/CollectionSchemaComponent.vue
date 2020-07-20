<template>

<div class="container">

  <div class="row">

    <div class="col-auto">
      <BreadcrumbComponent
        :connection="connection"
        :database="database"
        :collection="collection" 
        :display-collection="displayCollection" 
        action="Schema"
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
    <div class="container table-container">
      <div class="row" v-for="field in this.fields" :key="field._id" :class="'field-type-' + field.type">
        <div :class="[ 'col', 'field-depth-' + field.depth ]">
          {{ field.path }}
        </div>
        <div class="col">
          {{ field.type }}
          <span v-if="field.sub_type">({{ field.sub_type }})</span>
          <span v-if="field.probability" class="small text-muted">({{ field.probability }}%)</span>
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
      fields: [],
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
    await this.reload();
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
    },

    async rebuildSchema() {
      await MongoService.rebuildSchema(this.connection, this.database, this.collection);
      await this.reload();
    },

  },


}

</script>

<style scoped>

.field-type-Document {
  color: var(--success);
}

.field-type-Array {
  color: var(--primary);
}

.field-depth-2 {
  padding-left: 2em;
}

.field-depth-3 {
  padding-left: 3em;
}

.field-depth-4 {
  padding-left: 4em;
}

.field-depth-5 {
  padding-left: 5em;
}

.field-depth-6 {
  padding-left: 6em;
}

.field-depth-7 {
  padding-left: 7em;
}

</style>
