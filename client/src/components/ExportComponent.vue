<template>


<div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        Export
      </div>
    </div>
  </div>

  <div class="container table-container">

    <div class="row">
      <div class="col p-1">
        Collection
      </div>
      <div class="col p-1">
        fch_parts
      </div>
    </div>

  </div>


</div>

</template>

<script>

import ConfigService from '../ConfigService';
import MongoService from '../MongoService';
import queryString from 'query-string';

export default {

  data() {
    return {
      connection: '',
      database: '',
      collection: '',
      type: '',
    }
  },

  async created () {
    this.connection = this.$route.params.connection;
    this.database = this.$route.params.database;
    this.collection = this.$route.params.collection;
    this.type = this.$route.params.type;
  },
  
  methods: {


  },

}


</script>

