<template>

<div>

  <div class="container">

    <div class="row">
      <div class="col">
        <b-button variant="link" to="/">
          <span class="fa fa-home"></span>
        </b-button>
        <span class="text-muted">/</span>
        <b-button variant="link" :to="`/db/${connection}/list`">{{ connection_name }} </b-button>
        <span class="text-muted">/</span>
        <b-button variant="link" :to="`/db/${connection}/${database}/index`">{{ database }}</b-button>
        <span class="text-muted">/</span>
        <b-dropdown id="dropdown-dropright" dropright text="Stats" variant="muted" class="text-muted">
          <b-dropdown-item :to="`/db/${connection}/${database}/index`">Collections</b-dropdown-item>
          <b-dropdown-item :to="`/db/${connection}/${database}/home`">Stats</b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="row my-3">
      <div class="col h4">
        {{ database }}
      </div>
    </div>
  </div>

  <div class="container table-container">
    <div class="row py-1">
      <div class="col"> Data Size </div>
      <div class="col"> {{ stats.dataSize }} </div>
    </div>
    <div class="row py-1">
      <div class="col"> Collections </div>
      <div class="col"> {{ stats.collections }} </div>
    </div>
    <div class="row py-1">
      <div class="col"> Indexes </div>
      <div class="col"> {{ stats.indexes }} </div>
    </div>
    <div class="row py-1">
      <div class="col"> Schema Present </div>
      <div class="col">
        {{ stats.schema_count }} / {{ stats.collections }}
      </div>
    </div>
  </div>

</div>

</template>

<script>

import ConfigService from '../ConfigService';
import MongoService from '../MongoService';

export default {

  data() {
    return {
      connection: '',
      database: '',
      connection_name: '',
      search_text: '',
      stats: {
        collections: null,
        dataSize: null,
      }
    }
  },

  async created () {
    this.connection = this.$route.params.connection;
    this.database = this.$route.params.database;
    let connections = await ConfigService.getConnections();
    if(connections) {
      this.connection_name = connections[this.connection].name;
    }
    this.stats = await MongoService.get(this, 'db_info');
    this.stats.dataSize = this.formatBytes(this.stats.dataSize);
  },

  methods: {

    formatBytes(size) {
      let suffix = "bytes";
      if(size < 1000) {
        // nothing
      }
      else if(size < 1000000) {
        size /= 1000;
        suffix = 'kb';
      }
      else if(size < 1000000000) {
        size /= 1000000;
        suffix = 'mb';
      }
      else {
        size /= 1000000000;
        suffix = 'gb';
      }
      size = Math.round(size*10) / 10;
      return size + ' ' + suffix;
    }

  },

}


</script>

<style scoped>

</style>
