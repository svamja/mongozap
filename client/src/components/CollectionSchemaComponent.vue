<template>

<div class="container">

  <div class="row">

    <div class="col-auto">
      <BreadcrumbComponent
        :database="database"
        :collection="collection" 
        :display-collection="displayCollection" 
        action="Schema"
      />
    </div>

  </div>

  <!-- Empty Schema  -->
  <div v-if="isSchemaEmpty">
    <div class="row">
      <div class="col border p-5 text-center h4">
        No Schema
      </div>
    </div>
  </div>




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
      database: '[db]',
      collection: '',
      displayCollection: '',
      isSchemaEmpty: false,
    }
  },

  async created () {
    if(this.$route.params.collection) {
      this.$storage.set('collection', this.$route.params.collection);
    }
    this.database = this.$storage.get('database');
    this.collection = this.$storage.get('collection');
    const displayField = ConfigService.get('collection_display');
    if(displayField == 'name') {
      this.displayCollection = this.collection;
    }
    else {
      this.displayCollection = _.upperFirst(_.camelCase(this.collection));
    }
    this.fields = await MongoService.loadSchema(this.database, this.collection);
    if(!this.fields || !this.fields.length) {
      this.isSchemaEmpty = true;
    }
  },

  methods: {
  },


}

</script>

<style scoped>

</style>
